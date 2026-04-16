import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedCategories = new Set([
  "product",
  "food",
  "dessert",
  "space",
  "portrait",
  "portrait-private",
]);

const normalizeText = (value: FormDataEntryValue | null, maxLength: number): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const sanitizeFilename = (name: string): string => {
  return name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
};

const getExtension = (file: File): string => {
  const explicitExtension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase() ?? ""
    : "";

  if (explicitExtension) {
    return explicitExtension;
  }

  const byMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/avif": "avif",
  };

  return byMimeType[file.type] ?? "jpg";
};

type InsertedImage = {
  id: string;
  category_slug: string;
  image_path: string;
  image_url: string | null;
  caption: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").trim();
  const serviceRoleKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration is incomplete." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid multipart form data." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const categorySlug = normalizeText(formData.get("category_slug"), 80);
  const caption = normalizeText(formData.get("caption"), 300) || null;
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  const legacyFileEntry = formData.get("file");
  const uploadFiles = files.length
    ? files
    : legacyFileEntry instanceof File
      ? [legacyFileEntry]
      : [];

  if (!allowedCategories.has(categorySlug)) {
    return new Response(
      JSON.stringify({ error: "지원하지 않는 카테고리입니다." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!uploadFiles.length) {
    return new Response(
      JSON.stringify({ error: "이미지 파일이 필요합니다." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (uploadFiles.some((file) => !file.type.startsWith("image/"))) {
    return new Response(
      JSON.stringify({ error: "이미지 파일만 업로드할 수 있습니다." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: category, error: categoryError } = await supabaseAdmin
    .from("works_categories")
    .select("slug")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (categoryError || !category) {
    return new Response(
      JSON.stringify({ error: "works_categories에 카테고리가 없습니다." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: lastImage } = await supabaseAdmin
    .from("works_images")
    .select("sort_order")
    .eq("category_slug", categorySlug)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextSortOrder = (lastImage?.sort_order ?? -1) + 1;
  const insertedImages: InsertedImage[] = [];

  for (const fileEntry of uploadFiles) {
    const extension = getExtension(fileEntry);
    const baseName = sanitizeFilename(fileEntry.name.replace(/\.[^.]+$/, "")) || "image";
    const filePath = `${categorySlug}/${Date.now()}-${crypto.randomUUID()}-${baseName}.${extension}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from("works")
      .upload(filePath, fileEntry, {
        contentType: fileEntry.type || undefined,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Failed to upload file", uploadError);

      if (insertedImages.length) {
        await supabaseAdmin.storage.from("works").remove(insertedImages.map((image) => image.image_path));
        await supabaseAdmin.from("works_images").delete().in("id", insertedImages.map((image) => image.id));
      }

      return new Response(
        JSON.stringify({ error: "Storage 업로드에 실패했습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("works").getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    const { data: insertedImage, error: insertError } = await supabaseAdmin
      .from("works_images")
      .insert({
        category_slug: categorySlug,
        image_path: filePath,
        image_url: publicUrl,
        caption,
        sort_order: nextSortOrder,
        is_visible: true,
      })
      .select("id, category_slug, image_path, image_url, caption, sort_order, is_visible, created_at")
      .single();

    if (insertError || !insertedImage) {
      console.error("Failed to insert works_images row", insertError);

      await supabaseAdmin.storage.from("works").remove([filePath]);

      if (insertedImages.length) {
        await supabaseAdmin.storage.from("works").remove(insertedImages.map((image) => image.image_path));
        await supabaseAdmin.from("works_images").delete().in("id", insertedImages.map((image) => image.id));
      }

      return new Response(
        JSON.stringify({ error: "DB row 생성에 실패했습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    insertedImages.push(insertedImage);
    nextSortOrder += 1;
  }

  return new Response(
    JSON.stringify({
      message: "Upload completed.",
      publicUrl: insertedImages[0]?.image_url ?? null,
      record: insertedImages[0] ?? null,
      records: insertedImages,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

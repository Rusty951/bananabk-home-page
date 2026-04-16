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

type Payload = {
  mode?: string;
  category_slug?: string;
  image_id?: string;
  ordered_ids?: string[];
};

type WorksImage = {
  id: string;
  category_slug: string;
  image_path: string;
  image_url: string | null;
  caption: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  resolved_url?: string | null;
};

const allowedModes = new Set([
  "list",
  "move-up",
  "move-down",
  "toggle-visibility",
  "delete",
  "reorder",
]);

const normalizeText = (value: unknown, maxLength: number): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const normalizeImagePath = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/works\//, "")
    .replace(/^\/+/, "")
    .replace(/^works\//, "");
};

const createAdminClient = () => {
  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").trim();
  const serviceRoleKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Server configuration is incomplete.");
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { supabaseAdmin };
};

const attachResolvedUrls = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  images: WorksImage[],
) => {
  return Promise.all(images.map(async (image) => {
    const normalizedPath = normalizeImagePath(image.image_path);

    if (!normalizedPath) {
      return {
        ...image,
        resolved_url: image.image_url,
      };
    }

    const { data, error } = await supabaseAdmin
      .storage
      .from("works")
      .createSignedUrl(normalizedPath, 60 * 60);

    if (error || !data?.signedUrl) {
      const { data: publicUrlData } = supabaseAdmin.storage.from("works").getPublicUrl(normalizedPath);
      return {
        ...image,
        image_path: normalizedPath,
        resolved_url: publicUrlData.publicUrl || image.image_url,
      };
    }

    return {
      ...image,
      image_path: normalizedPath,
      resolved_url: data.signedUrl,
    };
  }));
};

const fetchCategoryImages = async (supabaseAdmin: ReturnType<typeof createClient>, categorySlug: string, ascending = true) => {
  const { data, error } = await supabaseAdmin
    .from("works_images")
    .select("id, category_slug, image_path, image_url, caption, sort_order, is_visible, created_at")
    .eq("category_slug", categorySlug)
    .order("sort_order", { ascending })
    .order("created_at", { ascending });

  if (error) {
    throw error;
  }

  return attachResolvedUrls(supabaseAdmin, (data ?? []) as WorksImage[]);
};

const fetchCategorySummary = async (supabaseAdmin: ReturnType<typeof createClient>) => {
  const { data, error } = await supabaseAdmin
    .from("works_images")
    .select("category_slug");

  if (error) {
    throw error;
  }

  const counts: Record<string, number> = {};
  for (const row of (data ?? [])) {
    const slug = row.category_slug;
    counts[slug] = (counts[slug] || 0) + 1;
  }

  return counts;
};

const normalizeCategoryOrder = async (supabaseAdmin: ReturnType<typeof createClient>, categorySlug: string, orderedIds?: string[]) => {
  // 로직상 정렬은 항상 오름차순(ASC)으로 가져와서 처리해야 인덱스가 꼬이지 않음
  const images = await fetchCategoryImages(supabaseAdmin, categorySlug, true);
  const nextOrder = orderedIds && orderedIds.length
    ? orderedIds.map((id) => images.find((image) => image.id === id)).filter(Boolean)
    : images;

  if (!nextOrder.length) {
    return [];
  }

  for (const [index, image] of nextOrder.entries()) {
    const { error } = await supabaseAdmin
      .from("works_images")
      .update({ sort_order: index })
      .eq("id", image!.id)
      .eq("category_slug", categorySlug);

    if (error) {
      throw error;
    }
  }

  return fetchCategoryImages(supabaseAdmin, categorySlug, true);
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

  let payload: Payload;

  try {
    payload = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return new Response(
      JSON.stringify({ error: "JSON object payload is required." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { supabaseAdmin } = createAdminClient();
    const mode = normalizeText(payload.mode, 40);
    const categorySlug = normalizeText(payload.category_slug, 80);
    const imageId = normalizeText(payload.image_id, 120);

    if (!mode || !allowedModes.has(mode)) {
      return new Response(
        JSON.stringify({ error: "유효한 mode 값이 필요합니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!allowedCategories.has(categorySlug)) {
      return new Response(
        JSON.stringify({ error: "지원하지 않는 카테고리입니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "list") {
      const [images, summary] = await Promise.all([
        fetchCategoryImages(supabaseAdmin, categorySlug, true),
        fetchCategorySummary(supabaseAdmin),
      ]);
      return new Response(
        JSON.stringify({ images, summary }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "reorder") {
      const orderedIds = payload.ordered_ids;
      if (!Array.isArray(orderedIds)) {
        return new Response(
          JSON.stringify({ error: "ordered_ids 배열이 필요합니다." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      
      const nextImages = await normalizeCategoryOrder(supabaseAdmin, categorySlug, orderedIds);
      return new Response(
        JSON.stringify({ images: nextImages }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!imageId) {
      return new Response(
        JSON.stringify({ error: "image_id가 필요합니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const images = await fetchCategoryImages(supabaseAdmin, categorySlug, true);
    const currentIndex = images.findIndex((image) => image.id === imageId);

    if (currentIndex === -1) {
      return new Response(
        JSON.stringify({ error: "대상 이미지를 찾을 수 없습니다." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "move-up" || mode === "move-down") {
      const targetIndex = mode === "move-up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= images.length) {
        return new Response(
          JSON.stringify({ images }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const orderedIds = images.map((image) => image.id);
      const [movedId] = orderedIds.splice(currentIndex, 1);
      orderedIds.splice(targetIndex, 0, movedId);
      const nextImages = await normalizeCategoryOrder(supabaseAdmin, categorySlug, orderedIds);

      return new Response(
        JSON.stringify({ images: nextImages }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "toggle-visibility") {
      const target = images[currentIndex];
      const { error } = await supabaseAdmin
        .from("works_images")
        .update({ is_visible: !target.is_visible })
        .eq("id", target.id)
        .eq("category_slug", categorySlug);

      if (error) {
        throw error;
      }

      const nextImages = await fetchCategoryImages(supabaseAdmin, categorySlug, true);
      return new Response(
        JSON.stringify({ images: nextImages }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "delete") {
      const target = images[currentIndex];
      const { error: deleteRowError } = await supabaseAdmin
        .from("works_images")
        .delete()
        .eq("id", target.id)
        .eq("category_slug", categorySlug);

      if (deleteRowError) {
        throw deleteRowError;
      }

      if (target.image_path) {
        await supabaseAdmin.storage.from("works").remove([normalizeImagePath(target.image_path)]);
      }

      const nextImages = await normalizeCategoryOrder(supabaseAdmin, categorySlug);
      return new Response(
        JSON.stringify({ images: nextImages }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "지원하지 않는 작업입니다." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("manage-work-images failed", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "관리 요청 처리에 실패했습니다.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

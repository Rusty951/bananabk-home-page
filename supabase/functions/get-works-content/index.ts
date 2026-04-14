import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const allowedCategories = new Set([
  "product",
  "food",
  "dessert",
  "space",
  "portrait",
  "portrait-private",
]);

type WorksCategory = {
  slug: string;
  name: string;
  title: string;
  description: string | null;
  is_public: boolean;
  sort_order: number;
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

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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

const fetchCategories = async (supabaseAdmin: ReturnType<typeof createClient>) => {
  const { data, error } = await supabaseAdmin
    .from("works_categories")
    .select("slug, name, title, description, is_public, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as WorksCategory[];
};

const fetchVisibleImages = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  categorySlug?: string,
) => {
  let query = supabaseAdmin
    .from("works_images")
    .select("id, category_slug, image_path, image_url, caption, sort_order, is_visible, created_at")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (categorySlug) {
    query = query.eq("category_slug", categorySlug);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return attachResolvedUrls(supabaseAdmin, (data ?? []) as WorksImage[]);
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const supabaseAdmin = createAdminClient();
    const requestUrl = new URL(request.url);
    const mode = normalizeText(requestUrl.searchParams.get("mode"), 40);
    const slug = normalizeText(requestUrl.searchParams.get("slug"), 80);

    if (mode === "hub") {
      const categories = (await fetchCategories(supabaseAdmin)).filter((category) => category.is_public);
      const images = await fetchVisibleImages(supabaseAdmin);
      const firstImageBySlug = Object.fromEntries(
        categories.map((category) => {
          const image = images.find((item) => item.category_slug === category.slug) ?? null;
          return [category.slug, image];
        }),
      );

      return new Response(
        JSON.stringify({ categories, firstImageBySlug }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "category") {
      if (!allowedCategories.has(slug)) {
        return new Response(
          JSON.stringify({ error: "지원하지 않는 카테고리입니다." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const categories = await fetchCategories(supabaseAdmin);
      const category = categories.find((item) => item.slug === slug);

      if (!category) {
        return new Response(
          JSON.stringify({ error: "카테고리를 찾을 수 없습니다." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const images = await fetchVisibleImages(supabaseAdmin, slug);

      return new Response(
        JSON.stringify({ categories, category, images }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "유효한 mode 값이 필요합니다." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("get-works-content failed", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "콘텐츠 조회에 실패했습니다.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

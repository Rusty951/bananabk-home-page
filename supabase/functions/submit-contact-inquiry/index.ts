import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InquiryPayload = {
  brand_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  message?: string;
  privacy_agreed?: boolean;
  source_page?: string;
};

const normalizeText = (value: unknown, maxLength: number): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
};

const normalizeMultilineText = (value: unknown, maxLength: number): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const buildAdminMailText = (payload: {
  createdAt: string;
  brandName: string | null;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  sourcePage: string;
}) => {
  return [
    "[Banana Black] 새 문의가 접수되었습니다",
    "",
    `접수 시간: ${payload.createdAt}`,
    `브랜드명: ${payload.brandName ?? "-"}`,
    `담당자명: ${payload.contactName}`,
    `이메일: ${payload.email}`,
    `연락처: ${payload.phone}`,
    `유입 페이지: ${payload.sourcePage}`,
    "",
    "문의 내용:",
    payload.message,
  ].join("\n");
};

const sendAdminNotification = async (options: {
  resendApiKey: string;
  adminEmail: string;
  mailFrom: string;
  inquiry: {
    createdAt: string;
    brandName: string | null;
    contactName: string;
    email: string;
    phone: string;
    message: string;
    sourcePage: string;
  };
}) => {
  console.log(`actual to: ${options.adminEmail}`);
  console.log(`actual from: ${options.mailFrom}`);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: options.mailFrom,
      to: [options.adminEmail],
      subject: "[Banana Black] 새 문의가 접수되었습니다",
      text: buildAdminMailText(options.inquiry),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${errorText}`);
  }
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").trim();
  const serviceRoleKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
  const resendApiKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  const adminNotificationEmail = (Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? "").trim().toLowerCase();
  const mailFrom = (Deno.env.get("MAIL_FROM") ?? "").trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration is incomplete." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let payload: InquiryPayload;

  try {
    payload = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const brandName = normalizeText(payload.brand_name, 160) || null;
  const contactName = normalizeText(payload.contact_name, 120);
  const email = normalizeText(payload.email, 160).toLowerCase();
  const phone = normalizeText(payload.phone, 60);
  const message = normalizeMultilineText(payload.message, 5000);
  const sourcePage = normalizeText(payload.source_page, 120) || "contact";
  const privacyAgreed = payload.privacy_agreed === true;

  if (!contactName || !email || !phone || !message) {
    return new Response(
      JSON.stringify({ error: "Required fields are missing." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!privacyAgreed) {
    return new Response(
      JSON.stringify({ error: "Privacy consent is required." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!isValidEmail(email)) {
    return new Response(
      JSON.stringify({ error: "Invalid email address." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const insertPayload = {
    brand_name: brandName,
    contact_name: contactName,
    email,
    phone,
    message,
    privacy_agreed: true,
    source_page: sourcePage,
  };

  const { data: insertedInquiry, error: insertError } = await supabaseAdmin
    .from("contact_inquiries")
    .insert(insertPayload)
    .select("id, created_at, brand_name, contact_name, email, phone, message, source_page")
    .single();

  if (insertError || !insertedInquiry) {
    console.error("Failed to store inquiry", insertError);

    return new Response(
      JSON.stringify({ error: "Failed to save inquiry." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let notificationSent = false;
  let warning: string | null = null;

  if (!resendApiKey || !adminNotificationEmail || !mailFrom) {
    warning = "Inquiry saved, but email settings are incomplete.";
    console.warn(warning);
  } else {
    try {
      const adminRecipient = adminNotificationEmail;

      await sendAdminNotification({
        resendApiKey,
        adminEmail: adminRecipient,
        mailFrom,
        inquiry: {
          createdAt: insertedInquiry.created_at,
          brandName: insertedInquiry.brand_name,
          contactName: insertedInquiry.contact_name,
          email: insertedInquiry.email,
          phone: insertedInquiry.phone,
          message: insertedInquiry.message,
          sourcePage: insertedInquiry.source_page,
        },
      });

      notificationSent = true;

      const { error: updateError } = await supabaseAdmin
        .from("contact_inquiries")
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq("id", insertedInquiry.id);

      if (updateError) {
        console.error("Inquiry saved and email sent, but notification flags failed to update", updateError);
      }
    } catch (error) {
      warning = error instanceof Error
        ? error.message
        : "Inquiry saved, but email notification failed.";
      console.error("Failed to send admin email notification", error);
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      inquiryId: insertedInquiry.id,
      notificationSent,
      warning,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});

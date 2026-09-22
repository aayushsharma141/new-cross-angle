// Edge function runs on Deno — fetch is a native global
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  handlePreflight,
  okResponse,
  serverErrorResponse,
  badRequestResponse,
  rateLimitResponse,
  checkRateLimit,
  getClientId,
  verifyAdmin,
  readLimitedBody,
  structuredLog,
  getRequestId,
} from "../_lib/security.ts";

const FN = "notify-telegram";

/**
 * Trust model (Admin Audit P2-18)
 * --------------------------------
 * This function used to accept any JSON from anyone and forward it to the
 * owner's Telegram — an unauthenticated spam/phishing vector.
 *
 *  - Trusted callers (the `on_lead_insert_telegram_notify` DB trigger using the
 *    service-role key, or an admin JWT from the dashboard) may send a full
 *    `record`; it is used as-is.
 *  - Anyone else (the public contact form via supabase.functions.invoke) may
 *    only send a lead id. The lead is re-read from the database with the
 *    service role, must have been created in the last few minutes, and the
 *    message is built from the stored row — never from client-supplied text.
 *    These calls are also rate limited per IP.
 */
const UNTRUSTED_MAX_LEAD_AGE_MS = 10 * 60 * 1000;
const UNTRUSTED_RATE_LIMIT = { bucket: "notify-telegram", max: 5, windowMs: 60_000 };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface LeadRecord {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  service: string | null;
  budget: string | null;
  budget_value_inr: number | null;
  lead_source: string | null;
  lead_type: string | null;
  city: string | null;
  message: string | null;
  source: string | null;      // Human-readable tag: "Contact-Form", "Style-Quiz", etc.
  form_data: Record<string, unknown> | null; // Raw form submission payload
  created_at: string | null;
}

// Direct invocation or webhook payload
interface NotifyPayload {
  record?: LeadRecord; // If coming from DB Webhook
  [key: string]: unknown;  // If coming directly as LeadRecord
}

/** Service-role key (legacy DB trigger), Webhook secret (Dashboard Webhook), or verified admin JWT. */
async function isTrustedCaller(req: Request, serviceKey: string, webhookSecret?: string): Promise<boolean> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  if (webhookSecret && token === webhookSecret) return true;
  if (serviceKey && token === serviceKey) return true;
  const admin = await verifyAdmin(req);
  return admin.error === null;
}

/** Re-reads a lead the public form claims to have just created. */
async function loadRecentLead(id: string, serviceKey: string): Promise<LeadRecord | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!supabaseUrl || !serviceKey) return null;

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data, error } = await adminClient
    .from("leads")
    .select("id, name, email, phone, service, budget, lead_source, lead_type, city, message, source, form_data, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const createdAt = data.created_at ? Date.parse(data.created_at) : NaN;
  if (Number.isNaN(createdAt) || Date.now() - createdAt > UNTRUSTED_MAX_LEAD_AGE_MS) {
    return null;
  }

  return { budget_value_inr: null, ...data } as LeadRecord;
}

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID") || "1228126069";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET") ?? "";

  try {
    const { body: rawPayload, error: bodyError } = await readLimitedBody<NotifyPayload>(req);
    if (bodyError || !rawPayload) {
      return badRequestResponse(req, bodyError ?? "Invalid payload", {}, requestId);
    }

    const trusted = await isTrustedCaller(req, serviceKey, webhookSecret);
    let lead: LeadRecord | null = null;

    if (trusted) {
      // DB trigger / admin dashboard: payload is authoritative.
      lead = (rawPayload.record ? rawPayload.record : rawPayload) as LeadRecord;
    } else {
      const clientId = getClientId(req);
      const rl = await checkRateLimit(req, clientId, UNTRUSTED_RATE_LIMIT);
      if (rl.limited) {
        return rateLimitResponse(req, rl, {}, FN, requestId);
      }

      const candidateId = rawPayload.record?.id ?? (rawPayload as { id?: unknown }).id;
      if (typeof candidateId !== "string" || !UUID_RE.test(candidateId)) {
        return badRequestResponse(req, "A valid lead id is required", {}, requestId);
      }

      lead = await loadRecentLead(candidateId, serviceKey);
      if (!lead) {
        structuredLog("warn", FN, "Untrusted caller referenced an unknown or stale lead", { leadId: candidateId, clientId }, requestId);
        return badRequestResponse(req, "Lead not found", {}, requestId);
      }
    }

    if (!lead || !lead.id) {
      return badRequestResponse(req, "No record found in payload", {}, requestId);
    }

    if (!botToken) {
      structuredLog("error", FN, "TELEGRAM_BOT_TOKEN is missing", {}, requestId);
      return serverErrorResponse(req, "Bot configuration missing", {}, FN, undefined, requestId);
    }

    // Format the message
    const sourceLabel = lead.source || lead.lead_source?.replace(/_/g, " ") || "Website";
    const emoji = (lead.budget_value_inr && lead.budget_value_inr >= 5000000) ? "🔥" : "🚨";

    // Build admin URL
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://crossangleinterior.com";
    const adminLink = `${appBaseUrl.replace(/\/$/, "")}/admin/crm/leads?id=${lead.id}`;

    // Build optional form data summary (show key fields only)
    let formDataSummary = "";
    if (lead.form_data && typeof lead.form_data === "object") {
      const skipKeys = new Set(["email", "phone", "submittedAt", "firstName", "lastName", "message"]);
      const extra = Object.entries(lead.form_data)
        .filter(([k]) => !skipKeys.has(k))
        .map(([k, v]) => `  • <b>${escapeHtml(k)}:</b> ${escapeHtml(String(v ?? ""))}`);
      if (extra.length > 0) {
        formDataSummary = `\n━━━━━━━━━━━━━━━━━━\n📋 <b>Form Details:</b>\n${extra.join("\n")}`;
      }
    }

    const message = `
${emoji} <b>New Lead: CrossAngle Interior</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Name:</b> ${escapeHtml(lead.name)}
📞 <b>Phone:</b> <code>${escapeHtml(lead.phone)}</code>
📧 <b>Email:</b> ${escapeHtml(lead.email)}
🏠 <b>Service:</b> ${escapeHtml(lead.service || lead.lead_type || "General Inquiry")}
💰 <b>Budget:</b> ${escapeHtml(lead.budget)}
🏙️ <b>City:</b> ${escapeHtml(lead.city)}
🏷️ <b>Source:</b> ${escapeHtml(sourceLabel)}
━━━━━━━━━━━━━━━━━━
💬 <b>Message:</b>
<i>${escapeHtml(lead.message || "No message provided")}</i>${formDataSummary}
━━━━━━━━━━━━━━━━━━
🔗 <a href="${adminLink}">View in Admin CRM</a>
📅 ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
    `.trim();

    // Send to Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      structuredLog("error", FN, "Telegram API error", { error: errorData }, requestId);
      return serverErrorResponse(req, "Failed to send Telegram message", {}, FN, undefined, requestId);
    }

    structuredLog("info", FN, "Telegram notification sent", { leadId: lead.id }, requestId);
    return okResponse(req, { success: true }, {}, undefined, undefined, requestId);

  } catch (error) {
    structuredLog("error", FN, "Unexpected error in notify-telegram", { error: String(error) }, requestId);
    return serverErrorResponse(req, "Internal Server Error", {}, FN, error, requestId);
  }
});

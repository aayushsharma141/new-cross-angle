// Edge function runs on Deno — fetch is a native global
import {
  handlePreflight,
  okResponse,
  serverErrorResponse,
  structuredLog,
  getRequestId,
} from "../_lib/security.ts";

const FN = "notify-telegram";

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

  try {
    const rawPayload = await req.json() as NotifyPayload;
    // Extract lead depending on whether it was a webhook or direct invocation
    const lead = (rawPayload.record ? rawPayload.record : rawPayload) as LeadRecord;

    if (!lead) {
      return serverErrorResponse(req, "No record found in payload", {}, FN, undefined, requestId);
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
    // @ts-expect-error -- fetch is a Deno global, not recognized by VS Code's TS
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

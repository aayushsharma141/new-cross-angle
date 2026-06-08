// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  buildCorsHeaders,
  handlePreflight,
  badRequestResponse,
  serverErrorResponse,
  unauthorizedResponse,
  okResponse,
  structuredLog,
  getRequestId,
  readLimitedBody,
} from "../_lib/security.ts";

const HIGH_VALUE_THRESHOLD = 5_000_000;
const DEFAULT_WHATSAPP_NUMBER = "917410179061";
const DEFAULT_ALERT_EMAIL = "info@crossangleinterior.com";
const SUPPORTED_EVENTS = new Set(["INSERT", "insert"]);

const FN = "handle-new-lead";
type JsonMap = Record<string, unknown>;

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
  auto_reply_sent_at: string | null;
  auto_reply_template: string | null;
  internal_notified_at: string | null;
  internal_notes: JsonMap | null;
  created_at: string | null;
}

interface WebhookPayload {
  type?: string;
  eventType?: string;
  table?: string;
  schema?: string;
  record?: Partial<LeadRecord> | null;
  old_record?: Partial<LeadRecord> | null;
}

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateWebhookSecret(req: Request): boolean {
  const configured = Deno.env.get("LEAD_WEBHOOK_SECRET")?.trim();
  if (!configured) return false;

  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const candidates = [
    bearer,
    authHeader?.trim(),
    req.headers.get("x-webhook-secret")?.trim(),
    req.headers.get("x-lead-webhook-secret")?.trim(),
  ].filter(Boolean) as string[];

  return candidates.includes(configured);
}

function sourceLabel(source: string | null | undefined): string {
  switch (source) {
    case "website_contact":
      return "Contact Form";
    case "estimator":
      return "Estimator";
    case "style_quiz":
      return "Style Quiz";
    case "aesthetic_discovery_engine":
      return "Aesthetic Discovery Engine";
    case "whatsapp":
      return "WhatsApp";
    case "instagram":
      return "Instagram";
    case "referral":
      return "Referral";
    default:
      return source ? source.replace(/_/g, " ") : "Lead Capture";
  }
}

function buildWhatsAppLink(): string {
  const rawNumber = Deno.env.get("WHATSAPP_NUMBER") || DEFAULT_WHATSAPP_NUMBER;
  const digits = rawNumber.replace(/\D/g, "");
  return `https://wa.me/${digits || DEFAULT_WHATSAPP_NUMBER}`;
}

function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "Not provided";
  return `INR ${value.toLocaleString("en-IN")}`;
}

function templateTier(lead: LeadRecord): "Luxury High-Value" | "Standard Premium" {
  return (lead.budget_value_inr ?? 0) >= HIGH_VALUE_THRESHOLD ? "Luxury High-Value" : "Standard Premium";
}

function taskPriority(tier: string): "high" | "normal" {
  return tier === "Luxury High-Value" ? "high" : "normal";
}

function taskDueAt(tier: string): string {
  const now = Date.now();
  const offsetMs = tier === "Luxury High-Value" ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return new Date(now + offsetMs).toISOString();
}

function summarizeMessage(message: string | null | undefined): string {
  if (!message) return "No message provided";
  const trimmed = message.trim();
  return trimmed.length > 280 ? `${trimmed.slice(0, 277)}...` : trimmed;
}

function sourceContext(lead: LeadRecord): string {
  if (lead.lead_source === "estimator") {
    return "We've received your estimator request and our team is reviewing the scope, budget, and execution preferences you shared.";
  }

  if (lead.lead_source === "style_quiz" || lead.lead_source === "aesthetic_discovery_engine") {
    return "Your Spatial Identity Blueprint has been saved, and our team is reviewing the design direction and priorities from your quiz.";
  }

  return "We've received your inquiry and our team is reviewing the details you shared.";
}

function buildCustomerEmail(lead: LeadRecord, tier: "Luxury High-Value" | "Standard Premium") {
  const safeName = escapeHtml(lead.name || "there");
  const safeService = escapeHtml(lead.service || lead.lead_type || "your project");
  const whatsappLink = buildWhatsAppLink();
  const sharedIntro = sourceContext(lead);

  if (tier === "Luxury High-Value") {
    return {
      subject: "Priority Review for Your Cross Angle Interior Inquiry",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; max-width: 640px; margin: 0 auto; padding: 40px 28px; background: #ffffff;">
          <p style="font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: #8b5e34; margin: 0 0 18px;">Luxury High-Value Inquiry</p>
          <h1 style="font-size: 30px; line-height: 1.2; margin: 0 0 18px; color: #111827;">Hello ${safeName},</h1>
          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 16px;">${escapeHtml(sharedIntro)}</p>
          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 16px;">Your ${safeService} request has been flagged for senior-priority review, and you can expect same-business-day outreach from our team to discuss consultation timing, site requirements, and the best next step.</p>
          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px;">We tailor every high-value engagement around design clarity, execution quality, and a proposal process aligned to your home, budget, and timeline.</p>
          <div style="margin: 28px 0;">
            <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-weight: 600;">Chat on WhatsApp for urgent needs</a>
          </div>
          <p style="font-size: 14px; line-height: 1.7; color: #4b5563; margin: 0 0 8px;">You can also reply directly to this email if you want to share inspiration images, plans, or priorities before we connect.</p>
          <p style="font-size: 14px; line-height: 1.7; color: #4b5563; margin: 0 0 28px;">Meanwhile, you can explore our recent work at <a href="https://crossangleinterior.com/portfolio" style="color: #8b5e34;">crossangleinterior.com/portfolio</a>.</p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0;">Warm regards,<br /><strong>Cross Angle Interior</strong></p>
        </div>
      `,
    };
  }

  return {
    subject: "Thank You for Reaching Out to Cross Angle Interior",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; max-width: 640px; margin: 0 auto; padding: 40px 28px; background: #ffffff;">
        <h1 style="font-size: 28px; line-height: 1.2; margin: 0 0 18px; color: #111827;">Hi ${safeName},</h1>
        <p style="font-size: 16px; line-height: 1.7; margin: 0 0 16px;">${escapeHtml(sharedIntro)}</p>
        <p style="font-size: 16px; line-height: 1.7; margin: 0 0 16px;">Our team will review your ${safeService} requirements and get back to you within 24 hours with the best next step for your project.</p>
        <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px;">If you would like immediate assistance, you can reach us on WhatsApp or simply reply to this email with any additional details, plans, or inspiration references.</p>
        <div style="margin: 28px 0;">
          <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-weight: 600;">Chat on WhatsApp</a>
        </div>
        <p style="font-size: 14px; line-height: 1.7; color: #4b5563; margin: 0 0 28px;">In the meantime, you can explore our portfolio and studio work at <a href="https://crossangleinterior.com/portfolio" style="color: #8b5e34;">crossangleinterior.com/portfolio</a>.</p>
        <p style="font-size: 15px; line-height: 1.7; margin: 0;">Best regards,<br /><strong>Cross Angle Interior</strong></p>
      </div>
    `,
  };
}

function buildInternalNotification(lead: LeadRecord, tier: "Luxury High-Value" | "Standard Premium", dueAt: string) {
  const alertEmail = Deno.env.get("LEAD_ALERT_EMAIL") || DEFAULT_ALERT_EMAIL;
  const isHotLead = tier === "Luxury High-Value";
  const appBaseUrl = (Deno.env.get("APP_BASE_URL") || Deno.env.get("SITE_URL") || "https://crossangleinterior.com").replace(/\/$/, "");
  const adminUrl = `${appBaseUrl}/admin/crm/leads`;
  const safeName = escapeHtml(lead.name || "Unknown");
  const safeEmail = escapeHtml(lead.email || "Not provided");
  const safePhone = escapeHtml(lead.phone || "Not provided");
  const safeSource = escapeHtml(sourceLabel(lead.lead_source));
  const safeService = escapeHtml(lead.service || lead.lead_type || "Not provided");
  const safeBudgetText = escapeHtml(lead.budget || "Not provided");
  const safeMessage = escapeHtml(summarizeMessage(lead.message));

  return {
    to: alertEmail,
    subject: `${isHotLead ? "🔥 HOT LEAD" : "New Lead"} — ${safeName} — ${safeSource}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; max-width: 700px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px; color: ${isHotLead ? "#b91c1c" : "#111827"};">${isHotLead ? "🔥 HOT LEAD" : "New Lead"} Notification</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; font-weight: 600;">Name</td><td style="padding: 8px 0;">${safeName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Email</td><td style="padding: 8px 0;">${safeEmail}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Phone</td><td style="padding: 8px 0;">${safePhone}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Source</td><td style="padding: 8px 0;">${safeSource}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Service / Type</td><td style="padding: 8px 0;">${safeService}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Budget</td><td style="padding: 8px 0;">${safeBudgetText}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Budget Value</td><td style="padding: 8px 0;">${escapeHtml(formatCurrency(lead.budget_value_inr))}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Message Summary</td><td style="padding: 8px 0;">${safeMessage}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Follow-up Due</td><td style="padding: 8px 0;">${escapeHtml(new Date(dueAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }))}</td></tr>
        </table>
        <p style="margin: 24px 0 0;">
          <a href="${adminUrl}" style="color: #8b5e34; font-weight: 600;">Open CRM leads</a>
        </p>
      </div>
    `,
  };
}

async function sendResendEmail(payload: { from: string; to: string[]; subject: string; html: string }, resendApiKey: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API failed (${response.status}): ${body}`);
  }
}

async function logActivity(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  activityType: string,
  description: string,
  metadata: JsonMap = {},
  requestId?: string,
) {
  const { error } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    activity_type: activityType,
    description,
    metadata: { ...metadata, trace_id: requestId },
    performed_by: null,
  });

  if (error) {
    structuredLog("error", FN, `Failed to log ${activityType}`, { error: error.message }, requestId);
  }
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  try {
    if (!validateWebhookSecret(req)) {
      return unauthorizedResponse(req, "Invalid webhook secret", {}, requestId);
    }

    // Enforce 10KB payload limit — DB trigger payloads are typically <1KB.
    // Oversized payloads could cause OOM crashes or billing abuse.
    const { body: payload, error: sizeError } = await readLimitedBody<WebhookPayload>(req, 10 * 1024);
    if (sizeError || !payload) {
      return badRequestResponse(req, sizeError ?? "Empty payload", {}, requestId);
    }
    const eventType = payload.type || payload.eventType;

    if (eventType && !SUPPORTED_EVENTS.has(eventType)) {
      return okResponse(req, { success: true, ignored: true, reason: `Unsupported event ${eventType}` }, {}, undefined, undefined, requestId);
    }

    const recordId = payload.record?.id;
    if (!recordId) {
      return badRequestResponse(req, "Webhook payload did not include record.id", {}, requestId);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return serverErrorResponse(req, "Supabase environment is not configured", {}, FN, undefined, requestId);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, name, email, phone, service, budget, budget_value_inr, lead_source, lead_type, city, message, auto_reply_sent_at, auto_reply_template, internal_notified_at, internal_notes, created_at")
      .eq("id", recordId)
      .single();

    if (leadError || !lead) {
      return serverErrorResponse(req, `Unable to load lead ${recordId}`, {}, FN, leadError, requestId);
    }

    const typedLead = lead as LeadRecord;
    const tier = templateTier(typedLead);
    const dueAt = taskDueAt(tier);
    const priority = taskPriority(tier);
    const taskTitle = `Respond to ${typedLead.name || "lead"} (${sourceLabel(typedLead.lead_source)})`;
    const taskDescription = [
      `Template used: ${tier}`,
      `Budget tier: ${tier === "Luxury High-Value" ? "High-value" : "Standard"}`,
      `Source: ${sourceLabel(typedLead.lead_source)}`,
      `Contact: ${typedLead.email || "no email"}${typedLead.phone ? ` / ${typedLead.phone}` : ""}`,
      `Message: ${summarizeMessage(typedLead.message)}`,
    ].join("\n");

    const results = {
      autoReplySent: false,
      internalNotified: false,
      crmTaskCreated: false,
      skipped: [] as string[],
      errors: [] as string[],
    };

    if (typedLead.email && resendApiKey && !typedLead.auto_reply_sent_at) {
      try {
        const email = buildCustomerEmail(typedLead, tier);
        await sendResendEmail({
          from: "Cross Angle Interior <hello@crossangleinterior.com>",
          to: [typedLead.email],
          subject: email.subject,
          html: email.html,
        }, resendApiKey);

        const { error: updateError } = await supabase
          .from("leads")
          .update({
            auto_reply_sent_at: new Date().toISOString(),
            auto_reply_template: tier,
          })
          .eq("id", typedLead.id);

        if (updateError) {
          results.errors.push(`Failed to update lead auto reply fields: ${updateError.message}`);
        }

        await logActivity(supabase, typedLead.id, "auto_reply_sent", `Customer auto-reply sent using ${tier}`, {
          template: tier,
          budget_value_inr: typedLead.budget_value_inr,
          lead_source: typedLead.lead_source,
        }, requestId);
        results.autoReplySent = true;
      } catch (error) {
        structuredLog("error", FN, "Customer auto-reply failed", { error: String(error) }, requestId);
        results.errors.push(error instanceof Error ? error.message : "Customer auto-reply failed");
      }
    } else if (!typedLead.email) {
      results.skipped.push("customer-email-missing");
    } else if (!resendApiKey) {
      results.skipped.push("resend-not-configured");
    } else {
      results.skipped.push("customer-email-already-sent");
    }

    if (resendApiKey && !typedLead.internal_notified_at) {
      try {
        const internalEmail = buildInternalNotification(typedLead, tier, dueAt);
        await sendResendEmail({
          from: "Cross Angle Interior <hello@crossangleinterior.com>",
          to: [internalEmail.to],
          subject: internalEmail.subject,
          html: internalEmail.html,
        }, resendApiKey);

        const { error: updateError } = await supabase
          .from("leads")
          .update({ internal_notified_at: new Date().toISOString() })
          .eq("id", typedLead.id);

        if (updateError) {
          results.errors.push(`Failed to update internal notification timestamp: ${updateError.message}`);
        }

        await logActivity(supabase, typedLead.id, "internal_notification_sent", "Internal lead notification sent", {
          template: tier,
          alert_email: Deno.env.get("LEAD_ALERT_EMAIL") || DEFAULT_ALERT_EMAIL,
          due_at: dueAt,
        }, requestId);
        results.internalNotified = true;
      } catch (error) {
        structuredLog("error", FN, "Internal notification failed", { error: String(error) }, requestId);
        results.errors.push(error instanceof Error ? error.message : "Internal notification failed");
      }
    } else if (!resendApiKey) {
      results.skipped.push("internal-email-skipped-resend-missing");
    } else {
      results.skipped.push("internal-email-already-sent");
    }

    const { data: taskRow, error: taskError } = await supabase
      .from("crm_tasks")
      .upsert({
        lead_id: typedLead.id,
        task_type: "initial_follow_up",
        title: taskTitle,
        description: taskDescription,
        priority,
        status: "pending",
        due_at: dueAt,
      }, {
        onConflict: "lead_id,task_type",
      })
      .select("id")
      .single();

    if (taskError) {
      structuredLog("error", FN, "CRM task upsert failed", { error: taskError.message }, requestId);
      results.errors.push(`Failed to create CRM task: ${taskError.message}`);
    } else {
      await logActivity(supabase, typedLead.id, "crm_task_created", "Initial follow-up task created or refreshed", {
        crm_task_id: taskRow.id,
        due_at: dueAt,
        priority,
        task_type: "initial_follow_up",
      }, requestId);
      results.crmTaskCreated = true;
    }

    return okResponse(req, { success: true, leadId: typedLead.id, tier, ...results }, {}, undefined, undefined, requestId);
  } catch (error) {
    structuredLog("error", FN, "handle-new-lead error", { error: String(error) }, requestId);
    const message = error instanceof Error ? error.message : "Unknown error";
    return serverErrorResponse(req, message, {}, FN, error, requestId);
  }
});

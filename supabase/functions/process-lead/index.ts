// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildCorsHeaders,
  handlePreflight,
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  badRequestResponse,
  serverErrorResponse,
  okResponse,
  checkIdempotency,
  structuredLog,
  signWebhookPayload,
  getRequestId,
} from "../_lib/security.ts";

const FN = "process-lead";

// 5 submissions per minute per IP — contact form abuse protection.
const RATE_OPTS = { bucket: "process-lead", max: 5, windowMs: 60_000 };

// Input validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function isValidName(name: string): boolean {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 100;
}

function isValidPhone(phone: string | undefined): boolean {
  if (!phone) return true; // Phone is optional
  // Allow common phone formats: digits, spaces, dashes, parentheses, plus sign
  const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
  return phoneRegex.test(phone);
}

function isValidMessage(message: string | undefined): boolean {
  if (!message) return true; // Message can be empty
  return message.length <= 5000; // Max 5000 characters
}

function isValidCategory(category: string | undefined): boolean {
  if (!category) return true;
  return ['residential', 'commercial', 'other'].includes(category);
}

function sanitizeString(str: string | undefined): string {
  if (!str) return '';
  // Remove any potential script tags and trim
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

async function syncToGoogleSheets(
  lead: { name: string; email: string; phone?: string; message?: string; category?: string },
  requestId: string
) {
  const webhookUrl = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");

  if (!webhookUrl) {
    structuredLog("info", FN, "Google Sheets webhook not configured, skipping sync", {}, requestId);
    return;
  }

  try {
    const payloadStr = JSON.stringify({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || "",
      message: lead.message || "",
      category: lead.category || "other",
      timestamp: new Date().toISOString(),
    });

    const signature = await signWebhookPayload(payloadStr);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (signature) {
      headers["X-CrossAngle-Signature"] = signature;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: payloadStr,
    });

    if (!response.ok) {
      structuredLog("error", FN, "Google Sheets webhook error", { status: response.status, body: await response.text() }, requestId);
    } else {
      structuredLog("info", FN, "Lead synced to Google Sheets successfully", {}, requestId);
    }
  } catch (error) {
    structuredLog("error", FN, "Error syncing to Google Sheets", { error: String(error) }, requestId);
  }
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  // KV-backed rate limit (email not yet available, use IP at entry)
  const clientId = getClientId(req);
  const rl = await checkRateLimit(req, clientId, RATE_OPTS);
  if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

  try {
    const corsHeaders = buildCorsHeaders(req);
    let body;
    try {
      body = await req.json();
    } catch {
      return badRequestResponse(req, "Invalid JSON", {}, requestId);
    }

    const { name, email, phone, message, category } = body;

    // Validate required fields
    if (!email || !isValidEmail(email)) {
      return badRequestResponse(req, "Invalid email address", {}, requestId);
    }

    if (!name || !isValidName(name)) {
      return badRequestResponse(req, "Name is required and must be under 100 characters", {}, requestId);
    }

    if (!isValidPhone(phone)) {
      return badRequestResponse(req, "Invalid phone number format", {}, requestId);
    }

    if (!isValidMessage(message)) {
      return badRequestResponse(req, "Message must be under 5000 characters", {}, requestId);
    }

    if (!isValidCategory(category)) {
      return badRequestResponse(req, "Invalid category", {}, requestId);
    }

    // Rate limiting check (per IP already done above, this is belt-and-suspenders per email)
    const emailId = getClientId(req, undefined) + `:${email}`;
    const rlEmail = await checkRateLimit(req, emailId, { ...RATE_OPTS, bucket: "process-lead-email" });
    if (rlEmail.limited) return rateLimitResponse(req, rlEmail, {}, FN, requestId);

    // Idempotency: prevent duplicate inserts from double-clicks / retries.
    // Key = email + sanitized name + category (stable for same submission).
    const idemKey = `${email}:${name?.trim().toLowerCase()}:${category ?? "other"}`;
    const idem = await checkIdempotency(idemKey, "process-lead");
    if (idem.duplicate) {
      structuredLog("info", FN, "Duplicate submission blocked", { email }, requestId);
      return okResponse(req, { success: true, deduplicated: true }, {}, rl, RATE_OPTS.max, requestId);
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedMessage = sanitizeString(message);
    const sanitizedPhone = sanitizeString(phone);

    // Operational sync only. Customer/internal messaging is handled by the
    // database-webhook automation in handle-new-lead.
    await syncToGoogleSheets({
      name: sanitizedName,
      email,
      phone: sanitizedPhone,
      message: sanitizedMessage,
      category
    }, requestId);

    // -----------------------------------------------------------------------
    // AI RESPONSE HOOK (optional)
    // If you want to generate an AI acknowledgment message for internal notes,
    // add your integration here. Suggested alternatives:
    //   - Google Gemini: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
    //     (use GEMINI_API_KEY env var)
    //   - OpenAI:        https://api.openai.com/v1/chat/completions
    //     (use OPENAI_API_KEY env var)
    // The result can be stored in internal_notes below.
    // -----------------------------------------------------------------------

    // Insert the lead into Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from("leads")
      .insert({
        name: sanitizedName,
        email,
        phone: sanitizedPhone,
        message: sanitizedMessage,
        lead_source: body.lead_source || "website_contact",
        source_url: body.source_url || "",
        status: "new",
        service: category || null,
        lead_type: category === "commercial" ? "commercial" : null,
        budget_value_inr: null,
        internal_notes: { category: category || "other" }
      });

    if (insertError) {
      structuredLog("error", FN, "DB insert failed", { code: insertError.code, details: insertError.details }, requestId);
    } else {
      await idem.markComplete();
      structuredLog("info", FN, "Lead inserted", { email }, requestId);
    }

    structuredLog("info", FN, "Lead processed successfully", { email, category: category ?? "other" }, requestId);

    return okResponse(req, { success: true }, {}, rl, RATE_OPTS.max, requestId);
  } catch (error: unknown) {
    structuredLog("error", FN, "Unhandled exception", { error: String(error) }, requestId);
    const message = error instanceof Error ? error.message : "Unknown error";
    return serverErrorResponse(req, message, {}, FN, error, requestId);
  }
});

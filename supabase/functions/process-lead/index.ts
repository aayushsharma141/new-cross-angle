import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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
} from "../_lib/security.ts";

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

async function sendWhatsAppNotification(lead: { name: string; email: string; phone?: string; message?: string }) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_WHATSAPP_FROM");
  const adminNumber = Deno.env.get("ADMIN_WHATSAPP_NUMBER");

  if (!accountSid || !authToken || !fromNumber || !adminNumber) {
    console.log("Twilio credentials not configured, skipping WhatsApp notification");
    return;
  }

  try {
    const message = `🏠 *New Lead from Cross Angle Interior*\n\n*Name:* ${lead.name}\n*Email:* ${lead.email}\n*Phone:* ${lead.phone || 'Not provided'}\n*Message:* ${lead.message || 'No message'}`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          From: `whatsapp:${fromNumber}`,
          To: `whatsapp:${adminNumber}`,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      console.error("Twilio API error:", await response.text());
    } else {
      console.log("WhatsApp notification sent successfully");
    }
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
  }
}

async function syncToGoogleSheets(lead: { name: string; email: string; phone?: string; message?: string; category?: string }) {
  const webhookUrl = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");

  if (!webhookUrl) {
    console.log("Google Sheets webhook not configured, skipping sync");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        message: lead.message || "",
        category: lead.category || "other",
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Google Sheets webhook error:", await response.text());
    } else {
      console.log("Lead synced to Google Sheets successfully");
    }
  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
  }
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  // KV-backed rate limit (email not yet available, use IP at entry)
  const clientId = getClientId(req);
  const rl = await checkRateLimit(req, clientId, RATE_OPTS);
  if (rl.limited) return rateLimitResponse(req, rl);

  try {
    const corsHeaders = buildCorsHeaders(req);
    let body;
    try {
      body = await req.json();
    } catch {
      console.error("Invalid JSON in request body");
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, email, phone, message, category } = body;

    // Validate required fields
    if (!email || !isValidEmail(email)) {
      console.error("Invalid email provided:", email);
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!name || !isValidName(name)) {
      console.error("Invalid name provided");
      return new Response(JSON.stringify({ error: "Name is required and must be under 100 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidPhone(phone)) {
      console.error("Invalid phone format");
      return new Response(JSON.stringify({ error: "Invalid phone number format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidMessage(message)) {
      console.error("Message too long");
      return new Response(JSON.stringify({ error: "Message must be under 5000 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidCategory(category)) {
      console.error("Invalid category");
      return new Response(JSON.stringify({ error: "Invalid category" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting check (per IP already done above, this is belt-and-suspenders per email)
    const emailId = getClientId(req, undefined) + `:${email}`;
    const rlEmail = await checkRateLimit(req, emailId, { ...RATE_OPTS, bucket: "process-lead-email" });
    if (rlEmail.limited) return rateLimitResponse(req, rlEmail);

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedMessage = sanitizeString(message);
    const sanitizedPhone = sanitizeString(phone);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Send WhatsApp notification and sync to Google Sheets in parallel
    // Both are fire-and-forget with internal error handling
    await Promise.allSettled([
      sendWhatsAppNotification({
        name: sanitizedName,
        email,
        phone: sanitizedPhone,
        message: sanitizedMessage
      }),
      syncToGoogleSheets({
        name: sanitizedName,
        email,
        phone: sanitizedPhone,
        message: sanitizedMessage,
        category
      }),
    ]);

    if (!LOVABLE_API_KEY) {
      console.log("LOVABLE_API_KEY not configured, skipping AI response");
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate AI response
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional interior design consultant at Cross Angle Interior. Generate a warm, professional acknowledgment message for a new inquiry. Be friendly but professional. Keep the response under 100 words. Include a brief mention that our team will reach out within 24 hours to discuss their project in detail.`
          },
          {
            role: "user",
            content: `New inquiry from ${sanitizedName} (${email}): "${sanitizedMessage}"`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI gateway error:", await aiResponse.text());
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const generatedResponse = aiData.choices?.[0]?.message?.content || "";

    // Update lead with AI response
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from("leads")
      .update({ ai_response: generatedResponse })
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("Lead processed with AI response, WhatsApp notification, and Google Sheets sync");

    return okResponse(req, { success: true, aiResponse: generatedResponse }, {}, rl, RATE_OPTS.max);
  } catch (error: unknown) {
    console.error("Error processing lead:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return serverErrorResponse(req, message);
  }
});

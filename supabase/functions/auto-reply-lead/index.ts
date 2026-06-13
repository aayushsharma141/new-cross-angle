// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
    buildCorsHeaders,
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
    badRequestResponse,
    serverErrorResponse,
    okResponse,
    structuredLog,
    getRequestId,
} from "../_lib/security.ts";

const FN = "auto-reply-lead";
const RATE_OPTS = { bucket: "auto-reply", max: 3, windowMs: 60_000 };

interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    service?: string;
}

Deno.serve(async (req) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);

    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { lead }: { lead: Lead } = await req.json();

        if (!lead || !lead.email) {
            return badRequestResponse(req, "Lead email is required for auto-reply", {}, requestId);
        }

        structuredLog("info", FN, `Processing Auto-Reply`, { email: lead.email, lead_id: lead.id }, requestId);

        // 1. Fetch template from DB or use fallback
        const { data: settings } = await supabaseClient.from('site_settings').select('integrations').limit(1).maybeSingle();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const integrations = (settings?.integrations as any) || {};
        const customTemplate = integrations?.email_templates?.auto_reply_lead;

        let htmlContent = `
            <div style="font-family: sans-serif; color: #333;">
              <h2>Hi ${lead.name},</h2>
              <p>Thank you for reaching out to Cross Angle Interior. We have received your inquiry regarding <strong>${lead.service || "your project"}</strong>.</p>
              <p>Our team is reviewing your details and will get back to you within 24 hours to discuss how we can bring your vision to life.</p>
              <p>In the meantime, feel free to browse our <a href="https://crossangleinterior.com/portfolio">latest projects</a> for inspiration.</p>
              <br/>
              <p>Best regards,</p>
              <p><strong>The Cross Angle Team</strong></p>
              <p style="font-size: 12px; color: #888;">Jamshedpur, India</p>
            </div>
        `;

        if (customTemplate) {
            htmlContent = customTemplate
                .replace(/\{\{lead\.name\}\}/g, lead.name)
                .replace(/\{\{lead\.service\}\}/g, lead.service || "your project")
                .replace(/\{\{lead\.email\}\}/g, lead.email)
                .replace(/\{\{lead\.phone\}\}/g, lead.phone || "");
        }

        // 2. Send Email via Resend
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || integrations?.resend_api_key;
        if (RESEND_API_KEY) {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Cross Angle <hello@crossangleinterior.com>', // User needs to verify domain
                    to: [lead.email],
                    subject: `Thank you for contacting Cross Angle Interior!`,
                    html: htmlContent
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                structuredLog("error", FN, "Resend Error", { error: errorData }, requestId);
            } else {
                structuredLog("info", FN, "Auto-reply email sent successfully", { email: lead.email }, requestId);

                // 2. Log Activity
                await supabaseClient.from('lead_activities').insert({
                    lead_id: lead.id,
                    activity_type: 'email_sent',
                    description: 'Auto-reply email sent',
                    performed_by: null // System action
                });
            }
        } else {
            structuredLog("warn", FN, "RESEND_API_KEY not set, skipping auto-reply", {}, requestId);
        }

        return okResponse(req, { success: true }, {}, rl, RATE_OPTS.max, requestId);

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        structuredLog("error", FN, "Auto-reply Unhandled Exception", { error: msg }, requestId);
        return serverErrorResponse(req, msg, {}, FN, error, requestId);
    }
});

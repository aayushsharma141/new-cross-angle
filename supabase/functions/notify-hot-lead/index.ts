import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { 
  handlePreflight, 
  checkRateLimit, 
  getClientId, 
  rateLimitResponse, 
  okResponse, 
  serverErrorResponse, 
  structuredLog, 
  getRequestId 
} from "../_lib/security.ts";

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    service?: string;
    message?: string;
    budget?: string;
    score?: number;
    priority?: string;
}

const FN = "notify-hot-lead";
const RATE_OPTS = { bucket: "notify-hot-lead", max: 5, windowMs: 60_000 };


Deno.serve(async (req) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabaseClient = createClient(supabaseUrl, supabaseKey);

        const { lead }: { lead: Lead } = await req.json();

        // Calculate score logic (Server-side validation)
        const isHot = (lead.score && lead.score >= 70) || (lead.priority === 'hot');

        if (isHot) {
            structuredLog("info", FN, `Processing Hot Lead Alert`, { email: lead.email, score: lead.score }, requestId);

            const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
            if (RESEND_API_KEY) {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Cross Angle <leads@crossangleinterior.com>',
                        to: ['aayushsharma141@gmail.com'], 
                        subject: `🔥 HOT LEAD: ${lead.name} (${lead.score}/100)`,
                        html: `
              <h2>High Priority Lead Received!</h2>
              <p><strong>Score:</strong> ${lead.score}/100</p>
              <p><strong>Name:</strong> ${lead.name}</p>
              <p><strong>Phone:</strong> ${lead.phone}</p>
              <p><strong>Service:</strong> ${lead.service}</p>
              <p><strong>Budget:</strong> ${lead.budget}</p>
              <p><strong>Message:</strong> ${lead.message}</p>
              <br/>
              <p><a href="${supabaseUrl.replace('.supabase.co', '')}/admin/leads">View in Dashboard</a></p>
            `
                    })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    structuredLog("info", FN, "Hot lead email sent", { resend_id: data.id }, requestId);
                } else {
                    const err = await res.text();
                    structuredLog("error", FN, "Resend API error", { error: err }, requestId);
                }
            } else {
                structuredLog("warn", FN, "RESEND_API_KEY not set, skipping email alert.", {}, requestId);
            }
        }

        return okResponse(req, { success: true }, {}, rl, RATE_OPTS.max, requestId);

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        structuredLog("error", FN, "Hot Lead Notification Failure", { error: msg }, requestId);
        return serverErrorResponse(req, msg, {}, FN, error, requestId);
    }
});

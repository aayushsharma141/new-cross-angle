import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

function isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const key = identifier.toLowerCase().trim();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return true;
    }

    record.count++;
    return false;
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        if (isRateLimited(`ip:${ip}`)) {
            return new Response(JSON.stringify({ error: "Too Many Requests" }), {
                status: 429,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { lead }: { lead: Lead } = await req.json()

        // Calculate score logic (Server-side validation)
        // We can reuse the same logic or trust the client passed score if authenticated. 
        // For now, let's assume lead.score is passed or we calculate simple high priority check.

        const isHot = (lead.score && lead.score >= 70) || (lead.priority === 'hot');

        if (isHot) {
            console.log(`Processing Hot Lead: ${lead.name}`);

            const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
            if (RESEND_API_KEY) {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Cross Angle <leads@crossangleinterior.com>', // User needs to verify domain
                        to: ['aayushsharma141@gmail.com'], // Defaulting to dev email or env var
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
              <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/admin/leads">View in Dashboard</a></p>
            `
                    })
                });
                const data = await res.json();
                console.log("Email sent:", data);
            } else {
                console.log("RESEND_API_KEY not set, skipping email.");
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

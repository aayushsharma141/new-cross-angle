import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Lead {
    id: string;
    name: string;
    email: string; // Required for auto-reply
    phone?: string;
    service?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { lead }: { lead: Lead } = await req.json()

        if (!lead || !lead.email) {
            throw new Error("Lead email is required for auto-reply")
        }

        console.log(`Processing Auto-Reply for: ${lead.email}`);

        // 1. Send Email via Resend
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
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
                    html: `
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
          `
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Resend Error:", errorData);
            } else {
                console.log("Auto-reply email sent successfully.");

                // 2. Log Activity
                await supabaseClient.from('lead_activities').insert({
                    lead_id: lead.id,
                    activity_type: 'email_sent',
                    description: 'Auto-reply email sent',
                    performed_by: null // System action
                });
            }
        } else {
            console.log("RESEND_API_KEY not set, skipping auto-reply.");
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error("Auto-reply Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

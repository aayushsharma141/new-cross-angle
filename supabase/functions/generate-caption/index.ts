import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  handlePreflight,
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  okResponse,
  badRequestResponse,
  unauthorizedResponse,
  serverErrorResponse,
  structuredLog,
  getRequestId
} from "../_lib/security.ts";
import { callOmniRoute, parseModelFromRequest } from "../_lib/omniroute.ts";

interface RequestBody {
    imageUrl: string
    projectContext?: string
    maxLength?: number
}

const FN = "generate-caption";
const RATE_OPTS = { bucket: "generate-caption", max: 5, windowMs: 60_000 };
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

Deno.serve(async (req) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);

    // Rate limiting
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

    try {
        // Verify User Auth (prevent public abuse)
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return unauthorizedResponse(req, "Authentication required", {}, requestId);
        }
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
        if (userError || !user) {
            return unauthorizedResponse(req, "Invalid session", {}, requestId);
        }

        const { imageUrl, projectContext, maxLength = 125 }: RequestBody = await req.json()

        if (!imageUrl) {
            return badRequestResponse(req, 'imageUrl is required', {}, requestId);
        }

        if (!OPENROUTER_API_KEY && !ANTHROPIC_API_KEY) {
            structuredLog("error", FN, "Neither OPENROUTER_API_KEY nor ANTHROPIC_API_KEY is configured", {}, requestId);
            throw new Error('AI service API keys not configured');
        }

        // Fetch image and convert to base64
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = btoa(
            new Uint8Array(imageBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
            )
        )

        // Determine media type
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
        const model = parseModelFromRequest(
            { model: 'google/gemini-2.5-flash' },
            'OMNIROUTE_CAPTION_MODEL'
        );

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        };

        structuredLog("info", FN, `Using OmniRoute (${model}) for caption generation`, {}, requestId);

        const omniRes = await callOmniRoute(
            {
                model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Generate a concise, SEO-friendly alt text for this interior design image. ${projectContext ? `Context: ${projectContext}.` : ''
                                    } Requirements:
- Maximum ${maxLength} characters
- Describe the room type, style, and key features
- Use professional interior design terminology
- Focus on what makes this space unique
- Start with the room type (e.g., "Modern minimalist bedroom...")
- Do not use phrases like "image of" or "picture of"

Respond with ONLY the alt text, nothing else.`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${contentType};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.5,
                max_tokens: 150
            },
            corsHeaders
        );

        if (!omniRes.ok) {
            const error = await omniRes.text();
            throw new Error(`OmniRoute API error: ${error}`);
        }

        const data = await omniRes.json();
        const caption = data.choices?.[0]?.message?.content?.trim() || '';

        // Log successful generation
        structuredLog("info", FN, "Generated caption", { length: caption.length }, requestId);

        return okResponse(req, {
            success: true,
            caption,
            length: caption.length
        }, {}, rl, RATE_OPTS.max, requestId);

    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        structuredLog("error", FN, "Caption generation failed", { error: msg }, requestId);
        return serverErrorResponse(req, msg, {}, FN, error, requestId);
    }
})

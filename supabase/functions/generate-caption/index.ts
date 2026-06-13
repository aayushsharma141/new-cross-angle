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
        let caption = '';

        if (OPENROUTER_API_KEY) {
            structuredLog("info", FN, "Using OpenRouter (Gemini-2.5-Flash) for caption generation", {}, requestId);
            const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://crossangle.com',
                    'X-Title': 'Cross Angle Interior'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
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
                })
            });

            if (!openRouterResponse.ok) {
                const error = await openRouterResponse.text();
                throw new Error(`OpenRouter API error: ${error}`);
            }

            const data = await openRouterResponse.json();
            caption = data.choices?.[0]?.message?.content?.trim() || '';
        } else {
            structuredLog("info", FN, "Using Anthropic for caption generation", {}, requestId);
            const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY!,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 200,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image',
                                    source: {
                                        type: 'base64',
                                        media_type: contentType,
                                        data: base64Image
                                    }
                                },
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
                                }
                            ]
                        }
                    ]
                })
            });

            if (!anthropicResponse.ok) {
                const error = await anthropicResponse.text();
                throw new Error(`Anthropic API error: ${error}`);
            }

            const data = await anthropicResponse.json();
            caption = data.content[0].text.trim();
        }

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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
    imageUrl: string
    projectContext?: string
    maxLength?: number
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Verify User Auth (prevent public abuse)
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { imageUrl, projectContext, maxLength = 125 }: RequestBody = await req.json()

        if (!imageUrl) {
            throw new Error('imageUrl is required')
        }

        if (!ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY not configured')
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

        // Call Anthropic API
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
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
        })

        if (!anthropicResponse.ok) {
            const error = await anthropicResponse.text()
            throw new Error(`Anthropic API error: ${error}`)
        }

        const data = await anthropicResponse.json()
        const caption = data.content[0].text.trim()

        // Log successful generation
        console.log(`Generated caption (${caption.length} chars): ${caption.substring(0, 50)}...`)

        return new Response(
            JSON.stringify({
                success: true,
                caption,
                length: caption.length
            }),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )

    } catch (error) {
        console.error('Error generating caption:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to generate caption'
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )
    }
})

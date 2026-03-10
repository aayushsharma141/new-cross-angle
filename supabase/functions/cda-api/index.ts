import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        let resource = url.searchParams.get('resource');
        let slug = url.searchParams.get('slug');
        let action = url.searchParams.get('action');

        if (req.method === 'POST') {
            const body = await req.json().catch(() => ({}));
            if (body.resource) resource = body.resource;
            if (body.slug) slug = body.slug;
            if (body.action) action = body.action;
        }

        if (!resource) {
            throw new Error('Resource parameter is required (e.g., ?resource=pages or in body)');
        }

        // 1. Check Edge Cache
        const cachePattern = slug ? `${resource}:${slug}` : resource;
        // The Cache API is a web standard, available in Deno
        const cache = await caches.open('cda-cache');

        // We use a dummy URL for the cache key because Cache API requires a Request object
        const cacheKey = new Request(`https://cda-api.local/${cachePattern}`);

        // Invalidation override
        if (action === 'invalidate') {
            const deleted = await cache.delete(cacheKey);
            return new Response(
                JSON.stringify({ success: true, message: `Cache invalidated for ${cachePattern}`, deleted }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
            console.log(`[Cache HIT] ${cachePattern}`);
            const data = await cachedResponse.json();
            return new Response(
                JSON.stringify({ ...data, source: 'cache' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`[Cache MISS] ${cachePattern}`);

        // 2. Fetch from DB
        // Using ANON KEY so RLS policies are strictly enforced (status='published' should be active)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_ANON_KEY') || ''
        );

        let resultData: any = null;

        if (resource === 'pages') {
            if (slug) {
                // Fetch page and its sections
                const { data: page, error: pageErr } = await supabase
                    .from('pages')
                    .select('*')
                    .eq('slug', slug)
                    .eq('status', 'published') // Explicit double-check
                    .single();

                if (pageErr || !page) throw new Error('Page not found or not published');

                const { data: sections, error: secErr } = await supabase
                    .from('page_sections')
                    .select('*')
                    .eq('page_slug', slug)
                    .eq('status', 'published')
                    .order('order_index', { ascending: true });

                if (secErr) throw secErr;

                resultData = { ...page, sections };
            } else {
                // Fetch all active pages
                const { data, error } = await supabase.from('pages').select('*').eq('status', 'published');
                if (error) throw error;
                resultData = data;
            }
        }
        else if (resource === 'blogs') {
            if (slug) {
                const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).eq('status', 'published').single();
                if (error) throw error;
                resultData = data;
            } else {
                const { data, error } = await supabase.from('blogs').select('*').eq('status', 'published').order('published_at', { ascending: false });
                if (error) throw error;
                resultData = data;
            }
        }
        else {
            throw new Error(`Unsupported resource type: ${resource}`);
        }

        // 3. Store in Edge Cache (TTL: 60 seconds for freshness)
        const responseToCache = new Response(JSON.stringify({ data: resultData }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 's-maxage=60, max-age=60', // 60 seconds Cache
            },
        });

        // Put in cache non-blocking
        cache.put(cacheKey, responseToCache.clone()).catch(console.error);

        return new Response(
            JSON.stringify({ data: resultData, source: 'db' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Error in CDA API:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

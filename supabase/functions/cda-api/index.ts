// Deno.serve is the native Supabase Edge Function entrypoint — no std/http import needed
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
    structuredLog,
    getRequestId,
} from "../_lib/security.ts";

const FN = "cda-api";
const RATE_OPTS = { bucket: "cda-api", max: 30, windowMs: 60_000 };

Deno.serve(async (req) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);

    // Persistent rate limiting (KV-backed)
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

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
            return badRequestResponse(req, 'Resource parameter is required', {}, requestId);
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
            structuredLog("info", FN, "Cache invalidated", { pattern: cachePattern }, requestId);
            return okResponse(req, { success: true, message: `Cache invalidated for ${cachePattern}`, deleted }, {}, rl, RATE_OPTS.max, requestId);
        }

        // Check edge cache before hitting DB
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
            structuredLog("info", FN, "Cache HIT", { pattern: cachePattern }, requestId);
            const data = await cachedResponse.json();
            return okResponse(req, { ...data, source: 'cache' }, {}, rl, RATE_OPTS.max, requestId);
        }

        structuredLog("info", FN, "Cache MISS", { pattern: cachePattern }, requestId);

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
        cache.put(cacheKey, responseToCache.clone()).catch(err => {
            structuredLog("error", FN, "Cache put failed", { error: String(err) }, requestId);
        });

        return okResponse(req, { data: resultData, source: 'db' }, {}, rl, RATE_OPTS.max, requestId);

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        structuredLog("error", FN, "CDA API Exception", { error: msg }, requestId);
        return serverErrorResponse(req, msg, {}, FN, error, requestId);
    }
});

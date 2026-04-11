/**
 * middleware.ts  —  Vercel Edge Middleware
 *
 * Purpose: Intercept requests from social-media and search-engine crawlers
 * (Googlebot, Twitterbot, facebookexternalhit, etc.) and inject fully-formed
 * Open Graph / Twitter Card meta tags into the otherwise empty Vite SPA shell.
 *
 * This is a ZERO-JAVASCRIPT-RUNTIME cost approach: the middleware runs on the
 * Vercel Edge Network (V8 isolate) with <1 ms overhead and does NOT ship any
 * additional JavaScript to end users.
 *
 * How it works:
 *   1. Detect crawler by User-Agent.
 *   2. For static routes → look up STATIC_OG_MAP.
 *   3. For dynamic routes (/blog/:slug, /portfolio/:slug) → fetch from Supabase REST.
 *   4. Fetch the SPA index.html from Vercel's origin.
 *   5. Inject <meta> tags into <head> before returning the response.
 *   6. All real users are passed through untouched (no overhead).
 */

import type { OgData } from "./src/og/og-defaults";
import {
  DEFAULT_OG,
  SITE_NAME,
  SITE_URL,
  STATIC_OG_MAP,
  SERVICE_OG_MAP,
} from "./src/og/og-defaults";

export const config = {
  matcher: [
    /*
     * Match ALL routes EXCEPT:
     *  - /api/*       — API routes
     *  - /assets/*    — Static assets (already cached at CDN)
     *  - Files with extensions (.js, .css, .png, etc.)
     */
    "/((?!api|assets|.*\\..*).*)",
  ],
};

// ─── Bot detection ─────────────────────────────────────────────────────────────

const BOT_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp",           // Yahoo
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "exabot",
  "facebot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "slackbot",
  "discordbot",
  "pinterest",
  "embedly",
  "quora",
  "outbrain",
  "semrushbot",
  "ahrefsbot",
  "msnbot",
  "rogerbot",
  "dotbot",
  "screaming frog",
  "chrome-lighthouse",
];

function isSocialCrawler(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some((bot) => lower.includes(bot));
}

// ─── Supabase REST fetch helpers (zero SDK overhead) ───────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

async function fetchBlogOg(slug: string): Promise<OgData | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=title,excerpt,cover_image,cover_image_url,slug&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json() as Array<{
      title?: string;
      excerpt?: string;
      cover_image?: string;
      cover_image_url?: string;
      slug?: string;
    }>;
    const row = rows[0];
    if (!row) return null;
    return {
      title: `${row.title ?? "Blog Post"} | ${SITE_NAME}`,
      description: row.excerpt ?? DEFAULT_OG.description,
      image: row.cover_image ?? row.cover_image_url ?? DEFAULT_OG.image,
      url: `${SITE_URL}/blog/${slug}`,
      type: "article",
    };
  } catch {
    return null;
  }
}

async function fetchProjectOg(slug: string): Promise<OgData | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?slug=eq.${encodeURIComponent(slug)}&select=title,description,cover_image,slug&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json() as Array<{
      title?: string;
      description?: string;
      cover_image?: string;
      slug?: string;
    }>;
    const row = rows[0];
    if (!row) return null;
    return {
      title: `${row.title ?? "Project"} | ${SITE_NAME} Portfolio`,
      description: row.description ?? DEFAULT_OG.description,
      image: row.cover_image ?? DEFAULT_OG.image,
      url: `${SITE_URL}/portfolio/${slug}`,
      type: "website",
    };
  } catch {
    return null;
  }
}

// ─── OG resolver ───────────────────────────────────────────────────────────────

async function resolveOg(pathname: string): Promise<OgData> {
  // 1. Exact static match
  if (STATIC_OG_MAP[pathname]) {
    return { ...DEFAULT_OG, ...STATIC_OG_MAP[pathname] };
  }

  // 2. Dynamic: /blog/:slug
  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const data = await fetchBlogOg(blogMatch[1]);
    if (data) return data;
  }

  // 3. Dynamic: /portfolio/:slug  OR  /projects/:slug
  const projectMatch = pathname.match(/^\/(?:portfolio|projects?)\/([^/]+)$/);
  if (projectMatch) {
    const data = await fetchProjectOg(projectMatch[1]);
    if (data) return data;
  }

  // 4. Service detail: /services/:category/:slug
  const serviceMatch = pathname.match(/^\/services\/[^/]+\/([^/]+)$/);
  if (serviceMatch && SERVICE_OG_MAP[serviceMatch[1]]) {
    return { ...DEFAULT_OG, ...SERVICE_OG_MAP[serviceMatch[1]] };
  }

  // 5. Fallback
  return DEFAULT_OG;
}

// ─── Meta tag builder ──────────────────────────────────────────────────────────

function buildMetaTags(og: OgData): string {
  const escape = (s: string) => s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const t = escape(og.title);
  const d = escape(og.description);
  const img = escape(og.image);
  const url = escape(og.url);
  const type = og.type ?? "website";

  return `
  <!-- OG: injected by Vercel Edge Middleware -->
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="${escape(SITE_NAME)}" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${url}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${img}" />
  <meta name="twitter:site" content="@crossangleinterior" />
  <link rel="canonical" href="${url}" />
  <!-- /OG -->`.trim();
}

// ─── Middleware entry point ─────────────────────────────────────────────────────

export default async function middleware(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";

  // Pass real users through immediately — zero overhead
  if (!isSocialCrawler(ua)) {
    // Return early to allow static asset/routing to continue.
    // In Vercel Edge Middleware, returning new Response() interrupts, 
    // returning nothing or calling x-middleware-next headers passes through.
    // Setting `x-middleware-next` header is the standard way to continue in pure edge functions.
    return new Response(null, { headers: { "x-middleware-next": "1" } });
  }

  const urlObj = new URL(req.url);
  const pathname = urlObj.pathname;
  const og = await resolveOg(pathname);
  const metaTags = buildMetaTags(og);

  // Fetch the SPA shell from Vercel's CDN
  let html: string;
  try {
    const spaRes = await fetch(`${urlObj.origin}/index.html`);
    html = await spaRes.text();
  } catch {
    return new Response(null, { headers: { "x-middleware-next": "1" } });
  }

  // Inject OG tags right before </head>
  const injected = html.replace("</head>", `${metaTags}\n</head>`);

  return new Response(injected, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      "X-OG-Injected": "1",
    },
  });
}

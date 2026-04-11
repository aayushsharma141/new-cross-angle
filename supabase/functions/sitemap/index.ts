/**
 * sitemap/index.ts  —  Supabase Edge Function
 *
 * Serves a fully-dynamic sitemap.xml that combines:
 *   - Static routes (hardcoded, curated priorities)
 *   - Service category pages  (/services/residential, etc.)
 *   - Individual service pages (/services/:category/:slug)  ← from DB + static config
 *   - Project portfolio pages (/portfolio/:slug)            ← from DB
 *   - Published blog posts    (/blog/:slug)                 ← from DB
 *
 * Deployed at:  https://<project>.supabase.co/functions/v1/sitemap
 * Proxied via:  apps/web/vercel.json  →  /sitemap.xml
 *
 * Cache: 1 h at the edge (s-maxage=3600) + 5 min stale-while-revalidate.
 * Googlebot checks sitemaps infrequently, daily is more than enough.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  handlePreflight,
  structuredLog,
  serverErrorResponse,
  getRequestId,
} from "../_lib/security.ts";

const FN = "sitemap";
const BASE_URL = "https://crossangleinterior.com";

// ─── Service category pages (static — matches site-content.ts) ─────────────────

const SERVICE_CATEGORIES = [
  { slug: "residential", priority: "0.85" },
  { slug: "commercial",  priority: "0.85" },
  { slug: "specialized", priority: "0.80" },
];

// Static service slug → category mapping (mirrors site-content.ts)
// Used to build /services/:category/:slug URLs for DB-sourced services.
const SERVICE_CATEGORY_MAP: Record<string, string> = {
  "living-room":     "residential",
  "bedroom":         "residential",
  "kitchen":         "residential",
  "office":          "commercial",
  "retail":          "commercial",
  "restaurant":      "commercial",
  "modular-kitchens":"specialized",
  "ceilings":        "specialized",
  "lighting":        "specialized",
  "custom-furniture":"specialized",
};

// ─── XML helpers ───────────────────────────────────────────────────────────────

function urlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
): string {
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function isoDate(raw?: string | null): string {
  if (!raw) return new Date().toISOString().split("T")[0];
  try {
    return new Date(raw).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

// ─── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables.");
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

    structuredLog("info", FN, "Generating dynamic sitemap", {}, requestId);

    const today = new Date().toISOString().split("T")[0];
    const entries: string[] = [];

    // ── 1. Static pages ──────────────────────────────────────────────────────
    const staticPages = [
      { path: "",             priority: "1.0",  freq: "weekly"  },
      { path: "/about-us",    priority: "0.8",  freq: "monthly" },
      { path: "/services",    priority: "0.9",  freq: "weekly"  },
      { path: "/gallery",     priority: "0.8",  freq: "weekly"  },
      { path: "/portfolio",   priority: "0.8",  freq: "weekly"  },
      { path: "/blog",        priority: "0.8",  freq: "weekly"  },
      { path: "/contact-us",  priority: "0.75", freq: "monthly" },
      { path: "/estimate",    priority: "0.7",  freq: "monthly" },
    ];

    for (const p of staticPages) {
      entries.push(urlEntry(`${BASE_URL}${p.path}`, today, p.freq, p.priority));
    }

    // ── 2. Service category pages ─────────────────────────────────────────────
    for (const cat of SERVICE_CATEGORIES) {
      entries.push(
        urlEntry(
          `${BASE_URL}/services/${cat.slug}`,
          today,
          "monthly",
          cat.priority,
        ),
      );
    }

    // ── 3. Individual service pages (DB-driven, enriched with category) ───────
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("slug, updated_at, category_id")
      .order("updated_at", { ascending: false });

    if (servicesError) {
      structuredLog("warn", FN, "Services query failed", { error: servicesError.message }, requestId);
    }

    if (services && services.length > 0) {
      for (const svc of services) {
        if (!svc.slug) continue;
        // Prefer the explicit category_id from DB; fall back to static map
        const categorySlug =
          svc.category_id ?? SERVICE_CATEGORY_MAP[svc.slug as keyof typeof SERVICE_CATEGORY_MAP];
        if (!categorySlug) continue;

        const lastmod = isoDate(svc.updated_at);
        entries.push(
          urlEntry(
            `${BASE_URL}/services/${categorySlug}/${svc.slug}`,
            lastmod,
            "monthly",
            "0.9",
          ),
        );
      }
    } else {
      // Fallback: emit static services if DB is unreachable
      for (const [slug, category] of Object.entries(SERVICE_CATEGORY_MAP)) {
        entries.push(
          urlEntry(`${BASE_URL}/services/${category}/${slug}`, today, "monthly", "0.9"),
        );
      }
    }

    // ── 4. Project portfolio pages ─────────────────────────────────────────────
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, slug, updated_at, created_at")
      .order("display_order", { ascending: true });

    if (projectsError) {
      structuredLog("warn", FN, "Projects query failed", { error: projectsError.message }, requestId);
    }

    if (projects) {
      for (const project of projects) {
        const identifier = project.slug || project.id;
        if (!identifier) continue;
        const lastmod = isoDate(project.updated_at ?? project.created_at);
        entries.push(
          urlEntry(`${BASE_URL}/portfolio/${identifier}`, lastmod, "monthly", "0.8"),
        );
      }
    }

    // ── 5. Published blog posts ────────────────────────────────────────────────
    const { data: blogs, error: blogsError } = await supabase
      .from("blog_posts")
      .select("id, slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (blogsError) {
      structuredLog("warn", FN, "Blog posts query failed", { error: blogsError.message }, requestId);
    }

    if (blogs) {
      for (const blog of blogs) {
        const identifier = blog.slug || blog.id;
        if (!identifier) continue;
        const lastmod = isoDate(blog.updated_at ?? blog.published_at);
        entries.push(
          urlEntry(`${BASE_URL}/blog/${identifier}`, lastmod, "weekly", "0.7"),
        );
      }
    }

    // ── 6. Build XML ───────────────────────────────────────────────────────────
    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
      `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
      ...entries,
      `</urlset>`,
    ].join("\n");

    structuredLog(
      "info",
      FN,
      "Sitemap generated",
      { totalUrls: entries.length },
      requestId,
    );

    return new Response(xml, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/xml; charset=utf-8",
        // 1 h CDN cache, 5 min stale-while-revalidate
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
        "X-Request-Id": requestId,
        "X-Sitemap-Urls": String(entries.length),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    structuredLog("error", FN, "Sitemap generation failed", { error: msg }, requestId);
    return serverErrorResponse(req, msg, {}, FN, error, requestId);
  }
});

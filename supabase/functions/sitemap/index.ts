import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables.");
    }

    // Initialize Supabase admin client using Service Role if available, else Anon Key
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

    const baseUrl = "https://crossangleinterior.com";

    // 1. Start the XML document
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 2. Add static routes manually
    const staticRoutes = [
      { path: "", priority: "1.0", frequency: "weekly" },
      { path: "/about-us", priority: "0.8", frequency: "monthly" },
      { path: "/services", priority: "0.8", frequency: "weekly" },
      { path: "/gallery", priority: "0.8", frequency: "weekly" },
      { path: "/blog", priority: "0.8", frequency: "weekly" },
      { path: "/contact-us", priority: "0.8", frequency: "monthly" },
    ];

    const today = new Date().toISOString();

    staticRoutes.forEach(route => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.frequency}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // 3. Query distinct services dynamically
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('slug, updated_at');

    if (!servicesError && services) {
      services.forEach(service => {
        const lastmod = service.updated_at ? new Date(service.updated_at).toISOString() : today;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/services/${service.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    // 4. Query projects dynamically
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, slug, updated_at, created_at');

    if (!projectsError && projects) {
      projects.forEach(project => {
        const identifier = project.slug || project.id;
        const lastmod = project.updated_at ? new Date(project.updated_at).toISOString() : (project.created_at ? new Date(project.created_at).toISOString() : today);
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/portfolio/${identifier}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    // 5. Query published blog posts dynamically
    const { data: blogs, error: blogsError } = await supabase
      .from('blog_posts')
      .select('id, slug, updated_at, published_at')
      .eq('status', 'published');

    if (!blogsError && blogs) {
      blogs.forEach(blog => {
        const identifier = blog.slug || blog.id;
        const lastmod = blog.updated_at ? new Date(blog.updated_at).toISOString() : (blog.published_at ? new Date(blog.published_at).toISOString() : today);
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/blog/${identifier}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    // 6. Complete XML
    xml += `</urlset>`;

    // 7. Return Response with XML Headers and Cache mapping
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
      status: 200,
    });

  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

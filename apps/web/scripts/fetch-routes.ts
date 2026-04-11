/**
 * fetch-routes.ts
 *
 * Pre-build script that fetches all dynamic routes (projects, blogs)
 * from Supabase to provide to vite-plugin-prerender.
 *
 * It generates `dynamic-routes.json` in the web root.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables (Vite doesn't automatically load them for arbitrary Node scripts)
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️  Skipping dynamic route fetch: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing.");
  fs.writeFileSync(path.resolve(__dirname, "../dynamic-routes.json"), JSON.stringify([]));
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchDynamicRoutes() {
  console.log("Fetching dynamic routes from Supabase for prerendering...");
  const routes: string[] = [];

  // Add all static base routes that need to be prerendered
  routes.push("/", "/services", "/gallery", "/portfolio", "/blog", "/about-us", "/contact-us", "/estimate");

  // Fetch Services
  const { data: services } = await supabase.from("services").select("slug, category_id");
  
  // Create a static map for fallback if category_id is missing
  const serviceCategoryMap: Record<string, string> = {
    "living-room": "residential",
    "bedroom": "residential",
    "kitchen": "residential",
    "office": "commercial",
    "retail": "commercial",
    "restaurant": "commercial",
    "modular-kitchens": "specialized",
    "ceilings": "specialized",
    "lighting": "specialized",
    "custom-furniture": "specialized",
  };

  if (services) {
    services.forEach((s) => {
      const category = s.category_id || serviceCategoryMap[s.slug];
      if (s.slug && category) {
        routes.push(`/services/${category}/${s.slug}`);
      }
    });
  }

  // Fetch Projects
  const { data: projects } = await supabase.from("projects").select("slug, id");
  if (projects) {
    projects.forEach((p) => {
      routes.push(`/portfolio/${p.slug || p.id}`);
    });
  }

  // Fetch Blogs
  const { data: blogs } = await supabase.from("blog_posts").select("slug, id").eq("status", "published");
  if (blogs) {
    blogs.forEach((b) => {
      routes.push(`/blog/${b.slug || b.id}`);
    });
  }

  const outputPath = path.resolve(__dirname, "../dynamic-routes.json");
  fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2));
  console.log(`✅ Fetched ${routes.length} routes and saved to dynamic-routes.json`);
}

fetchDynamicRoutes().catch((err) => {
  console.error("❌ Failed to fetch dynamic routes:", err);
  process.exit(1);
});

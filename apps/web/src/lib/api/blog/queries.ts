import { supabase } from "@/integrations/supabase/client";
import { fetchAndStitchDamUsages } from "../_shared/dam-stitcher";
import type { SupabaseItem } from "../_shared/supabase-types";
import type { Blog } from "./types";

export const blogApi = {
  getBlogs: async (): Promise<Blog[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching blogs:", error);
      return [];
    }

    const itemsWithDam = await fetchAndStitchDamUsages(data || [], "blog");

    return itemsWithDam.map((item: SupabaseItem) => ({
      id: item.id,
      title: item.title || "Untitled",
      excerpt: item.excerpt || "",
      image: item.cover_image_url || item.deprecated_cover_image_url || "",
      category: item.tags && item.tags.length > 0 ? item.tags[0] : "Interior Design",
      date: new Date(
        item.published_at || item.created_at || new Date(),
      ).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      slug: item.slug || item.id,
      content:
        typeof item.content === "string" ? item.content : JSON.stringify(item.content),
      view_count: item.view_count ?? 0,
    }));
  },
};

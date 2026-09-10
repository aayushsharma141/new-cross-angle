import type { Tables } from "@/integrations/supabase/types";

export type BlogStatus = "draft" | "review" | "published";

/**
 * A blog post as loaded for editing.
 *
 * Derived from the generated row so it cannot silently drift from the schema.
 *
 * `cover_image_url` and `scheduled_at` are NOT columns on `blog_posts`: DAM v3
 * renamed the former to `deprecated_cover_image_url`, and the latter has never
 * existed in any migration. Both stay optional because the editor still
 * surfaces them, but they read as undefined at runtime. Declaring them as
 * required is what let the double-cast at the fetch site hide the gap.
 * TODO(ADR-0002): source the cover image from asset_usages.
 */
export interface BlogPost
  extends Pick<
    Tables<"blog_posts">,
    | "id"
    | "title"
    | "slug"
    | "excerpt"
    | "content"
    | "status"
    | "featured"
    | "seo_title"
    | "seo_description"
    | "tags"
    | "published_at"
    | "created_at"
  > {
  cover_image_url?: string | null;
  scheduled_at?: string | null;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: BlogStatus;
  featured: boolean;
  seo_title: string;
  seo_description: string;
  tags: string;
  scheduled_at: string;
}

import type { Tables } from "@/integrations/supabase/types";

export type BlogStatus = "draft" | "review" | "published";

/**
 * A blog post as loaded for editing.
 *
 * Derived from the generated row so it cannot silently drift from the schema.
 *
 * `cover_image_url` is NOT a column on `blog_posts` — DAM v3 renamed it to
 * `deprecated_cover_image_url`. It stays optional because the editor still
 * surfaces it, but it reads as undefined at runtime. Declaring it required is
 * what let the double-cast at the fetch site hide the gap.
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
}

import type { Tables } from "@/integrations/supabase/types";

export type BlogStatus = "draft" | "review" | "published";

/**
 * A blog post as loaded for editing.
 *
 * Derived from the generated row so it cannot silently drift from the schema.
 *
 * The cover image is stored in `deprecated_cover_image_url` — DAM v3 renamed
 * `cover_image_url` to that, and it is still the only place the blog cover
 * lives (the public blog reads it too). There is no `cover_image_url` column:
 * a field of that name on this type read as undefined at runtime, so the
 * editor opened every post with an empty cover and saved null over the stored
 * one. The editor's own field is `BlogFormData.cover_image_url`.
 * TODO(ADR-0002): source the cover image from asset_usages.
 */
export type BlogPost = Pick<
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
  | "deprecated_cover_image_url"
>;

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

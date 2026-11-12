import type { BlogFormData, BlogPost, BlogStatus } from "@/types/blog";

/** The cover image stored on the post row, or an empty string. */
const storedCover = (post: BlogPost): string => post.deprecated_cover_image_url ?? "";

/** Editor state for an existing post. */
export function blogPostToFormData(post: BlogPost): BlogFormData {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: typeof post.content === "string" ? post.content : "",
    cover_image_url: storedCover(post),
    status: (post.status as BlogStatus) || "draft",
    featured: post.featured ?? false,
    seo_title: post.seo_title ?? "",
    seo_description: post.seo_description ?? "",
    tags: post.tags?.join(", ") ?? "",
  };
}

/**
 * Editor state for an autosaved draft of an existing post.
 *
 * A draft with no cover falls back to the stored one. Drafts are autosaved as
 * soon as the editor opens, and every draft written before the editor loaded
 * the stored cover carries an empty string; restoring one verbatim would save
 * null over the image. The cost is that deliberately clearing the cover only
 * survives a save, not a restored draft.
 */
export function restoreBlogDraft(draft: BlogFormData, post: BlogPost): BlogFormData {
  return { ...draft, cover_image_url: draft.cover_image_url || storedCover(post) };
}

/**
 * `published_at` for a save. A post keeps the date it was first published, so
 * editing it does not move it to the top of the blog; it is stamped only when
 * a post that has no date is published, and cleared when a post is not live.
 */
export function resolvePublishedAt(
  status: BlogStatus,
  existing: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (status !== "published") return null;
  return existing ?? now.toISOString();
}

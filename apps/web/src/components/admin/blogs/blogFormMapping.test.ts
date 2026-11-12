import { describe, expect, it } from "vitest";
import type { BlogFormData, BlogPost } from "@/types/blog";
import { blogPostToFormData, resolvePublishedAt, restoreBlogDraft } from "./blogFormMapping";

/** A `blog_posts` row as the admin list and deep link load it (`select('*')`). */
const storedPost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: "22222222-2222-2222-2222-222222222222",
  title: "Choosing stone for a kitchen",
  slug: "choosing-stone",
  excerpt: "A short guide.",
  content: "<p>Body</p>",
  status: "published",
  featured: false,
  seo_title: null,
  seo_description: null,
  tags: ["materials", "kitchen"],
  published_at: "2026-03-04T09:00:00.000Z",
  created_at: "2026-03-01T09:00:00.000Z",
  deprecated_cover_image_url: "https://cdn.example/blog/stone.jpg",
  ...overrides,
});

describe("blogPostToFormData", () => {
  it("loads the stored cover image into the editor", () => {
    expect(blogPostToFormData(storedPost()).cover_image_url).toBe(
      "https://cdn.example/blog/stone.jpg",
    );
  });

  it("starts with an empty cover when the post has none", () => {
    expect(
      blogPostToFormData(storedPost({ deprecated_cover_image_url: null })).cover_image_url,
    ).toBe("");
  });

  it("maps the remaining editable fields", () => {
    expect(blogPostToFormData(storedPost())).toMatchObject({
      title: "Choosing stone for a kitchen",
      slug: "choosing-stone",
      excerpt: "A short guide.",
      content: "<p>Body</p>",
      status: "published",
      featured: false,
      seo_title: "",
      seo_description: "",
      tags: "materials, kitchen",
    });
  });
});

describe("restoreBlogDraft", () => {
  const draft = (overrides: Partial<BlogFormData> = {}): BlogFormData => ({
    ...blogPostToFormData(storedPost()),
    title: "Choosing stone for a kitchen (edited)",
    ...overrides,
  });

  it("keeps the unsaved edits", () => {
    expect(restoreBlogDraft(draft(), storedPost()).title).toBe(
      "Choosing stone for a kitchen (edited)",
    );
  });

  it("keeps a cover the author changed in the draft", () => {
    const restored = restoreBlogDraft(
      draft({ cover_image_url: "https://cdn.example/blog/new.jpg" }),
      storedPost(),
    );

    expect(restored.cover_image_url).toBe("https://cdn.example/blog/new.jpg");
  });

  it("does not let a draft with no cover erase the stored one", () => {
    // Drafts autosaved before the editor loaded the stored cover all carry an
    // empty string here; restoring one verbatim would null the image on save.
    const restored = restoreBlogDraft(draft({ cover_image_url: "" }), storedPost());

    expect(restored.cover_image_url).toBe("https://cdn.example/blog/stone.jpg");
  });
});

describe("resolvePublishedAt", () => {
  const now = new Date("2026-11-12T12:00:00.000Z");

  it("keeps the original date when a published post is edited", () => {
    expect(resolvePublishedAt("published", "2026-03-04T09:00:00.000Z", now)).toBe(
      "2026-03-04T09:00:00.000Z",
    );
  });

  it("stamps the date when a post is published for the first time", () => {
    expect(resolvePublishedAt("published", null, now)).toBe("2026-11-12T12:00:00.000Z");
  });

  it("clears the date when a post is not published", () => {
    expect(resolvePublishedAt("draft", "2026-03-04T09:00:00.000Z", now)).toBeNull();
    expect(resolvePublishedAt("review", null, now)).toBeNull();
  });
});

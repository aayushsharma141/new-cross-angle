import { describe, expect, it } from "vitest";
import { blogPostSchema, imageRefSchema, portfolioSchema } from "./validations";

describe("imageRefSchema", () => {
  it.each([
    ["an absolute URL", "https://ik.imagekit.io/cross-angle/projects/cover.jpg"],
    ["a site-relative path", "/images/projects/discovery/lifestyle-5.jpg"],
    ["an empty value", ""],
  ])("accepts %s", (_label, value) => {
    expect(imageRefSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["a bare filename", "cover.jpg"],
    ["a protocol-relative URL", "//cdn.example/cover.jpg"],
    ["free text", "not an image"],
  ])("rejects %s", (_label, value) => {
    expect(imageRefSchema.safeParse(value).success).toBe(false);
  });
});

describe("cover fields accept what existing rows store", () => {
  it("lets a project with a site-relative cover be saved", () => {
    const result = portfolioSchema.safeParse({
      title: "Serene Master Suite",
      slug: "serene-master-suite",
      cover_image_url: "/assets/portfolio-bedroom.jpg",
    });

    expect(result.success).toBe(true);
  });

  it("lets a post with a site-relative cover be saved", () => {
    const result = blogPostSchema.safeParse({
      title: "Choosing stone for a kitchen",
      slug: "choosing-stone",
      cover_image: "/images/blog/stone.jpg",
    });

    expect(result.success).toBe(true);
  });
});

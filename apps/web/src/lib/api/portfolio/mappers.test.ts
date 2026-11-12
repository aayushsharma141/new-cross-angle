import { describe, expect, it } from "vitest";
import { mapSupabaseToProject } from "./mappers";
import type { SupabaseItem } from "../_shared/supabase-types";

/**
 * A `projects` row shaped exactly as the admin form saves it
 * (components/admin/portfolio/PortfolioFormDialog.tsx): the project facts and
 * narrative live inside the `description` JSONB, and the cover URL lives in
 * `deprecated_cover_image_url`. None of them are top-level columns.
 */
const rowAsSavedByAdmin = (overrides: Partial<SupabaseItem> = {}): SupabaseItem => ({
  id: "11111111-1111-1111-1111-111111111111",
  title: "Villa Test",
  slug: "villa-test",
  client_name: "A. Client",
  location: "Jamshedpur",
  year_completed: 2025,
  style_tags: ["Modern"],
  description: {
    area: "4,200 sq ft",
    budget: "1.2 Cr",
    duration: "9 months",
    brief: "The client brief.",
    approach: "Our approach.",
    video_url: "",
    hero_image_url: "",
  },
  deprecated_cover_image_url: "https://cdn.example/cover.jpg",
  project_gallery: [],
  project_materials: [],
  project_categories: { name: "Residential" },
  ...overrides,
});

describe("mapSupabaseToProject", () => {
  it("publishes the facts and narrative the admin saved in description", () => {
    const project = mapSupabaseToProject(rowAsSavedByAdmin());

    expect(project.area).toBe("4,200 sq ft");
    expect(project.budget).toBe("1.2 Cr");
    expect(project.duration).toBe("9 months");
    expect(project.brief).toBe("The client brief.");
    expect(project.approach).toBe("Our approach.");
  });

  it("reads description when PostgREST returns it as a JSON string", () => {
    const row = rowAsSavedByAdmin();
    const project = mapSupabaseToProject({
      ...row,
      description: JSON.stringify(row.description),
    });

    expect(project.area).toBe("4,200 sq ft");
    expect(project.brief).toBe("The client brief.");
  });

  it("keeps the placeholders when the admin left the fields empty", () => {
    const project = mapSupabaseToProject(
      rowAsSavedByAdmin({
        description: { area: "", budget: "", duration: "", brief: "", approach: "" },
      }),
    );

    expect(project.area).toBe("-");
    expect(project.budget).toBe("-");
    expect(project.duration).toBe("-");
    expect(project.brief).toBe("");
    expect(project.approach).toBe("");
  });

  it("still reads top-level facts for rows that carry them", () => {
    const project = mapSupabaseToProject(
      rowAsSavedByAdmin({ description: null, area: "900 sq ft", brief: "Legacy brief." }),
    );

    expect(project.area).toBe("900 sq ft");
    expect(project.brief).toBe("Legacy brief.");
  });

  describe("image", () => {
    it("shows the saved cover URL when no asset usage is bound", () => {
      expect(mapSupabaseToProject(rowAsSavedByAdmin()).heroImage).toBe(
        "https://cdn.example/cover.jpg",
      );
    });

    it("prefers the cover bound through asset_usages over the legacy column", () => {
      const project = mapSupabaseToProject(
        rowAsSavedByAdmin({ cover_image_url: "https://cdn.example/dam-cover.jpg" }),
      );

      expect(project.heroImage).toBe("https://cdn.example/dam-cover.jpg");
    });

    it("prefers the hero image the admin set explicitly", () => {
      const row = rowAsSavedByAdmin();
      const project = mapSupabaseToProject({
        ...row,
        description: { ...row.description, hero_image_url: "https://cdn.example/hero.jpg" },
      });

      expect(project.heroImage).toBe("https://cdn.example/hero.jpg");
    });
  });
});

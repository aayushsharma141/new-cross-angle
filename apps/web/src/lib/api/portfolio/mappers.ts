import type { Project } from "./types";
import type { SupabaseItem, AssetVersion, SupabaseGalleryItem, SupabaseMaterialItem } from "../_shared/supabase-types";

/**
 * Maps a raw Supabase project row (with optional DAM stitching already applied)
 * to the public Project interface.
 */
export const mapSupabaseToProject = (item: SupabaseItem): Project => {
  // Parse description JSON if necessary
  let descJson: Record<string, unknown> = {};
  if (typeof item.description === "string") {
    try {
      const parsed = JSON.parse(item.description);
      descJson = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      // Ignore parse errors for older projects without JSON description
    }
  } else {
    descJson =
      item.description && typeof item.description === "object"
        ? (item.description as Record<string, unknown>)
        : {};
  }

  // Group gallery items by room
  const galleryMap = new Map<string, string[]>();
  if (item.project_gallery && Array.isArray(item.project_gallery)) {
    item.project_gallery.forEach((g: SupabaseGalleryItem) => {
      const room = g.room_name || "General";
      const url = g.deprecated_image_url || g.image_url;
      if (!url) return;
      if (!galleryMap.has(room)) galleryMap.set(room, []);
      galleryMap.get(room)?.push(url);
    });
  }

  const gallery = Array.from(galleryMap.entries()).map(([room, images]) => ({
    room,
    images,
  }));

  const materials =
    item.project_materials?.map((m: SupabaseMaterialItem) => ({
      name: m.name,
      details: m.details || "",
    })) || [];

  // The admin form saves the project facts and narrative inside the
  // `description` JSONB — they are not columns on `projects`. The top-level
  // reads below remain for rows that carry them directly.
  const fromDescription = (key: string): string => {
    const value = descJson[key];
    return typeof value === "string" ? value : "";
  };

  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title || "Untitled",
    client: item.client_name || item.client || "Client",
    location: item.location || "Location",
    type: item.type === "commercial" ? "commercial" : "residential",
    category: item.project_categories?.name || item.category || "General",
    area: fromDescription("area") || item.area || "-",
    budget: fromDescription("budget") || item.budget || "-",
    duration: fromDescription("duration") || item.duration || "-",
    style:
      item.style_tags && Array.isArray(item.style_tags) && item.style_tags.length > 0
        ? item.style_tags.join(", ")
        : item.style || "-",
    year: Number(item.year_completed || item.year || new Date().getFullYear()),
    // Explicit hero, then the cover and hero bound through asset_usages. The
    // cover URL the admin form stores on the row comes last: it only fills
    // the gap left when nothing is bound (a pasted URL has no usage row), so
    // it never displaces an image that was already being shown.
    heroImage:
      fromDescription("hero_image_url") ||
      item.cover_image_url ||
      item.hero_image ||
      item.deprecated_cover_image_url ||
      "",
    heroAsset: (item as SupabaseItem & { heroAsset?: AssetVersion }).heroAsset,
    coverAsset: (item as SupabaseItem & { coverAsset?: AssetVersion }).coverAsset,
    gallery,
    brief: fromDescription("brief") || item.brief || "",
    approach: fromDescription("approach") || item.approach || "",
    materials,
    testimonial: item.testimonial_quote
      ? {
          quote: item.testimonial_quote,
          author: item.testimonial_author || "Client",
          role: item.testimonial_role || "Homeowner",
        }
      : undefined,
  };
};

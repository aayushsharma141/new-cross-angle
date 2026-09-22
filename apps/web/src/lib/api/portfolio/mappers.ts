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

  const heroImageFromDesc =
    typeof descJson.hero_image_url === "string" ? descJson.hero_image_url : undefined;

  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title || "Untitled",
    client: item.client_name || item.client || "Client",
    location: item.location || "Location",
    type: item.type === "commercial" ? "commercial" : "residential",
    category: item.project_categories?.name || item.category || "General",
    area: item.area || "-",
    budget: item.budget || "-",
    duration: item.duration || "-",
    style:
      item.style_tags && Array.isArray(item.style_tags) && item.style_tags.length > 0
        ? item.style_tags.join(", ")
        : item.style || "-",
    year: Number(item.year_completed || item.year || new Date().getFullYear()),
    heroImage: heroImageFromDesc || item.cover_image_url || item.hero_image || "",
    heroAsset: (item as SupabaseItem & { heroAsset?: AssetVersion }).heroAsset,
    coverAsset: (item as SupabaseItem & { coverAsset?: AssetVersion }).coverAsset,
    gallery,
    brief: item.brief || "",
    approach: item.approach || "",
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

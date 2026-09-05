import { supabase } from "@/integrations/supabase/client";
import type { SupabaseItem, AssetVersion, AssetUsageRecord } from "./supabase-types";

/**
 * Fetches DAM asset_usages for a batch of entities and stitches the asset
 * URLs back onto the entity objects in place.
 *
 * This is an internal helper — not exported from the public api/index.ts.
 * Used by portfolio, services, and blog contexts.
 */
export const fetchAndStitchDamUsages = async (
  items: SupabaseItem[],
  entityType: string,
): Promise<SupabaseItem[]> => {
  if (!supabase || items.length === 0) return items;

  const ids = items.map((i) => i.id).filter(Boolean) as string[];
  if (ids.length === 0) return items;

  try {
    const { data: usages, error } = await supabase
      .from("asset_usages")
      .select(
        `
        entity_id,
        role,
        display_order,
        assets (
          asset_versions (
            url,
            mime_type,
            size_bytes
          )
        )
      `,
      )
      .eq("entity_type", entityType)
      .in("entity_id", ids);

    if (error || !usages) {
      console.warn("Failed to fetch asset usages:", error);
      return items;
    }

    const typedUsages = usages as unknown as AssetUsageRecord[];

    for (const item of items) {
      const itemUsages = typedUsages.filter((u) => u.entity_id === item.id);
      if (itemUsages.length === 0) continue;

      const getAsset = (role: string): AssetVersion | undefined => {
        const usage = itemUsages.find((u) => u.role === role);
        return usage?.assets?.asset_versions?.[0];
      };

      const getUrls = (role: string): string[] => {
        const matchingUsages = itemUsages
          .filter((u) => u.role === role)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        return matchingUsages
          .map((u) => u.assets?.asset_versions?.[0]?.url)
          .filter((url): url is string => Boolean(url));
      };

      if (entityType === "project") {
        const coverAsset = getAsset("cover");
        if (coverAsset?.url) {
          item.cover_image_url = coverAsset.url;
          (item as SupabaseItem & { coverAsset?: AssetVersion }).coverAsset = coverAsset;
        }

        const heroAsset = getAsset("hero");
        if (heroAsset?.url) {
          item.hero_image = heroAsset.url;
          (item as SupabaseItem & { heroAsset?: AssetVersion }).heroAsset = heroAsset;
        }

        const galleryUrls = getUrls("gallery");
        if (galleryUrls.length > 0) {
          item.project_gallery = galleryUrls.map((url) => ({
            image_url: url,
            room_name: "General",
          }));
        }
      } else if (entityType === "service") {
        const heroAsset = getAsset("hero");
        if (heroAsset?.url) {
          item.hero_image = heroAsset.url;
          (item as SupabaseItem & { heroAsset?: AssetVersion }).heroAsset = heroAsset;
        }

        const iconAsset = getAsset("icon");
        if (iconAsset?.url) {
          item.icon_url = iconAsset.url;
          (item as SupabaseItem & { iconAsset?: AssetVersion }).iconAsset = iconAsset;
        }
      }
    }
  } catch (e) {
    console.warn("Exception fetching DAM usages:", e);
  }

  return items;
};

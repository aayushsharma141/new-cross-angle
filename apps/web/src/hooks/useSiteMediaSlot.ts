import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Resolve a named site media slot (`site_media_assets.asset_key` →
 * `media_files.url`) with a static fallback. Use this for page-level
 * imagery such as hero backdrops, where there is no entity row to hang an
 * `asset_usages` record on (`asset_usages.entity_id` is a uuid).
 *
 * Returns the fallback while loading and whenever the slot is unmapped.
 */
export function useSiteMediaSlot(assetKey: string, fallbackUrl: string): { url: string; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.siteMedia.slot(assetKey),
    queryFn: async (): Promise<string | null> => {
      const result = await supabase
        .from("site_media_assets" as never)
        .select("media_files(url)")
        .eq("asset_key", assetKey)
        .maybeSingle();
      const row = result.data as unknown as { media_files: { url: string } | null } | null;
      return row?.media_files?.url ?? null;
    },
  });
  return { url: data || fallbackUrl, isLoading };
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseDamAssetResult {
  url: string;
  isLoading: boolean;
}

export function useDamAsset(
  domain: string,
  entityId: string,
  role: string,
  fallbackUrl: string
): UseDamAssetResult {
  const [url, setUrl] = useState<string>(fallbackUrl);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAsset() {
      try {
        const { data, error } = await supabase
          .from("asset_usages")
          .select(`
            asset_id,
            assets!inner (
              asset_versions (
                url,
                version_number
              )
            )
          `)
          .eq("entity_type", domain)
          .eq("entity_id", entityId)
          .eq("role", role)
          .maybeSingle();

        if (error) {
          console.error(`Error loading asset usage for ${domain}/${entityId}/${role}:`, error);
          return;
        }

        const typedData = data as unknown as {
          assets: {
            asset_versions: { url: string; version_number: number }[];
          };
        };

        const versions = typedData?.assets?.asset_versions;
        if (versions && versions.length > 0) {
          // Assuming newest version is first or we sort, but for now just pick the first valid URL
          const validVersion = versions.find((v) => v.url);
          if (validVersion?.url) {
            setUrl(validVersion.url);
          }
        }
      } catch (err) {
        console.error(`Error loading asset usage for ${domain}/${entityId}/${role}:`, err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAsset();
  }, [domain, entityId, role]);

  return { url, isLoading };
}

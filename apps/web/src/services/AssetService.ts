import { supabase } from "@/integrations/supabase/client";

export interface AssetRow {
  id: string;
  title: string;
  type: string;
  source: string;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetUsageRow {
  id: string;
  asset_id: string;
  entity_type: string;
  entity_id: string;
  role: string;
  created_at: string;
}

export const AssetService = {
  async getAssets(): Promise<AssetRow[]> {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAssetUsages(assetId: string): Promise<AssetUsageRow[]> {
    const { data, error } = await supabase
      .from("asset_usages")
      .select("*")
      .eq("asset_id", assetId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Needed to resolve the actual image URL since `assets` itself does not store the URL. 
  // It is stored in `asset_versions` or we can join with `media_files` (since dual write is active).
  // Let's use `asset_versions` as it is the V3 way.
  async getAssetVersion(versionId: string) {
    const { data, error } = await supabase
      .from("asset_versions")
      .select("*")
      .eq("id", versionId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

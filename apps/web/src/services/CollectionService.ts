import { supabase } from "@/integrations/supabase/client";
import { AssetInUseError } from "@/services/AssetService";

import type { AssetRow } from "@/services/AssetService";

export type CollectionType = "shoot" | "campaign" | "moodboard_set" | "project_delivery";

export interface CollectionRow {
  id: string;
  name: string;
  type: CollectionType;
  created_at: string;
  asset_count?: number;
}

export interface CollectionDetails {
  collection: CollectionRow;
  assets: AssetRow[];
  totalBytes: number;
  totalUsages: number;
  inUseAssetsCount: number;
}

export const CollectionService = {
  async getCollectionDetails(collectionId: string): Promise<CollectionDetails> {
    const { data: collection, error: colError } = await supabase
      .from("asset_collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (colError) throw colError;

    const { data: assets, error: assetsError } = await supabase
      .from("assets")
      .select(`
        *,
        asset_versions (
          id,
          url,
          version_number,
          file_id,
          size_bytes
        ),
        asset_usages (count),
        asset_tag_links (tag_id)
      `)
      .eq("collection_id", collectionId)
      .order("updated_at", { ascending: false })
      .order("version_number", { referencedTable: "asset_versions", ascending: false });

    if (assetsError) throw assetsError;

    const typedAssets = (assets || []) as unknown as AssetRow[];

    let totalBytes = 0;
    let totalUsages = 0;
    let inUseAssetsCount = 0;

    for (const a of typedAssets) {
      const latestVersionSize = a.asset_versions?.[0]?.size_bytes || 0;
      totalBytes += latestVersionSize;
      const usagesCount = a.asset_usages?.[0]?.count || 0;
      totalUsages += usagesCount;
      if (usagesCount > 0) inUseAssetsCount++;
    }

    return {
      collection: collection as CollectionRow,
      assets: typedAssets,
      totalBytes,
      totalUsages,
      inUseAssetsCount,
    };
  },

  async getCollections(): Promise<CollectionRow[]> {
    const { data, error } = await supabase
      .from("asset_collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as CollectionRow[]) || [];
  },

  async getCollectionWithAssetCount(): Promise<CollectionRow[]> {
    const { data: collections, error } = await supabase
      .from("asset_collections")
      .select("*, assets(count)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!collections) return [];

    return collections.map((col) => ({
      id: col.id,
      name: col.name,
      type: col.type as CollectionType,
      created_at: col.created_at,
      // PostgREST returns [{count: N}] for embedded resource counts
      asset_count: (col.assets as unknown as { count: number }[] | null)?.[0]?.count ?? 0,
    }));
  },

  async createCollection(name: string, type: CollectionType): Promise<CollectionRow> {
    const { data, error } = await supabase
      .from("asset_collections")
      .insert({ name, type })
      .select()
      .single();

    if (error) throw error;
    return data as CollectionRow;
  },

  async assignAssetToCollection(assetId: string, collectionId: string | null): Promise<void> {
    const { error } = await supabase
      .from("assets")
      .update({ collection_id: collectionId })
      .eq("id", assetId);

    if (error) throw error;
  },

  async updateCollection(id: string, patch: { name?: string; type?: CollectionType }): Promise<CollectionRow> {
    const { data, error } = await supabase
      .from("asset_collections")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as CollectionRow;
  },

  async deleteCollection(collectionId: string): Promise<void> {
    // Phase 09: Guard against deleting collections that contain active assets.
    // First, find all assets in this collection
    const { data: assets, error: assetsError } = await supabase
      .from("assets")
      .select("id, status")
      .eq("collection_id", collectionId);
      
    if (assetsError) throw assetsError;

    if (assets && assets.length > 0) {
      // Only consider assets that are NOT archived — archived assets are logically retired
      // and should not block collection deletion even if they still have usage rows.
      const activeAssets = (assets as Array<{ id: string; status: string }>).filter(
        (a) => a.status !== "archived"
      );
      const assetIds = activeAssets.map((a) => a.id);

      if (assetIds.length > 0) {
        const { data: usages, error: usagesError } = await supabase
          .from("asset_usages")
          .select("*")
          .in("asset_id", assetIds);

        if (usagesError) throw usagesError;

        if (usages && usages.length > 0) {
          throw new AssetInUseError(usages);
        }
      }
    }

    // First unassign all assets in this collection
    await supabase
      .from("assets")
      .update({ collection_id: null })
      .eq("collection_id", collectionId);

    const { error } = await supabase
      .from("asset_collections")
      .delete()
      .eq("id", collectionId);

    if (error) throw error;
  },
};

import { supabase } from "@/integrations/supabase/client";

export interface AssetRow {
  id: string;
  collection_id?: string | null;
  title: string | null;
  type: string;
  source: string;
  status: "uploading" | "processing" | "ready" | "failed" | "archived";
  created_at: string;
  updated_at: string;
  asset_versions?: { id: string; url: string | null; version_number: number; file_id: string }[];
  asset_usages?: { count: number }[];
}

export interface AssetUsageRow {
  id: string;
  asset_id: string;
  entity_type: string;
  entity_id: string;
  role: string;
  created_at: string;
}

/** Thrown when attempting to hard-delete an asset that still has active usages. */
export class AssetInUseError extends Error {
  constructor(public readonly usages: AssetUsageRow[]) {
    super(`Asset is still referenced by ${usages.length} usage(s) and cannot be deleted.`);
    this.name = "AssetInUseError";
  }
}

export const AssetService = {
  async getAssets(
    collectionId?: string | null,
    opts?: { 
        showArchived?: boolean; 
        searchQuery?: string; 
        status?: AssetRow["status"]; 
        unused?: boolean;
        domain?: string;
        role?: string;
    }
  ): Promise<AssetRow[]> {
    let query = supabase
      .from("assets")
      .select(`
        *,
        asset_versions (
          id,
          url,
          version_number,
          file_id
        ),
        asset_usages (count)
      `)
      .order("updated_at", { ascending: false });

    // By default, exclude archived assets from normal views unless overridden
    if (!opts?.showArchived && !opts?.status) {
      query = query.neq("status", "archived");
    }

    if (opts?.status) {
      query = query.eq("status", opts.status);
    }

    if (collectionId) {
      query = query.eq("collection_id", collectionId);
    }

    if (opts?.searchQuery) {
      query = query.ilike("title", `%${opts.searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    let results = data as unknown as AssetRow[];
    
    if (opts?.unused) {
        results = results.filter(a => !a.asset_usages || a.asset_usages.length === 0 || a.asset_usages[0].count === 0);
    }

    // Domain/role filtering: these values live on asset_usages, not assets themselves.
    // Fetch matching usage records if a domain or role filter is requested.
    if (opts?.domain || opts?.role) {
        let usageQuery = supabase
            .from("asset_usages")
            .select("asset_id, entity_type, role, domain");

        if (opts.domain) {
            usageQuery = usageQuery.ilike("domain", opts.domain);
        }
        if (opts.role) {
            usageQuery = usageQuery.eq("role", opts.role);
        }

        const { data: usageData, error: usageError } = await usageQuery;
        if (usageError) throw usageError;

        const matchingAssetIds = new Set((usageData || []).map(u => u.asset_id));
        results = results.filter(a => matchingAssetIds.has(a.id));
    }

    return results;
  },

  async getArchivedAssets(): Promise<AssetRow[]> {
    const { data, error } = await supabase
      .from("assets")
      .select(`
        *,
        asset_versions (
          id,
          url,
          version_number,
          file_id
        )
      `)
      .eq("status", "archived")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data as unknown as AssetRow[];
  },

  async archiveAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from("assets")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) throw error;
  },

  async restoreAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from("assets")
      .update({ status: "ready" })
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Hard-deletes an asset. Pre-flight checks for active usages.
   * Throws AssetInUseError if the asset is still referenced.
   * Cleans up all asset_versions rows and deletes each file from ImageKit storage.
   */
  async deleteAsset(id: string): Promise<void> {
    // Pre-flight: check for active usages
    const usages = await AssetService.getAssetUsages(id);
    if (usages.length > 0) {
      throw new AssetInUseError(usages);
    }

    // 1. Fetch all version records to get their storage file_ids
    const { data: versions, error: versionsError } = await supabase
      .from("asset_versions")
      .select("id, file_id")
      .eq("asset_id", id);

    if (versionsError) throw versionsError;

    // 2. Delete each file from ImageKit storage (best-effort; log on failure)
    if (versions && versions.length > 0) {
      for (const version of versions) {
        if (version.file_id) {
          try {
            await supabase.functions.invoke("imagekit-upload", {
              body: { action: "delete", filePath: version.file_id },
            });
          } catch (e) {
            console.warn(`[AssetService.deleteAsset] ImageKit delete failed for file_id=${version.file_id}:`, e);
          }
        }
      }

      // 3. Delete all asset_versions rows for this asset
      const { error: deleteVersionsError } = await supabase
        .from("asset_versions")
        .delete()
        .eq("asset_id", id);

      if (deleteVersionsError) throw deleteVersionsError;
    }

    // 4. Hard-delete the asset record
    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("id", id);

    if (error) throw error;
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

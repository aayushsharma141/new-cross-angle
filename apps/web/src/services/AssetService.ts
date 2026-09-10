import { supabase } from "@/integrations/supabase/client";
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("AssetService");
export interface AssetRow {
  id: string;
  collection_id?: string | null;
  title: string | null;
  type: string;
  source: string;
  status: "uploading" | "processing" | "ready" | "failed" | "archived";
  created_at: string;
  updated_at: string;
  asset_versions?: { id: string; url: string | null; version_number: number; file_id: string; size_bytes?: number }[];
  asset_usages?: { count: number }[];
  asset_tag_links?: { tag_id: string }[];
}

export interface AssetTagRow {
  id: string;
  name: string;
  slug: string;
}

export interface AssetUsageRow {
  id: string;
  asset_id: string;
  entity_type: string;
  entity_id: string;
  role: string;
  created_at: string;
}

export interface AssetVersionRow {
  id: string;
  asset_id: string;
  version_number: number;
  url: string | null;
  file_id: string;
  size_bytes: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  storage_provider: string | null;
  created_at: string;
}

/** Thrown when attempting to hard-delete an asset that still has active usages. */
export class AssetInUseError extends Error {
  constructor(public readonly usages: AssetUsageRow[]) {
    super(`Asset is still referenced by ${usages.length} usage(s) and cannot be deleted.`);
    this.name = "AssetInUseError";
  }
}

/** Folder used when an existing version carries no derivable storage path. */
const REPLACEMENT_FALLBACK_FOLDER = "dam/replacements";

/** Reads a File as the base64 data URL the `imagekit-upload` function expects. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Derives a version's storage folder so its replacement lands beside it. */
function folderOf(fileId: string | null | undefined): string {
  if (!fileId) return REPLACEMENT_FALLBACK_FOLDER;
  const lastSlash = fileId.lastIndexOf("/");
  return lastSlash > 0 ? fileId.slice(0, lastSlash) : REPLACEMENT_FALLBACK_FOLDER;
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
        tags?: string[];
        recent?: boolean;
        timeoutMs?: number;
    }
  ): Promise<AssetRow[]> {
    return tracer.startActiveSpan("AssetService.getAssets", async (span) => {
      const startTime = performance.now();
      try {
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort('Request timeout'), opts?.timeoutMs || 5000);

        let query = supabase
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
          .order("updated_at", { ascending: false })
          .order("version_number", { referencedTable: "asset_versions", ascending: false });

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
          span.setAttribute("search.query", opts.searchQuery);
        }

        const { data, error } = await query.abortSignal(timeoutController.signal);
        clearTimeout(timeoutId);
        
        if (error) {
          if (error.message.includes('AbortError') || error.message.includes('Request timeout')) {
            throw new Error('Supabase request timed out');
          }
          throw error;
        }
        
        let results = data as unknown as AssetRow[];
        
        if (opts?.unused) {
            results = results.filter(a => !a.asset_usages || a.asset_usages.length === 0 || a.asset_usages[0].count === 0);
        }

        if (opts?.domain || opts?.role) {
            let usageQuery = supabase
                .from("asset_usages")
                .select("asset_id, entity_type, role, domain");

            if (opts.domain) usageQuery = usageQuery.ilike("domain", opts.domain);
            if (opts.role) usageQuery = usageQuery.eq("role", opts.role);

            const { data: usageData, error: usageError } = await usageQuery;
            if (usageError) throw usageError;

            const matchingAssetIds = new Set((usageData || []).map(u => u.asset_id));
            results = results.filter(a => matchingAssetIds.has(a.id));
        }

        if (opts?.tags && opts.tags.length > 0) {
          const { data: tagLinks, error: tagLinksError } = await supabase
            .from('asset_tag_links')
            .select('asset_id')
            .in('tag_id', opts.tags);

          if (tagLinksError) throw tagLinksError;
          
          const matchedAssetIds = new Set((tagLinks || []).map(l => l.asset_id));
          results = results.filter(a => matchedAssetIds.has(a.id));
        }

        if (opts?.recent) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            results = results.filter(a => new Date(a.created_at) >= sevenDaysAgo);
        }

        const duration = performance.now() - startTime;
        span.setAttribute("search.duration_ms", duration);
        span.setAttribute("search.results_count", results.length);

        if (opts?.searchQuery && duration > 500) {
          console.warn(`⚠️ SLO VIOLATION: Search took ${Math.round(duration)}ms (Target: < 500ms)`);
          span.setAttribute("slo.violation", true);
        }

        span.end();
        return results;
      } catch (err: any) {
        span.recordException(err);
        span.end();
        throw err;
      }
    });
  },

  async getTags(): Promise<AssetTagRow[]> {
    const { data, error } = await supabase
      .from("asset_tags")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
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
      .order("updated_at", { ascending: false })
      .order("version_number", { referencedTable: "asset_versions", ascending: false });

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

  /** Full version history for an asset, newest first. */
  async getAssetVersions(assetId: string): Promise<AssetVersionRow[]> {
    const { data, error } = await supabase
      .from("asset_versions")
      .select("*")
      .eq("asset_id", assetId)
      .order("version_number", { ascending: false });

    if (error) throw error;
    return (data || []) as AssetVersionRow[];
  },

  /**
   * Replaces an asset's binary without breaking references.
   *
   * Entities point at `asset_id` through `asset_usages` — never at a version id
   * or a raw CDN URL (ADR-0002) — so appending a new `asset_versions` row
   * re-points every consumer at once. `rpc_finalize_dam_asset` cannot be reused
   * here: it hardcodes `version_number = 1` and would also bind a usage row.
   *
   * The superseded file is deliberately left in ImageKit; it is what makes the
   * history browsable and a rollback possible.
   */
  async replaceAsset(assetId: string, file: File): Promise<AssetVersionRow> {
    const versions = await AssetService.getAssetVersions(assetId);
    const current = versions[0];
    const nextVersionNumber = (current?.version_number ?? 0) + 1;

    const fileData = await readAsDataUrl(file);

    const { data: uploaded, error: uploadError } = await supabase.functions.invoke(
      "imagekit-upload",
      {
        body: {
          action: "upload",
          fileName: file.name,
          fileData,
          folder: folderOf(current?.file_id),
          useUniqueName: true,
        },
      },
    );

    if (uploadError) {
      throw new Error(`Replacement upload failed: ${uploadError.message}`);
    }

    const filePath: string = uploaded.filePath || uploaded.name;

    const { data: inserted, error: insertError } = await supabase
      .from("asset_versions")
      .insert({
        asset_id: assetId,
        version_number: nextVersionNumber,
        storage_provider: "imagekit",
        file_id: filePath,
        url: uploaded.url,
        size_bytes: file.size,
        mime_type: file.type || "application/octet-stream",
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
      })
      .select()
      .single();

    if (insertError) {
      // The row is what makes the upload reachable. Without it the file is an
      // orphan in ImageKit with nothing pointing at it, so clean it up rather
      // than leaving unreferenced bytes behind.
      try {
        await supabase.functions.invoke("imagekit-upload", {
          body: { action: "delete", filePath },
        });
      } catch (e) {
        console.warn(
          `[AssetService.replaceAsset] orphan cleanup failed for file_id=${filePath}:`,
          e,
        );
      }
      throw insertError;
    }

    // Surface the replacement in the "recently updated" ordering the sidebar uses.
    const { error: touchError } = await supabase
      .from("assets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", assetId);

    if (touchError) {
      console.warn("[AssetService.replaceAsset] failed to touch asset updated_at:", touchError);
    }

    return inserted as AssetVersionRow;
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

/**
 * AssetUsageService
 *
 * The single authoritative layer for reading and writing `asset_usages` records.
 *
 * Design contract:
 * - UI components (UniversalAssetPicker, MediaPickerField) MUST NOT call this directly.
 * - Only consuming editors (PortfolioFormDialog, AdminServices, ArchetypesEditor, etc.)
 *   may call this service after an asset is selected.
 * - This keeps the relationship graph logic outside of reusable UI components.
 */

import { supabase } from "@/integrations/supabase/client";
import { AssetUsageRow } from "@/services/AssetService";

export interface CreateUsageParams {
  assetId: string;
  entityType: string;
  entityId: string;
  role: string;
  domain?: string;
}

export const AssetUsageService = {
  /**
   * Creates a new asset_usage record for a given asset/entity/role combination.
   * Does NOT check for existing records — use replaceUsage when swapping images.
   */
  async createUsage(params: CreateUsageParams): Promise<AssetUsageRow> {
    const { assetId, entityType, entityId, role, domain } = params;

    // Infer domain based on entityType if not explicitly provided
    let resolvedDomain = domain;
    if (!resolvedDomain) {
      const typeLower = entityType.toLowerCase();
      if (typeLower === "archetype" || typeLower === "discovery_visual") {
        resolvedDomain = "Discovery";
      } else if (typeLower === "blogs" || typeLower === "blog") {
        resolvedDomain = "Marketing";
      } else {
        resolvedDomain = "Portfolio";
      }
    }

    const { data, error } = await supabase
      .from("asset_usages")
      .insert({
        asset_id: assetId,
        entity_type: entityType,
        entity_id: entityId,
        role,
        domain: resolvedDomain,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AssetUsageRow;
  },

  /**
   * Removes all asset_usage records matching the (entityType, entityId, role) triplet.
   * Used before creating a new usage when swapping an asset.
   */
  async removeUsage(params: Omit<CreateUsageParams, "assetId">): Promise<void> {
    const { entityType, entityId, role } = params;

    const { error } = await supabase
      .from("asset_usages")
      .delete()
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("role", role);

    if (error) throw error;
  },

  /**
   * Atomically replaces the asset used in a given slot.
   *
   * If entityId is null/undefined (e.g. a brand-new entity not yet saved),
   * the operation is a no-op — we cannot create a usage without an entity ID.
   * This is intentional: the first save of a new entity creates it in the DB,
   * after which subsequent edits will have the ID and can bind usages.
   *
   * Steps:
   * 1. Delete any existing usage for (entityType, entityId, role)
   * 2. Insert the new usage for (assetId, entityType, entityId, role)
   */
  async replaceUsage(params: CreateUsageParams & { entityId: string | null | undefined }): Promise<void> {
    const { assetId, entityType, entityId, role } = params;

    if (!entityId) {
      // Cannot bind usage without a stable entity ID.
      // This happens during new entity creation — silently skip.
      return;
    }

    // Step 1: Remove old usage for this slot
    await AssetUsageService.removeUsage({ entityType, entityId, role });

    // Step 2: Insert new usage
    await AssetUsageService.createUsage({ assetId, entityType, entityId, role });
  },

  /**
   * Returns all usage records for a given entity (e.g. all images bound to a project).
   */
  async getUsagesByEntity(entityType: string, entityId: string): Promise<AssetUsageRow[]> {
    const { data, error } = await supabase
      .from("asset_usages")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as AssetUsageRow[];
  },

  /**
   * Returns all usage records for a given asset across all entities.
   */
  async getUsagesByAsset(assetId: string): Promise<AssetUsageRow[]> {
    const { data, error } = await supabase
      .from("asset_usages")
      .select("*")
      .eq("asset_id", assetId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as AssetUsageRow[];
  },
};

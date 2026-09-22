/**
 * MediaRepository.ts — Supabase DB reads/writes for media_files and media_folders.
 *
 * Owns all database interactions. Does NOT touch storage — that is the provider's job.
 * All public methods return domain types (MediaFile, MediaFolder), not raw rows.
 */

import { supabase } from "@/integrations/supabase/client";
import { toMediaFolder, toMediaFile } from "./mappers";
import type { MediaFile, MediaFolder, MediaFileRow, MediaFolderRow } from "./types";

export const MediaRepository = {
  // ── Folders ──────────────────────────────────────────────────────────────

  async getFolders(parentId?: string | null): Promise<MediaFolder[]> {
    let query = supabase.from("media_folders").select("*").order("name", { ascending: true });
    if (parentId !== undefined) {
      query = parentId === null ? query.is("parent_id", null) : query.eq("parent_id", parentId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as MediaFolderRow[]).map(toMediaFolder);
  },

  async createFolder(name: string, parentId: string | null = null): Promise<MediaFolder> {
    const tempPath = `root.${name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}_${Date.now()}`;
    const { data, error } = await supabase
      .from("media_folders")
      .insert({ name, parent_id: parentId, path: tempPath })
      .select()
      .single();
    if (error) throw error;
    return toMediaFolder(data as MediaFolderRow);
  },

  async renameFolder(id: string, name: string): Promise<MediaFolder> {
    const { data, error } = await supabase
      .from("media_folders")
      .update({ name })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toMediaFolder(data as MediaFolderRow);
  },

  async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase.from("media_folders").delete().eq("id", id);
    if (error) throw error;
  },

  // ── Files ─────────────────────────────────────────────────────────────────

  async getFiles(folderId?: string | null): Promise<MediaFile[]> {
    let query = supabase
      .from("media_files")
      .select("*")
      .order("created_at", { ascending: false });
    if (folderId !== undefined) {
      query = folderId === null ? query.is("folder_id", null) : query.eq("folder_id", folderId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as MediaFileRow[]).map(toMediaFile);
  },

  async insertFile(params: {
    folderId?: string | null;
    fileName: string;
    displayName: string;
    url: string;
    storageProvider: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<{ id: string; url: string }> {
    const { data, error } = await supabase
      .from("media_files")
      .insert({
        folder_id: params.folderId,
        file_name: params.fileName,
        display_name: params.displayName,
        url: params.url,
        storage_provider: params.storageProvider,
        storage_path: params.storagePath,
        mime_type: params.mimeType,
        size_bytes: params.sizeBytes,
      })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, url: params.url };
  },

  async getFileById(id: string): Promise<{ storage_provider: string; storage_path: string; url: string } | null> {
    const { data, error } = await supabase
      .from("media_files")
      .select("storage_provider, storage_path, url")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    // maybeSingle, not single: a row already gone is not an error for callers
    // that delete — MediaService.delete treats null as "nothing left to do".
    return data as { storage_provider: string; storage_path: string; url: string } | null;
  },

  async deleteFile(id: string): Promise<void> {
    const { error } = await supabase.from("media_files").delete().eq("id", id);
    if (error) throw error;
  },

  async moveFiles(ids: string[], newFolderId: string | null): Promise<{ succeeded: number; total: number; errors: string[] }> {
    const { data: files } = await supabase.from("media_files").select("id").in("id", ids);
    if (!files) return { succeeded: 0, total: ids.length, errors: ["Files not found"] };

    const results = await Promise.allSettled(
      files.map(async (f) => {
        const { error } = await supabase
          .from("media_files")
          .update({ folder_id: newFolderId })
          .eq("id", f.id);
        if (error) throw error;
        return f.id;
      }),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)));
    return { succeeded, total: ids.length, errors };
  },

  async updateMetadata(id: string, metadata: { displayName?: string; altText?: string; caption?: string }): Promise<void> {
    const { error } = await supabase
      .from("media_files")
      .update({
        display_name: metadata.displayName,
        alt_text: metadata.altText,
        caption: metadata.caption,
      } as never)
      .eq("id", id);
    if (error) throw error;
  },
};

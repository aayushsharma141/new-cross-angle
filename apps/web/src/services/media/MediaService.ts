/**
 * media/MediaService.ts — Thin facade re-assembling the public MediaService API.
 *
 * This file is the only place that composes Repository + Provider + Orchestrator.
 * Consumer code imports from src/services/MediaService.ts (the shim), which
 * re-exports everything from here. Public API surface is unchanged.
 */

import { supabase } from "@/integrations/supabase/client";
import { MediaRepository } from "./MediaRepository";
import { UploadOrchestrator } from "./UploadOrchestrator";
import { defaultProvider, resolveProvider } from "./providers";
import type {
  MediaFile,
  UploadOptions,
  DamUploadOptions,
  UploadResult,
  DamUploadResult,
  BulkOperationResult,
} from "./types";

const damOrchestrator = new UploadOrchestrator(defaultProvider);

export const MediaService = {
  // ── Folders ──────────────────────────────────────────────────────────────

  getFolders: (parentId?: string | null) => MediaRepository.getFolders(parentId),
  createFolder: (name: string, parentId?: string | null) => MediaRepository.createFolder(name, parentId ?? null),
  renameFolder: (id: string, name: string) => MediaRepository.renameFolder(id, name),
  deleteFolder: (id: string) => MediaRepository.deleteFolder(id),

  // ── File reads ───────────────────────────────────────────────────────────

  getFiles: (folderId?: string | null) => MediaRepository.getFiles(folderId),

  /** Legacy: returns all files without folder filter. */
  list: (): Promise<MediaFile[]> => MediaRepository.getFiles(),

  // ── Legacy upload (media library, pre-DAM v3) ─────────────────────────

  async upload(options: UploadOptions): Promise<UploadResult> {
    const { file, folderId, onProgress } = options;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const uploaded = await defaultProvider.upload({
            fileName: file.name,
            fileData: base64,
            folder: "media",
            useUniqueName: true,
          });

          const inserted = await MediaRepository.insertFile({
            folderId,
            fileName: uploaded.name,
            displayName: file.name,
            url: uploaded.url,
            storageProvider: "imagekit",
            storagePath: uploaded.filePath,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
          });

          onProgress?.(100);
          resolve({ id: inserted.id, url: uploaded.url, name: file.name });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  // ── DAM v3 Upload (multi-step saga) ──────────────────────────────────────

  uploadDamAsset: (options: DamUploadOptions): Promise<DamUploadResult> =>
    damOrchestrator.upload(options),

  // ── File mutations ────────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    const file = await MediaRepository.getFileById(id);
    if (!file) return;

    await resolveProvider(file.storage_provider).delete(file.storage_path);
    await MediaRepository.deleteFile(id);
  },

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const results = await Promise.allSettled(
      ids.map((id) => MediaService.delete(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)));
    return { succeeded, total: ids.length, errors };
  },

  bulkMove: (ids: string[], newFolderId: string | null): Promise<BulkOperationResult> =>
    MediaRepository.moveFiles(ids, newFolderId),

  updateMetadata: (
    id: string,
    metadata: { displayName?: string; altText?: string; caption?: string },
  ) => MediaRepository.updateMetadata(id, metadata),

  // ── Bulk operations via Edge Functions ────────────────────────────────────

  async bulkCopy(fileIds: string[], targetFolderId: string | null): Promise<BulkOperationResult> {
    const { data, error } = await supabase.functions.invoke("media-operations", {
      body: { action: "bulk-copy", payload: { fileIds, targetFolderId } },
    });
    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.message ?? "Copy failed");
    return { succeeded: fileIds.length, total: fileIds.length, errors: [] };
  },

  async exportZip(fileIds: string[], folderIds: string[] = []): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl;
    const resp = await fetch(`${supabaseUrl}/functions/v1/media-export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ fileIds, folderIds }),
    });

    if (!resp.ok) throw new Error(`Export failed: ${await resp.text()}`);

    const contentType = resp.headers.get("Content-Type") ?? "";
    if (!contentType.includes("zip")) {
      const json = await resp.json() as { message?: string };
      throw new Error(json.message ?? "Export not fully implemented on server");
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-export-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 3000);
  },

  async importZip(zipFile: File, targetFolderId: string | null): Promise<{ message: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl;
    const form = new FormData();
    form.append("file", zipFile);
    if (targetFolderId) form.append("targetFolderId", targetFolderId);

    const resp = await fetch(`${supabaseUrl}/functions/v1/media-import`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: form,
    });

    if (!resp.ok) throw new Error(`Import failed: ${await resp.text()}`);
    return resp.json() as Promise<{ message: string }>;
  },
};

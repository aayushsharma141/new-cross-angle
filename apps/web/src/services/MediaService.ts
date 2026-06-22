import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MediaFileRow = Tables<"media_files">;
export type MediaFolderRow = Tables<"media_folders">;

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  folderId: string | null;
  name: string;
  url: string;
  size: number;
  createdAt: string;
  provider: MediaProvider;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
}

export interface UploadOptions {
  file: File;
  folderId?: string | null;
  onProgress?: (percent: number) => void;
}

export interface DamUploadOptions {
  file: File;
  title?: string;
  domain: string; // e.g., 'portfolio', 'discovery'
  entityType: string; // e.g., 'projects', 'archetypes'
  entityId?: string | null;
  role: string; // e.g., 'hero', 'gallery'
  onProgress?: (percent: number) => void;
}

const BUCKET_NAME = "media";

export type MediaProvider = "imagekit" | "supabase" | "external";

function toMediaFolder(folder: MediaFolderRow): MediaFolder {
  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parent_id,
    path: folder.path as string,
    createdAt: folder.created_at ?? new Date().toISOString(),
  };
}

function toMediaFile(file: MediaFileRow): MediaFile {
  return {
    id: file.id,
    folderId: file.folder_id,
    name: file.display_name || file.file_name,
    url: file.url,
    size: file.size_bytes || 0,
    createdAt: file.created_at ?? new Date().toISOString(),
    provider: (file.storage_provider as MediaProvider) || "imagekit",
    mimeType: file.mime_type || "application/octet-stream",
    width: file.width || undefined,
    height: file.height || undefined,
    altText: (file as Record<string, unknown>).alt_text as string | undefined,
    caption: (file as Record<string, unknown>).caption as string | undefined,
  };
}

export const MediaService = {
  // ----------------------------------------------------
  // FOLDERS
  // ----------------------------------------------------

  async getFolders(parentId?: string | null): Promise<MediaFolder[]> {
    let query = supabase.from("media_folders").select("*").order("name", { ascending: true });
    
    if (parentId !== undefined) {
      if (parentId === null) {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", parentId);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as MediaFolderRow[]).map(toMediaFolder);
  },

  async createFolder(name: string, parentId: string | null = null): Promise<MediaFolder> {
    const tempPath = `root.${name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}_${Date.now()}`;
    
    const { data, error } = await supabase
      .from("media_folders")
      .insert({
        name,
        parent_id: parentId,
        path: tempPath,
      })
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
    const { error } = await supabase
      .from("media_folders")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // ----------------------------------------------------
  // FILES & ASSETS
  // ----------------------------------------------------

  async getFiles(folderId?: string | null): Promise<MediaFile[]> {
    let query = supabase
      .from("media_files")
      .select("*")
      .order("created_at", { ascending: false });

    if (folderId !== undefined) {
      if (folderId === null) {
        query = query.is("folder_id", null);
      } else {
        query = query.eq("folder_id", folderId);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as MediaFileRow[]).map(toMediaFile);
  },

  async list(): Promise<MediaFile[]> {
    // Legacy support for parts of the app that just call list() without folders
    return this.getFiles();
  },

  // Legacy upload
  async upload(options: UploadOptions): Promise<{ id: string; url: string; name: string }> {
    const { file, folderId, onProgress } = options;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          // Use ImageKit Edge function
          const { data, error } = await supabase.functions.invoke("imagekit-upload", {
            body: {
              action: "upload",
              fileName: file.name,
              fileData: base64,
              folder: "media", // Default imagekit remote folder
              useUniqueName: true,
            },
          });

          if (error) {
            throw new Error(error.message || "Upload failed");
          }

          // Insert into media_files
          const { data: insertedFile, error: insertError } = await supabase.from("media_files").insert({
            folder_id: folderId,
            file_name: data.name,
            display_name: file.name,
            url: data.url,
            storage_provider: "imagekit",
            storage_path: data.filePath || data.name,
            mime_type: file.type || "application/octet-stream",
            size_bytes: file.size,
          }).select().single();

          if (insertError) throw insertError;

          onProgress?.(100);
          resolve({ id: insertedFile.id, url: data.url, name: file.name });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  // DAM V3 Upload
  async uploadDamAsset(options: DamUploadOptions): Promise<{ assetId: string; url: string; filePath: string }> {
    const { file, title, domain, entityType, entityId, role, onProgress } = options;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const type = file.type.startsWith("video/") ? "video" : 
                       file.type.startsWith("image/") ? "image" : "document";

          // 1. Create the base asset as "uploading" (Step 1 RPC)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: assetId, error: createError } = await (supabase as any).rpc("rpc_create_uploading_asset", {
            p_type: type,
            p_source: "uploaded",
            p_title: title || file.name,
          });

          if (createError) throw new Error(`Asset creation failed: ${createError.message}`);

          // 2. Upload to ImageKit via edge function
          const { data, error } = await supabase.functions.invoke("imagekit-upload", {
            body: {
              action: "upload",
              fileName: file.name,
              fileData: base64,
              folder: `dam/${domain}/${entityType}`, 
              useUniqueName: true,
            },
          });

          if (error) {
            // Delete the "uploading" asset if ImageKit upload fails
            console.error("ImageKit upload failed, rolling back asset", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from("assets").delete().eq("id", assetId as string);
            throw new Error(error.message || "Upload failed");
          }

          // 3. Finalize the asset (Step 2 RPC)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: rpcError } = await (supabase as any).rpc("rpc_finalize_dam_asset", {
            p_asset_id: assetId,
            p_file_id: data.filePath || data.name,
            p_url: data.url,
            p_size_bytes: file.size,
            p_mime_type: file.type || "application/octet-stream",
            p_width: data.width || null,
            p_height: data.height || null,
            p_domain: domain,
            p_entity_type: entityType,
            p_entity_id: entityId,
            p_role: role
          });

          if (rpcError) {
            // Rollback ImageKit upload and database asset on DB failure
            console.error("DB RPC failed, attempting to rollback from ImageKit and DB", rpcError);
            await supabase.functions.invoke("imagekit-upload", {
              body: { action: "delete", filePath: data.filePath || data.name }
            }).catch(e => console.warn("Rollback ImageKit failed:", e));
            await Promise.resolve(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (supabase as any).from("assets").delete().eq("id", assetId as string)
            ).catch(e => console.warn("Rollback DB failed:", e));
            
            throw new Error(`Asset finalization failed: ${rpcError.message}`);
          }

          onProgress?.(100);
          resolve({ assetId: assetId as string, url: data.url, filePath: data.filePath || data.name });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  async delete(id: string): Promise<void> {
    const { data: file, error: fetchError } = await supabase
      .from("media_files")
      .select("storage_provider, storage_path, url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (file.storage_provider === "imagekit") {
      // NOTE: Our edge function for 'delete' requires fileId, but we didn't store it.
      // We stored storage_path. We'll pass filePath which imagekit-upload might support deleting by path.
      const { error } = await supabase.functions.invoke("imagekit-upload", {
        body: {
          action: "delete",
          filePath: file.storage_path,
        },
      });
      if (error) console.warn("ImageKit delete failed:", error.message);
    } else if (file.storage_provider === "supabase") {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([file.storage_path]);
      if (storageError) console.warn("Supabase storage delete failed:", storageError.message);
    }

    const { error: dbError } = await supabase.from("media_files").delete().eq("id", id);
    if (dbError) throw dbError;
  },

  async bulkDelete(ids: string[]): Promise<{ succeeded: number; total: number; errors: string[] }> {
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        await MediaService.delete(id);
        return id;
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)));

    return { succeeded, total: ids.length, errors };
  },

  async bulkMove(ids: string[], newFolderId: string | null): Promise<{ succeeded: number; total: number; errors: string[] }> {
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
      })
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

  /**
   * Bulk copy files to a target folder via edge function.
   * The edge function creates DB copies of file records (same ImageKit assets).
   */
  async bulkCopy(fileIds: string[], targetFolderId: string | null): Promise<{ succeeded: number; total: number; errors: string[] }> {
    const { data, error } = await supabase.functions.invoke("media-operations", {
      body: { action: "bulk-copy", payload: { fileIds, targetFolderId } },
    });
    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.message ?? "Copy failed");
    return { succeeded: fileIds.length, total: fileIds.length, errors: [] };
  },

  /**
   * Export selected files as a ZIP archive.
   * Calls edge function which downloads from ImageKit, zips them,
   * and returns the blob — we then trigger a browser download.
   */
  async exportZip(fileIds: string[], folderIds: string[] = []): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl;
    const fnUrl = `${supabaseUrl}/functions/v1/media-export`;

    const resp = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ fileIds, folderIds }),
    });

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(`Export failed: ${msg}`);
    }

    const contentType = resp.headers.get("Content-Type") ?? "";
    if (!contentType.includes("zip")) {
      // Edge function still scaffolded — show informative error
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

  /**
   * Import a ZIP file by sending multipart form data to the edge function.
   * The function extracts files, creates folders, and uploads to ImageKit.
   */
  async importZip(zipFile: File, targetFolderId: string | null): Promise<{ message: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl;
    const fnUrl = `${supabaseUrl}/functions/v1/media-import`;

    const form = new FormData();
    form.append("file", zipFile);
    if (targetFolderId) form.append("targetFolderId", targetFolderId);

    const resp = await fetch(fnUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.access_token}` },
      body: form,
    });

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(`Import failed: ${msg}`);
    }

    return resp.json() as Promise<{ message: string }>;
  },
};

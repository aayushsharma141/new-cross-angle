/**
 * media/mappers.ts — Pure mapping functions from Supabase rows to domain types.
 */

import type { MediaFile, MediaFolder, MediaFileRow, MediaFolderRow, MediaProvider } from "./types";

export function toMediaFolder(folder: MediaFolderRow): MediaFolder {
  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parent_id,
    path: folder.path as string,
    createdAt: folder.created_at ?? new Date().toISOString(),
  };
}

export function toMediaFile(file: MediaFileRow): MediaFile {
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

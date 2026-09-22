/**
 * media/types.ts — Domain types for the media bounded context.
 *
 * These are the public-facing types. Never import from MediaFileRow/MediaFolderRow
 * in consumer code — use MediaFile and MediaFolder instead.
 */

import type { Tables } from "@/integrations/supabase/types";

// Raw Supabase row types (used only inside this service layer)
export type MediaFileRow = Tables<"media_files">;
export type MediaFolderRow = Tables<"media_folders">;

export type MediaProvider = "imagekit" | "supabase" | "external";

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
  domain: string;
  entityType: string;
  entityId?: string | null;
  role: string;
  collectionId?: string | null;
  idempotencyKey?: string;
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  id: string;
  url: string;
  name: string;
}

export interface DamUploadResult {
  assetId: string;
  url: string;
  filePath: string;
}

export interface BulkOperationResult {
  succeeded: number;
  total: number;
  errors: string[];
}

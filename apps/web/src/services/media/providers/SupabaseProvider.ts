/**
 * providers/SupabaseProvider.ts — Supabase Storage implementation of StorageProvider.
 *
 * Used as a fallback when ImageKit is unavailable, and for legacy files
 * stored before DAM v3 was introduced.
 */

import { supabase } from "@/integrations/supabase/client";
import type { StorageProvider, StorageUploadResult } from "../StorageGateway";

const BUCKET_NAME = "media";

export class SupabaseProvider implements StorageProvider {
  async upload(params: {
    fileName: string;
    fileData: string;
    folder: string;
    useUniqueName?: boolean;
  }): Promise<StorageUploadResult> {
    // Convert base64 data URL to Blob
    const base64Data = params.fileData.split(",")[1];
    const mimeType = params.fileData.match(/data:([^;]+);/)?.[1] || "application/octet-stream";
    const byteCharacters = atob(base64Data);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mimeType });

    const uniqueName = params.useUniqueName
      ? `${Date.now()}-${params.fileName}`
      : params.fileName;
    const storagePath = `${params.folder}/${uniqueName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, blob, { contentType: mimeType });

    if (error) throw new Error(error.message || "Supabase storage upload failed");

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return {
      url: urlData.publicUrl,
      filePath: storagePath,
      name: uniqueName,
    };
  }

  /** Throws on failure — see the note on ImageKitProvider.delete. */
  async delete(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    if (error) throw new Error(`Supabase storage delete failed: ${error.message}`);
  }
}

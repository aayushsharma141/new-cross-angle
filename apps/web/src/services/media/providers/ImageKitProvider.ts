/**
 * providers/ImageKitProvider.ts — ImageKit implementation of StorageProvider.
 *
 * Routes uploads through the `imagekit-upload` Supabase Edge Function.
 * This is the default provider for all DAM v3 assets.
 */

import { supabase } from "@/integrations/supabase/client";
import type { StorageProvider, StorageUploadResult } from "../StorageGateway";

export class ImageKitProvider implements StorageProvider {
  async upload(params: {
    fileName: string;
    fileData: string;
    folder: string;
    useUniqueName?: boolean;
  }): Promise<StorageUploadResult> {
    const { data, error } = await supabase.functions.invoke("imagekit-upload", {
      body: {
        action: "upload",
        fileName: params.fileName,
        fileData: params.fileData,
        folder: params.folder,
        useUniqueName: params.useUniqueName ?? true,
      },
    });

    if (error) throw new Error(error.message || "ImageKit upload failed");

    return {
      url: data.url,
      filePath: data.filePath || data.name,
      name: data.name,
      width: data.width || undefined,
      height: data.height || undefined,
    };
  }

  /**
   * Throws on failure so callers can leave the DB row in place. Swallowing the
   * error let MediaService drop the row while the file survived in ImageKit —
   * an orphan with nothing left pointing at it. The edge function treats a
   * 404 from ImageKit as success, so deleting an already-gone file is a no-op.
   */
  async delete(filePath: string): Promise<void> {
    const { error } = await supabase.functions.invoke("imagekit-upload", {
      body: { action: "delete", filePath },
    });
    if (error) throw new Error(`ImageKit delete failed: ${error.message}`);
  }
}

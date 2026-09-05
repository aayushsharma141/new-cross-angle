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

  async delete(filePath: string): Promise<void> {
    const { error } = await supabase.functions.invoke("imagekit-upload", {
      body: { action: "delete", filePath },
    });
    if (error) console.warn("ImageKit delete failed:", error.message);
  }
}

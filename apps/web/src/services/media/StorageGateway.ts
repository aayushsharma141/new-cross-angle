/**
 * StorageGateway.ts — Interface contract for storage providers.
 *
 * Any provider (ImageKit, Supabase Storage, S3) must implement this interface.
 * The DAM upload orchestrator depends only on this interface, never on a concrete provider.
 */

export interface StorageUploadResult {
  url: string;
  filePath: string;
  name: string;
  width?: number;
  height?: number;
}

export interface StorageProvider {
  /** Upload a file and return public URL + storage path. */
  upload(params: {
    fileName: string;
    fileData: string; // base64 data URL
    folder: string;
    useUniqueName?: boolean;
  }): Promise<StorageUploadResult>;

  /** Delete a file by its storage path. */
  delete(filePath: string): Promise<void>;
}

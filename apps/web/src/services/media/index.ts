/**
 * media/index.ts — Public barrel for the media bounded context.
 * All consumer imports from `@/services/MediaService` continue to work
 * via the shim at src/services/MediaService.ts.
 */

export type {
  MediaFile,
  MediaFolder,
  MediaFileRow,
  MediaFolderRow,
  MediaProvider,
  UploadOptions,
  DamUploadOptions,
  UploadResult,
  DamUploadResult,
  BulkOperationResult,
} from "./types";

export { MediaService } from "./MediaService";
export { MediaRepository } from "./MediaRepository";
export type { StorageProvider, StorageUploadResult } from "./StorageGateway";
export { ImageKitProvider } from "./providers/ImageKitProvider";
export { SupabaseProvider } from "./providers/SupabaseProvider";
export { UploadOrchestrator } from "./UploadOrchestrator";

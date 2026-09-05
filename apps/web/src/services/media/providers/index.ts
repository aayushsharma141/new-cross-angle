/**
 * providers/index.ts — Provider registry / factory.
 *
 * The MediaService façade imports ONLY from here — never from concrete providers.
 * To swap the default provider (e.g. to Cloudflare R2), change only this file.
 *
 * Rules:
 * - `defaultProvider` is the live production storage (ImageKit)
 * - `fallbackProvider` is the secondary storage (Supabase Storage) for legacy files
 */

import type { StorageProvider } from "../StorageGateway";
import { ImageKitProvider } from "./ImageKitProvider";
import { SupabaseProvider } from "./SupabaseProvider";

export const defaultProvider: StorageProvider = new ImageKitProvider();
export const fallbackProvider: StorageProvider = new SupabaseProvider();

/**
 * Resolve the correct provider from a stored `storage_provider` column value.
 * Used when deleting files — we need the right provider to clean up storage.
 */
export function resolveProvider(storageProvider: string): StorageProvider {
  switch (storageProvider) {
    case "imagekit":
      return defaultProvider;
    case "supabase":
      return fallbackProvider;
    default:
      console.warn(`Unknown storage provider: ${storageProvider}. Falling back to ImageKit.`);
      return defaultProvider;
  }
}

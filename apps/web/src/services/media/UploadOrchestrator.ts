/**
 * UploadOrchestrator.ts — DAM v3 multi-step upload flow.
 *
 * Owns the create→upload→finalize→link saga.
 * Uses StorageProvider interface — not tied to ImageKit specifically.
 * Rollback logic is fully encapsulated here.
 */

import { supabase } from "@/integrations/supabase/client";
import type { StorageProvider } from "./StorageGateway";
import type { DamUploadOptions, DamUploadResult } from "./types";
import { trace } from "@opentelemetry/api";
import { TelemetryMetrics } from "../../analytics/telemetry/Metrics";
import { Logger } from "../../analytics/telemetry/Logger";

const tracer = trace.getTracer("StorageGateway");
const activeUploads = new Map<string, Promise<DamUploadResult>>();

export class UploadOrchestrator {
  constructor(private readonly provider: StorageProvider) {}

  async upload(options: DamUploadOptions): Promise<DamUploadResult> {
    const metricLabels = { tenant: options.domain, provider: 'imagekit' }; // Assuming imagekit for now based on context
    TelemetryMetrics.uploadRequestsTotal.add(1, metricLabels);

    return tracer.startActiveSpan("dam.upload", async (span) => {
      const startTime = performance.now();
      span.setAttribute("tenant", options.domain);
      span.setAttribute("provider", "imagekit");

      try {
        const result = await this._upload(options);
        const duration = performance.now() - startTime;
        
        TelemetryMetrics.uploadDurationSeconds.record(duration / 1000, metricLabels);
        
        if (duration > 200) {
          Logger.warn(`⚠️ SLO VIOLATION: Upload took ${Math.round(duration)}ms (Target: < 200ms)`);
          span.setAttribute("slo.violation", true);
        }
        
        span.end();
        return result;
      } catch (err) {
        span.recordException(err as Error);
        TelemetryMetrics.uploadFailuresTotal.add(1, metricLabels);
        span.end();
        throw err;
      }
    });
  }

  private async _upload(options: DamUploadOptions): Promise<DamUploadResult> {
    Logger.info(`[Upload] Called with idempKey=${options.idempotencyKey}, has=${activeUploads.has(options.idempotencyKey as string)}`);
    if (options.idempotencyKey && activeUploads.has(options.idempotencyKey)) {
      Logger.info(`[Upload] Returning cached promise for ${options.idempotencyKey}`);
      return activeUploads.get(options.idempotencyKey)!;
    }

    const { file, title, domain, entityType, entityId, role, collectionId, onProgress } = options;

    const uploadPromise = (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      return new Promise<DamUploadResult>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
        let assetId: string | null = null;
        let uploadedFilePath: string | null = null;

        try {
          const type = file.type.startsWith("video/")
            ? "video"
            : file.type.startsWith("image/")
            ? "image"
            : "document";

          // Step 1: Create the asset record as "uploading"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: createdAssetId, error: createError } = await (supabase as any).rpc(
            "rpc_create_uploading_asset",
            { p_type: type, p_source: "uploaded", p_title: title || file.name },
          );
          if (createError) throw new Error(`Asset creation failed: ${createError.message}`);
          assetId = createdAssetId as string;

          // Step 2: Upload to storage via provider
          let uploaded;
          let uploadAttempts = 0;
          const maxAttempts = 2;
          
          while (uploadAttempts < maxAttempts) {
            uploadAttempts++;
            try {
              uploaded = await this.provider.upload({
                fileName: file.name,
                fileData: base64,
                folder: `dam/${domain}/${entityType}`,
                useUniqueName: true,
              });
              break; // Success
            } catch (uploadError) {
              if (uploadAttempts >= maxAttempts) {
                console.error(`Provider upload failed after ${uploadAttempts} attempts, rolling back DB:`, uploadError);
                try {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await (supabase as any)
                    .from("assets")
                    .delete()
                    .eq("id", assetId);
                } catch (e: unknown) {
                  console.warn("Rollback DB failed during provider error:", e);
                }
                throw new Error(`Upload provider failed: ${(uploadError as Error).message}`);
              }
              console.warn(`Provider upload attempt ${uploadAttempts} failed, retrying...`);
              await new Promise(r => setTimeout(r, 500)); // basic backoff
            }
          }
          
          uploadedFilePath = uploaded.filePath;

          // Step 3: Finalize the asset record
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: rpcError } = await (supabase as any).rpc("rpc_finalize_dam_asset", {
            p_asset_id: assetId,
            p_file_id: uploaded.filePath,
            p_url: uploaded.url,
            p_size_bytes: file.size,
            p_mime_type: file.type || "application/octet-stream",
            p_width: uploaded.width || null,
            p_height: uploaded.height || null,
            p_domain: domain,
            p_entity_type: entityType,
            p_entity_id: entityId,
            p_role: role,
          });

          if (rpcError) {
            // Rollback: delete storage file + DB record
            console.error("DB RPC failed, rolling back:", rpcError);
            await this.provider.delete(uploadedFilePath || uploaded.filePath).catch((e) =>
              console.warn("Rollback storage failed:", e),
            );
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase as any)
                .from("assets")
                .delete()
                .eq("id", assetId);
            } catch (e) {
              console.warn("Rollback DB failed:", e);
            }
            throw new Error(`Asset finalization failed: ${rpcError.message}`);
          }

          // Step 4: Optional collection assignment
          if (collectionId && assetId) {
            const { error: collError } = await supabase
              .from("assets")
              .update({ collection_id: collectionId })
              .eq("id", assetId);
            if (collError)
              throw new Error(`Asset uploaded, but collection assignment failed: ${collError.message}`);
          }

          onProgress?.(100);
          resolve({ assetId: assetId as string, url: uploaded.url, filePath: uploaded.filePath });
        } catch (err) {
          reject(err);
        }
      };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    })();

    if (options.idempotencyKey) {
      activeUploads.set(options.idempotencyKey, uploadPromise);
      // We keep the promise in memory to fulfill exact idempotency within this session.
      // In a real robust system, idempotency would also be backed by DB checks.
      uploadPromise.catch(() => {
        // Only remove from cache on failure, so retries can happen
        if (options.idempotencyKey) activeUploads.delete(options.idempotencyKey);
      });
    }

    return uploadPromise;
  }
}

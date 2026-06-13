/**
 * migrate-to-imagekit Edge Function
 *
 * Migrates all files from Supabase Storage to ImageKit.
 *
 * 1. Lists all files in Supabase Storage buckets
 * 2. Downloads each file
 * 3. Uploads to ImageKit
 * 4. Updates the media table records with new ImageKit URLs
 *
 * Required Supabase secrets:
 *   IMAGEKIT_PRIVATE_KEY  — ImageKit private API key
 *   SUPABASE_SERVICE_ROLE_KEY — for DB and Storage access
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  handlePreflight,
  verifyAdmin,
  badRequestResponse,
  serverErrorResponse,
  okResponse,
  unauthorizedResponse,
  structuredLog,
  getRequestId,
} from "../_lib/security.ts";

const FN = "migrate-to-imagekit";
const BUCKET_NAME = "media";
const FOLDERS = ["portfolio", "services", "blogs", "general"];

interface MigrateRequest {
  /** If true, skip files already migrated (have imagekit: prefix in file_name) */
  skipExisting?: boolean;
  /** Limit how many files to process in one run */
  limit?: number;
  /** Specific folder to migrate */
  folder?: string;
  /** If true, delete Supabase Storage source files after DB update succeeds. */
  deleteSource?: boolean;
}

interface SourceDownloadResult {
  blob: Blob | null;
  error?: string;
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  const auth = await verifyAdmin(req);
  if (!auth.user) {
    return unauthorizedResponse(req, auth.error ?? "Unauthorized");
  }

  const ikPrivateKey = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
  if (!ikPrivateKey) {
    return serverErrorResponse(
      req, "IMAGEKIT_PRIVATE_KEY not configured", {}, FN, null, requestId
    );
  }

  try {
    const body = await req.json().catch(() => ({})) as MigrateRequest;
    return await handleMigration(req, body, ikPrivateKey, auth.user.id, requestId);
  } catch (err) {
    return serverErrorResponse(
      req, err instanceof Error ? err.message : "Internal error", {}, FN, err, requestId
    );
  }
});

async function handleMigration(
  req: Request,
  opts: MigrateRequest,
  ikPrivateKey: string,
  userId: string,
  requestId: string,
): Promise<Response> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);
  const basicAuth = btoa(`${ikPrivateKey}:`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let totalAdvanced = 0;
  const errors: string[] = [];
  const migrated: Array<{ name: string; url: string; fileId: string }> = [];

  const foldersToMigrate = opts.folder ? [opts.folder] : FOLDERS;
  const limit = opts.limit || 100;

  // First, find all media records that still point to Supabase Storage
  const { data: mediaRecords, error: mediaError } = await adminClient
    .from("media_files")
    .select("id, url, file_name, mime_type, size_bytes, display_name, storage_provider, storage_path, folder_id")
    .eq("storage_provider", "supabase")
    .not("file_name", "ilike", "imagekit:%") // Not already migrated
    .order("created_at", { ascending: true })
    .limit(limit);

  if (mediaError) {
    return serverErrorResponse(
      req, `Failed to fetch media records: ${mediaError.message}`, {}, FN, mediaError, requestId
    );
  }

  if (!mediaRecords || mediaRecords.length === 0) {
    // If no un-migrated records, try listing storage directly
    return await migrateFromStorage(
      req, adminClient, basicAuth, foldersToMigrate, opts, userId, requestId
    );
  }

  // Process DB records that still have Supabase URLs
  for (const record of mediaRecords) {
    try {
      if (opts.skipExisting && record.file_name.startsWith("imagekit:")) {
        totalSkipped++;
        continue;
      }

      const storagePath = normalizeProviderPath(record.storage_path || record.file_name);
      if (!storagePath) {
        totalSkipped++;
        continue;
      }

      if (record.url.includes("ik.imagekit.io")) {
        const { error: updateError } = await adminClient
          .from("media_files")
          .update({
            file_name: `imagekit:${storagePath}`,
            storage_provider: "imagekit",
            storage_path: storagePath,
          })
          .eq("id", record.id);

        if (updateError) {
          errors.push(`${record.file_name}: provider update failed — ${updateError.message}`);
          totalErrors++;
        } else {
          totalSkipped++;
          totalAdvanced++;
        }
        continue;
      }

      // Prefer Storage API download with the service role so private buckets work too.
      const source = await downloadSourceFile(adminClient, storagePath, record.url);
      if (!source.blob) {
        errors.push(`${record.file_name}: ${source.error || "download failed"}`);
        totalErrors++;
        continue;
      }

      const uploadTarget = buildUploadTarget(storagePath);

      // Upload to ImageKit
      const formData = new FormData();
      formData.append("file", source.blob, uploadTarget.fileName);
      formData.append("fileName", uploadTarget.fileName);
      formData.append("useUniqueFileName", "false");
      formData.append("folder", uploadTarget.folder);
      formData.append("isPrivateFile", "false");

      const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: { Authorization: `Basic ${basicAuth}` },
        body: formData,
      });

      if (!ikRes.ok) {
        const errText = await ikRes.text();
        errors.push(`${record.file_name}: ImageKit upload failed — ${errText}`);
        totalErrors++;
        continue;
      }

      const ikFile = await ikRes.json();
      const providerPath = normalizeProviderPath(ikFile.filePath || storagePath);

      // Update DB record with new ImageKit URL and imagekit: prefix
      const { error: updateError } = await adminClient
        .from("media_files")
        .update({
          url: ikFile.url,
          file_name: `imagekit:${providerPath}`,
          storage_provider: "imagekit",
          storage_path: providerPath,
        })
        .eq("id", record.id);

      if (updateError) {
        errors.push(`${record.file_name}: DB update failed — ${updateError.message}`);
        totalErrors++;
        continue;
      }

      if (opts.deleteSource) {
        const { error: deleteSourceError } = await adminClient.storage
          .from(BUCKET_NAME)
          .remove([storagePath]);

        if (deleteSourceError) {
          errors.push(`${record.file_name}: source delete failed — ${deleteSourceError.message}`);
          totalErrors++;
        }
      }

      migrated.push({ name: storagePath, url: ikFile.url, fileId: ikFile.fileId });
      totalProcessed++;
      totalAdvanced++;

      structuredLog("info", FN, "Migrated file to ImageKit", {
        from: record.url,
        to: ikFile.url,
        fileId: ikFile.fileId,
        requestId,
      });
    } catch (err) {
      errors.push(`${record.file_name}: ${err instanceof Error ? err.message : String(err)}`);
      totalErrors++;
    }
  }

  return okResponse(req, {
    success: true,
    totalProcessed,
    totalSkipped,
    totalErrors,
    errors: errors.length > 0 ? errors : undefined,
    migrated: migrated.slice(0, 10),
    hasMore: (mediaRecords?.length || 0) >= limit && totalAdvanced > 0,
  });
}

async function migrateFromStorage(
  req: Request,
  adminClient: SupabaseClient,
  basicAuth: string,
  folders: string[],
  opts: MigrateRequest,
  userId: string,
  requestId: string,
): Promise<Response> {
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const errors: string[] = [];

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const limit = opts.limit || 100;

  for (const folder of folders) {
    const storagePath = folder === "general" ? "" : folder;
    const { data: files, error: listError } = await adminClient.storage
      .from(BUCKET_NAME)
      .list(storagePath, { limit });

    if (listError) {
      errors.push(`${folder}: list failed — ${listError.message}`);
      continue;
    }

    for (const file of files || []) {
      if (file.name === ".emptyFolderPlaceholder") {
        totalSkipped++;
        continue;
      }
      if (!file.metadata) {
        totalSkipped++;
        continue;
      }

      try {
        const path = folder === "general" ? file.name : `${folder}/${file.name}`;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;

        const source = await downloadSourceFile(adminClient, path, publicUrl);
        if (!source.blob) {
          errors.push(`${path}: ${source.error || "download failed"}`);
          totalErrors++;
          continue;
        }

        const uploadTarget = buildUploadTarget(path);

        const formData = new FormData();
        formData.append("file", source.blob, uploadTarget.fileName);
        formData.append("fileName", uploadTarget.fileName);
        formData.append("useUniqueFileName", "false");
        formData.append("folder", uploadTarget.folder);
        formData.append("isPrivateFile", "false");

        const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          headers: { Authorization: `Basic ${basicAuth}` },
          body: formData,
        });

        if (!ikRes.ok) {
          const errText = await ikRes.text();
          errors.push(`${path}: ImageKit upload failed — ${errText}`);
          totalErrors++;
          continue;
        }

        const ikFile = await ikRes.json();
        const providerPath = normalizeProviderPath(ikFile.filePath || path);

        // Insert or update DB record
        const { error: upsertError } = await adminClient.from("media_files").upsert(
          {
            url: ikFile.url,
            file_name: `imagekit:${providerPath}`,
            mime_type: file.metadata?.mimetype || "application/octet-stream",
            size_bytes: file.metadata?.size || ikFile.size || 0,
            display_name: file.name,
            folder_id: '00000000-0000-0000-0000-000000000000', // Root folder
            storage_provider: "imagekit",
            storage_path: providerPath,
          },
          { onConflict: "folder_id,display_name" }
        );

        if (upsertError) {
          errors.push(`${path}: DB upsert failed — ${upsertError.message}`);
          totalErrors++;
          continue;
        }

        if (opts.deleteSource) {
          const { error: deleteSourceError } = await adminClient.storage
            .from(BUCKET_NAME)
            .remove([path]);

          if (deleteSourceError) {
            errors.push(`${path}: source delete failed — ${deleteSourceError.message}`);
            totalErrors++;
          }
        }

        totalProcessed++;
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : String(err)}`);
        totalErrors++;
      }
    }
  }

  return okResponse(req, {
    success: true,
    totalProcessed,
    totalSkipped,
    totalErrors,
    errors: errors.length > 0 ? errors : undefined,
    hasMore: false,
  });
}

function normalizeProviderPath(path: string): string {
  return path.replace(/^imagekit:/, "").replace(/^\/+/, "");
}

async function downloadSourceFile(
  adminClient: SupabaseClient,
  storagePath: string,
  publicUrl: string,
): Promise<SourceDownloadResult> {
  const { data, error } = await adminClient.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (data) return { blob: data };

  const fallbackRes = await fetch(publicUrl);
  if (fallbackRes.ok) {
    return { blob: await fallbackRes.blob() };
  }

  const storageMessage = error?.message ? `Storage API: ${error.message}; ` : "";
  return {
    blob: null,
    error: `${storageMessage}public URL HTTP ${fallbackRes.status}`,
  };
}

function buildUploadTarget(path: string): { fileName: string; folder: string } {
  const normalized = normalizeProviderPath(path);
  const slashIndex = normalized.lastIndexOf("/");

  if (slashIndex < 0) {
    return { fileName: normalized, folder: "/" };
  }

  return {
    fileName: normalized.slice(slashIndex + 1),
    folder: `/${normalized.slice(0, slashIndex)}`,
  };
}

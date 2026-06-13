/**
 * sync-imagekit Edge Function
 * 
 * Fetches all files from ImageKit via their REST API and upserts them into
 * the Supabase `media` table so the Admin Media panel can display them.
 * 
 * Required Supabase secrets (set via: supabase secrets set KEY=value):
 *   IMAGEKIT_PRIVATE_KEY   — ImageKit private API key (never expose client-side)
 *   IMAGEKIT_URL_ENDPOINT  — e.g. https://ik.imagekit.io/wdrs8y61o/cross-angle
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  handlePreflight,
  verifyAdmin,
  okResponse,
  unauthorizedResponse,
  serverErrorResponse,
  getRequestId,
} from "../_lib/security.ts";

const FN = "sync-imagekit";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  const auth = await verifyAdmin(req);
  if (!auth.user) {
    return unauthorizedResponse(req, auth.error ?? "Unauthorized", {}, requestId);
  }

  try {
    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // ── ImageKit API ─────────────────────────────────────────────────────────
    const ikPrivateKey   = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
    const ikUrlEndpoint  = Deno.env.get("IMAGEKIT_URL_ENDPOINT") 
                           || "https://ik.imagekit.io/wdrs8y61o/cross-angle";

    if (!ikPrivateKey) {
      return serverErrorResponse(
        req,
        "IMAGEKIT_PRIVATE_KEY secret not set. Run: supabase secrets set IMAGEKIT_PRIVATE_KEY=your_private_key",
        {},
        FN,
        null,
        requestId,
      );
    }

    // ImageKit uses HTTP Basic Auth: privateKey as username, empty password
    const basicAuth = btoa(`${ikPrivateKey}:`);

    // Parse optional folder path from request body
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const folder = body.folder || ""; // e.g. "/cross-angle/gallery"
    const limit  = Math.min(body.limit || 500, 1000);

    // Fetch files from ImageKit API
    const ikApiUrl = new URL("https://api.imagekit.io/v1/files");
    ikApiUrl.searchParams.set("limit", String(limit));
    ikApiUrl.searchParams.set("skip", "0");
    ikApiUrl.searchParams.set("type", "file");
    if (folder) ikApiUrl.searchParams.set("path", folder);

    const ikRes = await fetch(ikApiUrl.toString(), {
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    });

    if (!ikRes.ok) {
      const errText = await ikRes.text();
      return serverErrorResponse(req, `ImageKit API error ${ikRes.status}: ${errText}`, {}, FN, null, requestId);
    }

    const ikFiles: Array<{
      fileId: string;
      name: string;
      url: string;
      filePath: string;
      fileType: string;
      size: number;
      createdAt: string;
      updatedAt: string;
      width?: number;
      height?: number;
      tags?: string[];
      customMetadata?: Record<string, unknown>;
    }> = await ikRes.json();

    if (!Array.isArray(ikFiles)) {
      return serverErrorResponse(req, "Unexpected ImageKit response", {}, FN, null, requestId);
    }

    // ── Upsert into media table ──────────────────────────────────────────────
    let upserted = 0;
    let skipped  = 0;
    const errors: string[] = [];

    for (const f of ikFiles) {
      // file_name is our unique key — use ImageKit filePath (starts with /)
      const providerPath = f.filePath.replace(/^\/+/, "");
      const fileName = `imagekit:${providerPath}`.slice(0, 500); // prefix to distinguish from Supabase storage

      const { error: dbErr } = await adminClient
        .from("media")
        .upsert(
          {
            file_name: fileName,
            url: f.url,
            file_type: f.fileType === "image" ? "image/jpeg" : f.fileType,
            size_bytes: f.size || 0,
            alt: f.name,
            title: f.name,
            uploaded_by: auth.user.id,
            storage_provider: "imagekit",
            provider_file_id: f.fileId,
            provider_path: providerPath,
          },
          { onConflict: "file_name" }
        );

      if (dbErr) {
        errors.push(`${f.name}: ${dbErr.message}`);
      } else {
        upserted++;
      }
    }

    return okResponse(req, {
      success: true,
      total: ikFiles.length,
      upserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      ikUrlEndpoint,
    }, {}, undefined, undefined, requestId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return serverErrorResponse(req, message, {}, FN, err, requestId);
  }
});

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
    const skipped  = 0;
    const errors: string[] = [];

    for (const f of ikFiles) {
      // file_name is our unique key — use ImageKit filePath (starts with /)
      const providerPath = f.filePath.replace(/^\/+/, "");
      const fileName = `imagekit:${providerPath}`.slice(0, 255); // prefix to distinguish from Supabase storage

      // Target is media_files (the table the app actually reads). The old
      // `media` table this function used to write to does not exist on the
      // project — every sync silently failed. Columns below match the
      // media_files schema; upsert key is the unique index on file_name.
      const { error: dbErr } = await adminClient
        .from("media_files")
        .upsert(
          {
            file_name: fileName,
            display_name: f.name,
            storage_path: providerPath.slice(0, 500),
            url: f.url.slice(0, 1000),
            mime_type: guessMimeType(f.name, f.fileType),
            size_bytes: f.size || 0,
            width: f.width ?? null,
            height: f.height ?? null,
            storage_provider: "imagekit",
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

/**
 * ImageKit's `fileType` is only "image" | "non-image", which is not a MIME
 * type. Derive one from the extension and fall back to a safe default.
 */
function guessMimeType(name: string, fileType?: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    pdf: "application/pdf",
  };
  if (byExt[ext]) return byExt[ext];
  return fileType === "image" ? "image/jpeg" : "application/octet-stream";
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  handlePreflight,
  verifyAdmin,
  badRequestResponse,
  serverErrorResponse,
  okResponse,
  unauthorizedResponse,
} from "../_lib/security.ts";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const FN = "media-import";

const IMAGEKIT_BASE_URL = "https://upload.imagekit.io/api/v2/files/upload";

async function uploadToImageKit(
  fileName: string,
  fileBytes: Uint8Array,
  mimeType: string,
  imagekitPrivateKey: string
): Promise<{ url: string; filePath: string; name: string }> {
  // Convert bytes to base64
  const binaryStr = Array.from(fileBytes, (b) => String.fromCharCode(b)).join("");
  const base64 = btoa(binaryStr);
  const dataUri = `data:${mimeType};base64,${base64}`;

  const form = new FormData();
  form.append("file", dataUri);
  form.append("fileName", fileName);
  form.append("folder", "/media/imports");
  form.append("useUniqueFileName", "true");

  const resp = await fetch(IMAGEKIT_BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(imagekitPrivateKey + ":")}`,
    },
    body: form,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`ImageKit upload failed for ${fileName}: ${errText}`);
  }

  const data = await resp.json() as { url: string; filePath: string; name: string };
  return data;
}

function resolveMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
    webp: "image/webp", svg: "image/svg+xml", avif: "image/avif",
    mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg",
    pdf: "application/pdf", txt: "text/plain",
  };
  return map[ext] ?? "application/octet-stream";
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const auth = await verifyAdmin(req);
  if (!auth.user) {
    return unauthorizedResponse(req, auth.error ?? "Unauthorized");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const imagekitPrivateKey = Deno.env.get("IMAGEKIT_PRIVATE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  try {
    const contentType = req.headers.get("content-type") ?? "";

    let zipBytes: Uint8Array;
    let targetFolderId: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const zipFile = form.get("file") as File | null;
      if (!zipFile) return badRequestResponse(req, "No ZIP file provided in form data");
      const buf = await zipFile.arrayBuffer();
      zipBytes = new Uint8Array(buf);
      targetFolderId = (form.get("targetFolderId") as string | null) ?? null;
    } else {
      // Support raw body with JSON metadata
      return badRequestResponse(req, "Please send a multipart/form-data request with a ZIP file");
    }

    // Extract ZIP
    const extracted = unzipSync(zipBytes);
    const entries = Object.entries(extracted);

    if (entries.length === 0) {
      return badRequestResponse(req, "ZIP archive is empty");
    }

    const results: Array<{ fileName: string; status: "ok" | "error"; error?: string }> = [];

    for (const [entryPath, bytes] of entries) {
      // Skip macOS metadata files
      if (entryPath.startsWith("__MACOSX") || entryPath.endsWith(".DS_Store")) continue;
      // Skip manifest
      if (entryPath === "_manifest.txt") continue;
      // Skip directories (zero-byte entries that are paths)
      if (entryPath.endsWith("/") || bytes.length === 0) continue;

      const fileName = entryPath.split("/").pop() ?? entryPath;
      const mimeType = resolveMimeType(fileName);

      try {
        const ikResult = await uploadToImageKit(fileName, bytes, mimeType, imagekitPrivateKey);
        const { error: insertErr } = await adminClient.from("media_files").insert({
          folder_id: targetFolderId,
          file_name: ikResult.name,
          display_name: fileName,
          url: ikResult.url,
          storage_provider: "imagekit",
          storage_path: ikResult.filePath,
          mime_type: mimeType,
          size_bytes: bytes.byteLength,
        });
        if (insertErr) throw insertErr;
        results.push({ fileName, status: "ok" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Import error for ${fileName}:`, msg);
        results.push({ fileName, status: "error", error: msg });
      }
    }

    const succeeded = results.filter((r) => r.status === "ok").length;
    const failed = results.filter((r) => r.status === "error");

    return okResponse(req, {
      success: true,
      message: `Imported ${succeeded} of ${results.length} files${failed.length > 0 ? ` (${failed.length} failed)` : ""}`,
      results,
    });

  } catch (error) {
    const err = error as Error;
    return serverErrorResponse(req, err.message, {}, FN, error);
  }
});

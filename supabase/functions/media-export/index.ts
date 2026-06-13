import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  handlePreflight,
  verifyAdmin,
  badRequestResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "../_lib/security.ts";
import { zipSync, strToU8 } from "https://esm.sh/fflate@0.8.2";

const FN = "media-export";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const auth = await verifyAdmin(req);
  if (!auth.user) {
    return unauthorizedResponse(req, auth.error ?? "Unauthorized");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  try {
    const { fileIds = [], folderIds = [] } = await req.json() as {
      fileIds?: string[];
      folderIds?: string[];
    };

    if (fileIds.length === 0 && folderIds.length === 0) {
      return badRequestResponse(req, "No files or folders selected for export");
    }

    // Collect all file IDs (direct + those in requested folders)
    let allFileIds = [...fileIds];

    if (folderIds.length > 0) {
      // Get all descendants of the requested folders via ltree path
      for (const fId of folderIds) {
        const { data: folderData } = await adminClient
          .from("media_folders")
          .select("path")
          .eq("id", fId)
          .single();
        if (folderData) {
          const { data: subFolders } = await adminClient
            .from("media_folders")
            .select("id")
            .like("path", `${folderData.path}%`);
          const subIds = subFolders?.map((f) => f.id) ?? [];
          const includedFolderIds = [fId, ...subIds];
          const { data: folderFiles } = await adminClient
            .from("media_files")
            .select("id")
            .in("folder_id", includedFolderIds);
          if (folderFiles) allFileIds.push(...folderFiles.map((f) => f.id));
        }
      }
    }

    // Deduplicate
    allFileIds = [...new Set(allFileIds)];

    if (allFileIds.length === 0) {
      return badRequestResponse(req, "No files found for the selected items");
    }

    // Fetch file metadata
    const { data: files, error: filesError } = await adminClient
      .from("media_files")
      .select("id, display_name, file_name, url, folder_id")
      .in("id", allFileIds);

    if (filesError) throw filesError;
    if (!files || files.length === 0) {
      return badRequestResponse(req, "No accessible files found");
    }

    // Build ZIP in memory using fflate
    const zipEntries: Record<string, Uint8Array> = {};

    const downloadResults = await Promise.allSettled(
      files.map(async (file) => {
        try {
          const response = await fetch(file.url, {
            headers: { "Accept": "*/*" },
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const buffer = await response.arrayBuffer();
          const fileName = (file.display_name || file.file_name || `file_${file.id}`).replace(/[<>:"/\\|?*]/g, "_");
          zipEntries[fileName] = new Uint8Array(buffer);
        } catch (err) {
          console.warn(`Failed to fetch file ${file.id}: ${err}`);
        }
      })
    );

    if (Object.keys(zipEntries).length === 0) {
      return badRequestResponse(req, "Failed to download any files for export");
    }

    // Add a manifest
    const manifest = files.map((f) => `${f.display_name || f.file_name} → ${f.url}`).join("\n");
    zipEntries["_manifest.txt"] = strToU8(manifest);

    const zipped = zipSync(zipEntries, { level: 1 }); // level 1 = fast, minimal compression

    return new Response(zipped, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="media-export-${Date.now()}.zip"`,
        "Content-Length": String(zipped.byteLength),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "Content-Disposition",
      },
    });

  } catch (error) {
    const err = error as Error;
    return serverErrorResponse(req, err.message, {}, FN, error);
  }
});

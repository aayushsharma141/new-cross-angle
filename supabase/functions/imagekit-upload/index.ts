import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
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

const FN = "imagekit-upload";
const IMAGEKIT_PRIVATE_KEY = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
const IMAGEKIT_PUBLIC_KEY = Deno.env.get("IMAGEKIT_PUBLIC_KEY");

interface UploadRequest {
  action: "upload" | "delete" | "getAuth" | "uploadUrl" | "move";
  fileName?: string;
  fileData?: string;
  folder?: string;
  fileUrl?: string;
  fileId?: string;
  filePath?: string;
  useUniqueName?: boolean;
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const requestId = getRequestId(req);

  const auth = await verifyAdmin(req);
  if (!auth.user) {
    return unauthorizedResponse(req, auth.error ?? "Unauthorized");
  }

  if (!IMAGEKIT_PRIVATE_KEY) {
    return serverErrorResponse(
      req, "IMAGEKIT_PRIVATE_KEY not configured", {}, FN, null, requestId
    );
  }

  try {
    const { body, error: parseError } = await readBody(req);
    if (parseError) return badRequestResponse(req, parseError, {}, requestId);

    const { action } = body as UploadRequest;

    switch (action) {
      case "upload":
        return handleUpload(req, body as UploadRequest, auth.user.id, requestId);
      case "uploadUrl":
        return handleUploadUrl(req, body as UploadRequest, auth.user.id, requestId);
      case "delete":
        return handleDelete(req, body as UploadRequest, requestId);
      case "move":
        return handleMove(req, body as UploadRequest, requestId);
      case "getAuth":
        return handleGetAuth(req, requestId);
      default:
        return badRequestResponse(req, `Unknown action: ${action}`, {}, requestId);
    }
  } catch (err) {
    return serverErrorResponse(
      req, err instanceof Error ? err.message : "Internal error", {}, FN, err, requestId
    );
  }
});

async function handleUpload(
  req: Request,
  { fileName, fileData, folder = "general", useUniqueName }: UploadRequest,
  userId: string,
  requestId: string
): Promise<Response> {
  if (!fileName || !fileData) {
    return badRequestResponse(req, "fileName and fileData (base64) are required", {}, requestId);
  }

  const uniqueName = useUniqueName
    ? `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${fileName}`
    : fileName;
  const folderPath = normalizeImageKitFolder(folder);

  const basicAuth = btoa(`${IMAGEKIT_PRIVATE_KEY}:`);

  const formData = new FormData();
  formData.append("file", fileData);
  formData.append("fileName", uniqueName);
  formData.append("useUniqueFileName", "false");
  formData.append("folder", folderPath);
  formData.append("isPrivateFile", "false");

  const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Basic ${basicAuth}` },
    body: formData,
  });

  if (!ikRes.ok) {
    const errText = await ikRes.text();
    structuredLog("error", FN, "ImageKit upload failed", {
      status: ikRes.status,
      error: errText,
      fileName,
      requestId,
    });
    return serverErrorResponse(
      req, `ImageKit upload failed: ${errText}`, {}, FN, null, requestId
    );
  }

  const ikFile = await ikRes.json();
  const providerPath = normalizeProviderPath(ikFile.filePath || `${folderPath}/${uniqueName}`);
  const fileRecordName = `imagekit:${providerPath}`;

  // Determine mime type from the file data header
  const mimeMatch = fileData.match(/^data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";



  structuredLog("info", FN, "File uploaded to ImageKit", {
    fileId: ikFile.fileId,
    fileName: providerPath,
    url: ikFile.url,
    size: ikFile.size,
    requestId,
  });

  return okResponse(req, {
    success: true,
    fileId: ikFile.fileId,
    url: ikFile.url,
    name: providerPath,
    size: ikFile.size,
    fileType: ikFile.fileType,
    thumbnailUrl: ikFile.thumbnailUrl,
  });
}

async function handleUploadUrl(
  req: Request,
  { fileUrl, fileName, folder = "general" }: UploadRequest,
  userId: string,
  requestId: string
): Promise<Response> {
  if (!fileUrl) {
    return badRequestResponse(req, "fileUrl is required for uploadUrl action", {}, requestId);
  }

  const basicAuth = btoa(`${IMAGEKIT_PRIVATE_KEY}:`);
  const folderPath = normalizeImageKitFolder(folder);

  const formData = new FormData();
  formData.append("file", fileUrl);
  formData.append("fileName", fileName || `imported-${Date.now()}`);
  formData.append("useUniqueFileName", "true");
  formData.append("folder", folderPath);
  formData.append("isPrivateFile", "false");

  const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Basic ${basicAuth}` },
    body: formData,
  });

  if (!ikRes.ok) {
    const errText = await ikRes.text();
    return serverErrorResponse(
      req, `ImageKit import failed: ${errText}`, {}, FN, null, requestId
    );
  }

  const ikFile = await ikRes.json();
  const providerPath = normalizeProviderPath(ikFile.filePath || `${folderPath}/${ikFile.name}`);



  return okResponse(req, {
    success: true,
    fileId: ikFile.fileId,
    url: ikFile.url,
    name: providerPath,
    size: ikFile.size,
    fileType: ikFile.fileType,
  });
}

async function handleDelete(
  req: Request,
  { fileId, filePath }: UploadRequest,
  requestId: string
): Promise<Response> {
  const resolvedFileId = fileId || (filePath ? await findImageKitFileId(filePath) : null);
  if (!resolvedFileId) {
    return badRequestResponse(req, "fileId or filePath is required for delete action", {}, requestId);
  }

  const basicAuth = btoa(`${IMAGEKIT_PRIVATE_KEY}:`);

  const ikRes = await fetch(`https://api.imagekit.io/v1/files/${resolvedFileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
  });

  if (!ikRes.ok && ikRes.status !== 404) {
    const errText = await ikRes.text();
    structuredLog("error", FN, "ImageKit delete failed", {
      status: ikRes.status,
      error: errText,
      fileId: resolvedFileId,
      filePath,
      requestId,
    });
    return serverErrorResponse(
      req, `ImageKit delete failed: ${errText}`, {}, FN, null, requestId
    );
  }

  structuredLog("info", FN, "File deleted from ImageKit", { fileId: resolvedFileId, filePath, requestId });

  return okResponse(req, { success: true, message: "File deleted" });
}

async function handleMove(
  req: Request,
  { filePath, folder }: UploadRequest,
  requestId: string
): Promise<Response> {
  if (!filePath || !folder) {
    return badRequestResponse(req, "filePath and folder are required for move action", {}, requestId);
  }

  const basicAuth = btoa(`${IMAGEKIT_PRIVATE_KEY}:`);
  const destinationPath = normalizeImageKitFolder(folder);
  const sourceFilePath = `/${normalizeProviderPath(filePath)}`;

  const ikRes = await fetch(`https://api.imagekit.io/v1/files/move`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceFilePath,
      destinationPath,
    }),
  });

  if (!ikRes.ok) {
    const errText = await ikRes.text();
    structuredLog("error", FN, "ImageKit move failed", {
      status: ikRes.status,
      error: errText,
      sourceFilePath,
      destinationPath,
      requestId,
    });
    return serverErrorResponse(
      req, `ImageKit move failed: ${errText}`, {}, FN, null, requestId
    );
  }

  return okResponse(req, { success: true, message: "File moved" });
}

async function handleGetAuth(
  req: Request,
  requestId: string
): Promise<Response> {
  const ikAuthEndpoint = "https://api.imagekit.io/v1/auth";
  const basicAuth = btoa(`${IMAGEKIT_PRIVATE_KEY}:`);

  const authRes = await fetch(ikAuthEndpoint, {
    method: "GET",
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  if (!authRes.ok) {
    const errText = await authRes.text();
    return serverErrorResponse(
      req, `ImageKit auth failed: ${errText}`, {}, FN, null, requestId
    );
  }

  const authData = await authRes.json();
  return okResponse(req, authData);
}

async function readBody(req: Request): Promise<{ body: unknown; error: null } | { body: null; error: string }> {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return { body: Object.fromEntries((await req.formData()).entries()), error: null };
    }
    const text = await req.text();
    return { body: JSON.parse(text), error: null };
  } catch (e) {
    return { body: null, error: `Failed to parse body: ${e instanceof Error ? e.message : String(e)}` };
  }
}

function normalizeImageKitFolder(folder?: string): string {
  const normalized = (folder || "general").replace(/^\/+|\/+$/g, "");
  return normalized ? `/${normalized}` : "/";
}

function normalizeProviderPath(path: string): string {
  return path.replace(/^\/+/, "");
}

async function findImageKitFileId(filePath: string): Promise<string | null> {
  const normalizedPath = normalizeProviderPath(filePath);
  const slashIndex = normalizedPath.lastIndexOf("/");
  const folder = slashIndex >= 0 ? `/${normalizedPath.slice(0, slashIndex)}` : "/";
  const targetPath = `/${normalizedPath}`;
  const basicAuth = btoa(`${IMAGEKIT_PRIVATE_KEY}:`);
  const apiUrl = new URL("https://api.imagekit.io/v1/files");
  apiUrl.searchParams.set("type", "file");
  apiUrl.searchParams.set("limit", "1000");
  apiUrl.searchParams.set("skip", "0");
  apiUrl.searchParams.set("path", folder);

  const res = await fetch(apiUrl.toString(), {
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  if (!res.ok) return null;

  const files = await res.json() as Array<{ filePath?: string; fileId?: string }>;
  if (!Array.isArray(files)) return null;

  const match = files.find((file) => file?.filePath === targetPath || file?.filePath === normalizedPath);
  return match?.fileId || null;
}

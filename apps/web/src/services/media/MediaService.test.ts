import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// See UploadOrchestrator.test.ts: the browser client holds no session under
// cookie auth, so getSession() resolves null exactly as it does in the app.
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    supabaseUrl: "https://site.example/api/supabase",
    auth: { getSession },
    rpc: vi.fn(),
    from: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}));

import { MediaService } from "./MediaService";

const fetchMock = vi.fn();

const headersOf = (init: RequestInit | undefined) => new Headers(init?.headers);

describe("MediaService zip transfer under cookie auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("imports through the proxy without a client-side token", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Imported 3 files" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const zip = new File(["zip"], "media.zip", { type: "application/zip" });

    await expect(MediaService.importZip(zip, null)).resolves.toEqual({
      message: "Imported 3 files",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://site.example/api/supabase/functions/v1/media-import");
    // The proxy injects Authorization from the HTTP-only cookie; the browser
    // has no token to send and must not invent one.
    expect(headersOf(init).has("Authorization")).toBe(false);
  });

  it("exports through the proxy without a client-side token", async () => {
    fetchMock.mockResolvedValue(
      new Response(new Uint8Array([0x50, 0x4b, 0x03, 0x04]), {
        status: 200,
        headers: { "Content-Type": "application/zip" },
      }),
    );
    // jsdom implements neither of these; exportZip uses them to hand the
    // downloaded zip to the browser.
    const objectUrls = URL as unknown as Record<string, unknown>;
    objectUrls.createObjectURL = vi.fn(() => "blob:export");
    objectUrls.revokeObjectURL = vi.fn();

    try {
      await expect(MediaService.exportZip(["file-1"])).resolves.toBeUndefined();
    } finally {
      delete objectUrls.createObjectURL;
      delete objectUrls.revokeObjectURL;
    }

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://site.example/api/supabase/functions/v1/media-export");
    expect(headersOf(init).has("Authorization")).toBe(false);
  });

  it("reports the server's refusal when the caller is not signed in", async () => {
    fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    const zip = new File(["zip"], "media.zip", { type: "application/zip" });

    await expect(MediaService.importZip(zip, null)).rejects.toThrow(
      "Import failed: Unauthorized",
    );
  });
});

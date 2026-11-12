import { beforeEach, describe, expect, it, vi } from "vitest";

// Under cookie auth the browser client never holds a session: the access token
// lives in an HTTP-only cookie and the /api/supabase proxy attaches it to each
// request (integrations/supabase/client.ts, middleware.ts). getSession() is
// stubbed to return what it really returns in the app — null — so these tests
// fail if the upload path ever depends on a client-side session again.
const { rpc, getSession, from } = vi.hoisted(() => ({
  rpc: vi.fn(),
  getSession: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getSession }, rpc, from },
}));

import { UploadOrchestrator } from "./UploadOrchestrator";
import type { StorageProvider } from "./StorageGateway";

const makeProvider = (): StorageProvider => ({
  upload: vi.fn().mockResolvedValue({
    url: "https://cdn.example/dam/portfolio/cover.png",
    filePath: "/dam/portfolio/cover.png",
    name: "cover.png",
  }),
  delete: vi.fn().mockResolvedValue(undefined),
});

const uploadOptions = () => ({
  file: new File(["bytes"], "cover.png", { type: "image/png" }),
  domain: "portfolio",
  entityType: "portfolio",
  entityId: null,
  role: "cover",
});

describe("UploadOrchestrator under cookie auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it("uploads when the browser client holds no session", async () => {
    rpc.mockImplementation(async (fn: string) =>
      fn === "rpc_create_uploading_asset"
        ? { data: "asset-1", error: null }
        : { data: null, error: null },
    );
    const provider = makeProvider();

    const result = await new UploadOrchestrator(provider).upload(uploadOptions());

    expect(result).toEqual({
      assetId: "asset-1",
      url: "https://cdn.example/dam/portfolio/cover.png",
      filePath: "/dam/portfolio/cover.png",
    });
    expect(provider.upload).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "rpc_finalize_dam_asset",
      expect.objectContaining({ p_asset_id: "asset-1", p_role: "cover" }),
    );
  });

  it("leaves authorisation to the server and surfaces its rejection", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });
    const provider = makeProvider();

    await expect(
      new UploadOrchestrator(provider).upload(uploadOptions()),
    ).rejects.toThrow("Asset creation failed: permission denied");
    expect(provider.upload).not.toHaveBeenCalled();
  });
});

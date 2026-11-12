import { beforeEach, describe, expect, it, vi } from "vitest";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));

import { fetchAndStitchDamUsages } from "./dam-stitcher";
import type { AssetUsageRecord, SupabaseItem } from "./supabase-types";

const PROJECT_ID = "11111111-1111-1111-1111-111111111111";

const usage = (role: string, url: string): AssetUsageRecord => ({
  entity_id: PROJECT_ID,
  role,
  display_order: 0,
  assets: { asset_versions: [{ url }] },
});

/** Makes `asset_usages` return the given rows for the stitcher's query. */
const givenUsages = (rows: AssetUsageRecord[]) => {
  from.mockReturnValue({
    select: () => ({
      eq: () => ({ in: () => Promise.resolve({ data: rows, error: null }) }),
    }),
  });
};

const stitchProject = async (): Promise<SupabaseItem> => {
  const [item] = await fetchAndStitchDamUsages([{ id: PROJECT_ID }], "project");
  return item;
};

describe("fetchAndStitchDamUsages — project cover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stitches the cover bound under the canonical 'cover' role", async () => {
    givenUsages([usage("cover", "https://cdn.example/cover.jpg")]);

    expect((await stitchProject()).cover_image_url).toBe("https://cdn.example/cover.jpg");
  });

  it("stitches covers the admin form previously bound as 'cover_image'", async () => {
    givenUsages([usage("cover_image", "https://cdn.example/legacy-cover.jpg")]);

    expect((await stitchProject()).cover_image_url).toBe(
      "https://cdn.example/legacy-cover.jpg",
    );
  });

  it("prefers 'cover' when both roles are bound", async () => {
    givenUsages([
      usage("cover_image", "https://cdn.example/legacy-cover.jpg"),
      usage("cover", "https://cdn.example/cover.jpg"),
    ]);

    expect((await stitchProject()).cover_image_url).toBe("https://cdn.example/cover.jpg");
  });
});

import { describe, it, expect } from "vitest";
import { resolveFooterCopy } from "@/content/footerCopy";
import { getBlockDef } from "@/content/registry";

const cta = getBlockDef("site.footer_cta").defaults;

describe("resolveFooterCopy", () => {
  it("prefers an exact path", () => {
    expect(resolveFooterCopy(cta, "/services").headlineStart).toBe("Choose your service,");
  });
  it("falls back to the section prefix for detail pages", () => {
    expect(resolveFooterCopy(cta, "/services/kitchens").headlineHighlight).toBe("start planning?");
    expect(resolveFooterCopy(cta, "/portfolio/some-project").headlineStart).toBe("Want a space");
  });
  it("uses the fallback for unknown pages", () => {
    expect(resolveFooterCopy(cta, "/privacy").headlineHighlight).toBe("get started?");
  });
});

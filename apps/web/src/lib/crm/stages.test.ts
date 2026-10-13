import { describe, it, expect } from "vitest";
import { CRM_STAGES, toCrmStageId } from "./stages";

describe("toCrmStageId", () => {
  it("passes CRM stages through unchanged", () => {
    for (const s of CRM_STAGES) expect(toCrmStageId(s.id)).toBe(s.id);
  });

  it.each([
    ["contacted", "in_conversation"],
    ["qualified", "in_conversation"],
    ["proposal", "quote_sent"],
  ])("maps legacy %s to %s instead of resetting it to new", (legacy, stage) => {
    expect(toCrmStageId(legacy)).toBe(stage);
  });

  it("falls back to new for missing or unknown values", () => {
    expect(toCrmStageId(null)).toBe("new");
    expect(toCrmStageId("negotiation")).toBe("new");
  });
});

import { describe, it, expect } from "vitest";
import { validatePricing } from "./PricingIntelligenceWorkspace";
import { DEFAULT_PRICING_CONFIG } from "@/addons/calculators/components/data/pricing-config";
import type { PricingConfig } from "@/addons/calculators/components/data/types";

const withPatch = (patch: (c: PricingConfig) => void) => {
  const c = structuredClone(DEFAULT_PRICING_CONFIG);
  patch(c);
  return validatePricing(c);
};

describe("validatePricing", () => {
  it("accepts the default pricing", () => {
    expect(validatePricing(DEFAULT_PRICING_CONFIG)).toEqual([]);
  });

  it("blocks a zero city multiplier, which would make every quote ₹0", () => {
    expect(withPatch((c) => { c.city_multipliers.metro = 0; })).toHaveLength(1);
  });

  it("blocks a package whose max rate is below its min", () => {
    expect(withPatch((c) => { c.execution.premium = { min: 9000, max: 8000 }; })[0]).toMatch(/max rate is below min/);
  });

  it("blocks negative rates and percentages over 100", () => {
    expect(withPatch((c) => { c.design.rate_3d = -1; c.logic.gst_pct = 180; })).toHaveLength(2);
  });
});

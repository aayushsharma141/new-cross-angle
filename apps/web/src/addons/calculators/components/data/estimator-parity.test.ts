import { describe, it, expect } from "vitest";
import { calculateEstimate } from "./calculation-engine";
import { DEFAULT_PRICING_CONFIG, mergePricingConfig } from "./pricing-config";
import type { CalculatorFormData } from "./types";
import * as server from "../../../../../../../supabase/functions/submit-estimate/pricing";

// Deterministic PRNG so a failure is reproducible.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const SERVICES = ["C1", "C2", "C3", "C4", "C5"] as const;
const TIERS = ["economy", "standard", "premium", "luxury"] as const;
const CITIES = ["metro", "tier1", "tier2"] as const;

describe("estimate parity: calculator vs submit-estimate", () => {
  it("shows the customer the same total the server stores, with and without admin overrides", () => {
    const r = rng(42);
    const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
    const int = (a: number, b: number) => Math.round(a + r() * (b - a));

    for (let i = 0; i < 2000; i++) {
      const override = i % 2
        ? {
            city_multipliers: { metro: 1 + Math.round(r() * 100) / 100 },
            execution: { premium: { min: int(7000, 9000), max: int(10000, 14000) } },
            design: { rate_2d: int(100, 300) },
            addons: { smart_home: int(1e6, 4e6) },
          }
        : null;
      const form = {
        name: "T", email: "t@example.com", phone: "9876543210",
        area: int(200, 15000), selectedService: pick(SERVICES), executionTier: pick(TIERS), cityTier: pick(CITIES),
        projectMonths: int(1, 24), extraVisits: int(0, 20), wardrobes: int(0, 5), bedrooms: 3,
        budgetAmount: int(1.5e6, 1.5e8),
        modularKitchen: r() < 0.5, falseCeiling: r() < 0.5, smartHome: r() < 0.5, customFurniture: r() < 0.5, premiumLighting: r() < 0.5,
      };

      const serverCfg = server.mergeConfig(server.DEFAULT_PRICING_CONFIG, override);
      const sanitized = server.sanitizeFormData(form, serverCfg).data;
      const stored = server.calculateEstimate(sanitized, serverCfg).total;
      const shown = calculateEstimate(form as unknown as CalculatorFormData, mergePricingConfig(DEFAULT_PRICING_CONFIG, override)).total;

      expect(shown.min, `case ${i}`).toBeCloseTo(stored.min, 6);
      expect(shown.max, `case ${i}`).toBeCloseTo(stored.max, 6);
    }
  });

  it("keeps the default price tables identical on both sides", () => {
    expect(server.DEFAULT_PRICING_CONFIG).toEqual(DEFAULT_PRICING_CONFIG);
  });
});

describe("mergePricingConfig", () => {
  it("keeps sibling rates when an admin row only overrides some of a group", () => {
    const merged = mergePricingConfig(DEFAULT_PRICING_CONFIG, { design: { rate_2d: 999 } });
    expect(merged.design.rate_2d).toBe(999);
    expect(merged.design.rate_3d).toBe(DEFAULT_PRICING_CONFIG.design.rate_3d);
    const total = calculateEstimate(
      { area: 1000, selectedService: "C3", cityTier: "tier2" } as unknown as CalculatorFormData,
      merged,
    ).total.min;
    expect(Number.isFinite(total)).toBe(true);
  });

  it("ignores null overrides instead of blanking a rate", () => {
    const merged = mergePricingConfig(DEFAULT_PRICING_CONFIG, { city_multipliers: { metro: null } });
    expect(merged.city_multipliers.metro).toBe(DEFAULT_PRICING_CONFIG.city_multipliers.metro);
  });
});

describe("submit-estimate input validation", () => {
  const cfg = server.DEFAULT_PRICING_CONFIG;
  const base = { name: "Ravi", email: "Ravi@Example.com", area: 1500, selectedService: "C5", executionTier: "premium", cityTier: "metro" };
  const ok = (over: Record<string, unknown>) => !server.sanitizeFormData({ ...base, ...over }, cfg).error;

  it("accepts a normal submission and normalises the email", () => {
    expect(server.sanitizeFormData(base, cfg).data?.email).toBe("ravi@example.com");
  });

  it.each([
    ["negative area", { area: -5 }],
    ["non-numeric area", { area: "abc" }],
    ["absurd area", { area: 1e9 }],
    ["malformed email", { email: "x@" }],
    ["unknown service", { selectedService: "C9" }],
    ["prototype key as package", { executionTier: "__proto__" }],
    ["unknown package", { executionTier: "gold" }],
    ["markup in phone", { phone: "<script>" }],
  ])("rejects %s", (_label, over) => {
    expect(ok(over)).toBe(false);
  });
});

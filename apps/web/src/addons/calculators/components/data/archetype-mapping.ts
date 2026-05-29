import type { ServiceId, ExecutionTierId, CalculatorFormData } from "./types";

export interface DiscoveryPreFill {
  selectedService: ServiceId | null;
  executionTier: ExecutionTierId | null;
  addons: Partial<
    Pick<
      CalculatorFormData,
      | "modularKitchen"
      | "wardrobes"
      | "falseCeiling"
      | "smartHome"
      | "customFurniture"
      | "premiumLighting"
    >
  >;
  /**
   * Short, archetype-specific explanation of *why* these defaults were chosen.
   * Surfaced in the personalization toast so users understand the recommendation
   * rather than just seeing a generic "pre-filled" message.
   */
  rationale: string;
}

/** Neutral fallback — non-committal, never breaks the Estimator */
const FALLBACK: DiscoveryPreFill = {
  selectedService: "C3",
  executionTier: null,
  addons: {},
  rationale:
    "We've started you with Immersive Visualization — a flexible entry point you can tailor as you go.",
};

const ARCHETYPE_MAP: Record<string, DiscoveryPreFill> = {
  // ── Original 4 archetypes ────────────────────────────────────────────────
  "The Quiet Curator": {
    selectedService: "C4",
    executionTier: "standard",
    addons: { falseCeiling: true },
    rationale:
      "We've matched you with Design & Project Stewardship plus architectural lighting — calm, intentional oversight that fits your restrained, curation-led aesthetic.",
  },
  "The Social Minimalist": {
    selectedService: "C3",
    executionTier: null,
    addons: {},
    rationale:
      "We've matched you with Immersive Visualization — see the open, gathering-friendly concept come to life before committing to a heavier service tier.",
  },
  "The Warm Modernist": {
    selectedService: "C4",
    executionTier: "premium",
    addons: { customFurniture: true, premiumLighting: true },
    rationale:
      "We've matched you with premium Stewardship plus bespoke joinery and curated fixtures — quality materials managed end-to-end to layer warmth into structured design.",
  },
  "The Expressive Collector": {
    selectedService: "C5",
    executionTier: "premium",
    addons: { customFurniture: true, premiumLighting: true, modularKitchen: true },
    rationale:
      "We've matched you with the White Glove Commission and three signature commissions — a fully bespoke residence built to hold your collected story.",
  },

  // ── Extended archetypes ──────────────────────────────────────────────────
  "The Serene Naturalist": {
    selectedService: "C4",
    executionTier: "standard",
    addons: { falseCeiling: true },
    rationale:
      "We've matched you with Stewardship plus architectural lighting — a grounded, organic build that lets natural materials and indirect light shape the experience.",
  },
  "The Bold Structuralist": {
    selectedService: "C4",
    executionTier: "premium",
    addons: { smartHome: true, premiumLighting: true },
    rationale:
      "We've matched you with premium Stewardship plus home automation and curated fixtures — precision execution and dramatic lighting to deliver your architectural statement.",
  },
  "The Intimate Storyteller": {
    selectedService: "C4",
    executionTier: "standard",
    addons: { customFurniture: true, premiumLighting: true },
    rationale:
      "We've matched you with Stewardship plus bespoke joinery and curated fixtures — a layered build that weaves your personal narrative into every detail.",
  },
  "The Refined Classicist": {
    selectedService: "C5",
    executionTier: "premium",
    addons: { customFurniture: true, premiumLighting: true },
    rationale:
      "We've matched you with the White Glove Commission plus bespoke joinery and gallery-grade fixtures — timeless proportions and quiet luxury, fully managed.",
  },
  "The Fluid Experimentalist": {
    selectedService: "C4",
    executionTier: "premium",
    addons: { smartHome: true, modularKitchen: true },
    rationale:
      "We've matched you with premium Stewardship plus automation and a chef's kitchen — a reconfigurable platform built for a home that keeps evolving.",
  },
  "The Grounded Pragmatist": {
    selectedService: "C3",
    executionTier: "standard",
    addons: {},
    rationale:
      "We've matched you with Immersive Visualization — see the design first, then layer in only what genuinely earns its place. Honest, comfortable, no fuss.",
  },
};

/**
 * Returns Estimator pre-fill values for a given archetype name.
 * Unknown archetypes silently return the neutral fallback (C3, no tier, no add-ons)
 * so the Estimator never breaks regardless of what ends up in localStorage.
 */
export function getEstimatorPreFill(archetype: string): DiscoveryPreFill {
  return ARCHETYPE_MAP[archetype] ?? FALLBACK;
}

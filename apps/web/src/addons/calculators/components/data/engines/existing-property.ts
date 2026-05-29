/**
 * Existing Property Analysis — Step 3
 *
 * Dynamic branching: renovation vs rebuild vs optimize.
 * If renovation cost > 70% of rebuild → suggest new build.
 * For non-owners: ideal property recommendations.
 */

import type { DiscoveryHandoff } from "../discovery-handoff";
import type { ExistingPropertyResult, PropertyPath } from "./types";

// ─── Decision Logic ──────────────────────────────────────────────────────────

export function analyzeExistingProperty(handoff: DiscoveryHandoff): ExistingPropertyResult {
  const { property, lifestyle, priorities } = handoff;
  const hasExisting = property.scope !== "new_build";
  const constraints: string[] = [];

  if (!hasExisting) {
    // Non-owner: generate ideal property spec
    const minSqFt = computeIdealArea(lifestyle.members, priorities.mustHave.length, lifestyle.hostingFreq);
    return {
      hasExistingProperty: false,
      recommendedPath: "new_build_exploration",
      pathRationale: "Since you're planning a new space, we can design without structural constraints — optimizing every square foot for your lifestyle from the ground up.",
      renovationToRebuildRatio: 0,
      structuralConstraints: [],
      layoutFlexibility: "flexible",
      idealPropertySpec: {
        type: inferIdealPropertyType(lifestyle, minSqFt),
        minSqFt,
        maxSqFt: Math.round(minSqFt * 1.3),
        layoutNotes: generateLayoutNotes(handoff),
      },
    };
  }

  // Existing property analysis
  if (property.ageYears >= 30) {
    constraints.push("Building age may require structural assessment before renovation");
  }
  if (property.ageYears >= 20) {
    constraints.push("Plumbing and electrical systems likely need full replacement");
  }
  if (property.type === "apartment" && property.areaSqFt < 600) {
    constraints.push("Very compact layout limits wall-moving options");
  }

  const layoutFlex = inferLayoutFlexibility(property);
  const ratio = estimateRenovationToRebuildRatio(property, constraints.length);

  let path: PropertyPath;
  let rationale: string;

  if (ratio > 0.70 && layoutFlex === "rigid") {
    path = "new_build_exploration";
    rationale = "Renovation costs approach rebuild levels, and the current layout is structurally inflexible. Exploring a new space may deliver better long-term value for your lifestyle goals.";
  } else if (ratio > 0.50 || constraints.length >= 2) {
    path = "space_reallocation";
    rationale = "Your property has workable bones but needs strategic reconfiguration. We'll optimize the layout to better serve your lifestyle priorities — keeping what works, rethinking what doesn't.";
  } else if (property.ageYears < 10 && constraints.length === 0) {
    path = "optimize_existing";
    rationale = "Your property is relatively modern with good structural integrity. A focused optimization — upgrading finishes, improving storage, and refining the atmosphere — will deliver maximum impact.";
  } else {
    path = "strategic_renovation";
    rationale = "Your property is a strong candidate for strategic renovation. We'll address core systems, upgrade priority spaces, and create the living experience you described.";
  }

  return {
    hasExistingProperty: true,
    recommendedPath: path,
    pathRationale: rationale,
    renovationToRebuildRatio: ratio,
    structuralConstraints: constraints,
    layoutFlexibility: layoutFlex,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeIdealArea(members: number, roomCount: number, hosting: string): number {
  const basePerPerson = 200;
  const basePerRoom = 120;
  const hostingBuffer = hosting === "Always" ? 200 : hosting === "Often" ? 120 : 50;
  return Math.max(600, members * basePerPerson + roomCount * basePerRoom + hostingBuffer);
}

function inferIdealPropertyType(lifestyle: DiscoveryHandoff["lifestyle"], sqft: number): string {
  if (sqft > 2500 || lifestyle.familyType === "Joint") return "Independent Villa or Floor";
  if (sqft > 1500) return "Large Apartment or Builder Floor";
  if (sqft > 800) return "3BHK Apartment";
  return "2BHK Apartment";
}

function generateLayoutNotes(h: DiscoveryHandoff): string[] {
  const notes: string[] = [];
  if (h.lifestyle.workFromHome) notes.push("Dedicated home office zone with acoustic separation");
  if (h.lifestyle.cookingRole === "Daily Ritual") notes.push("Open or semi-open kitchen with strong ventilation");
  if (h.lifestyle.hostingFreq === "Often" || h.lifestyle.hostingFreq === "Always") {
    notes.push("Living-dining flow with expandable gathering space");
  }
  if (h.lifestyle.children > 0) notes.push("Safe play zone accessible from kitchen/living");
  if (h.lifestyle.petsPresent) notes.push("Pet-friendly flooring with easy-clean finish");
  return notes;
}

function inferLayoutFlexibility(prop: DiscoveryHandoff["property"]): "rigid" | "moderate" | "flexible" {
  if (prop.type === "apartment") {
    if (prop.areaSqFt < 700) return "rigid";
    return "moderate";
  }
  if (prop.type === "villa" || prop.type === "independent_floor") return "flexible";
  return "moderate";
}

function estimateRenovationToRebuildRatio(prop: DiscoveryHandoff["property"], constraintCount: number): number {
  let ratio = 0.30; // baseline
  if (prop.ageYears >= 30) ratio += 0.25;
  else if (prop.ageYears >= 20) ratio += 0.15;
  else if (prop.ageYears >= 10) ratio += 0.08;

  ratio += constraintCount * 0.08;

  if (prop.type === "apartment" && prop.areaSqFt < 600) ratio += 0.10;

  return Math.min(0.95, ratio);
}

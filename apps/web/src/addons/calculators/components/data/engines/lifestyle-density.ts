/**
 * Lifestyle Density Engine — Step 4
 *
 * Maps how intensely space is actually used.
 * Two 1200sqft homes with different families need
 * completely different design strategies.
 *
 * Variables: occupancy, activity (cooking+WFH+hosting),
 * storage need, noise generation, maintenance load.
 */

import type { DiscoveryHandoff } from "../discovery-handoff";
import type { LifestyleDensityResult, DensityLevel } from "./types";

// ─── Dimension Scorers (each returns 0–100) ─────────────────────────────────

function scoreOccupancy(h: DiscoveryHandoff): number {
  const sqftPerPerson = h.property.areaSqFt / Math.max(h.lifestyle.members, 1);
  if (sqftPerPerson >= 400) return 15;   // spacious
  if (sqftPerPerson >= 250) return 30;
  if (sqftPerPerson >= 150) return 55;
  if (sqftPerPerson >= 100) return 75;
  return 95;                             // extremely dense
}

function scoreActivity(h: DiscoveryHandoff): number {
  let score = 20; // baseline

  // Cooking intensity
  if (h.lifestyle.cookingRole === "Daily Ritual") score += 25;
  else if (h.lifestyle.cookingRole === "Occasional") score += 10;

  // WFH
  if (h.lifestyle.workFromHome) score += 20;

  // Hosting
  if (h.lifestyle.hostingFreq === "Always") score += 25;
  else if (h.lifestyle.hostingFreq === "Often") score += 18;
  else if (h.lifestyle.hostingFreq === "Sometimes") score += 8;

  // Children amplify activity
  if (h.lifestyle.children >= 2) score += 12;
  else if (h.lifestyle.children >= 1) score += 6;

  return Math.min(100, score);
}

function scoreStorage(h: DiscoveryHandoff): number {
  let score = 30;

  // More people = more storage
  score += h.lifestyle.members * 8;

  // Children need storage growth
  score += h.lifestyle.children * 10;

  // Cooking = pantry/utensil storage
  if (h.lifestyle.cookingRole === "Daily Ritual") score += 15;

  // Pets
  if (h.lifestyle.petsPresent) score += 8;

  // Small space amplifies storage pressure
  if (h.property.areaSqFt < 800) score += 15;
  else if (h.property.areaSqFt < 1200) score += 8;

  return Math.min(100, score);
}

function scoreNoise(h: DiscoveryHandoff): number {
  let score = 20;

  if (h.lifestyle.children >= 2) score += 30;
  else if (h.lifestyle.children >= 1) score += 18;

  if (h.lifestyle.hostingFreq === "Always" || h.lifestyle.hostingFreq === "Often") score += 15;

  // WFH + children = noise conflict
  if (h.lifestyle.workFromHome && h.lifestyle.children > 0) score += 20;

  // Pets
  if (h.lifestyle.petsPresent) score += 10;

  // Apartment amplifies noise vs villa
  if (h.property.type === "apartment") score += 8;

  return Math.min(100, score);
}

function scoreMaintenance(h: DiscoveryHandoff): number {
  let score = 25;

  score += h.lifestyle.members * 5;
  if (h.lifestyle.children >= 1) score += 15;
  if (h.lifestyle.petsPresent) score += 12;
  if (h.lifestyle.cookingRole === "Daily Ritual") score += 10;

  // Larger homes = more maintenance
  if (h.property.areaSqFt > 2000) score += 10;

  // Older homes
  if (h.property.ageYears > 15) score += 8;

  return Math.min(100, score);
}

// ─── Density Level Classifier ────────────────────────────────────────────────

function classifyDensity(avgScore: number): DensityLevel {
  if (avgScore >= 75) return "extreme";
  if (avgScore >= 55) return "high";
  if (avgScore >= 35) return "moderate";
  return "low";
}

// ─── Narrative Generator ─────────────────────────────────────────────────────

function generateNarrative(level: DensityLevel, dims: LifestyleDensityResult["dimensions"], h: DiscoveryHandoff): string {
  const area = h.property.areaSqFt;
  const people = h.lifestyle.members;

  switch (level) {
    case "extreme":
      return `Your home experiences very high daily activity — ${people} people in ${area} sqft with intensive daily routines. Durability, noise management, smart zoning, and generous storage become non-negotiable design foundations.`;
    case "high":
      return `Your household has above-average daily activity. With ${people} occupants and your lifestyle patterns, the design should prioritize circulation flow, durable finishes, and strategic storage to prevent the space from feeling overwhelmed.`;
    case "moderate":
      return `Your space usage is balanced. Your lifestyle creates a comfortable activity level that gives the design room for both practical efficiency and aesthetic expression.`;
    case "low":
      return `Your home has a relaxed usage intensity. This gives significant freedom in material choices — you can lean into premium finishes and open layouts without worrying about heavy wear.`;
  }
}

function generateWarnings(dims: LifestyleDensityResult["dimensions"], h: DiscoveryHandoff): string[] {
  const warnings: string[] = [];

  if (dims.occupancy > 70 && dims.noise > 60) {
    warnings.push("High occupancy combined with noise-generating activities — acoustic zoning is strongly recommended.");
  }

  if (dims.storage > 70 && h.property.areaSqFt < 1000) {
    warnings.push("Storage demand is high relative to available space. Built-in and hidden storage will be critical.");
  }

  if (dims.activity > 75 && h.lifestyle.workFromHome) {
    warnings.push("WFH in a high-activity household. A dedicated, acoustically buffered work zone is essential.");
  }

  if (dims.maintenance > 70) {
    warnings.push("High maintenance load detected. Consider low-maintenance finishes: anti-stain surfaces, washable wall treatments, easy-clean flooring.");
  }

  return warnings;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function computeLifestyleDensity(handoff: DiscoveryHandoff): LifestyleDensityResult {
  const dimensions = {
    occupancy: scoreOccupancy(handoff),
    activity: scoreActivity(handoff),
    storage: scoreStorage(handoff),
    noise: scoreNoise(handoff),
    maintenance: scoreMaintenance(handoff),
  };

  const avgScore = Math.round(
    (dimensions.occupancy + dimensions.activity + dimensions.storage + dimensions.noise + dimensions.maintenance) / 5
  );

  const level = classifyDensity(avgScore);
  const narrative = generateNarrative(level, dimensions, handoff);
  const warnings = generateWarnings(dimensions, handoff);

  return { level, score: avgScore, dimensions, narrative, warnings };
}

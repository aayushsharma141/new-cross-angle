/**
 * Reality Simulation Engine — Step 10
 *
 * MOST POWERFUL STAGE.
 * Simulates: "How daily life would actually feel."
 *
 * Generates positive scenarios (what works well)
 * and friction points (where daily life creates tension).
 */

import type { DiscoveryHandoff } from "../discovery-handoff";
import type { RealitySimulationResult, SimulationScenario } from "./types";
import type { SpaceAllocationResult } from "./types";
import type { LifestyleDensityResult } from "./types";

// ─── Positive Scenario Generators ────────────────────────────────────────────

function generatePositives(h: DiscoveryHandoff, space: SpaceAllocationResult): SimulationScenario[] {
  const positives: SimulationScenario[] = [];

  // Hosting scenario
  if (h.lifestyle.hostingFreq === "Often" || h.lifestyle.hostingFreq === "Always") {
    const livingAlloc = space.allocations.find(a => a.room === "Living Room");
    if (livingAlloc && !livingAlloc.compressed) {
      positives.push({
        scenario: "Weekend gatherings flow naturally between living and dining areas",
        explanation: `Your ${livingAlloc.allocatedSqFt} sqft living space comfortably hosts your social style. Open flow to the kitchen keeps the cook connected.`,
        affectedRoom: "Living Room",
        confidence: "high",
      });
    }
  }

  // Kitchen connection
  if (h.lifestyle.cookingRole === "Daily Ritual") {
    positives.push({
      scenario: "Daily cooking becomes a connected family ritual, not an isolated chore",
      explanation: "Your kitchen layout is designed for the cook to stay socially present — conversation flows while meals come together.",
      affectedRoom: "Kitchen",
      confidence: "high",
    });
  }

  // WFH productivity
  if (h.lifestyle.workFromHome) {
    const officeAlloc = space.allocations.find(a => a.room === "Home Office" || a.room === "Study");
    if (officeAlloc) {
      positives.push({
        scenario: "Work-from-home days have clear visual and acoustic boundaries",
        explanation: `A dedicated ${officeAlloc.allocatedSqFt} sqft zone with partition strategy prevents work from bleeding into family life.`,
        affectedRoom: "Home Office",
        confidence: officeAlloc.compressed ? "medium" : "high",
      });
    }
  }

  // Children's play
  if (h.lifestyle.children > 0) {
    positives.push({
      scenario: "Children have visible, safe activity zones accessible from common areas",
      explanation: "Play areas are designed within sightline of the kitchen and living room, so supervision is natural — not exhausting.",
      affectedRoom: "Kids Room",
      confidence: "high",
    });
  }

  // Decompression
  const hasBalcony = space.allocations.some(a => a.room === "Balcony");
  if (hasBalcony) {
    positives.push({
      scenario: "Evening decompression happens naturally on the balcony with soft lighting",
      explanation: "The balcony is designed as a retreat zone — not a storage dump. Warm lighting, a comfortable seat, and visual greenery create an effortless wind-down routine.",
      affectedRoom: "Balcony",
      confidence: "medium",
    });
  }

  // Natural light
  if (h.sensory.lighting === "natural" || h.sensory.lighting === "warm") {
    positives.push({
      scenario: "Morning light flows through the home, creating energy without artificial overhead",
      explanation: "Window treatments are layered (sheer + blackout) so natural light is maximized during the day and controllable at night.",
      affectedRoom: "Living Room",
      confidence: "medium",
    });
  }

  return positives.slice(0, 5);
}

// ─── Friction Generators ─────────────────────────────────────────────────────

function generateFrictions(h: DiscoveryHandoff, space: SpaceAllocationResult, density: LifestyleDensityResult): SimulationScenario[] {
  const frictions: SimulationScenario[] = [];

  // Storage pressure
  if (density.dimensions.storage > 65) {
    frictions.push({
      scenario: "Storage starts feeling tight after 3–5 years as the household accumulates",
      explanation: `Your lifestyle density (${density.level}) suggests growing storage demand. Built-in vertical storage and seasonal rotation systems can extend capacity significantly.`,
      affectedRoom: "Throughout",
      confidence: "medium",
    });
  }

  // Noise friction
  if (density.dimensions.noise > 60 && h.lifestyle.workFromHome) {
    frictions.push({
      scenario: "Work calls overlap with household activity — creating focus interruptions",
      explanation: "Even with a dedicated work zone, sound travel in compact spaces is a reality. Acoustic panels and white noise integration help, but some overlap is expected.",
      affectedRoom: "Home Office",
      confidence: "high",
    });
  }

  // Compressed rooms
  const heavilyCompressed = space.allocations.filter(a => a.compressed && a.emotionalWeight > 0.5);
  for (const room of heavilyCompressed.slice(0, 2)) {
    frictions.push({
      scenario: `${room.room} feels smaller than ideal during daily use`,
      explanation: `Allocated ${room.allocatedSqFt} sqft vs ideal ${room.idealSqFt} sqft. ${room.compressionNote || "Smart furniture and vertical storage can mitigate this."}`,
      affectedRoom: room.room,
      confidence: "medium",
    });
  }

  // Hosting in compact space
  if (h.lifestyle.hostingFreq === "Always" && h.property.areaSqFt < 900) {
    frictions.push({
      scenario: "Large gatherings (8+ people) require furniture rearrangement",
      explanation: "Your hosting frequency is high, but the space can't permanently accommodate large groups. Flexible furniture (nesting tables, stackable seating) becomes essential.",
      affectedRoom: "Living Room",
      confidence: "high",
    });
  }

  // Joint family privacy
  if (h.lifestyle.familyType === "Joint" && h.property.areaSqFt < 1500) {
    frictions.push({
      scenario: "Privacy moments require intentional withdrawal to bedrooms",
      explanation: "Joint family dynamics in compact spaces mean common areas are rarely private. Bedroom doors, reading nooks, and balcony zones become essential personal retreat spaces.",
      affectedRoom: "Bedrooms",
      confidence: "medium",
    });
  }

  return frictions.slice(0, 4);
}

// ─── Future Risks ────────────────────────────────────────────────────────────

function assessFutureRisks(h: DiscoveryHandoff, density: LifestyleDensityResult): string[] {
  const risks: string[] = [];

  if (h.lifestyle.children > 0 && h.lifestyle.children < 3) {
    risks.push("Growing children will need progressively larger study zones and personal space — plan for convertible rooms.");
  }

  if (density.dimensions.storage > 60) {
    risks.push("Storage saturation typically occurs within 5 years at current density — consider modular systems that can expand.");
  }

  if (h.lifestyle.workFromHome && h.property.areaSqFt < 1000) {
    risks.push("If WFH becomes permanent, a more robust office zone may eventually need a dedicated room conversion.");
  }

  if (h.property.ageYears >= 15 && h.property.scope !== "new_build") {
    risks.push("Building systems (plumbing, electrical, waterproofing) will need attention within the next 5–10 years — budget for phased maintenance.");
  }

  if (h.lifestyle.familyType === "Nuclear" && h.lifestyle.members === 2) {
    risks.push("If the family grows, the current space allocation may need to be reconsidered — flexibility in room design now pays off later.");
  }

  return risks.slice(0, 4);
}

// ─── Livability Score ────────────────────────────────────────────────────────

function computeLivabilityScore(positives: SimulationScenario[], frictions: SimulationScenario[], risks: string[]): number {
  let score = 70; // baseline

  // Positives boost
  score += positives.filter(p => p.confidence === "high").length * 5;
  score += positives.filter(p => p.confidence === "medium").length * 3;

  // Frictions penalize
  score -= frictions.filter(f => f.confidence === "high").length * 8;
  score -= frictions.filter(f => f.confidence === "medium").length * 4;

  // Future risks minor penalty
  score -= risks.length * 2;

  return Math.max(20, Math.min(100, score));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function computeRealitySimulation(
  handoff: DiscoveryHandoff,
  spaceResult: SpaceAllocationResult,
  densityResult: LifestyleDensityResult
): RealitySimulationResult {
  const positives = generatePositives(handoff, spaceResult);
  const frictions = generateFrictions(handoff, spaceResult, densityResult);
  const futureRisks = assessFutureRisks(handoff, densityResult);
  const livabilityScore = computeLivabilityScore(positives, frictions, futureRisks);

  return { positives, frictions, futureRisks, livabilityScore };
}

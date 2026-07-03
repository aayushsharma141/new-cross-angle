/**
 * Space Allocation Intelligence — Step 5
 *
 * Redistributes emotional priorities vs physical reality.
 * NOT "you cannot have this." Instead: "here's the smartest version possible."
 *
 * Uses ideal sqft benchmarks per room type, then compresses
 * based on emotional weight — lowest-emotion rooms compress first.
 */

import type { DiscoveryHandoff } from "../discovery-handoff";
import type { SpaceAllocationResult, RoomAllocation, SpaceCompromise } from "./types";

// ─── Ideal Room Benchmarks (sqft) ────────────────────────────────────────────

const ROOM_BENCHMARKS: Record<string, { ideal: number; min: number; label: string }> = {
  "Living Room":       { ideal: 250, min: 120, label: "Living Room" },
  "Master Bedroom":    { ideal: 180, min: 100, label: "Master Bedroom" },
  "Bedroom":           { ideal: 140, min: 90,  label: "Bedroom" },
  "Kitchen":           { ideal: 120, min: 60,  label: "Kitchen" },
  "Home Office":       { ideal: 100, min: 50,  label: "Home Office" },
  "Study":             { ideal: 80,  min: 40,  label: "Study" },
  "Kids Room":         { ideal: 130, min: 80,  label: "Kids Room" },
  "Dining":            { ideal: 120, min: 60,  label: "Dining" },
  "Balcony":           { ideal: 60,  min: 30,  label: "Balcony" },
  "Pooja Room":        { ideal: 40,  min: 20,  label: "Pooja Room" },
  "Walk-in Wardrobe":  { ideal: 60,  min: 25,  label: "Walk-in Wardrobe" },
  "Home Theater":      { ideal: 150, min: 80,  label: "Home Theater" },
  "Gym":               { ideal: 100, min: 50,  label: "Gym" },
  "Guest Room":        { ideal: 130, min: 80,  label: "Guest Room" },
  "Utility":           { ideal: 40,  min: 20,  label: "Utility" },
  "Servant Quarter":   { ideal: 80,  min: 50,  label: "Servant Quarter" },
};

/** Circulation + walls eat ~20% of carpet area */
const CIRCULATION_OVERHEAD = 0.20;

// ─── Smart Compromise Generator ──────────────────────────────────────────────

const COMPROMISE_ALTERNATIVES: Record<string, { alt: string; reason: string }> = {
  "Walk-in Wardrobe":  { alt: "Full-wall hidden storage with mirror panel", reason: "delivers same capacity in 60% of the footprint" },
  "Home Theater":      { alt: "Living room with retractable projector + blackout blinds", reason: "dual-purpose space that transforms at night" },
  "Gym":               { alt: "Compact fitness nook in balcony or bedroom corner", reason: "essential equipment fits in 50 sqft with wall-mounted storage" },
  "Dining":            { alt: "Extended kitchen island with seating", reason: "saves dedicated dining footprint while creating a social cooking experience" },
  "Home Office":       { alt: "Convertible nook with fold-down desk in bedroom/living", reason: "provides functional work zone without dedicated room commitment" },
  "Guest Room":        { alt: "Sofa-bed in living room + enhanced guest bathroom", reason: "occasional hosting doesn't justify permanent room allocation" },
  "Study":             { alt: "Integrated reading corner with built-in shelving", reason: "achieves focus space without full room dedication" },
  "Servant Quarter":   { alt: "Compact utility area with separate access", reason: "optimizes helper workspace without losing a full room" },
};

// ─── Core Algorithm ──────────────────────────────────────────────────────────

export function computeSpaceAllocation(handoff: DiscoveryHandoff): SpaceAllocationResult {
  const totalAvailable = Math.round(handoff.property.areaSqFt * (1 - CIRCULATION_OVERHEAD));

  // Build room list with priorities
  const allRooms: { room: string; priority: "must-have" | "nice-to-have" | "inferred" }[] = [
    ...handoff.priorities.mustHave.map(r => ({ room: r, priority: "must-have" as const })),
    ...handoff.priorities.niceToHave.map(r => ({ room: r, priority: "nice-to-have" as const })),
  ];

  // Inferred rooms: always need at least bathrooms, utility
  const inferredRooms = ["Utility"];
  if (handoff.lifestyle.workFromHome && !allRooms.some(r => r.room === "Home Office" || r.room === "Study")) {
    inferredRooms.push("Home Office");
  }
  inferredRooms.forEach(r => {
    if (!allRooms.some(ar => ar.room === r)) {
      allRooms.push({ room: r, priority: "inferred" as const });
    }
  });

  // Calculate ideal total
  let idealTotal = 0;
  const rawAllocations: RoomAllocation[] = allRooms.map(({ room, priority }) => {
    const benchmark = ROOM_BENCHMARKS[room] || { ideal: 100, min: 50, label: room };
    const emotionalWeight = handoff.priorities.emotionalWeights[room] ?? (priority === "must-have" ? 0.8 : 0.4);
    idealTotal += benchmark.ideal;
    return {
      room,
      idealSqFt: benchmark.ideal,
      allocatedSqFt: benchmark.ideal,
      priority,
      emotionalWeight,
      compressed: false,
    };
  });

  const compromises: SpaceCompromise[] = [];

  // If ideal fits, no compression needed
  if (idealTotal <= totalAvailable) {
    return {
      allocations: rawAllocations,
      compromises: [],
      totalAllocated: idealTotal,
      totalAvailable,
      breathingRoom: Math.round(((totalAvailable - idealTotal) / totalAvailable) * 100),
    };
  }

  // Need to compress — sort by emotional weight (lowest first = compressed first)
  const sorted = [...rawAllocations].sort((a, b) => a.emotionalWeight - b.emotionalWeight);

  let remaining = totalAvailable;

  // First pass: allocate must-haves at ideal, track budget
  const mustHaveAllocated: RoomAllocation[] = [];
  const compressible: RoomAllocation[] = [];

  for (const alloc of sorted) {
    if (alloc.priority === "must-have" && alloc.emotionalWeight >= 0.7) {
      mustHaveAllocated.push(alloc);
      remaining -= alloc.idealSqFt;
    } else {
      compressible.push(alloc);
    }
  }

  // Second pass: distribute remaining space to compressible rooms
  const compressibleIdealTotal = compressible.reduce((s, r) => s + r.idealSqFt, 0);
  const compressionRatio = compressibleIdealTotal > 0 ? Math.max(0.3, remaining / compressibleIdealTotal) : 1;

  for (const alloc of compressible) {
    const benchmark = ROOM_BENCHMARKS[alloc.room] || { ideal: 100, min: 50, label: alloc.room };
    const compressed = Math.round(alloc.idealSqFt * compressionRatio);

    if (compressed < benchmark.min) {
      // Can't fit even minimum — trigger compromise
      const alt = COMPROMISE_ALTERNATIVES[alloc.room];
      if (alt) {
        compromises.push({
          room: alloc.room,
          originalConcept: `Dedicated ${alloc.room} (${benchmark.ideal} sqft)`,
          smartAlternative: alt.alt,
          reason: alt.reason,
          emotionalImpact: alloc.emotionalWeight > 0.6 ? "significant" : alloc.emotionalWeight > 0.3 ? "moderate" : "minimal",
        });
      }
      alloc.allocatedSqFt = benchmark.min;
      alloc.compressed = true;
      alloc.compressionNote = alt?.alt || `Compressed to minimum ${benchmark.min} sqft`;
    } else {
      alloc.allocatedSqFt = compressed;
      if (compressed < alloc.idealSqFt * 0.85) {
        alloc.compressed = true;
        alloc.compressionNote = `Reduced from ${alloc.idealSqFt} to ${compressed} sqft to fit priorities`;
      }
    }
  }

  const finalAllocations = [...mustHaveAllocated, ...compressible];
  const totalAllocated = finalAllocations.reduce((s, r) => s + r.allocatedSqFt, 0);

  return {
    allocations: finalAllocations,
    compromises,
    totalAllocated,
    totalAvailable,
    breathingRoom: Math.max(0, Math.round(((totalAvailable - totalAllocated) / totalAvailable) * 100)),
  };
}

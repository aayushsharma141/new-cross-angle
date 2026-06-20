/**
 * Feasibility Conflict Engine — Step 6
 *
 * Detects: aspiration conflicts, budget conflicts,
 * space conflicts, psychological conflicts.
 *
 * NEVER says "this won't work."
 * ALWAYS says "here's where aspirations and realities may need negotiation."
 */

import type { DiscoveryHandoff } from "../discovery-handoff";
import type { FeasibilityConflictResult, FeasibilityConflict } from "./types";

// ─── Conflict Detectors ──────────────────────────────────────────────────────

function detectEmotionalVsReality(h: DiscoveryHandoff): FeasibilityConflict[] {
  const conflicts: FeasibilityConflict[] = [];

  // Calm + heavy textures
  const wantsCalm = h.emotionalGoal.toLowerCase().includes("peace") ||
                    h.emotionalGoal.toLowerCase().includes("calm") ||
                    h.emotionalGoal.toLowerCase().includes("quiet");
  const heavyTextures = h.sensory.textures.some(t =>
    ["ornate", "dramatic", "bold", "heavy", "ornamental", "baroque"].includes(t.toLowerCase())
  );

  if (wantsCalm && heavyTextures) {
    conflicts.push({
      id: "calm_vs_heavy_texture",
      category: "emotional_vs_reality",
      severity: "advisory",
      aspiration: "A calm, mentally quiet environment",
      reality: "Selected textures and materials lean towards visual intensity",
      guidance: "Your sensory choices are rich and expressive — which is beautiful. To preserve the calm you're seeking, consider using these textures as accent moments rather than room-wide treatments. A warm, textured feature wall with restrained surroundings creates impact without overwhelm.",
      affectedPriority: "Emotional atmosphere",
    });
  }

  // Minimal + luxury materials
  const wantsMinimal = h.emotionalGoal.toLowerCase().includes("minimal") ||
                       h.sensory.textures.some(t => t.toLowerCase().includes("minimal"));
  const luxuryMaterials = h.sensory.luxuryResolvedAs === "invest-in-materials";

  if (wantsMinimal && luxuryMaterials) {
    conflicts.push({
      id: "minimal_vs_luxury",
      category: "emotional_vs_reality",
      severity: "advisory",
      aspiration: "A minimal, uncluttered aesthetic",
      reality: "Material investment leans towards premium/ornate finishes",
      guidance: "This is actually a powerful combination — calm luxury. The key is selecting fewer, better materials rather than many decorative ones. Think: one exceptional stone surface, one curated wood tone, precision joinery. Less surface variety, more depth in each choice.",
      affectedPriority: "Design coherence",
    });
  }

  return conflicts;
}

function detectSpaceVsLifestyle(h: DiscoveryHandoff): FeasibilityConflict[] {
  const conflicts: FeasibilityConflict[] = [];

  // Hosting + small space
  const highHosting = h.lifestyle.hostingFreq === "Often" || h.lifestyle.hostingFreq === "Always";
  if (highHosting && h.property.areaSqFt < 800) {
    conflicts.push({
      id: "hosting_small_space",
      category: "space_vs_lifestyle",
      severity: "warning",
      aspiration: "Frequent hosting and social gatherings",
      reality: `${h.property.areaSqFt} sqft creates density during gatherings`,
      guidance: "Your hosting aspiration is entirely valid — the design strategy shifts to flexible furniture (nesting tables, expandable dining), a socially-connected kitchen layout, and balcony integration to extend gathering space when needed.",
      affectedPriority: "Hosting experience",
    });
  }

  // Joint family + compact space
  if (h.lifestyle.familyType === "Joint" && h.property.areaSqFt < 1500) {
    conflicts.push({
      id: "joint_family_compact",
      category: "space_vs_lifestyle",
      severity: "warning",
      aspiration: "Joint family living with generational comfort",
      reality: "Space requires careful zoning for privacy and shared use",
      guidance: "Joint families thrive on togetherness AND individual retreat. We'll design acoustic zones, semi-private reading nooks, and flexible doors that open for gatherings and close for quiet time.",
      affectedPriority: "Family harmony",
    });
  }

  // WFH + no dedicated office + children
  if (h.lifestyle.workFromHome && h.lifestyle.children > 0 && h.property.areaSqFt < 1000) {
    conflicts.push({
      id: "wfh_kids_compact",
      category: "space_vs_lifestyle",
      severity: "warning",
      aspiration: "Productive home office with children at home",
      reality: "Compact space with children creates acoustic and focus challenges",
      guidance: "A dedicated micro-office zone (even 40 sqft) with acoustic treatment, a closing partition, and cable management can transform productivity. The key is visual and acoustic separation, not necessarily a full room.",
      affectedPriority: "Work productivity",
    });
  }

  // Large kitchen aspiration + small property
  const wantsLargeKitchen = h.priorities.mustHave.includes("Kitchen") && h.lifestyle.cookingRole === "Daily Ritual";
  if (wantsLargeKitchen && h.property.areaSqFt < 700) {
    conflicts.push({
      id: "kitchen_priority_small",
      category: "space_vs_lifestyle",
      severity: "advisory",
      aspiration: "A generous kitchen for daily cooking rituals",
      reality: "Available area limits standalone kitchen size",
      guidance: "An open kitchen with a living-connected layout actually amplifies the cooking experience — the cook stays socially connected. We'll maximize storage with vertical cabinets, a compact island, and professional-grade ventilation.",
      affectedPriority: "Kitchen experience",
    });
  }

  return conflicts;
}

function detectBudgetVsSensory(h: DiscoveryHandoff): FeasibilityConflict[] {
  const conflicts: FeasibilityConflict[] = [];
  const budgetPerSqft = h.budget / h.property.areaSqFt;

  // Premium sensory expectations + economy budget
  const wantsPremium = h.sensory.luxuryResolvedAs === "invest-in-materials" || h.sensory.luxuryResolvedAs === "invest-in-space";
  const premiumTextures = h.sensory.textures.some(t =>
    ["marble", "stone", "teak", "walnut", "brass", "gold", "crystal"].includes(t.toLowerCase())
  );

  if ((wantsPremium || premiumTextures) && budgetPerSqft < 2500) {
    conflicts.push({
      id: "premium_sensory_budget",
      category: "budget_vs_sensory",
      severity: "warning",
      aspiration: "Premium material experience with natural stone, wood, or metal accents",
      reality: `Current budget density (₹${Math.round(budgetPerSqft)}/sqft) supports standard-grade finishes`,
      guidance: "Premium materials can still appear through strategic placement: a marble-effect engineered counter, genuine wood veneer feature panels, and brass-finish hardware create authentic luxury perception. The key is material density — a few real touches surrounded by quality neutrals.",
      affectedPriority: "Material quality",
    });
  }

  // Dramatic lighting + economy budget
  if (h.sensory.lighting === "dramatic" && budgetPerSqft < 2000) {
    conflicts.push({
      id: "dramatic_lighting_budget",
      category: "budget_vs_sensory",
      severity: "advisory",
      aspiration: "Dramatic, layered lighting atmosphere",
      reality: "Budget allocation for imported or designer lighting is limited",
      guidance: "Dramatic lighting doesn't require expensive fixtures — it requires intelligent placement. Profile lighting, hidden LED strips, and a few accent pendants create cinematic atmosphere at a fraction of chandelier cost. The design intelligence is in the layering, not the brand.",
      affectedPriority: "Lighting atmosphere",
    });
  }

  return conflicts;
}

function detectIdentityVsProperty(h: DiscoveryHandoff): FeasibilityConflict[] {
  const conflicts: FeasibilityConflict[] = [];

  // Aspirational archetype vs property type
  const luxuryArchetypes = ["Opulent Maximalist", "The Statement Curator", "Urban Luxe"];
  const isLuxuryArchetype = luxuryArchetypes.some(a => h.archetype.includes(a));

  if (isLuxuryArchetype && h.property.areaSqFt < 800) {
    conflicts.push({
      id: "luxury_identity_compact",
      category: "identity_vs_property",
      severity: "advisory",
      aspiration: `Your ${h.archetype} identity implies spacious, curated luxury`,
      reality: "Compact spaces require a different expression of luxury",
      guidance: "Luxury in compact spaces is about intensity, not spread. Every surface becomes precious. A single statement wall, museum-quality lighting, and impeccable joinery can create stronger luxury perception than a larger space with distributed finishes.",
      affectedPriority: "Identity expression",
    });
  }

  // Nature-lover in high-rise apartment
  const wantsNature = h.sensory.textures.some(t =>
    ["organic", "natural", "green", "botanical", "earth", "wood"].includes(t.toLowerCase())
  );
  if (wantsNature && h.property.type === "apartment" && h.property.areaSqFt < 1200) {
    conflicts.push({
      id: "nature_aspiration_apartment",
      category: "identity_vs_property",
      severity: "advisory",
      aspiration: "A nature-connected, organic living environment",
      reality: "Apartment living limits direct nature access",
      guidance: "Biophilic design transforms apartments: vertical gardens, natural material palettes, maximized natural light through sheer layering, and balcony garden optimization. The goal is nature-presence, not nature-access.",
      affectedPriority: "Nature connection",
    });
  }

  return conflicts;
}

// ─── Narrative Generator ─────────────────────────────────────────────────────

function generateAlignmentNarrative(conflicts: FeasibilityConflict[], alignment: number): string {
  if (alignment >= 85) {
    return "Your aspirations and realities are well-aligned. The design can proceed with confidence — minor refinements may enhance the outcome further.";
  }
  if (alignment >= 65) {
    const topConflict = conflicts.find(c => c.severity === "warning") || conflicts[0];
    return `Most of your goals align naturally with your space and budget. The main area requiring thoughtful navigation: ${topConflict?.affectedPriority || "selected priorities"}.`;
  }
  if (alignment >= 40) {
    return `Several areas benefit from creative problem-solving. We've identified ${conflicts.length} points where smart design strategies can bridge the gap between what you want and what's immediately possible.`;
  }
  return `Your aspirations are ambitious relative to current constraints. This is not a limitation — it's an invitation for creative strategy. We've mapped ${conflicts.length} areas where intelligent design choices unlock significant quality.`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function computeFeasibilityConflicts(handoff: DiscoveryHandoff): FeasibilityConflictResult {
  const conflicts = [
    ...detectEmotionalVsReality(handoff),
    ...detectSpaceVsLifestyle(handoff),
    ...detectBudgetVsSensory(handoff),
    ...detectIdentityVsProperty(handoff),
  ];

  // Sort: critical → warning → advisory
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, advisory: 2 };
  conflicts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Overall alignment: 100 - weighted penalty
  const penalties = conflicts.reduce((sum, c) => {
    if (c.severity === "critical") return sum + 20;
    if (c.severity === "warning") return sum + 12;
    return sum + 5;
  }, 0);

  const overallAlignment = Math.max(0, Math.min(100, 100 - penalties));
  const narrative = generateAlignmentNarrative(conflicts, overallAlignment);

  return { conflicts, overallAlignment, narrative };
}

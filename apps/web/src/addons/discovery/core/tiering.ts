import { Archetype } from "@/types/discovery";

export type RecommendedTier = "Essential" | "Signature" | "Bespoke";

interface TieringInput {
    archetype: Archetype;
    carpetArea?: number;
    budgetBracket?: string;
    materialChoice?: string;
    luxuryResolution?: string;
    primaryValue?: string;
}

/**
 * Dynamic tier calculation.
 *
 * The Recommended Tier is NOT hardcoded to an archetype.
 * It is computed from: Archetype + Home Size + Budget + Material Preference + Primary Value.
 *
 * This prevents the "Quiet Luxury = Bespoke" trap — half your users should NOT end up Bespoke.
 */
export function calculateRecommendedTier(input: TieringInput): RecommendedTier {
    const { archetype, carpetArea, budgetBracket, materialChoice, luxuryResolution, primaryValue } = input;

    // --- Budget score (0–4) ---
    const budgetScore: Record<string, number> = {
        "₹5L–₹15L": 0,
        "₹15L–₹30L": 1,
        "₹30L–₹60L": 2,
        "₹60L–₹1Cr": 3,
        "₹1Cr+": 4,
    };
    const bScore = budgetScore[budgetBracket ?? ""] ?? 1;

    // --- Area score (0–2) ---
    let areaScore = 1;
    if (carpetArea) {
        if (carpetArea < 600) areaScore = 0;
        else if (carpetArea > 1800) areaScore = 2;
    }

    // --- Material score (0–2) ---
    const premiumMaterials = ["Polished Stone", "Matte Metal", "Marble", "Brass"];
    const materialScore = materialChoice && premiumMaterials.some(m => materialChoice.includes(m)) ? 2 : 0;

    // --- Primary value score (bonus for status/longevity signals) ---
    const valueBonus = (primaryValue === "impression" || primaryValue === "longevity") ? 1 : 0;

    // --- Archetype ceiling (Functional Family Planner rarely needs Bespoke) ---
    const archetypeCap: Record<string, RecommendedTier> = {
        "The Functional Family Planner": "Signature",
        "The Urban Minimalist": "Signature",
    };
    const cap = archetypeCap[archetype.name];

    const total = bScore + areaScore + materialScore + valueBonus;

    // --- Luxury resolution override: if user chose hero-focus despite low budget, stay Essential ---
    if (luxuryResolution === "material-swap" && bScore <= 1) {
        return "Essential";
    }

    let tier: RecommendedTier;
    if (total <= 2) {
        tier = "Essential";
    } else if (total <= 5) {
        tier = "Signature";
    } else {
        tier = "Bespoke";
    }

    // Apply archetype ceiling
    if (cap && tier === "Bespoke") {
        return cap;
    }

    return tier;
}

/**
 * Returns a short 1-sentence context string for the Estimator handoff banner.
 */
export function getTierContextLine(tier: RecommendedTier, archetypeName: string): string {
    switch (tier) {
        case "Essential":
            return `Based on your ${archetypeName} profile, a focused Essential execution will achieve maximum impact within your scope.`;
        case "Signature":
            return `Your ${archetypeName} profile aligns naturally with the Signature tier — quality materials, considered customisation, no compromise on key rooms.`;
        case "Bespoke":
            return `Your ${archetypeName} profile and project scope point toward a Bespoke engagement — one-of-a-kind finishes, full design control, no off-the-shelf compromises.`;
    }
}

import type { CalculatorFormData, LeadScore, LeadCategory, PricingConfig } from "./types";

/**
 * Scores a lead from 0–100 based on multiple dimensions.
 * Returns score breakdown and category (HOT / WARM / COLD).
 */
export function scoreLead(data: CalculatorFormData, config: PricingConfig): LeadScore {
    const weights = config.scoring_weights;

    const budgetScore = scoreBudget(data.budgetAmount, weights.budget);
    const scopeScore = scoreScope(data.selectedService ? [data.selectedService] : [], data.executionTier || "", weights.service);
    const areaScore = scoreArea(data.area, weights.area);
    const timelineScore = scoreTimeline(data.startTiming, weights.timeline);
    const cityScore = scoreCity(data.city, weights.city);

    // Engagement is not in config weights usually, keep hardcoded or add to config?
    // Reference doesn't seem to have engagement score? 
    // We'll keep it as a bonus or small factor, but for now let's say it's outside the main 100 points
    // or we assume weights sum to 100 (which they do in default config: 30+20+25+15+10 = 100).
    // The current implementation had 30+25+15+10+10 = 90 + 10 engagement = 100.
    // If we stricly follow reference weights, engagement is not part of it.
    // We will keep engagement as separate bonus or just drop it to align with reference?
    // Reference has: area(25), budget(30), service(20), city(10), timeline(15) = 100.
    // So engagement is NOT in reference. I will remove it to align with reference.

    const total = budgetScore + scopeScore + areaScore + timelineScore + cityScore;
    const category = categorize(total);

    return {
        total,
        category,
        breakdown: {
            budget: budgetScore,
            scope: scopeScore,
            area: areaScore,
            timeline: timelineScore,
            city: cityScore,
            engagement: 0, // Removed
        },
    };
}

function scoreBudget(budget: number, maxScore: number): number {
    if (budget > 7500000) return maxScore;
    if (budget > 4000000) return maxScore * 0.66;
    if (budget > 2000000) return maxScore * 0.33;
    return maxScore * 0.16;
}

function scoreScope(scopes: string[], designPackage: string, maxScore: number): number {
    // Reference: "Turnkey" -> max. "Design+Sup" -> 0.75. "Design" -> 0.5.
    if (scopes.includes("Turnkey Execution")) return maxScore;
    if (designPackage === "design_supervision" || scopes.includes("Design + Supervision")) return maxScore * 0.75;
    if (designPackage && designPackage !== "consultancy") return maxScore * 0.5;
    if (scopes.length > 1) return maxScore * 0.5;
    return maxScore * 0.25;
}

function scoreArea(area: number, maxScore: number): number {
    if (area > 3000) return maxScore;
    if (area > 1500) return maxScore * 0.66;
    if (area > 800) return maxScore * 0.33;
    return maxScore * 0.15;
}

function scoreTimeline(timeline: string | null, maxScore: number): number {
    if (timeline === "Immediate") return maxScore;
    if (timeline === "1-3 Months") return maxScore * 0.6;
    return maxScore * 0.3;
}

function scoreCity(city: string | null, maxScore: number): number {
    if (city === "Bangalore" || city === "Metro") return maxScore;
    return maxScore * 0.5;
}

function categorize(score: number): LeadCategory {
    if (score >= 75) return "HOT"; // Adjusted threshold slightly
    if (score >= 45) return "WARM";
    return "COLD";
}

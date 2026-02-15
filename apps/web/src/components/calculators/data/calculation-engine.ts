/* ═══════════════════════════════════════════════
   Interior Cost Estimator — Calculation Engine
   Exact port of InteriorCostEstimator_1.jsx logic
   ═══════════════════════════════════════════════ */

import type { CalculatorFormData, EstimateResult, PricingConfig } from "./types";
import { TIERS, SERVICES } from "./pricing-config";

/**
 * Core calculation engine — matches the reference Dazl logic exactly.
 *
 * Design Fee:  area × rate × city_multiplier + 18% GST
 * Supervision: ₹30,000/month (C4 only)
 * Extra Visits: max(0, visits - 5) × ₹5,000 (C4 only)
 * Execution:   area × tier_rate × city_multiplier (C5 only)
 * Contingency: 5% of execution cost (C5 only)
 * PM Fee:      3% of execution cost (C5 only)
 * Add-ons:     flat / per_room / per_sqft costs
 */
export function calculateEstimate(data: CalculatorFormData, config: PricingConfig): EstimateResult {
    const a = data.area;
    const m = TIERS[data.cityTier]?.multiplier ?? config.city_multipliers[data.cityTier] ?? 1.0;

    let dMin = 0, dMax = 0, sup = 0, exMin = 0, exMax = 0, extraVC = 0;

    const svc = data.selectedService;

    if (svc === "C1") {
        dMin = dMax = a * config.design.consultancy_rate * m;
    } else if (svc === "C2") {
        dMin = dMax = a * config.design.rate_2d * m;
    } else if (svc === "C3") {
        dMin = dMax = a * config.design.rate_3d * m;
    } else if (svc === "C4") {
        dMin = dMax = a * config.design.rate_3d * m;
        sup = config.design.supervision_monthly * (data.projectMonths || 3);
        extraVC = Math.max(0, (data.extraVisits || 5) - config.design.free_visits) * config.design.extra_visit_cost;
    } else if (svc === "C5" && data.executionTier) {
        const c5 = SERVICES.find(s => s.id === "C5");
        const tier = c5?.tiers?.[data.executionTier];
        if (tier) {
            exMin = a * tier.min * m;
            exMax = a * tier.max * m;
        }
        // C5 includes 2D design base rate
        dMin = dMax = a * config.design.rate_2d * m;
    }

    const gst = dMin * (config.logic.gst_pct / 100);

    const cMin = exMin * (config.logic.contingency_pct / 100);
    const cMax = exMax * (config.logic.contingency_pct / 100);

    const pmMin = exMin * (config.logic.pm_pct / 100);
    const pmMax = exMax * (config.logic.pm_pct / 100);

    /* --- Add-ons --- */
    let addons = 0;
    if (data.modularKitchen) addons += config.addons.modular_kitchen;
    if (data.wardrobes > 0) addons += data.wardrobes * config.addons.wardrobe_per_room;
    if (data.falseCeiling) addons += a * config.addons.false_ceiling_sqft;
    if (data.smartHome) addons += config.addons.smart_home;
    if (data.customFurniture) addons += config.addons.custom_furniture;
    if (data.premiumLighting) addons += config.addons.premium_lighting;

    /* --- Totals --- */
    const totalMin = dMin + gst + sup + extraVC + exMin + cMin + pmMin + addons;
    const totalMax = dMax + gst + sup + extraVC + exMax + cMax + pmMax + addons;

    return {
        designCost: { min: dMin, max: dMax },
        gstOnDesign: gst,
        supervisionCost: sup,
        extraVisitsCost: extraVC,
        executionCost: { min: exMin, max: exMax },
        contingency: { min: cMin, max: cMax },
        pmFee: { min: pmMin, max: pmMax },
        addonCost: addons,
        total: { min: totalMin, max: totalMax },
    };
}

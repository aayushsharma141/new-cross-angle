// Deno.serve is the native Supabase Edge Function entrypoint - no std/http import needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
    buildCorsHeaders,
    handlePreflight,
    checkRateLimit,
    getClientId,
    rateLimitResponse,
    badRequestResponse,
    serverErrorResponse,
    okResponse,
    structuredLog,
    getRequestId,
} from "../_lib/security.ts";

// Public endpoint: rate limit generously but still protect.
const FN = "submit-estimate";
const RATE_OPTS = { bucket: "submit-estimate", max: 20, windowMs: 60_000 };

// Define default config fallback matching frontend defaults
const DEFAULT_PRICING_CONFIG = {
    design: { consultancy_rate: 250, rate_2d: 150, rate_3d: 350, supervision_monthly: 150000, free_visits: 5, extra_visit_cost: 25000 },
    city_multipliers: { metro: 1.2, tier1: 1.1, tier2: 1.0 },
    execution: {
        economy: { min: 3500, max: 4500 },
        standard: { min: 5500, max: 7500 },
        premium: { min: 8500, max: 12000 },
        luxury: { min: 15000, max: 25000 }
    },
    logic: { contingency_pct: 10, pm_pct: 8, gst_pct: 18 },
    scoring_weights: { area: 25, budget: 30, service: 20, city: 10, timeline: 15 },
    addons: { modular_kitchen: 1500000, wardrobe_per_room: 800000, false_ceiling_sqft: 450, smart_home: 2500000, custom_furniture: 5000000, premium_lighting: 1200000 }
};

function calculateEstimate(data: any, config: any) {
    const a = data.area || 0;
    const m = config.city_multipliers[data.cityTier] ?? 1.0;

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
        const tier = config.execution[data.executionTier];
        if (tier) {
            exMin = a * tier.min * m;
            exMax = a * tier.max * m;
        }
        dMin = dMax = a * config.design.rate_2d * m;
    }

    const gst = dMin * (config.logic.gst_pct / 100);
    const cMin = exMin * (config.logic.contingency_pct / 100);
    const cMax = exMax * (config.logic.contingency_pct / 100);
    const pmMin = exMin * (config.logic.pm_pct / 100);
    const pmMax = exMax * (config.logic.pm_pct / 100);

    let addons = 0;
    if (data.modularKitchen) addons += config.addons.modular_kitchen;
    if (data.wardrobes > 0) addons += data.wardrobes * config.addons.wardrobe_per_room;
    if (data.falseCeiling) addons += a * config.addons.false_ceiling_sqft;
    if (data.smartHome) addons += config.addons.smart_home;
    if (data.customFurniture) addons += config.addons.custom_furniture;
    if (data.premiumLighting) addons += config.addons.premium_lighting;

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

function scoreLead(formData: any, config: any) {
    const w = config.scoring_weights;
    let budgetScore = 0, scopeScore = 0, areaScore = 0, timelineScore = 0, cityScore = 0;

    if (formData.budgetAmount >= 5000000) budgetScore = w.budget;
    else if (formData.budgetAmount >= 2000000) budgetScore = w.budget * 0.7;
    else if (formData.budgetAmount >= 500000) budgetScore = w.budget * 0.4;
    else budgetScore = w.budget * 0.15;

    if (formData.selectedService === "C5") scopeScore = w.service;
    else if (formData.selectedService === "C4") scopeScore = w.service * 0.8;
    else if (formData.selectedService === "C3") scopeScore = w.service * 0.6;
    else if (formData.selectedService === "C2") scopeScore = w.service * 0.4;
    else scopeScore = w.service * 0.2;

    if (formData.area >= 3000) areaScore = w.area;
    else if (formData.area >= 1500) areaScore = w.area * 0.6;
    else areaScore = w.area * 0.3;

    if (formData.startTiming === "Immediate") timelineScore = w.timeline;
    else if (formData.startTiming === "1-3 Months") timelineScore = w.timeline * 0.5;
    else timelineScore = w.timeline * 0.2;

    if (formData.cityTier === "metro") cityScore = w.city;
    else if (formData.cityTier === "tier1") cityScore = w.city * 0.6;
    else cityScore = w.city * 0.3;

    const total = Math.round(budgetScore + scopeScore + areaScore + timelineScore + cityScore);
    const category = total >= 70 ? "HOT" : total >= 40 ? "WARM" : "COLD";

    return {
        total,
        category,
        breakdown: {
            budget: Math.round(budgetScore),
            scope: Math.round(scopeScore),
            area: Math.round(areaScore),
            timeline: Math.round(timelineScore),
            city: Math.round(cityScore),
            engagement: 0,
        },
    };
}

Deno.serve(async (req: Request) => {
    const preflight = handlePreflight(req);
    if (preflight) return preflight;

    const requestId = getRequestId(req);

    // Rate limit by IP before any processing
    const clientId = getClientId(req);
    const rl = await checkRateLimit(req, clientId, RATE_OPTS);
    if (rl.limited) return rateLimitResponse(req, rl, {}, FN, requestId);

    try {
        const body = await req.json();
        const { formData } = body;

        if (!formData || !formData.email || !formData.area) {
            return badRequestResponse(req, "Invalid strictly required form data", {}, requestId);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch dynamic pricing rates created by user from Admin Panel
        let pricingConfig = DEFAULT_PRICING_CONFIG;
        const { data: dbRates } = await supabase
            .from('estimate_rates')
            .select('config')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (dbRates?.config) {
            pricingConfig = { ...DEFAULT_PRICING_CONFIG, ...dbRates.config };
        }

        // Calculate true values on server, defeating client-side overrides
        const estimate = calculateEstimate(formData, pricingConfig);
        const score = scoreLead(formData, pricingConfig);

        // Single insert into unified leads table (estimate_leads merged 2026-04-11)
        const { error: errInsert } = await supabase.from("leads").insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: `Cost estimate generated. Min: ₹${estimate.total.min.toLocaleString('en-IN')}, Max: ₹${estimate.total.max.toLocaleString('en-IN')}. Area: ${formData.area} sqft, Type: ${formData.propertyType}`,
            lead_source: 'estimator',
            city: formData.city,
            budget: formData.budgetAmount?.toString(),
            service: formData.selectedService,
            score: score.total,
            score_details: score.breakdown,
            // Estimator-specific columns (merged from former estimate_leads table)
            area: formData.area,
            city_tier: formData.cityTier,
            property_type: formData.propertyType,
            state: formData.state,
            start_timing: formData.startTiming,
            estimated_min: estimate.total.min,
            estimated_max: estimate.total.max,
            lead_score: score.total,
            estimate_breakdown: {
                designCost: estimate.designCost,
                gstOnDesign: estimate.gstOnDesign,
                supervisionCost: estimate.supervisionCost,
                extraVisitsCost: estimate.extraVisitsCost,
                executionCost: estimate.executionCost,
                contingency: estimate.contingency,
                pmFee: estimate.pmFee,
                addonCost: estimate.addonCost,
            },
            internal_notes: {
                execution_tier: formData.executionTier ?? null,
                bhk: formData.bhk ?? null,
                score_category: score.category,
                score_breakdown: score.breakdown,
            },
        });

        if (errInsert) {
            structuredLog("error", FN, "Lead Insert Error", { error: errInsert.message, details: errInsert.details }, requestId);
            throw errInsert;
        }

        structuredLog("info", FN, "Lead Estimate Processed", { email: formData.email, score: score.total }, requestId);
        return okResponse(req, { success: true, estimate }, {}, rl, RATE_OPTS.max, requestId);

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Internal error";
        structuredLog("error", FN, "Critical submission failure", { error: msg }, requestId);
        return serverErrorResponse(req, msg, {}, FN, err, requestId);
    }
});

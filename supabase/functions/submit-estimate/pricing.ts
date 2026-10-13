// Pure pricing + validation for submit-estimate. No imports, so the web app can
// unit-test it against the client engine (apps/web .../estimator-parity.test.ts).

// Define default config fallback matching frontend defaults
export const DEFAULT_PRICING_CONFIG = {
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

// Admin config may be partial; a shallow spread would replace whole nested
// objects (e.g. design) and leave missing keys undefined -> NaN totals.
export function mergeConfig(base: any, override: any): any {
    if (!override || typeof override !== "object" || Array.isArray(override)) return base;
    const out: any = Array.isArray(base) ? [...base] : { ...base };
    for (const [k, v] of Object.entries(override)) {
        const b = (base as any)?.[k];
        if (v && typeof v === "object" && !Array.isArray(v) && b && typeof b === "object" && !Array.isArray(b)) {
            out[k] = mergeConfig(b, v);
        } else if (v !== null && v !== undefined) {
            out[k] = v;
        }
    }
    return out;
}

const SERVICES = new Set(["C1", "C2", "C3", "C4", "C5"]);
const CITY_TIERS = new Set(["metro", "tier1", "tier2"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const str = (v: unknown, max: number): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t ? t.slice(0, max) : null;
};
const num = (v: unknown, min: number, max: number): number | null => {
    const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
    return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max ? n : null;
};

// Public endpoint writing with the service role: accept only well-formed values.
// Bounds are deliberately looser than the calculator UI so no real submission is refused.
export function sanitizeFormData(raw: any, config: any): { data?: any; error?: string } {
    if (!raw || typeof raw !== "object") return { error: "Missing form data" };
    const email = str(raw.email, 254)?.toLowerCase() ?? null;
    if (!email || !EMAIL_RE.test(email)) return { error: "A valid email is required" };
    const name = str(raw.name, 120);
    if (!name) return { error: "Name is required" };
    const area = num(raw.area, 50, 100000);
    if (area === null) return { error: "Area must be between 50 and 100,000 sq ft" };
    const selectedService = typeof raw.selectedService === "string" && SERVICES.has(raw.selectedService) ? raw.selectedService : null;
    if (!selectedService) return { error: "Unknown service" };
    let executionTier: string | null = null;
    if (selectedService === "C5") {
        executionTier = typeof raw.executionTier === "string" && Object.prototype.hasOwnProperty.call(config.execution ?? {}, raw.executionTier)
            ? raw.executionTier : null;
        if (!executionTier) return { error: "Unknown execution tier" };
    }
    const phone = str(raw.phone, 32);
    if (phone && !/^[+\d\s().-]+$/.test(phone)) return { error: "Invalid phone number" };

    return {
        data: {
            name,
            email,
            phone,
            area,
            selectedService,
            executionTier,
            cityTier: typeof raw.cityTier === "string" && CITY_TIERS.has(raw.cityTier) ? raw.cityTier : "tier2",
            city: str(raw.city, 100),
            state: str(raw.state, 100),
            propertyType: str(raw.propertyType, 60),
            startTiming: str(raw.startTiming, 60),
            bhk: str(raw.bhk, 20),
            budgetAmount: num(raw.budgetAmount, 0, 10_000_000_000) ?? 0,
            projectMonths: num(raw.projectMonths, 1, 60) ?? 3,
            extraVisits: num(raw.extraVisits, 0, 100) ?? 0,
            wardrobes: Math.floor(num(raw.wardrobes, 0, 50) ?? 0),
            modularKitchen: raw.modularKitchen === true,
            falseCeiling: raw.falseCeiling === true,
            smartHome: raw.smartHome === true,
            customFurniture: raw.customFurniture === true,
            premiumLighting: raw.premiumLighting === true,
        },
    };
}

export function calculateEstimate(data: any, config: any) {
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

export function scoreLead(formData: any, config: any) {
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

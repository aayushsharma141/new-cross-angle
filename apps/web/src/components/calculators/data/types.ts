/* ═══════════════════════════════════════════════
   Interior Cost Estimator — Type Definitions
   Aligned with InteriorCostEstimator_1.jsx reference
   ═══════════════════════════════════════════════ */

/** Property types available for estimation */
export type PropertyType =
    | "apartment"
    | "villa"
    | "office"
    | "independent_floor"
    | "turnkey"
    | "renovation";

/** City tier for pricing multiplier */
export type CityTier = "metro" | "tier1" | "tier2";

/** Service tier IDs */
export type ServiceId = "C1" | "C2" | "C3" | "C4" | "C5";

/** Execution tier IDs for C5 */
export type ExecutionTierId = "economy" | "standard" | "premium" | "luxury";

/** Timeline urgency options */
export type TimelineOption = "Immediate" | "1-3 Months" | "3+ Months";

/** Budget tier classification */
export type BudgetTier = "Budget" | "Standard" | "Premium" | "Luxury";

/** Lead temperature classification */
export type LeadCategory = "HOT" | "WARM" | "COLD";

/** Min/max number pair */
export interface Range {
    min: number;
    max: number;
}

/* ─── Pricing Config (admin-adjustable) ─── */

export interface PricingConfig {
    design: {
        consultancy_rate: number; // C1 rate/sqft
        rate_2d: number;          // C2 rate/sqft
        rate_3d: number;          // C3 rate/sqft
        supervision_monthly: number; // C4 monthly
        free_visits: number;
        extra_visit_cost: number;
    };
    city_multipliers: Record<CityTier, number>;
    execution: Record<ExecutionTierId, Range>;
    logic: {
        contingency_pct: number;
        pm_pct: number;
        gst_pct: number;
    };
    scoring_weights: {
        area: number;
        budget: number;
        service: number;
        city: number;
        timeline: number;
    };
    addons: {
        modular_kitchen: number;
        wardrobe_per_room: number;
        false_ceiling_sqft: number;
        smart_home: number;
        custom_furniture: number;
        premium_lighting: number;
    };
}

/* ─── Form Data (all 7 steps) ─── */

export interface CalculatorFormData {
    // Step 1 — Property Type
    propertyType: PropertyType | null;

    // Step 2 — Property Details
    bhk: string | null;
    area: number;
    stage: string | null;
    floors: number;
    floorNumber: string | null;
    // Room configuration
    livingRooms: number;
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    kitchen: number;
    balconies: number;
    // Villa amenities
    hasPool: boolean;
    hasGarden: boolean;
    hasGym: boolean;
    hasHomeTheater: boolean;
    hasServantQuarters: boolean;
    hasCoveredParking: boolean;
    // Office sections
    cabins: number;
    conferenceRooms: number;
    hasReception: boolean;
    hasPantry: boolean;
    hasServerRoom: boolean;
    hasTrainingRoom: boolean;
    hasLounge: boolean;
    // Renovation
    renovationScope: string | null;
    renovationRooms: string[];
    renovationPropertyType: string | null;

    // Step 3 — Location
    state: string;
    city: string;
    cityTier: CityTier;

    // Step 4 — Budget
    budgetAmount: number;
    budgetPreset: string;

    // Step 5 — Scope of Services
    selectedService: ServiceId | null;
    executionTier: ExecutionTierId | null;

    // Step 6 — Add-ons
    modularKitchen: boolean;
    wardrobes: number;
    falseCeiling: boolean;
    smartHome: boolean;
    customFurniture: boolean;
    premiumLighting: boolean;

    // Step 7 — Timeline & Contact
    startTiming: string | null;
    projectMonths: number;
    extraVisits: number;
    name: string;
    email: string;
    phone: string;
}

/* ─── Estimate Result ─── */

export interface EstimateResult {
    designCost: Range;
    gstOnDesign: number;
    supervisionCost: number;
    extraVisitsCost: number;
    executionCost: Range;
    contingency: Range;
    pmFee: Range;
    addonCost: number;
    total: Range;
}

/* ─── Lead Scoring ─── */

export interface LeadScore {
    total: number;
    category: LeadCategory;
    breakdown: {
        budget: number;
        scope: number;
        area: number;
        timeline: number;
        city: number;
        engagement: number;
    };
}

/** Stored lead record */
export interface LeadRecord {
    id: string;
    timestamp: string;
    formData: CalculatorFormData;
    estimate: EstimateResult;
    score: LeadScore;
}

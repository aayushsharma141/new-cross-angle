/* ═══════════════════════════════════════════════
   Interior Cost Estimator — Pricing Config & Constants
   All rates, tiers, locations, services, add-ons
   ═══════════════════════════════════════════════ */

import type { PricingConfig, CityTier } from "./types";

/* ─── Theme tokens (used by components) ─── */

export const THEME = {
    RED: "#c62828",
    RED_LIGHT: "#ef5350",
    BG: "#0d0d0d",
    CARD: "#161616",
    CARD2: "#1e1e1e",
    BORDER: "#2a2a2a",
    BORDER2: "#333",
    TEXT: "#f5f5f5",
    MUTED: "#777",
    MUTED2: "#999",
    GREEN: "#43a047",
    AMBER: "#fb8c00",
    GOLD: "#f4a261",
} as const;

/* ─── Property Types ─── */

export const PROPERTY_TYPES = [
    { id: "apartment" as const, label: "Apartment", icon: "🏢", desc: "Flat in a multi-storey building" },
    { id: "villa" as const, label: "Villa", icon: "🏡", desc: "Independent villa with private amenities" },
    { id: "office" as const, label: "Office", icon: "💼", desc: "Commercial workspace or office floor" },
    { id: "independent_floor" as const, label: "Independent Floor", icon: "🏘️", desc: "Single floor of an independent building" },
    { id: "turnkey" as const, label: "Turnkey Project", icon: "🔑", desc: "Complete build from scratch, fully managed" },
    { id: "renovation" as const, label: "Renovation", icon: "🔨", desc: "Revamp & redesign existing space" },
];

/* ─── BHK Presets ─── */

export const BHK_PRESETS: Record<string, {
    bedrooms: number; bathrooms: number; livingRooms: number;
    kitchen: number; balconies: number; toilets: number; suggestedArea: number;
}> = {
    "1 BHK": { bedrooms: 1, bathrooms: 1, livingRooms: 1, kitchen: 1, balconies: 1, toilets: 0, suggestedArea: 500 },
    "2 BHK": { bedrooms: 2, bathrooms: 2, livingRooms: 1, kitchen: 1, balconies: 1, toilets: 0, suggestedArea: 900 },
    "3 BHK": { bedrooms: 3, bathrooms: 3, livingRooms: 1, kitchen: 1, balconies: 2, toilets: 1, suggestedArea: 1400 },
    "4 BHK": { bedrooms: 4, bathrooms: 4, livingRooms: 1, kitchen: 1, balconies: 2, toilets: 1, suggestedArea: 2000 },
    "5+ BHK": { bedrooms: 5, bathrooms: 5, livingRooms: 2, kitchen: 1, balconies: 3, toilets: 1, suggestedArea: 3000 },
};

export const VILLA_BHK: Record<string, {
    bedrooms: number; bathrooms: number; livingRooms: number;
    kitchen: number; balconies: number; toilets: number; suggestedArea: number;
}> = {
    "3 BHK": { bedrooms: 3, bathrooms: 3, livingRooms: 1, kitchen: 1, balconies: 2, toilets: 1, suggestedArea: 2500 },
    "4 BHK": { bedrooms: 4, bathrooms: 4, livingRooms: 2, kitchen: 1, balconies: 3, toilets: 2, suggestedArea: 3500 },
    "5 BHK": { bedrooms: 5, bathrooms: 5, livingRooms: 2, kitchen: 2, balconies: 4, toilets: 2, suggestedArea: 5000 },
    "6+ BHK": { bedrooms: 6, bathrooms: 6, livingRooms: 3, kitchen: 2, balconies: 4, toilets: 2, suggestedArea: 7000 },
};

/* ─── Renovation ─── */

export const RENOVATION_STAGES = [
    { id: "full", label: "Full Renovation", desc: "Complete overhaul of all spaces" },
    { id: "partial", label: "Partial Renovation", desc: "Selected areas to be renovated" },
    { id: "room", label: "Room-by-Room", desc: "Choose specific rooms to renovate" },
];

export const RENOVATION_ROOMS = [
    "Living Room", "Master Bedroom", "Bedroom 2", "Bedroom 3", "Kitchen",
    "Master Bathroom", "Bathroom 2", "Guest Toilet", "Balcony", "Dining Area",
    "Study / Home Office", "Puja Room", "Servant Room", "Store Room",
];

/* ─── Project Stages per property type ─── */

export const PROJECT_STAGES_MAP: Record<string, { id: string; l: string; d: string }[]> = {
    apartment: [
        { id: "bare_shell", l: "Bare Shell", d: "Raw empty space, no finishes" },
        { id: "under_construction", l: "Under Construction", d: "Structural work ongoing" },
        { id: "ready_to_move", l: "Ready to Move / Redesign", d: "Existing space to redesign" },
    ],
    villa: [
        { id: "bare_shell", l: "Bare Shell", d: "Raw empty space, no finishes" },
        { id: "structure_complete", l: "Structure Complete", d: "Construction done, interiors pending" },
        { id: "renovation", l: "Renovation", d: "Existing villa to redesign" },
    ],
    office: [
        { id: "shell", l: "Shell Office", d: "Empty shell, no fitouts" },
        { id: "warm_shell", l: "Warm Shell", d: "Basic fitouts in place" },
        { id: "renovation", l: "Renovation", d: "Existing office to redesign" },
    ],
    independent_floor: [
        { id: "bare_shell", l: "Bare Shell", d: "Raw empty space" },
        { id: "under_construction", l: "Under Construction", d: "Structural work ongoing" },
        { id: "ready_to_move", l: "Ready to Move / Redesign", d: "Existing space to redesign" },
    ],
    turnkey: [
        { id: "new_build", l: "Brand New Build", d: "Starting from scratch" },
        { id: "existing_structure", l: "Existing Structure", d: "Build upon existing shell" },
    ],
};

/* ─── Location Data (state → city → tier) ─── */

export const LOCATION_DATA: Record<string, Record<string, CityTier>> = {
    "Andhra Pradesh": { "Visakhapatnam": "tier1", "Vijayawada": "tier1", "Guntur": "tier2", "Tirupati": "tier2", "Kakinada": "tier2", "Rajahmundry": "tier2", "Nellore": "tier2" },
    "Assam": { "Guwahati": "tier1", "Dibrugarh": "tier2", "Silchar": "tier2", "Jorhat": "tier2", "Nagaon": "tier2" },
    "Bihar": { "Patna": "tier1", "Gaya": "tier2", "Bhagalpur": "tier2", "Muzaffarpur": "tier2", "Darbhanga": "tier2" },
    "Chandigarh": { "Chandigarh": "tier1" },
    "Chhattisgarh": { "Raipur": "tier1", "Bhilai": "tier2", "Bilaspur": "tier2", "Korba": "tier2" },
    "Delhi / NCR": { "New Delhi": "metro", "Delhi": "metro", "Noida": "metro", "Gurugram": "metro", "Faridabad": "tier1", "Ghaziabad": "tier1", "Greater Noida": "metro" },
    "Goa": { "Panaji": "tier1", "Margao": "tier2", "Vasco": "tier2", "Mapusa": "tier2" },
    "Gujarat": { "Ahmedabad": "tier1", "Surat": "tier1", "Vadodara": "tier1", "Rajkot": "tier2", "Gandhinagar": "tier1", "Bhavnagar": "tier2", "Jamnagar": "tier2" },
    "Haryana": { "Gurugram": "metro", "Faridabad": "tier1", "Panipat": "tier2", "Ambala": "tier2", "Rohtak": "tier2", "Karnal": "tier2" },
    "Himachal Pradesh": { "Shimla": "tier2", "Manali": "tier2", "Dharamsala": "tier2", "Solan": "tier2", "Mandi": "tier2" },
    "Jharkhand": { "Ranchi": "tier1", "Jamshedpur": "tier2", "Dhanbad": "tier2", "Bokaro": "tier2", "Deoghar": "tier2" },
    "Karnataka": { "Bangalore": "metro", "Mysore": "tier1", "Mangalore": "tier1", "Hubli": "tier2", "Belagavi": "tier2", "Davangere": "tier2", "Tumkur": "tier2", "Udupi": "tier2" },
    "Kerala": { "Kochi": "tier1", "Thiruvananthapuram": "tier1", "Kozhikode": "tier1", "Thrissur": "tier2", "Kollam": "tier2", "Palakkad": "tier2", "Kannur": "tier2" },
    "Madhya Pradesh": { "Bhopal": "tier1", "Indore": "tier1", "Gwalior": "tier2", "Jabalpur": "tier2", "Ujjain": "tier2", "Sagar": "tier2" },
    "Maharashtra": { "Mumbai": "metro", "Pune": "metro", "Nagpur": "tier1", "Nashik": "tier1", "Thane": "metro", "Navi Mumbai": "metro", "Aurangabad": "tier2", "Solapur": "tier2", "Kolhapur": "tier2", "Amravati": "tier2" },
    "Manipur": { "Imphal": "tier2", "Thoubal": "tier2", "Bishnupur": "tier2" },
    "Meghalaya": { "Shillong": "tier2", "Tura": "tier2" },
    "Mizoram": { "Aizawl": "tier2", "Lunglei": "tier2", "Serchhip": "tier2", "Champhai": "tier2" },
    "Nagaland": { "Kohima": "tier2", "Dimapur": "tier2" },
    "Odisha": { "Bhubaneswar": "tier1", "Cuttack": "tier2", "Rourkela": "tier2", "Brahmapur": "tier2", "Sambalpur": "tier2" },
    "Punjab": { "Ludhiana": "tier1", "Amritsar": "tier1", "Jalandhar": "tier1", "Patiala": "tier2", "Bathinda": "tier2", "Mohali": "tier1" },
    "Rajasthan": { "Jaipur": "tier1", "Jodhpur": "tier1", "Udaipur": "tier1", "Kota": "tier2", "Ajmer": "tier2", "Bikaner": "tier2", "Alwar": "tier2" },
    "Sikkim": { "Gangtok": "tier2", "Namchi": "tier2" },
    "Tamil Nadu": { "Chennai": "metro", "Coimbatore": "tier1", "Madurai": "tier1", "Tiruchirappalli": "tier2", "Salem": "tier2", "Tirunelveli": "tier2", "Vellore": "tier2", "Erode": "tier2" },
    "Telangana": { "Hyderabad": "metro", "Warangal": "tier1", "Nizamabad": "tier2", "Karimnagar": "tier2", "Khammam": "tier2" },
    "Tripura": { "Agartala": "tier2", "Dharmanagar": "tier2" },
    "Uttar Pradesh": { "Lucknow": "tier1", "Kanpur": "tier1", "Agra": "tier1", "Varanasi": "tier1", "Meerut": "tier1", "Prayagraj": "tier1", "Noida": "metro", "Ghaziabad": "tier1", "Bareilly": "tier2", "Moradabad": "tier2", "Gorakhpur": "tier2" },
    "Uttarakhand": { "Dehradun": "tier1", "Haridwar": "tier2", "Rishikesh": "tier2", "Roorkee": "tier2", "Nainital": "tier2", "Haldwani": "tier2" },
    "West Bengal": { "Kolkata": "metro", "Howrah": "tier1", "Durgapur": "tier2", "Asansol": "tier2", "Siliguri": "tier1", "Bardhaman": "tier2" },
};

/* ─── City Tier info ─── */

export const TIERS: Record<CityTier, { label: string; multiplier: number; color: string }> = {
    metro: { label: "Metro City", multiplier: 1.2, color: "#ef5350" },
    tier1: { label: "Tier-1 City", multiplier: 1.1, color: "#f4a261" },
    tier2: { label: "Tier-2 City", multiplier: 1.0, color: "#80cbc4" },
};

/* ─── Services (C1–C5) ─── */

export interface ServiceDef {
    id: "C1" | "C2" | "C3" | "C4" | "C5";
    label: string;
    rateLabel: string;
    rate: number | null;
    gst: boolean;
    desc: string;
    includes: string[];
    excludes?: string[];
    revisions?: string;
    timeline?: string;
    payment?: string;
    extras?: string;
    supervisionRate?: number;
    tiers?: Record<string, { min: number; max: number; label: string; desc: string }>;
}

export interface AddonDef {
    id: string;
    label: string;
    icon: string;
    cost: number;
    unit: "flat" | "per_sqft" | "per_room";
    desc: string;
}

export const SERVICES: ServiceDef[] = [
    {
        id: "C1", label: "Design Direction", rateLabel: "₹250 / sq ft",
        rate: 250, gst: true,
        desc: "Strategic creative direction and aesthetic curation for the discerning client.",
        includes: ["Concept narrative & moodboards", "Spatial flow strategy", "Material selection curation", "Art & artifact advisory", "Lighting philosophy"],
        excludes: ["Technical drawings", "Procurement", "Site management"],
        revisions: "2 rounds", timeline: "3–4 weeks", payment: "100% retainer",
    },
    {
        id: "C2", label: "Architectural Planning", rateLabel: "₹150 / sq ft",
        rate: 150, gst: true,
        desc: "Precision technical planning and layout optimization for seamless execution.",
        includes: ["General Arrangement Drawings (GAD)", "Furniture placement layouts", "MEP (Services) coordination", "Civil modification plans"],
        excludes: ["3D visualization", "Material procurement"],
        revisions: "3 rounds", timeline: "4–6 weeks", payment: "50% advance / 50% completion",
    },
    {
        id: "C3", label: "Immersive Visualization", rateLabel: "₹350 / sq ft",
        rate: 350, gst: true,
        desc: "Photorealistic 3D visualization to experience your residence before construction.",
        includes: ["Full 3D modeled environment", "Material & lighting simulation", "Day/Night ambience checks", "VR/Walkthrough assets"],
        excludes: ["BOQ generation", "Execution supervision"],
        revisions: "Unlimited during concept phase", timeline: "6–8 weeks", payment: "40% / 40% / 20%",
    },
    {
        id: "C4", label: "Design & Project Stewardship", rateLabel: "Design fee + ₹1.5L/mo",
        rate: 350, gst: true, supervisionRate: 150000,
        desc: "Comprehensive design documentation with white-glove project oversight.",
        includes: ["All Design & 3D Deliverables", "Detailed GFC (Good for Construction) drawings", "Vendor & contractor selection", "Regular site quality audits", "Material quality checks"],
        extras: "Senior Principle visits: Included",
        timeline: "Project dependent", payment: "Retainer + Milestone based",
    },
    {
        id: "C5", label: "White Glove Commission", rateLabel: "Legacy Tier",
        rate: null, gst: false,
        desc: "The ultimate engagement. End-to-end creation of a bespoke residence, fully managed.",
        includes: ["Full-service Architecture & Interior", "Global procurement (Italy/Germany)", "Art curation", "Concierge move-in service", "Post-handover estate management"],
        tiers: {
            economy: { min: 3500, max: 4500, label: "Essential", desc: "Refined basics for secondary homes." },
            standard: { min: 5500, max: 7500, label: "Premium", desc: "High-spec finishes and branded fittings." },
            premium: { min: 8500, max: 12000, label: "Luxury", desc: "Imported marble, veneer, and automation." },
            luxury: { min: 15000, max: 25000, label: "Legacy", desc: "Museum-grade finishes, rare materials." },
        },
    },
];

/* ─── Add-ons (Bespoke Commissions) ─── */

export const ADDONS: AddonDef[] = [
    { id: "modularKitchen", label: "Chef's Kitchen", icon: "🍳", cost: 1500000, unit: "flat", desc: "German/Italian cabinetry with integrated appliances." },
    { id: "wardrobes", label: "Couture Storage", icon: "🚪", cost: 800000, unit: "per_room", desc: "Walk-in dressing systems with climate control." },
    { id: "falseCeiling", label: "Architectural Lighting", icon: "✨", cost: 450, unit: "per_sqft", desc: "Automation-ready cove & profile lighting channels." },
    { id: "smartHome", label: "Home Automation", icon: "📱", cost: 2500000, unit: "flat", desc: "Full KnX/Crestron integration for lights, HVAC, & A/V." },
    { id: "customFurniture", label: "Bespoke Joinery", icon: "🛋️", cost: 5000000, unit: "flat", desc: "Custom-commissioned furniture pieces & wall paneling." },
    { id: "premiumLighting", label: "Curated Fixtures", icon: "💡", cost: 1200000, unit: "flat", desc: "Imported chandeliers and gallery-grade track lights." },
];

/* ─── Default Pricing Config ─── */

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
    design: {
        consultancy_rate: 250, // Was 10
        rate_2d: 150, // Was 30
        rate_3d: 350, // Was 50
        supervision_monthly: 150000, // Was 30k
        free_visits: 5,
        extra_visit_cost: 25000, // Was 5k
    },
    city_multipliers: {
        metro: 1.2,
        tier1: 1.1,
        tier2: 1.0,
    },
    execution: {
        economy: { min: 3500, max: 4500 }, // "Essential" (was Economy)
        standard: { min: 5500, max: 7500 }, // "Premium" (was Standard)
        premium: { min: 8500, max: 12000 }, // "Luxury" (was Premium)
        luxury: { min: 15000, max: 25000 }, // "Legacy/Ultra-Luxury" (was Luxury)
    },
    logic: {
        contingency_pct: 10,
        pm_pct: 8, // Higher for luxury PM
        gst_pct: 18,
    },
    scoring_weights: {
        area: 25,
        budget: 30, // We'll map this to 'investment' in UI
        service: 20,
        city: 10,
        timeline: 15,
    },
    addons: {
        modular_kitchen: 1500000, // ₹15L (was ₹1.8L) - "Chef's Kitchen"
        wardrobe_per_room: 800000, // ₹8L (was ₹45k) - "Walk-in Dressing"
        false_ceiling_sqft: 450, // Was 120 - "Architectural Lighting"
        smart_home: 2500000, // ₹25L (was ₹85k) - "Integrated Automation"
        custom_furniture: 5000000, // ₹50L (was ₹2L) - "Bespoke Joinery"
        premium_lighting: 1200000, // ₹12L (was ₹75k) - "Curated Fixtures"
    },
};

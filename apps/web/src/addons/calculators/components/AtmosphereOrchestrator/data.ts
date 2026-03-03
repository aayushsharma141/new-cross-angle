
export const ROOM_STANDARDS: Record<string, { lux: number; label: string; image: string; description: string }> = {
    living: {
        lux: 200,
        label: "Living Room",
        description: "Social & Relaxation",
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop"
    },
    kitchen: {
        lux: 450,
        label: "Kitchen",
        description: "Cooking & Precision Task",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop"
    },
    bedroom: {
        lux: 150,
        label: "Bedroom",
        description: "Rest & Intimacy",
        image: "https://images.unsplash.com/photo-1616594039964-40809119bd54?q=80&w=1000&auto=format&fit=crop"
    },
    gallery: {
        lux: 600,
        label: "Home Office / Art",
        description: "Focus & Detail",
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop"
    }
};

export const MOODS = [
    { id: 'warm', label: 'Intimate', kelvin: 2700, description: 'Cozy, relaxing, social', color: 'bg-orange-400' },
    { id: 'neutral', label: 'Balanced', kelvin: 3500, description: 'Clean, natural, welcoming', color: 'bg-amber-100' },
    { id: 'cool', label: 'Focus', kelvin: 5000, description: 'Alert, crisp, energetic', color: 'bg-sky-200' },
    { id: 'dramatic', label: 'Luxury', kelvin: 3000, description: 'High contrast, theatrical', color: 'bg-purple-400' },
];

export const LIGHTING_MARKET_DATA = {
    economy: {
        id: "economy",
        label: "Functional Standard",
        priceTier: "Budget",
        brands: ["Philips", "Wipro"],
        specs: { cri: "80+", glare: "High", lifespan: "25k Hrs" },
        financials: { fixtureCost: 1250, driverCost: 0, installRate: 350 },
        lumensPerWatt: 100,
        impact: {
            visual: 65,
            energy: "₹1,800/yr",
            maintenance: "Medium",
            flexibility: "Low"
        },
        description: "Standard lighting. Gets the job done, but lacks depth."
    },
    premium: {
        id: "premium",
        label: "Architectural Premium",
        priceTier: "Value",
        brands: ["Hybec", "Tisva"],
        specs: { cri: "92+", glare: "Low", lifespan: "50k Hrs" },
        financials: { fixtureCost: 3800, driverCost: 850, installRate: 650 },
        lumensPerWatt: 90,
        impact: {
            visual: 88,
            energy: "₹2,100/yr",
            maintenance: "Low",
            flexibility: "Medium"
        },
        description: "The sweet spot. Great colors, no eye strain, long life."
    },
    luxury: {
        id: "luxury",
        label: "International Luxury",
        priceTier: "Investment",
        brands: ["Flos", "Erco"],
        specs: { cri: "97+", glare: "Zero", lifespan: "70k+ Hrs" },
        financials: { fixtureCost: 18500, driverCost: 4500, installRate: 2500 },
        lumensPerWatt: 80,
        impact: {
            visual: 98,
            energy: "₹2,400/yr",
            maintenance: "Zero",
            flexibility: "High"
        },
        description: "Gallery grade. Perfect for art, expensive fabrics, and drama."
    }
};

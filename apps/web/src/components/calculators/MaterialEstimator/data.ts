
export interface MaterialData {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    color: string;
    image: string; // URL for the zoom view
    risk: {
        level: 'Low' | 'Medium' | 'High';
        label: string;
        color: string;
        factors: string[]; // e.g., ["Scratch Prone", "Liquid Porosity"]
    };
    lifecycle: {
        maintenancePerYear: number; // Cost per sqft/year
        refinishingPeriod: number; // Years between refinishing
        refinishingCost: number; // Cost to refinish
        durabilityScore: number; // 0-100
    };
    wastage: {
        percent: number; // e.g., 0.15 for 15%
        transportCost: number; // Flat or per sqft
    };
}

export const MATERIALS: MaterialData[] = [
    {
        id: 'marble',
        name: 'Italian Statuario Marble',
        description: 'The epitome of luxury, but demands care.',
        price: 450, // INR approx for high grade
        unit: 'sqft',
        color: 'bg-stone-100',
        image: 'https://images.unsplash.com/photo-1599692697848-113aa0d268d6?q=80&w=1000&auto=format&fit=crop',
        risk: {
            level: 'High',
            label: 'High Maintenance',
            color: 'bg-red-500',
            factors: ['Acids Etch Surface', 'Porous: Stains Easily', 'Requires Sealing']
        },
        lifecycle: {
            maintenancePerYear: 25, // Polishing/Sealing
            refinishingPeriod: 3,
            refinishingCost: 60,
            durabilityScore: 65
        },
        wastage: {
            percent: 0.18, // High wastage due to pattern matching
            transportCost: 40
        }
    },
    {
        id: 'teak',
        name: 'Burma Teak (Reclaimed)',
        description: 'Timeless warmth that ages beautifully.',
        price: 650,
        unit: 'sqft',
        color: 'bg-amber-900',
        image: 'https://images.unsplash.com/photo-1543444634-19266782245b?q=80&w=1000&auto=format&fit=crop',
        risk: {
            level: 'Medium',
            label: 'Moderate Care',
            color: 'bg-amber-500',
            factors: ['Sensitivity to Humidity', 'Requires Oiling', 'Scratch Patina']
        },
        lifecycle: {
            maintenancePerYear: 15,
            refinishingPeriod: 5,
            refinishingCost: 45,
            durabilityScore: 85
        },
        wastage: {
            percent: 0.12,
            transportCost: 25
        }
    },
    {
        id: 'tiles',
        name: 'GVT Large Format TIles',
        description: 'Zero maintenance, industrial durability.',
        price: 180,
        unit: 'sqft',
        color: 'bg-zinc-200',
        image: 'https://images.unsplash.com/photo-1620613909770-4f593f6ae45d?q=80&w=1000&auto=format&fit=crop',
        risk: {
            level: 'Low',
            label: 'Investment Grade',
            color: 'bg-emerald-500',
            factors: ['Zero Porosity', 'Impact Resistant', 'No Sealing Needed']
        },
        lifecycle: {
            maintenancePerYear: 2, // Just cleaning
            refinishingPeriod: 0,
            refinishingCost: 0,
            durabilityScore: 98
        },
        wastage: {
            percent: 0.08,
            transportCost: 15
        }
    },
    {
        id: 'microcement',
        name: 'Seamless Microcement',
        description: 'Unified, minimal aesthetic.',
        price: 320,
        unit: 'sqft',
        color: 'bg-stone-300',
        image: 'https://images.unsplash.com/photo-1594901047648-5c46e033e5ee?q=80&w=1000&auto=format&fit=crop',
        risk: {
            level: 'Medium',
            label: 'Craft Sensitive',
            color: 'bg-amber-500',
            factors: ['Hairline Cracks Risk', 'Applicator Dependent', 'Stain Resistant']
        },
        lifecycle: {
            maintenancePerYear: 10,
            refinishingPeriod: 7,
            refinishingCost: 80,
            durabilityScore: 80
        },
        wastage: {
            percent: 0.05, // Applied in situ
            transportCost: 20
        }
    },
];

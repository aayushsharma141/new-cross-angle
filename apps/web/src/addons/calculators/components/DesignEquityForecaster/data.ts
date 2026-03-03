
export interface ZoneROI {
    id: string;
    label: string;
    recoverability: number; // 0-1.0 (e.g., 0.85 for 85%)
    impactScore: number; // 1-10, Visual impact on buyer
    description: string;
    avgCostPerSqFt: number;
}

export const ZONES: ZoneROI[] = [
    {
        id: 'kitchen',
        label: 'Gourmet Kitchen',
        recoverability: 0.85,
        impactScore: 9,
        description: "High-value asset. Emotional heart of the home.",
        avgCostPerSqFt: 3500
    },
    {
        id: 'master',
        label: 'Master Sanctuary',
        recoverability: 0.75,
        impactScore: 8,
        description: "Personal wellness retreat.",
        avgCostPerSqFt: 2800
    },
    {
        id: 'living',
        label: 'Social Lounge',
        recoverability: 0.60,
        impactScore: 9,
        description: "Primary visual theatre for guests.",
        avgCostPerSqFt: 2200
    },
    {
        id: 'bath',
        label: 'Spa Bathrooms',
        recoverability: 0.80,
        impactScore: 7,
        description: "Hygiene & luxury indicators.",
        avgCostPerSqFt: 3200
    },
];

export const APPRECIATION_RATES = {
    standard: 0.04, // 4% annual market appreciation
    designed: 0.07, // 7% annual appreciation for designer homes (The "Premium")
};

export const TIME_HORIZONS = [
    { value: 0, label: 'Today' },
    { value: 3, label: '3 Years' },
    { value: 5, label: '5 Years' },
    { value: 10, label: '10 Years' },
];

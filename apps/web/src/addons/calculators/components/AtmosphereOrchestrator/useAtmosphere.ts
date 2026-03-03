import { useState, useMemo } from 'react';
import { ROOM_STANDARDS, LIGHTING_MARKET_DATA, MOODS } from './data';

export const useAtmosphere = () => {
    const [inputs, setInputs] = useState({
        roomType: 'living',
        area: 400, // sqft
        height: 'standard', // standard | double
        mood: 'warm', // warm | neutral | cool | dramatic
        intensity: 75, // New "Arc" slider (0-100)
        tier: 'premium',
        marketScenario: 'stable' // stable | inflation | energy_spike
    });

    const stats = useMemo(() => {
        const standard = ROOM_STANDARDS[inputs.roomType];
        const tierData = LIGHTING_MARKET_DATA[inputs.tier as keyof typeof LIGHTING_MARKET_DATA];
        const activeMood = MOODS.find(m => m.id === inputs.mood) || MOODS[0];

        // 1. Calculate Multipliers
        const heightFactor = inputs.height === 'double' ? 2.4 : 1.0;

        // Intensity Factor: How much "juice" is the user asking for?
        // 50% = Standard Lux, 100% = 1.5x Lux (Bright/Dramatic)
        const intensityFactor = 0.5 + (inputs.intensity / 100);

        // 2. Core Physics
        const requiredLumens = inputs.area * standard.lux * heightFactor * intensityFactor;
        const totalWattage = requiredLumens / tierData.lumensPerWatt;
        const fixtureCount = Math.ceil(requiredLumens / 1000);

        // 3. Financials
        const materialCost = fixtureCount * tierData.financials.fixtureCost;
        const driverCost = fixtureCount * tierData.financials.driverCost;
        const installCost = fixtureCount * tierData.financials.installRate;

        const initialInvestment = materialCost + driverCost + installCost;

        // 4. Sensitivity & Lifecycle
        // Annual Energy Cost = Watts * Hours/Day * Days * Rate
        // Assuming 6 hours/day usage approx.
        const kwhPerYear = (totalWattage * 6 * 365) / 1000;
        let energyRate = 12; // Base INR/kWh

        if (inputs.marketScenario === 'energy_spike') energyRate *= 1.5;

        const annualEnergyCost = kwhPerYear * energyRate;

        // 5-Year Projection
        let inflationRate = 1.05; // 5% base
        if (inputs.marketScenario === 'inflation') inflationRate = 1.10;

        // Simple 5-year running cost (Energy + Maintenance)
        // Maintenance assumed at 5% of fixture cost annually after year 2
        let fiveYearRunningCost = 0;
        for (let i = 1; i <= 5; i++) {
            fiveYearRunningCost += annualEnergyCost * Math.pow(inflationRate, i - 1);
            if (i > 2) {
                fiveYearRunningCost += (materialCost * (tierData.id === 'economy' ? 0.08 : 0.02)) * Math.pow(inflationRate, i - 1);
            }
        }

        return {
            lumens: Math.round(requiredLumens),
            wattage: Math.round(totalWattage),
            fixtureCount,
            kelvin: activeMood.kelvin,
            costs: {
                total: initialInvestment,
                annualEnergy: Math.round(annualEnergyCost),
                fiveYearTotal: Math.round(initialInvestment + fiveYearRunningCost)
            },
            impact: tierData.impact,
            recommendation: standard.label,
            tierLabel: tierData.label
        };
    }, [inputs]);

    return { inputs, setInputs, stats };
};

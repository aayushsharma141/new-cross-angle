"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAtmosphere } from '../../calculators/AtmosphereOrchestrator/useAtmosphere';
import { MATERIALS } from '../../calculators/MaterialEstimator/data';

export type StudioTab = 'atmosphere' | 'investment' | 'strategy' | 'report';

interface StudioState {
    activeTab: StudioTab;
    setActiveTab: (tab: StudioTab) => void;

    // Integrated Modules
    atmosphere: ReturnType<typeof useAtmosphere>;

    // Material Module State
    selectedMaterialId: string;
    setSelectedMaterialId: (id: string) => void;

    // Strategy Module State
    timeHorizon: number; // Years
    setTimeHorizon: (years: number) => void;
    propertyValue: number; // Base Property Value
    setPropertyValue: (value: number) => void;

    // Global Settings
    projectArea: number; // sqft
    setProjectArea: (area: number) => void;

    // Global Project Estimates
    totalCost: number;
    totalValue: number;
}

const StudioContext = createContext<StudioState | undefined>(undefined);

export const StudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<StudioTab>('atmosphere');

    // Global Settings
    const [projectArea, setProjectArea] = useState(650); // Default area

    // Initialize Logic Hooks
    const atmosphere = useAtmosphere();

    // Sync Project Area with Atmosphere
    // Note: We use a useEffect to push global area to atmosphere inputs when it changes
    // This avoids race conditions in initialization if possible, or we could pass it to useAtmosphere
    useEffect(() => {
        atmosphere.setInputs(prev => ({ ...prev, area: projectArea }));
    }, [projectArea, atmosphere]); // Safe dependency

    // Material State
    const [selectedMaterialId, setSelectedMaterialId] = useState(MATERIALS[0].id);

    // Strategy State
    const [timeHorizon, setTimeHorizon] = useState(5);
    const [propertyValue, setPropertyValue] = useState(25000000);

    // These would be calculated from the sub-states in a real implementation
    const selectedMaterial = MATERIALS.find(m => m.id === selectedMaterialId);

    // Material Cost = Price * Area * 1.15 (Wastage Factor approx)
    const materialCost = selectedMaterial ? selectedMaterial.price * projectArea * 1.15 : 0;

    // Strategy value calculation
    const appreciation = timeHorizon === 3 ? 1.35 : timeHorizon === 5 ? 1.6 : 2.1;
    const futureValue = propertyValue * appreciation;
    const designAlpha = futureValue * 0.12;

    // Total Cost = Atmosphere Systems + Material Investment
    // Note: Atmosphere cost includes fixtures + install + drivers
    const totalCost = atmosphere.stats.costs.total + materialCost;
    const totalValue = designAlpha; // The "Value" we created

    return (
        <StudioContext.Provider value={{
            activeTab,
            setActiveTab,
            atmosphere,
            selectedMaterialId,
            setSelectedMaterialId,
            timeHorizon,
            setTimeHorizon,
            propertyValue,
            setPropertyValue,
            projectArea,
            setProjectArea,
            totalCost,
            totalValue
        }}>
            {children}
        </StudioContext.Provider>
    );
};

export const useStudio = () => {
    const context = useContext(StudioContext);
    if (context === undefined) {
        throw new Error('useStudio must be used within a StudioProvider');
    }
    return context;
};

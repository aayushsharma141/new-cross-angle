import React, { useMemo } from 'react';
import { UserSignals, Stage } from '@/types/discovery';
import { calculateEstimate } from '@/addons/calculators/components/data/calculation-engine';
import { DEFAULT_PRICING_CONFIG } from '@/addons/calculators/components/data/pricing-config';
import { formatCurrency } from '@/addons/calculators/components/data/format-utils';
import { CalculatorFormData } from '@/addons/calculators/components/data/types';
import { motion, AnimatePresence } from 'framer-motion';

export interface DiscoveryDossierProps {
    signals: UserSignals;
    stage: Stage;
}

function getDecisionSentences(signals: UserSignals): string[] {
    const sentences: string[] = [];
    if (signals.propertyType || signals.carpetArea) sentences.push("Space and size");
    if (signals.possessionStatus) sentences.push("Project timing");
    if (signals.morningRoutine) sentences.push("Morning routine");
    if (signals.cookingRole) sentences.push("Kitchen habits");
    if (signals.hostingFrequency) sentences.push("Hosting style");
    if (signals.roomPriorities && Object.keys(signals.roomPriorities).length > 0) sentences.push("Room priorities");
    if (signals.selectedImageIds?.length) sentences.push("Visual instinct");
    if (signals.intentVisualConflict) sentences.push("Design philosophy");
    if (signals.designIdentity?.length) sentences.push("Design identity");
    if (signals.atmosphere?.length) sentences.push("Atmosphere");
    if (signals.constraints?.length) sentences.push("Constraints");
    if (signals.materialChoice) sentences.push("Materials and touch");
    if (signals.sliderValues?.length) sentences.push("Living preferences");
    if (signals.primaryValue) sentences.push("What matters most");
    return sentences;
}

export function DiscoveryDossier({ signals, stage: _stage }: DiscoveryDossierProps) {
    const sentences = getDecisionSentences(signals);

    // Compute mock formData for estimator
    const estimatorData = useMemo(() => {
        if (!signals.carpetArea) return null;
        
        // Mock default data to feed into the calculation engine
        const data: CalculatorFormData = {
            propertyType: "apartment",
            bhk: null,
            area: signals.carpetArea,
            stage: null,
            floors: 1,
            floorNumber: null,
            livingRooms: 1,
            bedrooms: 2,
            bathrooms: 2,
            toilets: 0,
            kitchen: 1,
            balconies: 1,
            hasPool: false,
            hasGarden: false,
            hasGym: false,
            hasHomeTheater: false,
            hasServantQuarters: false,
            hasCoveredParking: false,
            cabins: 0,
            conferenceRooms: 0,
            hasReception: false,
            hasPantry: false,
            hasServerRoom: false,
            hasTrainingRoom: false,
            hasLounge: false,
            renovationScope: null,
            renovationRooms: [],
            renovationPropertyType: null,
            state: "",
            city: "",
            cityTier: "tier1",
            budgetAmount: 0, // not used directly in calculation engine, only for lead scoring
            budgetPreset: "",
            selectedService: "C5", // assume Full execution to show a number
            executionTier: signals.budgetBracket === "Premium" ? "premium" : "standard",
            modularKitchen: signals.roomPriorities?.['Kitchen'] === 'Must-Have',
            wardrobes: 2,
            falseCeiling: false,
            smartHome: false,
            customFurniture: false,
            premiumLighting: false,
            startTiming: null,
            projectMonths: 3,
            extraVisits: 5,
            name: "",
            email: "",
            phone: "",
        };
        return data;
    }, [signals]);

    const estimate = useMemo(() => {
        if (!estimatorData) return null;
        return calculateEstimate(estimatorData, DEFAULT_PRICING_CONFIG);
    }, [estimatorData]);

    return (
        <div className="flex flex-col h-full relative z-10 p-6 md:p-8 bg-transparent">
            <h3 className="text-[12px] font-mono tracking-wider uppercase text-kiro-accent mb-6">Your answers so far</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 pb-8 space-y-8">
                {/* Decision Sentences */}
                <div>
                    <h4 className="text-[12px] font-mono uppercase tracking-widest text-kiro-inkSoft mb-4">Answered</h4>
                    <div className="space-y-3">
                        {sentences.length === 0 && (
                            <div className="text-[13px] text-kiro-inkSoft">Your answers will list here as you go.</div>
                        )}
                        <AnimatePresence>
                            {sentences.map((sentence) => (
                                <motion.div
                                    key={sentence}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[13px] text-kiro-ink flex items-start gap-2 leading-relaxed"
                                >
                                    <span className="text-kiro-accent font-bold mt-0.5" aria-hidden="true">✓</span>
                                    <span>{sentence}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Intelligence & Estimate */}
                <div>
                    <h4 className="text-[12px] font-mono uppercase tracking-widest text-kiro-inkSoft mb-4">Reading</h4>
                    
                    <div className="p-4 rounded-xl border border-kiro-line bg-white space-y-4">
                        {/* Confidence Score */}
                        <div className="flex justify-between items-center border-b border-kiro-line pb-4">
                            <span className="text-[13px] text-kiro-inkSoft">Match confidence</span>
                            <span className="text-[14px] font-mono font-medium text-kiro-accent">
                                {signals.consultationIntelligence?.confidence.overall ? `${signals.consultationIntelligence.confidence.overall}%` : '—'}
                            </span>
                        </div>

                        {/* Estimate */}
                        <div>
                            <span className="text-[13px] text-kiro-inkSoft block mb-2">Rough range</span>
                            {!estimatorData ? (
                                <p className="text-[13px] text-kiro-inkSoft">
                                    Add your home's size to see a rough range.
                                </p>
                            ) : estimate ? (
                                <div className="space-y-1">
                                    <div className="text-[18px] font-serif font-medium text-kiro-ink">
                                        {formatCurrency(estimate.total.min)} - {formatCurrency(estimate.total.max)}
                                    </div>
                                    <p className="text-[12px] text-kiro-inkSoft leading-relaxed">
                                        For {signals.carpetArea} sq ft, assuming a 2-bedroom apartment with full-scope execution. The estimator refines this.
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Step 1 — Property Type selection */

import React, { useRef, KeyboardEvent } from "react";
import type { CalculatorFormData, PropertyType, PropertyTypeItem } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { getOptimizedUrl } from "@/lib/cdn";
import { selectableCardClassLight } from "@/addons/_shared/card-styles";
import { AnimatedContent } from "@/components/ReactBits";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

export function StepPropertyType({ formData, updateField }: Props) {
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const { data: propertyTypes = [] } = useFlowConfig<PropertyTypeItem[]>("property_types");

    const handleKeyDown = (e: KeyboardEvent, index: number) => {
        let newIndex = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            newIndex = (index + 1) % propertyTypes.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            newIndex = (index - 1 + propertyTypes.length) % propertyTypes.length;
        }

        if (newIndex !== -1) {
            e.preventDefault();
            buttonRefs.current[newIndex]?.focus();
            updateField("propertyType", propertyTypes[newIndex].id as PropertyType);
        }
    };

    if (propertyTypes.length === 0) {
        return (
            <div className="text-center py-12 px-6 border border-dashed border-kiro-line rounded-[8px] bg-white/40">
                <div className="text-4xl mb-3 opacity-40">🏗️</div>
                <p className="text-sm text-kiro-inkSoft font-medium mb-1">Property types unavailable</p>
                <p className="text-xs text-kiro-inkSoft/70">Please refresh the page or try again later.</p>
            </div>
        );
    }

    return (
        <AnimatedContent distance={20} delay={0.05} duration={0.6}>
            <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
                role="radiogroup"
                aria-label="Property type selection"
            >
                {propertyTypes.map((pt, i) => {
                    const selected = formData.propertyType === pt.id;
                    const isTabable = selected || (!formData.propertyType && i === 0);
                    return (
                        <button
                            type="button"
                            key={pt.id}
                            ref={el => { buttonRefs.current[i] = el; }}
                            onClick={() => updateField("propertyType", pt.id as PropertyType)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            aria-label={`${pt.label}${selected ? " (selected)" : ""}`}
                            tabIndex={isTabable ? 0 : -1}
                            className={selectableCardClassLight(selected, "group p-0 text-center active:scale-95")}
                        >
                            {/* Full-card background fill — drives all visual state */}
                            <div className={`p-6 w-full h-full flex flex-col items-center justify-center relative overflow-hidden rounded-[7px] transition-all duration-300 ${
                                selected
                                    ? "bg-[#7a5c30]/[0.14]"
                                    : "bg-white/60 group-hover:bg-[#7a5c30]/[0.06]"
                            }`}>

                                {/* Icon container */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${
                                    selected
                                        ? "bg-[#7a5c30]/25 shadow-[0_4px_16px_rgba(122,92,48,0.30)] ring-2 ring-[#7a5c30]/40"
                                        : "bg-[#1a1a1a]/[0.05] group-hover:bg-[#7a5c30]/[0.12]"
                                }`}>
                                    {pt.imageId ? (
                                        <img
                                            src={getOptimizedUrl(pt.imageId, { width: 96, quality: 80 })}
                                            alt={pt.label}
                                            className="w-8 h-8 rounded-md object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl leading-none">{pt.icon}</span>
                                    )}
                                </div>

                                {/* Label */}
                                <div className={`font-bold text-[15px] tracking-tight mb-1.5 transition-colors duration-200 ${
                                    selected
                                        ? "text-[#7a5c30]"
                                        : "text-[#1a1a1a] group-hover:text-[#7a5c30]"
                                }`}>
                                    {pt.label}
                                </div>

                                {/* Description */}
                                <div className={`text-[12px] leading-snug tracking-wide font-medium transition-colors duration-200 max-w-[120px] ${
                                    selected ? "text-[#7a5c30]/70" : "text-[#5a5a5a]"
                                }`}>
                                    {pt.desc}
                                </div>

                                {/* Bottom accent bar */}
                                <div
                                    className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${
                                        selected
                                            ? "h-[3px] bg-gradient-to-r from-transparent via-[#7a5c30] to-transparent opacity-100"
                                            : "h-[1px] bg-[#1a1a1a]/[0.06] group-hover:bg-[#7a5c30]/30"
                                    }`}
                                    aria-hidden="true"
                                />
                            </div>
                        </button>
                    );
                })}
            </div>
        </AnimatedContent>
    );
}

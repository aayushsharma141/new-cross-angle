/* Step 1 — Property Type selection */

import { useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import type { CalculatorFormData, PropertyType } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import {
    selectableCardClassLight,
    CARD_INTERACTIONS,
    cardListContainer,
    cardListItem,
    breathingAnimationLight,
    breathingTransitionLight,
} from "@/addons/_shared/card-styles";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

interface PropertyTypeItem {
  id: string;
  label: string;
  icon: string;
  desc: string;
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
            <div className="text-center py-12 px-6 border border-dashed border-[#e8e4dd] rounded-[8px] bg-white/40">
                <div className="text-4xl mb-3 opacity-40">🏗️</div>
                <p className="text-sm text-[#5a5a5a] font-medium mb-1">Property types unavailable</p>
                <p className="text-xs text-[#5a5a5a]/70">Please refresh the page or try again later.</p>
            </div>
        );
    }

    return (
        <div>

            <motion.div
                variants={cardListContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                role="radiogroup"
                aria-label="Property type selection"
            >
                {propertyTypes.map((pt, i) => {
                    const selected = formData.propertyType === pt.id;
                    const isTabable = selected || (!formData.propertyType && i === 0);
                    return (
                        <motion.button
                            type="button"
                            key={pt.id}
                            ref={el => { buttonRefs.current[i] = el; }}
                            onClick={() => updateField("propertyType", pt.id as PropertyType)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            aria-label={`${pt.label}${selected ? " (selected)" : ""}`}
                            aria-checked={selected ? "true" : "false"}
                            role="radio"
                            tabIndex={isTabable ? 0 : -1}
                            variants={cardListItem}
                            whileHover={CARD_INTERACTIONS.whileHover}
                            whileTap={CARD_INTERACTIONS.whileTap}
                            className={selectableCardClassLight(selected, "group p-5 text-center")}
                        >
                            {/* Breathing glow overlay — only on selected */}
                            {selected && (
                                <motion.span
                                    aria-hidden="true"
                                    className="absolute inset-0 pointer-events-none"
                                    animate={breathingAnimationLight}
                                    transition={breathingTransitionLight}
                                />
                            )}

                            <div className="text-4xl mb-3 filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                {pt.icon}
                            </div>

                            <div className="mb-1">
                                <div className={`font-bold text-sm tracking-tight ${selected ? "text-[#8b6f47] drop-shadow-sm" : "text-[#1a1a1a]"}`}>
                                    {pt.label}
                                </div>
                                <div className={`text-[10px] leading-relaxed mt-1 uppercase tracking-tighter ${selected ? "text-[#1a1a1a]/70" : "text-[#5a5a5a]"}`}>
                                    {pt.desc}
                                </div>
                            </div>

                            {selected && (
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#8b6f47] to-transparent opacity-60" />
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}

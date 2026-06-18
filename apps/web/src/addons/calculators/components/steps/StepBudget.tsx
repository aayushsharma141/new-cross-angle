/* Step 4 — Investment Scope */

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { CalculatorFormData } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { formatCurrency } from "../data/format-utils";
import { INVESTMENT_PRESETS } from "../data/pricing-config";
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

export function StepBudget({ formData, updateField }: Props) {
    const { data: investmentPresets = INVESTMENT_PRESETS } = useFlowConfig<typeof INVESTMENT_PRESETS>("investment_presets");
    // Minimum relevant scope for UHNW is higher
    const minInvestment = useMemo(() => Math.max(1500000, formData.area * 3500), [formData.area]);

    const feasibility = useMemo(() => {
        const ratio = formData.budgetAmount / minInvestment;
        const pct = Math.min(100, Math.max(0, (ratio / 2.5) * 100));

        let label = "Entry Level (< " + formatCurrency(minInvestment) + ")";
        if (ratio >= 2.5) label = "Legacy Tier";
        else if (ratio >= 1.8) label = "Luxury Tier";
        else if (ratio >= 1.2) label = "Comfortable Scope";
        else if (ratio >= 1.0) label = "Viable Entry";

        return { pct, label };
    }, [formData.budgetAmount, minInvestment]);

    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (barRef.current) {
            barRef.current.style.setProperty("--progress", `${feasibility.pct}%`);
        }
    }, [feasibility.pct]);


    return (
        <div className="max-w-2xl mx-auto">
            {/* Big budget display */}
            <div className="text-center py-7 mb-5 rounded-none border border-[#1a1a1a]/[0.06] bg-gradient-to-br from-site-bg-card to-site-bg">
                <div className="text-[#5a5a5a] text-xs mb-1 uppercase tracking-widest">Total Allocation</div>
                <div className="text-[#8b6f47] text-4xl font-extrabold tracking-tighter">
                    {formatCurrency(formData.budgetAmount)}
                </div>
                <div className="text-[11px] text-[#5a5a5a] mt-2">
                    Suggested baseline for your area: <span className="text-[#1a1a1a] font-medium">{formatCurrency(minInvestment)}</span>
                </div>
            </div>

            {/* Slider */}
            <div className="mb-6">
                <label htmlFor="budget-slider" className="sr-only">Investment amount</label>
                <input
                    id="budget-slider"
                    type="range"
                    {...{
                        "aria-label": `Investment amount: ${formatCurrency(formData.budgetAmount)}`,
                        "aria-valuemin": 1500000,
                        "aria-valuemax": 150000000,
                        "aria-valuenow": formData.budgetAmount,
                        "aria-valuetext": formatCurrency(formData.budgetAmount),
                    }}
                    min={1500000} max={150000000} step={500000}
                    value={formData.budgetAmount}
                    onChange={e => {
                        updateField("budgetAmount", Number(e.target.value));
                        updateField("budgetPreset", "");
                    }}
                    className="w-full h-2 bg-[#ffffff] border border-[#1a1a1a]/[0.06] rounded-full appearance-none cursor-pointer accent-[#8b6f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                />
                <div className="flex justify-between text-[#5a5a5a] text-xs mt-1 font-mono">
                    <span>₹15L</span><span>₹15 Cr+</span>
                </div>
            </div>

            {/* Presets */}
            <motion.div
                variants={cardListContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
            >
                {investmentPresets.map(bp => {
                    const active = formData.budgetPreset === bp.label;
                    return (
                        <motion.button
                            type="button"
                            key={bp.label}
                            variants={cardListItem}
                            whileHover={CARD_INTERACTIONS.whileHover}
                            whileTap={CARD_INTERACTIONS.whileTap}
                            onClick={() => {
                                updateField("budgetPreset", bp.label);
                                updateField("budgetAmount", bp.value);
                            }}
                            className={selectableCardClassLight(active, "p-4 text-center")}
                        >
                            {active && (
                                <motion.span
                                    aria-hidden="true"
                                    className="absolute inset-0 pointer-events-none"
                                    animate={breathingAnimationLight}
                                    transition={breathingTransitionLight}
                                />
                            )}
                            <div className={`font-bold text-sm ${active ? "text-[#8b6f47]" : "text-[#1a1a1a]"}`}>
                                {bp.label}
                            </div>
                            <div className={`text-xs mt-0.5 ${active ? "text-[#1a1a1a]/70" : "text-[#5a5a5a]"}`}>{bp.range}</div>
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Feasibility bar */}
            <div className="rounded-none px-4 py-3 border border-[#1a1a1a]/[0.06] bg-[#ffffff]">
                <div className="flex justify-between mb-2">
                    <span className="text-[#5a5a5a] text-xs uppercase tracking-wider">Feasibility Index</span>
                    <span className={`text-xs font-semibold ${feasibility.label === "Legacy Tier" ? "text-[#8b6f47]" :
                        feasibility.label === "Luxury Tier" ? "text-yellow-500" :
                            feasibility.label === "Comfortable Scope" ? "text-emerald-500" :
                                "text-[#5a5a5a]"
                        }`}>{feasibility.label}</span>
                </div>
                <div className="rounded-none h-2 overflow-hidden bg-site-bg">
                    <div
                        ref={barRef}
                        className="h-full rounded-none transition-all duration-500 ease-out w-[var(--progress)] bg-gradient-to-r from-emerald-500 via-yellow-500 to-site-gold"
                    />
                </div>
            </div>

        </div>
    );
}

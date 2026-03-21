/* Step 4 — Investment Scope */

import { useMemo, useRef, useEffect } from "react";
import type { CalculatorFormData } from "../data/types";
import { formatCurrency } from "../data/format-utils";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

const INVESTMENT_PRESETS = [
    { label: "Essential", range: "₹40–60 L", value: 5000000, color: "#80cbc4" },
    { label: "Premium", range: "₹80 L – 1.5 Cr", value: 12000000, color: "#64b5f6" },
    { label: "Luxury", range: "₹2.5 – 5 Cr", value: 35000000, color: "#f4a261" },
    { label: "Legacy", range: "₹10 Cr+", value: 100000000, color: "#e57373" },
];

export function StepBudget({ formData, updateField }: Props) {
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
        <div>
            <h2 className="text-2xl font-bold mb-1 text-site-text-heading uppercase">
                Investment Scope
            </h2>
            <p className="text-site-text-muted mb-6 text-sm">
                Define the capital allocation for your residence. <span className="text-xs text-site-text-meta">(Suggested baseline: {formatCurrency(minInvestment)})</span>
            </p>

            {/* Big budget display */}
            <div className="text-center py-7 mb-5 rounded-none border border-site-border bg-gradient-to-br from-site-bg-card to-site-bg">
                <div className="text-site-text-meta text-xs mb-1 uppercase tracking-widest">Total Allocation</div>
                <div className="text-site-crimson text-4xl font-extrabold tracking-tighter">
                    {formatCurrency(formData.budgetAmount)}
                </div>
            </div>

            {/* Slider */}
            <div className="mb-6">
                <input
                    type="range"
                    title="Investment Amount"
                    min={1500000} max={150000000} step={500000}
                    value={formData.budgetAmount}
                    onChange={e => updateField("budgetAmount", Number(e.target.value))}
                    className="w-full h-2 bg-site-bg-card rounded-none appearance-none cursor-pointer accent-site-crimson"
                />
                <div className="flex justify-between text-site-text-meta text-xs mt-1 font-mono">
                    <span>₹15L</span><span>₹15 Cr+</span>
                </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {INVESTMENT_PRESETS.map(bp => {
                    const active = formData.budgetPreset === bp.label;
                    return (
                        <button
                            key={bp.label}
                            type="button"
                            onClick={() => {
                                updateField("budgetPreset", bp.label);
                                updateField("budgetAmount", bp.value);
                            }}
                            className={`border-2 rounded-none p-4 text-center transition-all duration-200 ${active
                                ? "bg-site-crimson/10 border-site-crimson shadow-[0_0_15px_rgba(227, 83, 54,0.1)]"
                                : "bg-site-bg-card border-site-border hover:border-site-crimson/30"
                                }`}
                        >
                            <div className={`font-bold text-sm ${active
                                ? "text-site-crimson"
                                : "text-site-text-heading"
                                }`}>{bp.label}</div>
                            <div className="text-site-text-muted text-xs mt-0.5">{bp.range}</div>
                        </button>
                    );
                })}
            </div>

            {/* Feasibility bar */}
            <div className="rounded-none px-4 py-3 border border-site-border bg-site-bg-card">
                <div className="flex justify-between mb-2">
                    <span className="text-site-text-meta text-xs uppercase tracking-wider">Feasibility Index</span>
                    <span className={`text-xs font-semibold ${feasibility.label === "Legacy Tier" ? "text-site-crimson" :
                        feasibility.label === "Luxury Tier" ? "text-yellow-500" :
                            feasibility.label === "Comfortable Scope" ? "text-emerald-500" :
                                "text-site-text-muted"
                        }`}>{feasibility.label}</span>
                </div>
                <div className="rounded-none h-2 overflow-hidden bg-site-bg">
                    <div
                        ref={barRef}
                        className="h-full rounded-none transition-all duration-500 ease-out w-[var(--progress)] bg-gradient-to-r from-emerald-500 via-yellow-500 to-site-crimson"
                    />
                </div>
            </div>

        </div>
    );
}

/* Step 4 — Investment Scope */


import type { CalculatorFormData } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { formatCurrency } from "../data/format-utils";
import { INVESTMENT_PRESETS } from "../data/pricing-config";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

export function StepBudget({ formData, updateField }: Props) {
    const { data: investmentPresets = INVESTMENT_PRESETS } = useFlowConfig<typeof INVESTMENT_PRESETS>("investment_presets");


    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Big budget display */}
            <div className="text-center py-10 mb-8 rounded-[12px] border border-kiro-ink/[0.06] bg-kiro-surface shadow-sm">
                <div className="text-kiro-inkSoft text-sm mb-2 uppercase tracking-wide">Total Allocation</div>
                <div className="text-kiro-accent text-5xl md:text-6xl font-extrabold tracking-tighter">
                    {formatCurrency(formData.budgetAmount)}
                </div>
            </div>

            {/* Slider */}
            <div className="mb-10 px-2">
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
                    className="w-full h-2.5 bg-kiro-surface border border-kiro-ink/[0.06] rounded-full appearance-none cursor-pointer accent-kiro-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                />
                <div className="flex justify-between text-kiro-inkSoft text-xs mt-3 font-mono font-medium">
                    <span>₹15L</span><span>₹15 Cr+</span>
                </div>
            </div>

            {/* Presets — radiogroup semantics */}
            <div
                role="radiogroup"
                aria-label="Investment presets"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {investmentPresets.map((bp, i) => {
                    const active = formData.budgetPreset === bp.label;
                    const isTabable = active || (!formData.budgetPreset && i === 0);
                    return (
                        <button
                            type="button"
                            key={bp.label}
                            aria-label={`${bp.label} (${bp.range})${active ? " (selected)" : ""}`}
                            tabIndex={isTabable ? 0 : -1}
                            onClick={() => {
                                updateField("budgetPreset", bp.label);
                                updateField("budgetAmount", bp.value);
                            }}
                            className={`
                                p-5 text-center transition-all duration-300 rounded-[12px] border cursor-pointer flex flex-col items-center justify-center
                                ${active
                                    ? "bg-kiro-accent/[0.18] border-kiro-accent font-bold shadow-[0_4px_24px_rgba(139,111,71,0.25)] -translate-y-1 scale-[1.02] ring-2 ring-kiro-accent/30"
                                    : "bg-kiro-surface/80 border-kiro-ink/[0.06] hover:bg-kiro-accentSoft hover:border-kiro-accent/55 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(139,111,71,0.12)]"
                                }
                            `}
                        >
                            {active && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 pointer-events-none animate-pulse shadow-[0_0_24px_rgba(139,111,71,0.25)] rounded-[12px]"
                                />
                            )}
                            <div className={`font-bold text-sm transition-colors ${active ? "text-kiro-accent" : "text-kiro-ink"}`}>
                                {bp.label}
                            </div>
                            <div className={`text-xs mt-1 transition-colors ${active ? "text-kiro-ink/70" : "text-kiro-inkSoft"}`}>{bp.range}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

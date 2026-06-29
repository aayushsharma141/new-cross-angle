/* Results — Final Estimate Display */

import { useState } from "react";
import type { CalculatorFormData, EstimateResult } from "../data/types";
import { formatCurrency, formatRange } from "../data/format-utils";
import { SERVICES as DEFAULT_SERVICES, THEME } from "../data/pricing-config";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Link } from "react-router-dom";
import { Home, Calendar, Check, AlertTriangle, PhoneCall, Info, Compass } from "lucide-react";

import { cn } from "@/lib/utils";
import { ECOSYSTEM_COPY, ECOSYSTEM_ROUTES } from "@/addons/_shared/ecosystemCopy";
import { EstimatorIntelligencePanel } from "../EstimatorIntelligencePanel";
import type { EstimatorResponse } from "../data/discovery-handoff";
import { CountUp, FallingText, StarBorder, Magnet } from "@/components/ReactBits";

interface Props {
    formData: CalculatorFormData;
    estimate: EstimateResult | null;
    discoveryApplied?: boolean;
    discoveryName?: string;
    discoveryRationale?: string;
    alcsEstimatorResponse?: EstimatorResponse | null;
    onReset: () => void;
    onBack: () => void;
}

// ─── Item Explanations for Drawers ───

function getItemExplanation(label: string, propertyType: string): string {
    const pType = propertyType.replace("_", " ");
    switch (label) {
        case "Creative Fee":
            return `Covers bespoke architectural space design, 2D general arrangement plans, high-fidelity 3D modeling, material palette curation, and concept visualization tailored for your ${pType}.`;
        case "Statutory Tax (GST)":
            return "Government-mandated 18% Goods and Services Tax (GST) calculated on design consultancy and stewardship service fees.";
        case "On-site Stewardship":
            return "Dedicated engineering project manager, on-site quality checklist audits, contractor coordination, daily progress reports, and architectural supervision to ensure zero execution lag.";
        case "Artisanal Execution":
            return "Museum-grade execution, master masonry, engineered false ceiling layouts, high-spec paint finishings, carpentry joinery, electrical systems, and architectural flooring layouts.";
        case "Bespoke Commissions":
            return "Premium bespoke add-ons selected, including Italian/German chef's kitchen cabinetry, couture wardrobe suites, advanced Crestron/KNX smart automation, and curated global light fixtures.";
        default:
            return "Premium design allocation ensuring strict adherence to the highest luxury finishing and aesthetic standards.";
    }
}

export function StepResults({ formData, estimate, discoveryApplied = false, discoveryName = "", discoveryRationale = "", alcsEstimatorResponse = null, onReset, onBack }: Props) {
    const { data: services = DEFAULT_SERVICES } = useFlowConfig<typeof DEFAULT_SERVICES>("services");
    const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null);
    const [appliedSavings, setAppliedSavings] = useState<number>(0);

    if (!estimate) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-kiro-bg flex items-center justify-center mb-6 border border-kiro-line shadow-lg">
                    <AlertTriangle className="w-8 h-8 text-kiro-accent" />
                </div>
                <h3 className="text-kiro-ink text-xl font-bold mb-4">No Estimate Found</h3>
                <p className="text-kiro-inkSoft text-center max-w-xs mb-8">
                    It looks like we're missing some details to calculate your investment range.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-8 py-3 rounded-[8px] font-black text-xs uppercase tracking-wide bg-kiro-accent text-white hover:bg-[#705939] transition-all active:scale-[0.98] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                    >
                        ← Go Back
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="px-8 py-3 rounded-[8px] font-black text-xs uppercase tracking-wide border border-kiro-line bg-white text-kiro-ink hover:bg-kiro-bg transition-all active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                    >
                        Start Over
                    </button>
                    <Link
                        to={ECOSYSTEM_ROUTES.contact}
                        className="px-8 py-3 rounded-[8px] font-black text-xs uppercase tracking-wide border border-kiro-line bg-white text-kiro-inkSoft hover:bg-kiro-bg transition-all active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        );
    }

    const svc = services.find(s => s.id === formData.selectedService);
    const hasBlueprint = discoveryApplied && Boolean(discoveryName);
    const blueprintName = discoveryName || "your Discovery Blueprint";
    const blueprintSummary = hasBlueprint
        ? discoveryRationale || `This result uses ${blueprintName} as the personality layer above the practical project scope.`
        : ECOSYSTEM_COPY.estimatorWithoutBlueprint;

    const breakdownItems: { label: string; value: string; color?: string; icon?: React.ReactNode }[] = [];

    if (estimate.designCost.min > 0) {
        breakdownItems.push({
            label: `Creative Fee`,
            value: formatRange(estimate.designCost.min, estimate.designCost.max),
            icon: <Calendar className="w-4 h-4 text-kiro-accent" />
        });
    }
    if (estimate.gstOnDesign > 0) {
        breakdownItems.push({ label: "Statutory Tax (GST)", value: formatCurrency(estimate.gstOnDesign) });
    }
    if (estimate.supervisionCost > 0) {
        breakdownItems.push({
            label: `On-site Stewardship`,
            value: formatCurrency(estimate.supervisionCost),
        });
    }
    if (estimate.executionCost.min > 0) {
        breakdownItems.push({
            label: `Artisanal Execution`,
            value: formatRange(estimate.executionCost.min, estimate.executionCost.max),
            color: THEME.ACCENT,
        });
    }
    if (estimate.addonCost > 0) {
        breakdownItems.push({ label: "Bespoke Commissions", value: formatCurrency(estimate.addonCost), color: THEME.ACCENT });
    }



    const finalMin = Math.max(0, estimate.total.min - appliedSavings);
    const finalMax = Math.max(0, estimate.total.max - appliedSavings);

    return (
        <div
            className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
            {/* ═══ Immersive Header Card ═══ */}
            <StarBorder
              color="#7a5c30"
              backgroundColor="rgba(255, 255, 255, 0.9)"
              className="relative shadow-[0_8px_40px_rgba(139,111,71,0.08)]"
            >
              <div className="relative overflow-hidden p-10 lg:p-14 border border-kiro-line/10">
                {/* Warm Aura Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-kiro-accent/[0.06] blur-[120px] rounded-full -mr-32 -mt-32" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-kiro-accent/[0.04] blur-[100px] rounded-full -ml-20 -mb-20" aria-hidden="true" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div
                        className="mb-4 block"
                    >
                      <FallingText
                        text={hasBlueprint ? "Personalized Investment Outlook" : "Baseline Investment Outlook"}
                        className="text-kiro-accent font-mono text-[12px] uppercase tracking-[0.5em] font-bold justify-center"
                        delay={15}
                      />
                    </div>

                    <h2
                        className="text-4xl md:text-6xl font-bold text-kiro-ink tracking-tighter mb-3 font-serif"
                    >
                        <span className="tabular-nums">
                            <CountUp to={finalMin} duration={1.8} separator="," locale="en-IN" currency="INR" /> – <CountUp to={finalMax} duration={1.8} separator="," locale="en-IN" currency="INR" />
                        </span>
                    </h2>
                    <p className="text-sm md:text-base text-kiro-inkSoft max-w-xl leading-relaxed mb-6">
                        {hasBlueprint
                            ? `Estimated from your selected scope and calibrated with ${blueprintName}.`
                            : "Estimated from your selected scope. Add a Discovery Blueprint first for a more personal report."}
                    </p>

                    {/* Gold accent underline */}
                    <div
                        className="h-0.5 bg-gradient-to-r from-transparent via-kiro-accent to-transparent mb-8 w-40"
                    />

                    <div className="flex flex-wrap justify-center gap-3">
                    </div>
                </div>
              </div>
            </StarBorder>

            {/* ═══ Content Split ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Breakdown + Concordance (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white border border-kiro-line rounded-[8px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-[6px] bg-kiro-accent/10 border border-kiro-accent/25 flex items-center justify-center shrink-0">
                                <Compass className="w-5 h-5 text-kiro-accent" />
                            </div>
                            <div>
                                <p className="text-[12px] font-mono tracking-wider uppercase text-kiro-accent mb-2">
                                    {hasBlueprint ? "Discovery Continuity" : "Personalization Gap"}
                                </p>
                                <h3 className="text-xl font-serif text-kiro-ink mb-3">
                                    {hasBlueprint ? `${blueprintName} carried into execution` : "This is a direct estimate"}
                                </h3>
                                <p className="text-sm text-kiro-inkSoft leading-relaxed">
                                    {blueprintSummary}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Execution Intelligence */}
                    <div className="bg-white border border-kiro-line rounded-[8px] overflow-hidden backdrop-blur-xl transition-all shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="px-8 py-6 border-b border-kiro-line flex items-center justify-between">
                            <h3 className="text-kiro-ink text-base font-bold uppercase tracking-wide font-sans">Execution Intelligence</h3>
                            <div className="p-2 bg-kiro-bg rounded-[4px] border border-kiro-line flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider text-kiro-accent">
                                <span
                                    className="animate-pulse"
                                >
                                    Interactive
                                </span>
                            </div>
                        </div>

                        <div className="p-2 divide-y divide-kiro-line/60">
                            {breakdownItems.map((item, i) => {
                                const isExpanded = expandedItemIndex === i;
                                return (
                                    <div key={i} className="group transition-colors">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedItemIndex(isExpanded ? null : i)}
                                            className="w-full flex justify-between items-center px-6 py-5 text-left rounded-[4px] hover:bg-kiro-accent/[0.08] hover:border-l-2 hover:border-kiro-accent transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-1"
                                            title="Click to view details"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-[4px] border border-kiro-line bg-kiro-bg group-hover:bg-kiro-accent/[0.15] group-hover:border-kiro-accent/40 flex items-center justify-center transition-all duration-200">
                                                    {item.icon || <div className="w-1.5 h-1.5 rounded-full bg-kiro-accent/50 group-hover:bg-kiro-accent" />}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-kiro-inkSoft text-[13px] font-medium uppercase tracking-wide transition-colors group-hover:text-kiro-ink">{item.label}</span>
                                                    <Info className="w-3.5 h-3.5 text-kiro-inkSoft/40 group-hover:text-kiro-accent transition-colors" />
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight",
                                                item.color === THEME.ACCENT ? "text-kiro-accent" : "text-kiro-ink"
                                            )}>
                                                {item.value}
                                            </span>
                                        </button>
                                        
                                        {isExpanded && (
                                                <div
                                                    className="overflow-hidden bg-kiro-accent/[0.06] border-l-[3px] border-kiro-accent ml-6 rounded-b-[4px] animate-in slide-in-from-top-2 fade-in duration-200"
                                                >
                                                    <div className="px-8 py-4 text-[13px] text-kiro-inkSoft leading-relaxed font-light italic">
                                                        {getItemExplanation(item.label, formData.propertyType || "")}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Footer */}
                        <div className="p-8 bg-kiro-bg/60 border-t border-kiro-line flex justify-between items-center">
                            <div>
                                <p className="text-[12px] text-kiro-inkSoft uppercase tracking-wide font-black mb-1">Indicative Total</p>
                                <p className="text-2xl font-bold text-kiro-accent font-serif">{formatRange(finalMin, finalMax)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-kiro-inkSoft italic leading-relaxed font-medium">Model includes scope,<br />standard GST and contingency.</p>
                            </div>
                        </div>
                    </div>

                    {/* Blueprint Translation */}
                    <div className="bg-white border border-kiro-line p-8 rounded-[8px] relative overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-kiro-accent/[0.04] blur-2xl pointer-events-none group-hover:bg-kiro-accent/[0.08] transition-colors" aria-hidden="true" />
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-[4px] bg-kiro-accent/10 border border-kiro-accent/25 flex items-center justify-center">
                                <span className="text-kiro-accent text-lg">✦</span>
                            </div>
                            <h3 className="text-kiro-ink text-base font-bold uppercase tracking-wide">Blueprint Translation</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Radial gauge */}
                            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        className="fill-none stroke-kiro-line"
                                        strokeWidth="4"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        className="fill-none stroke-kiro-accent"
                                        strokeWidth="4"
                                        strokeDasharray="251.2"
                                        style={{ strokeDashoffset: 251.2 - (251.2 * 0.85), filter: "drop-shadow(0 0 6px rgba(139,111,71,0.3))" }}
                                    />
                                </svg>
                                <span className="absolute text-kiro-ink font-serif text-lg font-bold">85%</span>
                            </div>
                            <div className="flex-1 space-y-1.5 text-center sm:text-left">
                                <h4 className="text-xs font-black uppercase text-kiro-accent tracking-wider">
                                    {hasBlueprint ? "Profile-to-scope fit" : "Baseline scope fit"}
                                </h4>
                                <p className="text-kiro-inkSoft text-[13px] leading-relaxed">
                                    {hasBlueprint
                                        ? `Your ${blueprintName} profile helps prioritize finish language, service depth, and bespoke inclusions before a designer reviews the final plan.`
                                        : "This estimate is useful for scope planning. A Discovery Blueprint adds the emotional, material, and lifestyle layer needed for a more personalized report."}
                                </p>
							</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: ALCS Intelligence + Inclusions + Roadmap + CTAs (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">

                    {/* ALCS Intelligence Panel — shown when Discovery handoff available */}
                    {alcsEstimatorResponse && (
                        <EstimatorIntelligencePanel
                            response={alcsEstimatorResponse}
                            onSelectOption={(opt) => {
                                setAppliedSavings(prev => opt.isApplied ? prev + opt.savingsAmount : prev - opt.savingsAmount);
                            }}
                        />
                    )}
                    {/* Deliverables Card */}
                    <div className="bg-white border border-kiro-line rounded-[8px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-kiro-accent/[0.04] blur-2xl -mr-16 -mt-16 group-hover:bg-kiro-accent/[0.08] transition-colors" aria-hidden="true" />

                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-[4px] bg-kiro-accent/10 border border-kiro-accent/25 flex items-center justify-center">
                                <Check className="w-5 h-5 text-kiro-accent" />
                            </div>
                            <h3 className="text-kiro-ink text-base font-bold uppercase tracking-wide font-sans">Scope Inclusions</h3>
                        </div>

                        <div className="space-y-4">
                            {svc?.includes.slice(0, 6).map((item, i) => (
                                <div key={i} className="flex items-start gap-3 group/item">
                                    <div className="w-1.5 h-1.5 rounded-full bg-kiro-accent/40 mt-1.5 group-hover/item:scale-150 transition-transform" />
                                    <span className="text-kiro-inkSoft text-[13px] leading-relaxed group-hover/item:text-kiro-ink transition-colors">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Timeline Roadmap */}
                    <div className="bg-white border border-kiro-line p-8 rounded-[8px] relative overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <h3 className="text-kiro-ink text-base font-bold uppercase tracking-wide mb-8 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[4px] border border-kiro-line bg-kiro-bg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-kiro-accent" />
                            </div>
                            Artisanal Roadmap
                        </h3>
                        
                        <div className="relative border-l border-kiro-line ml-3 pl-8 space-y-8">
                            {/* Phase 1 */}
                            <div className="relative group/step">
                                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-[4px] bg-kiro-bg border border-kiro-accent flex items-center justify-center text-[12px] font-bold text-kiro-accent group-hover/step:bg-kiro-accent group-hover/step:text-white transition-all">
                                    01
                                </div>
                                <h4 className="text-[13px] font-black uppercase text-kiro-ink tracking-wider mb-1">Blueprint & Scope Calibration</h4>
                                <span className="text-[9px] font-mono text-kiro-accent/80 block mb-1">Weeks 1 – 4</span>
                                <p className="text-kiro-inkSoft text-[12px] leading-relaxed">
                                    Aligning your project details with style intent, room priorities, and investment comfort.
                                </p>
                            </div>

                            {/* Phase 2 */}
                            <div className="relative group/step">
                                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-[4px] bg-kiro-bg border border-kiro-line flex items-center justify-center text-[12px] font-bold text-kiro-inkSoft group-hover/step:border-kiro-accent group-hover/step:text-kiro-accent transition-all">
                                    02
                                </div>
                                <h4 className="text-[13px] font-black uppercase text-kiro-ink tracking-wider mb-1">Design Detailing & Sourcing</h4>
                                <span className="text-[9px] font-mono text-kiro-accent/80 block mb-1">Weeks 5 – 12</span>
                                <p className="text-kiro-inkSoft text-[12px] leading-relaxed">
                                    Translating the agreed direction into drawings, materials, vendor planning, and finish selections.
                                </p>
                            </div>

                            {/* Phase 3 */}
                            <div className="relative group/step">
                                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-[4px] bg-kiro-bg border border-kiro-line flex items-center justify-center text-[12px] font-bold text-kiro-inkSoft group-hover/step:border-kiro-accent group-hover/step:text-kiro-accent transition-all">
                                    03
                                </div>
                                <h4 className="text-[13px] font-black uppercase text-kiro-ink tracking-wider mb-1">Execution Stewardship & Handover</h4>
                                <span className="text-[9px] font-mono text-kiro-accent/80 block mb-1">Weeks 13+</span>
                                <p className="text-kiro-inkSoft text-[12px] leading-relaxed">
                                    Coordinating site progress, quality checks, installation sequence, and final move-in readiness.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Navigation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Magnet range={40} className="w-full">
                            <button
                                type="button"
                                onClick={onReset}
                                className="w-full p-6 rounded-[8px] border border-kiro-line bg-white hover:bg-kiro-accent/[0.04] hover:border-kiro-accent/40 transition-all group flex flex-col items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                            >
                                <Home className="w-6 h-6 text-kiro-inkSoft group-hover:text-kiro-accent transition-all group-hover:rotate-12" />
                                <span className="text-[12px] uppercase font-black tracking-wide text-kiro-inkSoft transition-colors group-hover:text-kiro-accent">Restart Estimate</span>
                            </button>
                        </Magnet>
                        <Magnet range={40} className="w-full">
                            <Link
                                to={ECOSYSTEM_ROUTES.discovery}
                                className="w-full p-6 rounded-[8px] border border-kiro-line bg-white hover:bg-kiro-accent/[0.04] hover:border-kiro-accent/40 transition-all group flex flex-col items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                            >
                                <Compass className="w-6 h-6 text-kiro-inkSoft group-hover:text-kiro-accent transition-colors" />
                                <span className="text-[12px] uppercase font-black tracking-wide text-kiro-inkSoft transition-colors group-hover:text-kiro-accent">
                                    {hasBlueprint ? "Refine Blueprint" : "Create Blueprint"}
                                </span>
                            </Link>
                        </Magnet>
                        <Magnet range={40} className="w-full">
                            <Link
                                to="/system-blueprint"
                                className="w-full p-6 rounded-[8px] border border-kiro-line bg-white hover:bg-kiro-accent/[0.04] hover:border-kiro-accent/40 transition-all group flex flex-col items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                            >
                                <Info className="w-6 h-6 text-kiro-inkSoft group-hover:text-kiro-accent transition-all group-hover:rotate-12" />
                                <span className="text-[12px] uppercase font-black tracking-wide text-kiro-inkSoft transition-colors group-hover:text-kiro-accent">System Blueprint</span>
                            </Link>
                        </Magnet>
                        <Magnet range={40} className="w-full">
                            <Link
                                to={ECOSYSTEM_ROUTES.contact}
                                className="w-full p-6 rounded-[8px] bg-kiro-accent hover:bg-[#705939] transition-all group flex flex-col items-center gap-3 shadow-[0_4px_16px_rgba(139,111,71,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                            >
                                <PhoneCall className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                <span className="text-[12px] uppercase font-black tracking-wide text-white">Review With Designer</span>
                            </Link>
                        </Magnet>
                    </div>
                </div>
            </div>
        </div >
    );
}



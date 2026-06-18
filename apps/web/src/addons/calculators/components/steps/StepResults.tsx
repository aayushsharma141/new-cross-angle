/* Results — Final Estimate Display */

import { useEffect, useRef, useState } from "react";
import type { CalculatorFormData, EstimateResult } from "../data/types";
import { formatCurrency, formatRange } from "../data/format-utils";
import { SERVICES as DEFAULT_SERVICES, TIERS as DEFAULT_TIERS, THEME } from "../data/pricing-config";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Link } from "react-router-dom";
import { Home, Calendar, Check, AlertTriangle, PhoneCall, Info, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    const { data: tiers = DEFAULT_TIERS } = useFlowConfig<typeof DEFAULT_TIERS>("city_tiers");
    const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null);
    const [appliedSavings, setAppliedSavings] = useState<number>(0);

    if (!estimate) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-[#faf8f5] flex items-center justify-center mb-6 border border-[#e8e4dd] shadow-lg">
                    <AlertTriangle className="w-8 h-8 text-[#8b6f47]" />
                </div>
                <h3 className="text-[#1a1a1a] text-xl font-bold mb-4">No Estimate Found</h3>
                <p className="text-[#5a5a5a] text-center max-w-xs mb-8">
                    It looks like we're missing some details to calculate your investment range.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-8 py-3 rounded-[8px] font-black text-xs uppercase tracking-widest bg-[#8b6f47] text-white hover:bg-[#705939] transition-all active:scale-[0.98] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                    >
                        ← Go Back
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="px-8 py-3 rounded-[8px] font-black text-xs uppercase tracking-widest border border-[#e8e4dd] bg-white text-[#1a1a1a] hover:bg-[#faf8f5] transition-all active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                    >
                        Start Over
                    </button>
                    <Link
                        to={ECOSYSTEM_ROUTES.contact}
                        className="px-8 py-3 rounded-[8px] font-black text-xs uppercase tracking-widest border border-[#e8e4dd] bg-white text-[#5a5a5a] hover:bg-[#faf8f5] transition-all active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        );
    }

    const svc = services.find(s => s.id === formData.selectedService);
    const cityLabel = formData.city === 'Other' ? 'Other City' : formData.city;
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
            icon: <Calendar className="w-4 h-4 text-[#8b6f47]" />
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

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1] as const
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const finalMin = Math.max(0, estimate.total.min - appliedSavings);
    const finalMax = Math.max(0, estimate.total.max - appliedSavings);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-20"
        >
            {/* ═══ Immersive Header Card ═══ */}
            <StarBorder
              color="#8b6f47"
              backgroundColor="rgba(255, 255, 255, 0.9)"
              className="relative shadow-[0_8px_40px_rgba(139,111,71,0.08)]"
            >
              <div className="relative overflow-hidden p-10 lg:p-14 border border-[#e8e4dd]/10">
                {/* Warm Aura Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#8b6f47]/[0.06] blur-[120px] rounded-full -mr-32 -mt-32" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b6f47]/[0.04] blur-[100px] rounded-full -ml-20 -mb-20" aria-hidden="true" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        variants={itemVariants}
                        className="mb-4 block"
                    >
                      <FallingText
                        text={hasBlueprint ? "Personalized Investment Outlook" : "Baseline Investment Outlook"}
                        className="text-[#8b6f47] font-mono text-[10px] uppercase tracking-[0.5em] font-bold justify-center"
                        delay={15}
                      />
                    </motion.div>

                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl md:text-6xl font-bold text-[#1a1a1a] tracking-tighter mb-3 font-serif"
                    >
                        <span className="tabular-nums">
                            <CountUp to={finalMin} duration={1.8} separator="," locale="en-IN" currency="INR" /> – <CountUp to={finalMax} duration={1.8} separator="," locale="en-IN" currency="INR" />
                        </span>
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-sm md:text-base text-[#5a5a5a] max-w-xl leading-relaxed mb-6">
                        {hasBlueprint
                            ? `Estimated from your selected scope and calibrated with ${blueprintName}.`
                            : "Estimated from your selected scope. Add a Discovery Blueprint first for a more personal report."}
                    </motion.p>

                    {/* Gold accent underline */}
                    <motion.div
                        className="h-0.5 bg-gradient-to-r from-transparent via-[#8b6f47] to-transparent mb-8"
                        initial={{ width: 0 }}
                        animate={{ width: 160 }}
                        transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />

                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
                    </motion.div>
                </div>
              </div>
            </StarBorder>

            {/* ═══ Content Split ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Breakdown + Concordance (7 Cols) */}
                <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
                    <div className="bg-white border border-[#e8e4dd] rounded-[8px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-[6px] bg-[#8b6f47]/10 border border-[#8b6f47]/25 flex items-center justify-center shrink-0">
                                <Compass className="w-5 h-5 text-[#8b6f47]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#8b6f47] mb-2">
                                    {hasBlueprint ? "Discovery Continuity" : "Personalization Gap"}
                                </p>
                                <h3 className="text-xl font-serif text-[#1a1a1a] mb-3">
                                    {hasBlueprint ? `${blueprintName} carried into execution` : "This is a direct estimate"}
                                </h3>
                                <p className="text-sm text-[#5a5a5a] leading-relaxed">
                                    {blueprintSummary}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Execution Intelligence */}
                    <div className="bg-white border border-[#e8e4dd] rounded-[8px] overflow-hidden backdrop-blur-xl transition-all shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="px-8 py-6 border-b border-[#e8e4dd] flex items-center justify-between">
                            <h3 className="text-[#1a1a1a] text-base font-bold uppercase tracking-widest font-sans">Execution Intelligence</h3>
                            <div className="p-2 bg-[#faf8f5] rounded-[4px] border border-[#e8e4dd] flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider text-[#8b6f47]">
                                <motion.span
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    Interactive
                                </motion.span>
                            </div>
                        </div>

                        <div className="p-2 divide-y divide-[#e8e4dd]/60">
                            {breakdownItems.map((item, i) => {
                                const isExpanded = expandedItemIndex === i;
                                return (
                                    <div key={i} className="group transition-colors">
                                        <motion.button
                                            type="button"
                                            onClick={() => setExpandedItemIndex(isExpanded ? null : i)}
                                            variants={itemVariants}
                                            className="w-full flex justify-between items-center px-6 py-5 text-left rounded-[4px] hover:bg-[#8b6f47]/[0.03] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-1"
                                            title="Click to view details"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-[4px] border border-[#e8e4dd] bg-[#faf8f5] flex items-center justify-center group-hover:bg-[#8b6f47]/10 transition-colors">
                                                    {item.icon || <div className="w-1.5 h-1.5 rounded-full bg-[#8b6f47]/50 group-hover:bg-[#8b6f47]" />}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[#5a5a5a] text-[11px] font-medium uppercase tracking-widest transition-colors group-hover:text-[#1a1a1a]">{item.label}</span>
                                                    <Info className="w-3.5 h-3.5 text-[#5a5a5a]/40 group-hover:text-[#8b6f47] transition-colors" />
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight",
                                                item.color === THEME.ACCENT ? "text-[#8b6f47]" : "text-[#1a1a1a]"
                                            )}>
                                                {item.value}
                                            </span>
                                        </motion.button>
                                        
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                                    className="overflow-hidden bg-[#faf8f5] border-l-2 border-[#8b6f47] ml-6"
                                                >
                                                    <div className="px-8 py-4 text-[11px] text-[#5a5a5a] leading-relaxed font-light italic">
                                                        {getItemExplanation(item.label, formData.propertyType || "")}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Footer */}
                        <div className="p-8 bg-[#faf8f5]/60 border-t border-[#e8e4dd] flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-[#5a5a5a] uppercase tracking-widest font-black mb-1">Indicative Total</p>
                                <p className="text-2xl font-bold text-[#8b6f47] font-serif">{formatRange(finalMin, finalMax)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-[#5a5a5a] italic leading-relaxed font-medium">Model includes scope,<br />standard GST and contingency.</p>
                            </div>
                        </div>
                    </div>

                    {/* Blueprint Translation */}
                    <div className="bg-white border border-[#e8e4dd] p-8 rounded-[8px] relative overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b6f47]/[0.04] blur-2xl pointer-events-none group-hover:bg-[#8b6f47]/[0.08] transition-colors" aria-hidden="true" />
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-[4px] bg-[#8b6f47]/10 border border-[#8b6f47]/25 flex items-center justify-center">
                                <span className="text-[#8b6f47] text-lg">✦</span>
                            </div>
                            <h3 className="text-[#1a1a1a] text-base font-bold uppercase tracking-widest">Blueprint Translation</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Radial gauge */}
                            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        className="fill-none stroke-[#e8e4dd]"
                                        strokeWidth="4"
                                    />
                                    <motion.circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        className="fill-none stroke-[#8b6f47]"
                                        strokeWidth="4"
                                        strokeDasharray="251.2"
                                        initial={{ strokeDashoffset: 251.2 }}
                                        animate={{ strokeDashoffset: 251.2 - (251.2 * 0.85) }}
                                        transition={{ duration: 2.0, ease: "easeOut", delay: 0.3 }}
                                        style={{ filter: "drop-shadow(0 0 6px rgba(139,111,71,0.3))" }}
                                    />
                                </svg>
                                <span className="absolute text-[#1a1a1a] font-serif text-lg font-bold">85%</span>
                            </div>
                            <div className="flex-1 space-y-1.5 text-center sm:text-left">
                                <h4 className="text-xs font-black uppercase text-[#8b6f47] tracking-wider">
                                    {hasBlueprint ? "Profile-to-scope fit" : "Baseline scope fit"}
                                </h4>
                                <p className="text-[#5a5a5a] text-[11px] leading-relaxed">
                                    {hasBlueprint
                                        ? `Your ${blueprintName} profile helps prioritize finish language, service depth, and bespoke inclusions before a designer reviews the final plan.`
                                        : "This estimate is useful for scope planning. A Discovery Blueprint adds the emotional, material, and lifestyle layer needed for a more personalized report."}
                                </p>
							</div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: ALCS Intelligence + Inclusions + Roadmap + CTAs (5 Cols) */}
                <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">

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
                    <div className="bg-white border border-[#e8e4dd] rounded-[8px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b6f47]/[0.04] blur-2xl -mr-16 -mt-16 group-hover:bg-[#8b6f47]/[0.08] transition-colors" aria-hidden="true" />

                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-[4px] bg-[#8b6f47]/10 border border-[#8b6f47]/25 flex items-center justify-center">
                                <Check className="w-5 h-5 text-[#8b6f47]" />
                            </div>
                            <h3 className="text-[#1a1a1a] text-base font-bold uppercase tracking-widest font-sans">Scope Inclusions</h3>
                        </div>

                        <div className="space-y-4">
                            {svc?.includes.slice(0, 6).map((item, i) => (
                                <div key={i} className="flex items-start gap-3 group/item">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#8b6f47]/40 mt-1.5 group-hover/item:scale-150 transition-transform" />
                                    <span className="text-[#5a5a5a] text-[11px] leading-relaxed group-hover/item:text-[#1a1a1a] transition-colors">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Timeline Roadmap */}
                    <div className="bg-white border border-[#e8e4dd] p-8 rounded-[8px] relative overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        <h3 className="text-[#1a1a1a] text-base font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[4px] border border-[#e8e4dd] bg-[#faf8f5] flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-[#8b6f47]" />
                            </div>
                            Artisanal Roadmap
                        </h3>
                        
                        <div className="relative border-l border-[#e8e4dd] ml-3 pl-8 space-y-8">
                            {/* Phase 1 */}
                            <div className="relative group/step">
                                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-[4px] bg-[#faf8f5] border border-[#8b6f47] flex items-center justify-center text-[10px] font-bold text-[#8b6f47] group-hover/step:bg-[#8b6f47] group-hover/step:text-white transition-all">
                                    01
                                </div>
                                <h4 className="text-[11px] font-black uppercase text-[#1a1a1a] tracking-wider mb-1">Blueprint & Scope Calibration</h4>
                                <span className="text-[9px] font-mono text-[#8b6f47]/80 block mb-1">Weeks 1 – 4</span>
                                <p className="text-[#5a5a5a] text-[10px] leading-relaxed">
                                    Aligning your project details with style intent, room priorities, and investment comfort.
                                </p>
                            </div>

                            {/* Phase 2 */}
                            <div className="relative group/step">
                                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-[4px] bg-[#faf8f5] border border-[#e8e4dd] flex items-center justify-center text-[10px] font-bold text-[#5a5a5a] group-hover/step:border-[#8b6f47] group-hover/step:text-[#8b6f47] transition-all">
                                    02
                                </div>
                                <h4 className="text-[11px] font-black uppercase text-[#1a1a1a] tracking-wider mb-1">Design Detailing & Sourcing</h4>
                                <span className="text-[9px] font-mono text-[#8b6f47]/80 block mb-1">Weeks 5 – 12</span>
                                <p className="text-[#5a5a5a] text-[10px] leading-relaxed">
                                    Translating the agreed direction into drawings, materials, vendor planning, and finish selections.
                                </p>
                            </div>

                            {/* Phase 3 */}
                            <div className="relative group/step">
                                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-[4px] bg-[#faf8f5] border border-[#e8e4dd] flex items-center justify-center text-[10px] font-bold text-[#5a5a5a] group-hover/step:border-[#8b6f47] group-hover/step:text-[#8b6f47] transition-all">
                                    03
                                </div>
                                <h4 className="text-[11px] font-black uppercase text-[#1a1a1a] tracking-wider mb-1">Execution Stewardship & Handover</h4>
                                <span className="text-[9px] font-mono text-[#8b6f47]/80 block mb-1">Weeks 13+</span>
                                <p className="text-[#5a5a5a] text-[10px] leading-relaxed">
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
                                className="w-full p-6 rounded-[8px] border border-[#e8e4dd] bg-white hover:bg-[#8b6f47]/[0.04] hover:border-[#8b6f47]/40 transition-all group flex flex-col items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                            >
                                <Home className="w-6 h-6 text-[#5a5a5a] group-hover:text-[#8b6f47] transition-all group-hover:rotate-12" />
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#5a5a5a] transition-colors group-hover:text-[#8b6f47]">Restart Estimate</span>
                            </button>
                        </Magnet>
                        <Magnet range={40} className="w-full">
                            <Link
                                to={ECOSYSTEM_ROUTES.discovery}
                                className="w-full p-6 rounded-[8px] border border-[#e8e4dd] bg-white hover:bg-[#8b6f47]/[0.04] hover:border-[#8b6f47]/40 transition-all group flex flex-col items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                            >
                                <Compass className="w-6 h-6 text-[#5a5a5a] group-hover:text-[#8b6f47] transition-colors" />
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#5a5a5a] transition-colors group-hover:text-[#8b6f47]">
                                    {hasBlueprint ? "Refine Blueprint" : "Create Blueprint"}
                                </span>
                            </Link>
                        </Magnet>
                        <Magnet range={40} className="w-full">
                            <Link
                                to="/system-blueprint"
                                className="w-full p-6 rounded-[8px] border border-[#e8e4dd] bg-white hover:bg-[#8b6f47]/[0.04] hover:border-[#8b6f47]/40 transition-all group flex flex-col items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                            >
                                <Info className="w-6 h-6 text-[#5a5a5a] group-hover:text-[#8b6f47] transition-all group-hover:rotate-12" />
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#5a5a5a] transition-colors group-hover:text-[#8b6f47]">System Blueprint</span>
                            </Link>
                        </Magnet>
                        <Magnet range={40} className="w-full">
                            <Link
                                to={ECOSYSTEM_ROUTES.contact}
                                className="w-full p-6 rounded-[8px] bg-[#8b6f47] hover:bg-[#705939] transition-all group flex flex-col items-center gap-3 shadow-[0_4px_16px_rgba(139,111,71,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                            >
                                <PhoneCall className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] uppercase font-black tracking-widest text-white">Review With Designer</span>
                            </Link>
                        </Magnet>
                    </div>
                </motion.div>
            </div>
        </motion.div >
    );
}

function Badge({ label, variant = "glass" }: { label: string; variant?: "glass" | "primary" | "gold" }) {
    const variants = {
        glass: "bg-white/70 text-[#5a5a5a] border-[#e8e4dd] font-medium backdrop-blur-md",
        primary: "bg-[#8b6f47]/15 text-[#8b6f47] border-[#8b6f47]/25 font-bold",
        gold: "bg-[#8b6f47]/15 text-[#8b6f47] border-[#8b6f47]/25 font-bold",
    };

    return (
        <span className={cn(
            "px-4 py-1.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider border",
            variants[variant]
        )}>
            {label}
        </span>
    );
}

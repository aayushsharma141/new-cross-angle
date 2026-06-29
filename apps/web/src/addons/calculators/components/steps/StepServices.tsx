import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { CalculatorFormData, ServiceId, ExecutionTierId } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import type { ExecutionTierItem } from "@/components/admin/estimator-flow/ExecutionTiersEditor";
import { getOptimizedUrl } from "@/lib/cdn";
import { SERVICES as DEFAULT_SERVICES } from "../data/pricing-config";
import {
    selectableCardClassLight,
    cardListContainer,
    cardListItem,
} from "@/addons/_shared/card-styles";
import { AnimatedContent } from "@/components/ReactBits";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

export function StepServices({ formData, updateField }: Props) {
    const { data: services = DEFAULT_SERVICES } = useFlowConfig<typeof DEFAULT_SERVICES>("services");
    const { data: executionTiers } = useFlowConfig<ExecutionTierItem[]>("execution_tiers");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);
    const selectedServiceObj = services.find(s => s.id === formData.selectedService);

    return (
        <div className="w-full mx-auto pb-4">
            <AnimatedContent distance={20} delay={0.05} duration={0.6}>
                <motion.div
                    variants={cardListContainer}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-3"
                    role="radiogroup"
                    aria-label="Service selection"
                >
                    {services.map(svc => {
                        const selected = formData.selectedService === svc.id;
                        const expanded = expandedId === svc.id;

                        return (
                            <motion.div
                                key={svc.id}
                                variants={cardListItem}
                                className={`${selectableCardClassLight(selected, "p-0")} ${selected ? "border-2 border-[#7a5c30] shadow-[0_8px_28px_rgba(122,92,48,0.18)]" : ""}`}
                            >
                                {/* Full-card fill — transparent allows outer bg to show */}
                                <div className={`relative w-full h-full transition-all duration-300 ${
                                    selected ? "bg-[#7a5c30]/[0.10]" : "bg-white/60 group-hover:bg-[#7a5c30]/[0.04]"
                                }`}>
                                    {/* Removed breathing glow span due to WebKit overflow-hidden clipping bug with border-radius and scale */}
                                    {/* Header */}
                                    <button
                                        type="button"
                                        {...(selected ? { "aria-pressed": "true" } : { "aria-pressed": "false" })}
                                        onClick={() => {
                                            updateField("selectedService", svc.id as ServiceId);
                                            if (svc.id !== "C5") updateField("executionTier", null);
                                        }}
                                        className="w-full text-left p-4 sm:p-5 focus:outline-none group"
                                        title={`Select ${svc.label} service`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <span className={`text-[12px] font-black px-2 py-0.5 rounded-none uppercase tracking-wider transition-colors ${selected ? "bg-[#7a5c30] text-white shadow-[0_2px_8px_rgba(122,92,48,0.3)]" : "bg-[#1a1a1a]/10 text-[#1a1a1a]/70 group-hover:bg-[#1a1a1a]/15"
                                                        }`}>
                                                        {svc.id}
                                                    </span>
                                                    <span className={`font-bold text-base transition-colors ${selected ? "text-[#7a5c30] font-bold" : "text-[#1a1a1a]/80 font-medium group-hover:text-[#1a1a1a]"
                                                        }`}>
                                                        {svc.label}
                                                    </span>
                                                </div>
                                                <div className={`text-xs leading-relaxed max-w-md transition-colors ${selected ? "text-[#1a1a1a]/80" : "text-[#5a5a5a] group-hover:text-[#4a4a4a]"}`}>
                                                    {svc.desc}
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className={`font-black text-sm tracking-tight transition-colors ${svc.tiers ? "text-[#7a5c30]" : selected ? "text-[#7a5c30]" : "text-[#1a1a1a]/95 group-hover:text-[#1a1a1a]"
                                                    }`}>
                                                    {svc.rateLabel}
                                                </div>
                                                {selected && (
                                                    <span className="text-[#7a5c30] text-[12px] font-bold uppercase mt-1">✓ Selected</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expand toggle */}
                                    <div className="px-5 pb-3 flex justify-between items-center border-t border-[#1a1a1a]/[0.06]">
                                        <button type="button" onClick={() => toggle(svc.id)}
                                            {...{"aria-expanded": expanded}}
                                            aria-controls={`svc-details-${svc.id}`}
                                            className="text-[#5a5a5a] text-[13px] font-semibold hover:text-[#7a5c30] hover:bg-kiro-accentSoft/50 transition-colors uppercase tracking-wide flex items-center gap-1 py-1 px-2 -ml-2 rounded-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a5c30]"
                                            >
                                            {expanded ? (
                                                <>Hide Details <ChevronUp size={14} /></>
                                            ) : (
                                                <>Full Scope <ChevronDown size={14} /></>
                                            )}
                                        </button>
                                    </div>

                                    {/* Expanded details */}
                                    {expanded && (
                                        <div id={`svc-details-${svc.id}`} className="border-t border-[#1a1a1a]/[0.06] bg-site-bg/20 p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {/* Includes */}
                                            <div>
                                                <div className="text-[#7a5c30] text-[12px] font-black uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    Deliverables
                                                </div>
                                                <div className="space-y-2">
                                                    {svc.includes.map((item, i) => (
                                                        <div key={i} className="text-[#1a1a1a] text-[12px] flex items-start gap-2 leading-snug">
                                                            <span className="text-[#7a5c30]/60 mt-0.5">•</span>
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Meta / Excludes */}
                                            <div className="space-y-4">
                                                {svc.excludes && svc.excludes.length > 0 && (
                                                    <div>
                                                        <div className="text-[#7a5c30] text-[12px] font-black uppercase tracking-wide mb-3 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                            Out of Scope
                                                        </div>
                                                        <div className="space-y-2">
                                                            {svc.excludes.map((item, i) => (
                                                                <div key={i} className="text-[#5a5a5a] text-[12px] flex items-start gap-2 leading-snug italic">
                                                                    <span className="text-[#1a1a1a]/20 mt-0.5">✗</span>
                                                                    {item}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    {svc.revisions && (
                                                        <div>
                                                            <div className="text-[12px] text-[#5a5a5a] uppercase font-black tracking-tighter">Revisions</div>
                                                            <div className="text-xs text-[#1a1a1a] mt-0.5 font-medium">{svc.revisions}</div>
                                                        </div>
                                                    )}
                                                    {svc.timeline && (
                                                        <div>
                                                            <div className="text-[12px] text-[#5a5a5a] uppercase font-black tracking-tighter">Turnaround</div>
                                                            <div className="text-xs text-[#1a1a1a] mt-0.5 font-medium">{svc.timeline}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {svc.extras && (
                                                    <div className="bg-[#7a5c30]/5 border border-[#7a5c30]/20 rounded-none p-3 text-[13px] text-[#7a5c30]/80 leading-relaxed font-medium">
                                                        <span className="font-black mr-1">NOTE:</span> {svc.extras}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatedContent>

            {/* Execution tiers rendered below the main service cards */}
            {selectedServiceObj?.tiers && (
                <AnimatedContent distance={20} delay={0.1} duration={0.6}>
                    <div className="mt-8 p-6 rounded-[12px] bg-[#ffffff] border border-[#1a1a1a]/[0.06] shadow-sm">
                        <div className="text-[#7a5c30] text-[13px] font-black uppercase tracking-wide mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_rgba(139,111,71,0.5)]" />
                            Select Execution Grade
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Execution grade selection">
                            {Object.entries(selectedServiceObj.tiers).map(([key, staticTier]) => {
                                const active = formData.executionTier === key;
                                const dynamicTier = executionTiers?.find(t => t.id === key);
                                const label = dynamicTier?.label || staticTier.label;
                                const desc = dynamicTier?.desc || staticTier.desc;
                                const imageId = dynamicTier?.imageId;
                                
                                return (
                                    <button type="button" key={key}
                                        {...(active ? { "aria-pressed": "true" } : { "aria-pressed": "false" })}
                                        onClick={() => updateField("executionTier", key as ExecutionTierId)}
                                        className={`group rounded-[8px] p-5 text-left transition-all duration-300 relative overflow-hidden border cursor-pointer ${active
                                            ? "bg-[#7a5c30]/18 border-2 border-[#7a5c30] shadow-[0_4px_24px_rgba(139,111,71,0.25)] -translate-y-[2px] scale-[1.01] ring-2 ring-[#7a5c30]/30"
                                            : "bg-[#faf8f5] border-[#1a1a1a]/[0.06] hover:bg-[#f3ede2] hover:border-[#7a5c30]/55 hover:shadow-[0_4px_20px_rgba(139,111,71,0.12)] hover:-translate-y-[2px]"
                                            }`}
                                        title={`Select ${label} execution grade`}>
                                        <div className="flex gap-4 h-full">
                                            {imageId && (
                                                <div className="w-14 h-14 shrink-0">
                                                    <img src={getOptimizedUrl(imageId, { width: 96, quality: 75 })} alt={label} className="w-full h-full object-cover rounded-md border border-[#1a1a1a]/10" />
                                                </div>
                                            )}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <div className={`font-black text-[15px] uppercase tracking-tight transition-colors ${active ? "text-[#7a5c30]" : "text-[#1a1a1a] group-hover:text-[#1a1a1a]"}`}>
                                                        {label}
                                                    </div>
                                                    {active && (
                                                        <div className="w-2 h-2 mt-1.5 rounded-full bg-[#7a5c30] shadow-[0_0_12px_rgba(122,92,48,0.6)]" />
                                                    )}
                                                </div>
                                                <div className={`text-sm font-black italic tracking-tight mb-2 ${active ? "text-[#7a5c30]" : "text-[#1a1a1a]/70 group-hover:text-[#1a1a1a]/80"}`}>
                                                    ₹{staticTier.min.toLocaleString()} – ₹{staticTier.max.toLocaleString()} <span className="text-[12px] opacity-70 not-italic uppercase tracking-wider">/sqft</span>
                                                </div>
                                                <div className="text-[#5a5a5a] text-[13px] leading-relaxed line-clamp-2 group-hover:text-[#4a4a4a]">
                                                    {desc}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </AnimatedContent>
            )}
        </div>
    );
}

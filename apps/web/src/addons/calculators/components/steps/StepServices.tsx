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
    breathingAnimationLight,
    breathingTransitionLight,
} from "@/addons/_shared/card-styles";
import { SpotlightCard, AnimatedContent } from "@/components/ReactBits";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

export function StepServices({ formData, updateField }: Props) {
    const { data: services = DEFAULT_SERVICES } = useFlowConfig<typeof DEFAULT_SERVICES>("services");
    const { data: executionTiers } = useFlowConfig<ExecutionTierItem[]>("execution_tiers");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

    return (
        <div className="max-w-4xl mx-auto overflow-y-auto max-h-[65vh] pr-1 scroll-smooth">
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
                                className={selectableCardClassLight(selected, "p-0")}
                            >
                                <SpotlightCard
                                    className="relative w-full h-full"
                                    spotlightColor={selected ? "rgba(139, 111, 71, 0.15)" : "rgba(139, 111, 71, 0.08)"}
                                >
                                    {selected && (
                                        <motion.span
                                            aria-hidden="true"
                                            className="absolute inset-0 pointer-events-none"
                                            animate={breathingAnimationLight}
                                            transition={breathingTransitionLight}
                                        />
                                    )}
                                    {/* Header */}
                                    <button
                                        type="button"
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
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-wider transition-colors ${selected ? "bg-[#8b6f47] text-black" : "bg-[#1a1a1a]/10 text-[#1a1a1a]/70"
                                                        }`}>
                                                        {svc.id}
                                                    </span>
                                                    <span className={`font-bold text-base transition-colors group-hover:text-[#1a1a1a] ${selected ? "text-[#8b6f47] font-bold" : "text-[#1a1a1a]/80 font-medium"
                                                        }`}>
                                                        {svc.label}
                                                    </span>
                                                </div>
                                                <div className={`text-xs leading-relaxed max-w-md transition-colors ${selected ? "text-[#1a1a1a]/75" : "text-[#5a5a5a]"}`}>
                                                    {svc.desc}
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className={`font-black text-sm tracking-tight transition-colors ${svc.tiers ? "text-[#8b6f47]" : selected ? "text-[#8b6f47]" : "text-[#1a1a1a]/95"
                                                    }`}>
                                                    {svc.rateLabel}
                                                </div>
                                                {selected && (
                                                    <span className="text-[#8b6f47] text-[10px] font-bold uppercase mt-1 animate-pulse">
                                                        Selected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expand toggle */}
                                    <div className="px-5 pb-3 flex justify-between items-center border-t border-[#1a1a1a]/[0.06]">
                                        <button type="button" onClick={() => toggle(svc.id)}
                                            {...{"aria-expanded": expanded}}
                                            aria-controls={`svc-details-${svc.id}`}
                                            className="text-[#5a5a5a] text-[11px] font-semibold hover:text-[#8b6f47] transition-colors uppercase tracking-widest flex items-center gap-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] rounded-sm"
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
                                                <div className="text-[#8b6f47] text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    Deliverables
                                                </div>
                                                <div className="space-y-2">
                                                    {svc.includes.map((item, i) => (
                                                        <div key={i} className="text-[#1a1a1a] text-[12px] flex items-start gap-2 leading-snug">
                                                            <span className="text-[#8b6f47]/60 mt-0.5">•</span>
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Meta / Excludes */}
                                            <div className="space-y-4">
                                                {svc.excludes && svc.excludes.length > 0 && (
                                                    <div>
                                                        <div className="text-[#8b6f47] text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
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
                                                            <div className="text-[10px] text-[#5a5a5a] uppercase font-black tracking-tighter">Revisions</div>
                                                            <div className="text-xs text-[#1a1a1a] mt-0.5 font-medium">{svc.revisions}</div>
                                                        </div>
                                                    )}
                                                    {svc.timeline && (
                                                        <div>
                                                            <div className="text-[10px] text-[#5a5a5a] uppercase font-black tracking-tighter">Turnaround</div>
                                                            <div className="text-xs text-[#1a1a1a] mt-0.5 font-medium">{svc.timeline}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {svc.extras && (
                                                    <div className="bg-[#8b6f47]/5 border border-[#8b6f47]/20 rounded-none p-3 text-[11px] text-[#8b6f47]/80 leading-relaxed font-medium">
                                                        <span className="font-black mr-1">NOTE:</span> {svc.extras}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Execution tiers for services that have them */}
                                    {selected && svc.tiers && (
                                        <div className="border-t border-[#1a1a1a]/[0.06] bg-site-bg/40 p-5">
                                            <div className="text-[#5a5a5a] text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                                Select Execution Grade
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Object.entries(svc.tiers).map(([key, staticTier]) => {
                                                    const active = formData.executionTier === key;
                                                    const dynamicTier = executionTiers?.find(t => t.id === key);
                                                    const label = dynamicTier?.label || staticTier.label;
                                                    const desc = dynamicTier?.desc || staticTier.desc;
                                                    const imageId = dynamicTier?.imageId;
                                                    
                                                    return (
                                                        <button type="button" key={key}
                                                            onClick={() => updateField("executionTier", key as ExecutionTierId)}
                                                            className={`group border-2 rounded-none p-4 text-left transition-all duration-200 relative overflow-hidden ${active
                                                                ? "bg-[#8b6f47]/10 border-[#8b6f47] ring-2 ring-[#8b6f47]/10"
                                                                : "bg-[#ffffff] border-[#1a1a1a]/[0.06] hover:border-[#8b6f47]/30"
                                                                }`}
                                                            title={`Select ${label} execution grade`}>
                                                            <div className="flex gap-3 h-full">
                                                                {imageId && (
                                                                    <div className="w-12 h-12 shrink-0">
                                                                        <img src={getOptimizedUrl(imageId, { width: 96, quality: 75 })} alt={label} className="w-full h-full object-cover rounded-md border border-[#1a1a1a]/10" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 flex flex-col justify-center">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <div className={`font-black text-sm uppercase tracking-tight transition-colors ${active ? "text-[#8b6f47] font-bold" : "text-[#1a1a1a]/80"
                                                                            }`}>
                                                                            {label}
                                                                        </div>
                                                                        {active && <div className="w-1.5 h-1.5 rounded-full bg-[#8b6f47] shadow-[0_0_8px_rgba(209,175,110,0.5)]" />}
                                                                    </div>
                                                                    <div className="text-[#8b6f47] text-sm font-black italic tracking-tight mb-1">
                                                                        ₹{staticTier.min.toLocaleString()} – ₹{staticTier.max.toLocaleString()} <span className="text-[10px] opacity-70">/sqft</span>
                                                                    </div>
                                                                    <div className="text-[#5a5a5a] text-[10px] leading-relaxed line-clamp-2">
                                                                        {desc}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </SpotlightCard>
                            </motion.div>
                        );
                    })}
                </motion.div >
            </AnimatedContent>
        </div >
    );
}

/* Step 5 — Scope of Services (C1–C5) */

import { useState } from "react";
import type { CalculatorFormData, ServiceId, ExecutionTierId } from "../data/types";
import { SERVICES, THEME } from "../data/pricing-config";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

export function StepServices({ formData, updateField }: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-1 text-site-text-heading uppercase">
                Scope of Services
            </h2>
            <p className="text-site-text-muted mb-6 text-sm">
                Choose the service tier that matches your needs
            </p>

            <div className="flex flex-col gap-3">
                {SERVICES.map(svc => {
                    const selected = formData.selectedService === svc.id;
                    const expanded = expandedId === svc.id;

                    return (
                        <div key={svc.id}
                            className={`border-2 rounded-none overflow-hidden transition-all duration-300 ${selected
                                ? "bg-site-crimson/5 border-site-crimson shadow-[0_0_30px_-5px_rgba(227, 83, 54,0.2)]"
                                : "bg-site-bg-card border-site-border hover:border-site-crimson/30"
                                }`}
                        >
                            {/* Header */}
                            <button
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
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-wider ${selected ? "bg-site-crimson text-site-bg" : "bg-site-bg-card-hover text-site-text-meta"
                                                }`}>
                                                {svc.id}
                                            </span>
                                            <span className={`font-bold text-base transition-colors group-hover:text-site-text-heading ${selected ? "text-site-crimson" : "text-site-text-heading"
                                                }`}>
                                                {svc.label}
                                            </span>
                                        </div>
                                        <div className="text-site-text-muted text-xs leading-relaxed max-w-md">
                                            {svc.desc}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className={`font-black text-sm tracking-tight ${svc.id === "C5" ? "text-yellow-500" : "text-site-crimson"
                                            }`}>
                                            {svc.rateLabel}
                                        </div>
                                        {selected && (
                                            <span className="text-emerald-500 text-[10px] font-bold uppercase mt-1 animate-pulse">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Expand toggle */}
                            <div className="px-5 pb-3 flex justify-between items-center border-t border-site-border/30">
                                <button onClick={() => toggle(svc.id)}
                                    className="text-site-text-meta text-[11px] font-semibold hover:text-site-crimson transition-colors uppercase tracking-widest flex items-center gap-1"
                                    title={expanded ? "Show less info" : "Show full scope info"}>
                                    {expanded ? "Less Info ▲" : "Full Scope ▼"}
                                </button>
                            </div>

                            {/* Expanded details */}
                            {expanded && (
                                <div className="border-t border-site-border/30 bg-site-bg/20 p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {/* Includes */}
                                    <div>
                                        <div className="text-site-crimson text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            Deliverables
                                        </div>
                                        <div className="space-y-2">
                                            {svc.includes.map((item, i) => (
                                                <div key={i} className="text-site-text text-[12px] flex items-start gap-2 leading-snug">
                                                    <span className="text-site-crimson/60 mt-0.5">•</span>
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Meta / Excludes */}
                                    <div className="space-y-4">
                                        {svc.excludes && svc.excludes.length > 0 && (
                                            <div>
                                                <div className="text-site-crimson text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    Out of Scope
                                                </div>
                                                <div className="space-y-2">
                                                    {svc.excludes.map((item, i) => (
                                                        <div key={i} className="text-site-text-muted text-[12px] flex items-start gap-2 leading-snug italic">
                                                            <span className="text-site-crimson/40 mt-0.5">✗</span>
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            {svc.revisions && (
                                                <div>
                                                    <div className="text-[10px] text-site-text-meta uppercase font-black tracking-tighter">Revisions</div>
                                                    <div className="text-xs text-site-text-heading mt-0.5 font-medium">{svc.revisions}</div>
                                                </div>
                                            )}
                                            {svc.timeline && (
                                                <div>
                                                    <div className="text-[10px] text-site-text-meta uppercase font-black tracking-tighter">Turnaround</div>
                                                    <div className="text-xs text-site-text-heading mt-0.5 font-medium">{svc.timeline}</div>
                                                </div>
                                            )}
                                        </div>

                                        {svc.extras && (
                                            <div className="bg-site-crimson/5 border border-site-crimson/20 rounded-none p-3 text-[11px] text-site-crimson/80 leading-relaxed font-medium">
                                                <span className="font-black mr-1">NOTE:</span> {svc.extras}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* C5 execution tiers */}
                            {selected && svc.id === "C5" && svc.tiers && (
                                <div className="border-t border-site-border bg-site-bg/40 p-5">
                                    <div className="text-site-text-meta text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                        Select Execution Grade
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(svc.tiers).map(([key, tier]) => {
                                            const active = formData.executionTier === key;
                                            return (
                                                <button key={key}
                                                    onClick={() => updateField("executionTier", key as ExecutionTierId)}
                                                    className={`group border-2 rounded-none p-4 text-left transition-all duration-200 relative overflow-hidden ${active
                                                        ? "bg-site-crimson/10 border-site-crimson ring-2 ring-site-crimson/20"
                                                        : "bg-site-bg-card border-site-border hover:border-site-crimson/30"
                                                        }`}
                                                    title={`Select ${tier.label} execution grade`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className={`font-black text-sm uppercase tracking-tight ${active ? "text-site-crimson" : "text-site-text-heading"
                                                            }`}>
                                                            {tier.label}
                                                        </div>
                                                        {active && <div className="w-1.5 h-1.5 rounded-full bg-site-crimson shadow-[0_0_8px_rgba(227, 83, 54,0.5)]" />}
                                                    </div>
                                                    <div className="text-site-crimson text-sm font-black italic tracking-tight mb-2">
                                                        ₹{tier.min.toLocaleString()} – ₹{tier.max.toLocaleString()} <span className="text-[10px] opacity-70">/sqft</span>
                                                    </div>
                                                    <div className="text-site-text-muted text-[10px] leading-relaxed line-clamp-2">
                                                        {tier.desc}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div >
        </div >
    );
}

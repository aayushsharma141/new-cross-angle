/* Step 7 — Timeline & Contact */

import React from "react";

import { Zap, Calendar, Search, ClipboardList } from "lucide-react";
import type { CalculatorFormData } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { TIMELINE_OPTIONS } from "../data/pricing-config";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

export function StepTimeline({ formData, updateField }: Props) {
    const { data: timelineOptions = TIMELINE_OPTIONS } = useFlowConfig<typeof TIMELINE_OPTIONS>("timeline_options");
    const showDuration = formData.selectedService === "C4" || formData.selectedService === "C5";
    const showVisits = formData.selectedService === "C4";

    const TimelineIconMap: Record<string, React.ReactNode> = {
        "Immediate": <Zap size={32} className="mx-auto" strokeWidth={1.5} />,
        "1-3 Months": <Calendar size={32} className="mx-auto" strokeWidth={1.5} />,
        "3+ Months": <Search size={32} className="mx-auto" strokeWidth={1.5} />
    };

    const labelStyle = "block text-sm font-medium mb-2 text-kiro-inkSoft";
    const inputStyle = "w-full bg-kiro-surface !bg-kiro-surface border border-kiro-ink/[0.08] focus:border-kiro-accent rounded-[8px] px-4 py-2.5 text-kiro-ink !text-kiro-ink text-sm outline-none transition-all shadow-inner placeholder:text-kiro-ink/30";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Column: Timeline & Settings */}
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-kiro-ink mb-4 uppercase tracking-wide">Project Start</h3>
                    
                    {/* Timeline options — radiogroup for keyboard/screen reader nav */}
                    <div
                        role="radiogroup"
                        aria-label="Project start timeline"
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                    >
                        {timelineOptions.map((opt, i) => {
                            const active = formData.startTiming === opt.label;
                            const isTabable = active || (!formData.startTiming && i === 0);
                            return (
                                <button
                                    type="button"
                                    key={opt.label}
                                    aria-label={`${opt.label}${active ? " (selected)" : ""}`}
                                    tabIndex={isTabable ? 0 : -1}
                                    onClick={() => updateField("startTiming", opt.label)}
                                    className={`
                                        py-5 px-3 text-center transition-all duration-300 rounded-[12px] border cursor-pointer flex flex-col items-center justify-center
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
                                    <div className={`mb-2 transition-colors ${active ? "text-kiro-accent drop-shadow-[0_0_6px_rgba(139,111,71,0.4)]" : "text-kiro-ink/60 group-hover:text-kiro-ink/80"}`}>
                                        {TimelineIconMap[opt.label] || opt.icon}
                                    </div>
                                    <div className={`font-bold text-sm transition-colors ${active ? "text-kiro-accent" : "text-kiro-ink group-hover:text-kiro-ink"}`}>
                                        {opt.label}
                                    </div>
                                    <div className={`text-[12px] uppercase tracking-wider mt-1 transition-colors ${active ? "text-kiro-ink/70" : "text-kiro-inkSoft group-hover:text-kiro-ink/80"}`}>
                                        {opt.desc}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Project duration (C4/C5) */}
                    {showDuration && (
                        <div className="mb-8">
                            <label htmlFor="duration-slider" className={`${labelStyle} flex justify-between`}>
                                <span>Project Duration</span>
                                <span className="font-bold text-kiro-accent">{formData.projectMonths} months</span>
                            </label>
                            <input
                                id="duration-slider"
                                type="range"
                                aria-label={`Project duration: ${formData.projectMonths} months`}
                                min={1} max={24} step={1}
                                value={formData.projectMonths}
                                onChange={e => updateField("projectMonths", Number(e.target.value))}
                                className="w-full h-2.5 bg-kiro-surface border border-kiro-ink/[0.06] rounded-full appearance-none cursor-pointer accent-kiro-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                            />
                            <div className="flex justify-between text-kiro-inkSoft text-xs mt-3 font-mono font-medium">
                                <span>1 month</span><span>24 months</span>
                            </div>
                        </div>
                    )}

                    {/* Extra visits (C4) */}
                    {showVisits && (
                        <div className="mb-8">
                            <label htmlFor="visits-slider" className={`${labelStyle} flex justify-between items-center`}>
                                <span>
                                    Senior Designer Visits
                                    <span className="text-xs ml-2 font-normal text-kiro-inkSoft uppercase tracking-wider">(5 free, then ₹5k/visit)</span>
                                </span>
                                <span className="font-bold text-kiro-accent">{formData.extraVisits}</span>
                            </label>
                            <input
                                id="visits-slider"
                                type="range"
                                aria-label={`Senior designer visits: ${formData.extraVisits}`}
                                min={0} max={20} step={1}
                                value={formData.extraVisits}
                                onChange={e => updateField("extraVisits", Number(e.target.value))}
                                className="w-full h-2.5 bg-kiro-surface border border-kiro-ink/[0.06] rounded-full appearance-none cursor-pointer accent-kiro-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                            />
                            <div className="flex justify-between text-kiro-inkSoft text-xs mt-3 font-mono font-medium">
                                <span>0 visits</span><span>20 visits</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Contact form */}
                <div className="w-full lg:w-80 shrink-0">
                    <fieldset className="bg-kiro-surface border border-kiro-ink/[0.06] rounded-[12px] p-6 shadow-sm sticky top-6">
                        <legend className="font-bold text-sm mb-5 text-kiro-ink uppercase tracking-wide px-1 flex items-center gap-2">
                            <ClipboardList size={18} className="text-kiro-accent" /> Contact Details
                        </legend>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label htmlFor="est-name" className="block text-xs font-bold mb-2 text-kiro-inkSoft uppercase tracking-wide">Full Name <span aria-hidden="true" className="text-red-400">*</span></label>
                                <input
                                    id="est-name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    aria-required="true"
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={e => updateField("name", e.target.value)}
                                    className={`${inputStyle} focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2`}
                                />
                            </div>
                            <div>
                                <label htmlFor="est-email" className="block text-xs font-bold mb-2 text-kiro-inkSoft uppercase tracking-wide">Email</label>
                                <input
                                    id="est-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={e => updateField("email", e.target.value)}
                                    className={`${inputStyle} focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2`}
                                />
                            </div>
                            <div>
                                <label htmlFor="est-phone" className="block text-xs font-bold mb-2 text-kiro-inkSoft uppercase tracking-wide">Phone Number <span aria-hidden="true" className="text-red-400">*</span></label>
                                <input
                                    id="est-phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    aria-required="true"
                                    placeholder="+91 99999 99999"
                                    value={formData.phone}
                                    onChange={e => updateField("phone", e.target.value)}
                                    className={`${inputStyle} focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2`}
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>

            </div>
        </div>
    );
}

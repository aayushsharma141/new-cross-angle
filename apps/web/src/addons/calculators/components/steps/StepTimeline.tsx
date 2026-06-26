/* Step 7 — Timeline & Contact */

import React from "react";
import { motion } from "framer-motion";
import { Zap, Calendar, Search, ClipboardList } from "lucide-react";
import type { CalculatorFormData } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { TIMELINE_OPTIONS } from "../data/pricing-config";
import {
    selectableCardClassLight,
    CARD_INTERACTIONS,
    cardListItem,
    breathingAnimationLight,
    breathingTransitionLight,
} from "@/addons/_shared/card-styles";

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
        <div className="max-w-4xl mx-auto">


            {/* Timeline options — radiogroup for keyboard/screen reader nav */}
            <div
                role="radiogroup"
                aria-label="Project start timeline"
                className="grid grid-cols-3 gap-3 mb-6"
            >
                {timelineOptions.map((opt, i) => {
                    const active = formData.startTiming === opt.label;
                    const isTabable = active || (!formData.startTiming && i === 0);
                    return (
                        <motion.button
                            type="button"
                            key={opt.label}
                            role="radio"
                            aria-checked={active}
                            tabIndex={isTabable ? 0 : -1}
                            variants={cardListItem}
                            whileHover={CARD_INTERACTIONS.whileHover}
                            whileTap={CARD_INTERACTIONS.whileTap}
                            onClick={() => updateField("startTiming", opt.label)}
                            className={selectableCardClassLight(active, "py-4 px-2 text-center")}
                        >
                            {active && (
                                <motion.span
                                    aria-hidden="true"
                                    className="absolute inset-0 pointer-events-none"
                                    animate={breathingAnimationLight}
                                    transition={breathingTransitionLight}
                                />
                            )}
                            <div className="text-kiro-accent mb-1.5">{TimelineIconMap[opt.label] || opt.icon}</div>
                            <div className={`font-semibold text-sm transition-colors ${active ? "text-kiro-accent font-bold" : "text-kiro-ink/80"}`}>
                                {opt.label}
                            </div>
                            <div className={`text-[10px] uppercase tracking-wider mt-1 transition-colors ${active ? "text-kiro-ink/70" : "text-kiro-inkSoft"}`}>{opt.desc}</div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Project duration (C4/C5) */}
            {showDuration && (
                <div className="mb-6">
                    <label htmlFor="duration-slider" className={`${labelStyle} text-kiro-inkSoft`}>
                        Project Duration: <span className="font-bold text-kiro-accent">{formData.projectMonths} months</span>
                    </label>
                    <input
                        id="duration-slider"
                        type="range"
                        aria-label={`Project duration: ${formData.projectMonths} months`}
                        min={1} max={24} step={1}
                        value={formData.projectMonths}
                        onChange={e => updateField("projectMonths", Number(e.target.value))}
                        className="w-full h-2 bg-kiro-surface border border-kiro-ink/[0.06] rounded-full appearance-none cursor-pointer accent-kiro-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                    />
                    <div className="flex justify-between text-kiro-inkSoft text-xs mt-1">
                        <span>1 month</span><span>24 months</span>
                    </div>
                </div>
            )}

            {/* Extra visits (C4) */}
            {showVisits && (
                <div className="mb-6">
                    <label htmlFor="visits-slider" className={`${labelStyle} text-kiro-inkSoft`}>
                        Senior Designer Visits: <span className="font-bold text-kiro-accent">{formData.extraVisits}</span>
                        <span className="text-xs ml-1.5 font-normal text-kiro-inkSoft">
                            (5 free, then ₹5,000/visit)
                        </span>
                    </label>
                    <input
                        id="visits-slider"
                        type="range"
                        aria-label={`Senior designer visits: ${formData.extraVisits}`}
                        min={0} max={20} step={1}
                        value={formData.extraVisits}
                        onChange={e => updateField("extraVisits", Number(e.target.value))}
                        className="w-full h-2 bg-kiro-surface border border-kiro-ink/[0.06] rounded-full appearance-none cursor-pointer accent-kiro-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                    />
                    <div className="flex justify-between text-kiro-inkSoft text-xs mt-1">
                        <span>0 visits</span><span>20 visits</span>
                    </div>
                </div>
            )}

            {/* Contact form */}
            <fieldset className="bg-kiro-surface border border-kiro-ink/[0.06] rounded-[8px] p-5 mt-2 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <legend className="font-semibold text-base mb-4 text-kiro-ink uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <ClipboardList size={18} className="text-kiro-accent" /> Contact Details
                </legend>
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="est-name" className="block text-xs font-medium mb-1.5 text-kiro-inkSoft uppercase tracking-widest">Full Name <span aria-hidden="true" className="text-red-400">*</span></label>
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
                        <label htmlFor="est-email" className="block text-xs font-medium mb-1.5 text-kiro-inkSoft uppercase tracking-widest">Email</label>
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
                        <label htmlFor="est-phone" className="block text-xs font-medium mb-1.5 text-kiro-inkSoft uppercase tracking-widest">Phone Number <span aria-hidden="true" className="text-red-400">*</span></label>
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
    );
}

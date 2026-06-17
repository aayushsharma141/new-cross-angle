/* Step 7 — Timeline & Contact */

import { motion } from "framer-motion";
import { Zap, Calendar, Search, ClipboardList } from "lucide-react";
import type { CalculatorFormData } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { TIMELINE_OPTIONS } from "../data/pricing-config";
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

export function StepTimeline({ formData, updateField }: Props) {
    const { data: timelineOptions = TIMELINE_OPTIONS } = useFlowConfig<typeof TIMELINE_OPTIONS>("timeline_options");
    const showDuration = formData.selectedService === "C4" || formData.selectedService === "C5";
    const showVisits = formData.selectedService === "C4";

    const TimelineIconMap: Record<string, React.ReactNode> = {
        "Immediate": <Zap size={32} className="mx-auto" strokeWidth={1.5} />,
        "1-3 Months": <Calendar size={32} className="mx-auto" strokeWidth={1.5} />,
        "3+ Months": <Search size={32} className="mx-auto" strokeWidth={1.5} />
    };

    const labelStyle = "block text-sm font-medium mb-2 text-[#5a5a5a]";
    const inputStyle = "w-full bg-[#ffffff] !bg-[#ffffff] border border-[#1a1a1a]/[0.08] focus:border-[#8b6f47] rounded-[8px] px-4 py-2.5 text-[#1a1a1a] !text-[#1a1a1a] text-sm outline-none transition-all shadow-inner placeholder:text-[#1a1a1a]/30";

    return (
        <div className="max-w-4xl mx-auto">


            {/* Timeline options */}
            <motion.div
                variants={cardListContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-3 gap-3 mb-6"
            >
                {timelineOptions.map(opt => {
                    const active = formData.startTiming === opt.label;
                    return (
                        <motion.button
                            type="button"
                            key={opt.label}
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
                            <div className="text-[#8b6f47] mb-1.5">{TimelineIconMap[opt.label] || opt.icon}</div>
                            <div className={`font-semibold text-sm transition-colors ${active ? "text-[#8b6f47] font-bold" : "text-[#1a1a1a]/80"}`}>
                                {opt.label}
                            </div>
                            <div className={`text-[10px] uppercase tracking-wider mt-1 transition-colors ${active ? "text-[#1a1a1a]/70" : "text-[#5a5a5a]"}`}>{opt.desc}</div>
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Project duration (C4/C5) */}
            {showDuration && (
                <div className="mb-6">
                    <label htmlFor="duration-slider" className={`${labelStyle} text-[#5a5a5a]`}>
                        Project Duration: <span className="font-bold text-[#8b6f47]">{formData.projectMonths} months</span>
                    </label>
                    <input
                        id="duration-slider"
                        type="range"
                        aria-label={`Project duration: ${formData.projectMonths} months`}
                        min={1} max={24} step={1}
                        value={formData.projectMonths}
                        onChange={e => updateField("projectMonths", Number(e.target.value))}
                        className="w-full h-2 bg-[#ffffff] border border-[#1a1a1a]/[0.06] rounded-full appearance-none cursor-pointer accent-[#8b6f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                    />
                    <div className="flex justify-between text-[#5a5a5a] text-xs mt-1">
                        <span>1 month</span><span>24 months</span>
                    </div>
                </div>
            )}

            {/* Extra visits (C4) */}
            {showVisits && (
                <div className="mb-6">
                    <label htmlFor="visits-slider" className={`${labelStyle} text-[#5a5a5a]`}>
                        Senior Designer Visits: <span className="font-bold text-[#8b6f47]">{formData.extraVisits}</span>
                        <span className="text-xs ml-1.5 font-normal text-[#5a5a5a]">
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
                        className="w-full h-2 bg-[#ffffff] border border-[#1a1a1a]/[0.06] rounded-full appearance-none cursor-pointer accent-[#8b6f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                    />
                    <div className="flex justify-between text-[#5a5a5a] text-xs mt-1">
                        <span>0 visits</span><span>20 visits</span>
                    </div>
                </div>
            )}

            {/* Contact form */}
            <fieldset className="bg-[#ffffff] border border-[#1a1a1a]/[0.06] rounded-[8px] p-5 mt-2 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <legend className="font-semibold text-base mb-4 text-[#1a1a1a] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <ClipboardList size={18} className="text-[#8b6f47]" /> Contact Details
                </legend>
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="est-name" className="block text-xs font-medium mb-1.5 text-[#5a5a5a] uppercase tracking-widest">Full Name <span aria-hidden="true" className="text-red-400">*</span></label>
                        <input
                            id="est-name"
                            type="text"
                            autoComplete="name"
                            required
                            placeholder="Your name"
                            value={formData.name}
                            onChange={e => updateField("name", e.target.value)}
                            className={`${inputStyle} focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2`}
                        />
                    </div>
                    <div>
                        <label htmlFor="est-email" className="block text-xs font-medium mb-1.5 text-[#5a5a5a] uppercase tracking-widest">Email</label>
                        <input
                            id="est-email"
                            type="email"
                            autoComplete="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={e => updateField("email", e.target.value)}
                            className={`${inputStyle} focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2`}
                        />
                    </div>
                    <div>
                        <label htmlFor="est-phone" className="block text-xs font-medium mb-1.5 text-[#5a5a5a] uppercase tracking-widest">Phone Number <span aria-hidden="true" className="text-red-400">*</span></label>
                        <input
                            id="est-phone"
                            type="tel"
                            autoComplete="tel"
                            required
                            placeholder="+91 99999 99999"
                            value={formData.phone}
                            onChange={e => updateField("phone", e.target.value)}
                            className={`${inputStyle} focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2`}
                        />
                    </div>
                </div>
            </fieldset>

        </div>
    );
}

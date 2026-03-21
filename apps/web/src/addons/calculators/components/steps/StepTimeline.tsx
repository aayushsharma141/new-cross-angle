/* Step 7 — Timeline & Contact */

import type { CalculatorFormData } from "../data/types";
import { THEME } from "../data/pricing-config";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

const TIMELINE_OPTIONS = [
    { label: "Immediate", desc: "Ready to start now", icon: "⚡" },
    { label: "1-3 Months", desc: "Planning ahead", icon: "📅" },
    { label: "3+ Months", desc: "Just exploring", icon: "🔍" },
];

export function StepTimeline({ formData, updateField }: Props) {
    const showDuration = formData.selectedService === "C4" || formData.selectedService === "C5";
    const showVisits = formData.selectedService === "C4";

    const labelStyle = "block text-sm font-medium mb-2";
    const inputStyle = "w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-gray-100 text-sm outline-none focus:border-red-600/50 transition-colors";

    return (
        <div>
            <h2 className="text-2xl font-bold mb-1 text-site-text-heading uppercase">
                Timeline & Contact
            </h2>
            <p className="text-site-text-muted mb-6 text-sm">
                When would you like to start?
            </p>

            {/* Timeline options */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {TIMELINE_OPTIONS.map(opt => {
                    const active = formData.startTiming === opt.label;
                    return (
                        <button
                            key={opt.label}
                            onClick={() => updateField("startTiming", opt.label)}
                            className={`border-2 rounded-none py-4 px-2 text-center transition-all duration-200 ${active ? "bg-site-crimson/10 border-site-crimson shadow-[0_0_15px_rgba(227, 83, 54,0.1)]" : "bg-site-bg-card border-site-border"
                                }`}
                        >
                            <div className="text-3xl mb-1.5">{opt.icon}</div>
                            <div className={`font-semibold text-sm ${active ? "text-site-crimson" : "text-site-text-heading"}`}>
                                {opt.label}
                            </div>
                            <div className="text-site-text-muted text-[10px] uppercase tracking-wider mt-1">{opt.desc}</div>
                        </button>
                    );
                })}
            </div>

            {/* Project duration (C4/C5) */}
            {showDuration && (
                <div className="mb-6">
                    <label className={`${labelStyle} text-site-text-muted`}>
                        Project Duration: <span className="font-bold text-site-crimson">{formData.projectMonths} months</span>
                    </label>
                    <input
                        type="range"
                        title="Project Duration"
                        min={1} max={24} step={1}
                        value={formData.projectMonths}
                        onChange={e => updateField("projectMonths", Number(e.target.value))}
                        className="w-full h-2 bg-site-bg-card rounded-none appearance-none cursor-pointer accent-site-crimson"
                    />
                    <div className="flex justify-between text-site-text-meta text-xs mt-1">
                        <span>1 month</span><span>24 months</span>
                    </div>
                </div>
            )}

            {/* Extra visits (C4) */}
            {showVisits && (
                <div className="mb-6">
                    <label className={`${labelStyle} text-site-text-muted`}>
                        Senior Designer Visits: <span className="font-bold text-site-crimson">{formData.extraVisits}</span>
                        <span className="text-xs ml-1.5 font-normal text-site-text-meta">
                            (5 free, then ₹5,000/visit)
                        </span>
                    </label>
                    <input
                        type="range"
                        title="Senior Designer Visits"
                        min={0} max={20} step={1}
                        value={formData.extraVisits}
                        onChange={e => updateField("extraVisits", Number(e.target.value))}
                        className="w-full h-2 bg-site-bg-card rounded-none appearance-none cursor-pointer accent-site-crimson"
                    />
                    <div className="flex justify-between text-site-text-meta text-xs mt-1">
                        <span>0 visits</span><span>20 visits</span>
                    </div>
                </div>
            )}

            {/* Contact form */}
            <div className="bg-site-bg-card border border-site-border rounded-none p-5 mt-2 shadow-2xl">
                <div className="font-semibold text-base mb-4 text-site-text-heading uppercase tracking-[0.2em]">
                    📋 Contact Details
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-site-text-meta uppercase tracking-widest">Full Name *</label>
                        <input
                            type="text"
                            title="Your full name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={e => updateField("name", e.target.value)}
                            className={inputStyle}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-site-text-meta uppercase tracking-widest">Email</label>
                        <input
                            type="email"
                            title="Your email address"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={e => updateField("email", e.target.value)}
                            className={inputStyle}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-site-text-meta uppercase tracking-widest">Phone Number *</label>
                        <input
                            type="tel"
                            title="Your phone number"
                            placeholder="+91 ..."
                            value={formData.phone}
                            onChange={e => updateField("phone", e.target.value)}
                            className={inputStyle}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}

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
            <h2 className="text-2xl font-bold mb-1 text-white">
                Timeline & Contact
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
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
                            className={`border-2 rounded-xl py-4 px-2 text-center transition-all duration-200 ${active ? "bg-red-600/10 border-red-600" : "bg-[#121212] border-white/5"
                                }`}
                        >
                            <div className="text-3xl mb-1.5">{opt.icon}</div>
                            <div className={`font-semibold text-sm ${active ? "text-red-400" : "text-white"}`}>
                                {opt.label}
                            </div>
                            <div className="text-gray-400 text-[10px] uppercase tracking-wider mt-1">{opt.desc}</div>
                        </button>
                    );
                })}
            </div>

            {/* Project duration (C4/C5) */}
            {showDuration && (
                <div className="mb-6">
                    <label className={`${labelStyle} text-gray-400`}>
                        Project Duration: <span className="font-bold text-red-400">{formData.projectMonths} months</span>
                    </label>
                    <input
                        type="range"
                        title="Project Duration"
                        min={1} max={24} step={1}
                        value={formData.projectMonths}
                        onChange={e => updateField("projectMonths", Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-gray-400 text-xs mt-1">
                        <span>1 month</span><span>24 months</span>
                    </div>
                </div>
            )}

            {/* Extra visits (C4) */}
            {showVisits && (
                <div className="mb-6">
                    <label className={`${labelStyle} text-gray-400`}>
                        Senior Designer Visits: <span className="font-bold text-red-400">{formData.extraVisits}</span>
                        <span className="text-xs ml-1.5 font-normal text-gray-500">
                            (5 free, then ₹5,000/visit)
                        </span>
                    </label>
                    <input
                        type="range"
                        title="Senior Designer Visits"
                        min={0} max={20} step={1}
                        value={formData.extraVisits}
                        onChange={e => updateField("extraVisits", Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-gray-400 text-xs mt-1">
                        <span>0 visits</span><span>20 visits</span>
                    </div>
                </div>
            )}

            {/* Contact form */}
            <div className="bg-[#161616] border border-white/10 rounded-xl p-5 mt-2">
                <div className="font-semibold text-base mb-4 text-white">
                    📋 Contact Details
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-gray-400">Full Name *</label>
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
                        <label className="block text-xs font-medium mb-1.5 text-gray-400">Email</label>
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
                        <label className="block text-xs font-medium mb-1.5 text-gray-400">Phone Number *</label>
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

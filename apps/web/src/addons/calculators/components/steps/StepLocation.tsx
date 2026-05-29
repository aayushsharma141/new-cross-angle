/* Step 3 — Location (State → City → Auto Tier) */

import { useMemo, useState } from "react";
import type { CalculatorFormData, CityTier } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
    updateFields: (partial: Partial<CalculatorFormData>) => void;
}

const labelStyle = "block text-sm font-medium mb-2 text-gray-400";
const inputStyle = "w-full bg-[#ffffff] !bg-[#ffffff] border border-[#1a1a1a]/[0.08] focus:border-[#8b6f47] rounded-[8px] px-4 py-2.5 text-[#1a1a1a] !text-[#1a1a1a] text-sm outline-none transition-all shadow-inner placeholder:text-[#1a1a1a]/30";
const dropdownStyle = "bg-[#ffffff] border border-[#1a1a1a]/[0.08] rounded-[8px] mt-1.5 max-h-52 overflow-y-auto shadow-2xl z-50 relative pointer-events-auto";
const dropdownItemStyle = "flex justify-between items-center w-full bg-transparent border-none text-[#1a1a1a] px-4 py-2.5 cursor-pointer text-sm text-left hover:bg-[#8b6f47]/10 transition-colors";

export function StepLocation({ formData, updateField, updateFields }: Props) {
    const { data: LOCATION_DATA } = useFlowConfig<Record<string, Record<string, string>>>("location_data");
    const { data: TIERS } = useFlowConfig<Record<string, { label: string; multiplier: number }>>("city_tiers");

    const [stateSearch, setStateSearch] = useState("");
    const [citySearch, setCitySearch] = useState("");

    const states = useMemo(() => Object.keys(LOCATION_DATA || {}).sort(), [LOCATION_DATA]);
    const filteredStates = useMemo(() =>
        states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())),
        [stateSearch, states]);

    const cities = useMemo(() =>
        formData.state && LOCATION_DATA ? Object.keys(LOCATION_DATA[formData.state] || {}).sort() : [],
        [formData.state, LOCATION_DATA]);

    const filteredCities = useMemo(() =>
        cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())),
        [citySearch, cities]);

    const handleStateSelect = (state: string) => {
        updateFields({ state, city: "", cityTier: "tier1" });
        setStateSearch("");
    };

    const handleCitySelect = (city: string) => {
        const tier = LOCATION_DATA[formData.state]?.[city] as CityTier;
        if (tier) {
            updateFields({ city, cityTier: tier });
        } else {
            updateFields({ city });
        }
        setCitySearch("");
    };

    const tierInfo = formData.cityTier ? TIERS[formData.cityTier] : null;

    return (
        <div>

            {/* State picker */}
            <div className="mb-5">
                <label className={labelStyle}>State</label>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        title="Search for your state"
                        placeholder="Search state..."
                        value={formData.state || stateSearch}
                        onChange={e => {
                            setStateSearch(e.target.value);
                            if (formData.state) updateFields({ state: "", city: "", cityTier: "tier1" });
                        }}
                        className={`${inputStyle} pr-10`}
                    />
                    {formData.state && (
                        <button
                            type="button"
                            onClick={() => {
                                updateFields({ state: "", city: "", cityTier: "tier1" });
                                setStateSearch("");
                            }}
                            className="absolute right-3 text-[#5a5a5a] hover:text-[#8b6f47] transition-colors text-sm"
                            title="Clear state"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {(stateSearch && !formData.state) && (
                    <div className={dropdownStyle}>
                        {filteredStates.map(s => (
                            <button key={s} onClick={() => handleStateSelect(s)} className={dropdownItemStyle}>
                                {s}
                            </button>
                        ))}
                        {filteredStates.length === 0 && (
                            <div className="p-3 text-[#5a5a5a] text-xs text-center italic">No states found</div>
                        )}
                    </div>
                )}
                {/* Show state chips when no search text */}
                {!stateSearch && !formData.state && (
                    <div className="flex flex-wrap gap-2 mt-3 max-h-40 overflow-y-auto pr-1">
                        {states.map(s => (
                            <button key={s} onClick={() => handleStateSelect(s)}
                                className="bg-[#ffffff] border border-[#1a1a1a]/[0.06] text-[#1a1a1a]/70 rounded-none px-3 py-1.5 cursor-pointer text-xs hover:border-[#8b6f47]/50 hover:text-[#1a1a1a] transition-all">
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* City picker */}
            {formData.state && (
                <div className="mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className={labelStyle}>City</label>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            title="Search for your city"
                            placeholder="Search city..."
                            value={formData.city || citySearch}
                            onChange={e => {
                                setCitySearch(e.target.value);
                                if (formData.city) updateFields({ city: "", cityTier: "tier1" });
                            }}
                            className={`${inputStyle} pr-10`}
                        />
                        {formData.city && (
                            <button
                                type="button"
                                onClick={() => {
                                    updateFields({ city: "", cityTier: "tier1" });
                                    setCitySearch("");
                                }}
                                className="absolute right-3 text-[#5a5a5a] hover:text-[#8b6f47] transition-colors text-sm"
                                title="Clear city"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {(citySearch && !formData.city) && (
                        <div className={dropdownStyle}>
                            {filteredCities.map(c => {
                                const t = LOCATION_DATA[formData.state]?.[c];
                                return (
                                    <button key={c} onClick={() => handleCitySelect(c)} className={dropdownItemStyle}>
                                        <span className="font-medium">{c}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-none uppercase tracking-tighter ${t === "tier1" ? "bg-[#8b6f47]/15 text-[#8b6f47]" :
                                            t === "tier2" ? "bg-amber-500/15 text-amber-500" :
                                                "bg-[#1a1a1a]/10 text-[#1a1a1a]/70"
                                            }`}>
                                            {TIERS[t]?.label || t}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {!citySearch && !formData.city && (
                        <div className="flex flex-wrap gap-2 mt-3 overflow-y-auto pr-1">
                            {cities.map(c => {
                                const t = LOCATION_DATA[formData.state]?.[c];
                                return (
                                    <button key={c} onClick={() => handleCitySelect(c)}
                                        className="bg-[#ffffff] border border-[#1a1a1a]/[0.06] rounded-none px-3 py-1.5 cursor-pointer hover:border-[#8b6f47]/50 transition-all group">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#1a1a1a]/70 text-xs group-hover:text-[#1a1a1a] transition-colors">{c}</span>
                                            <span className={`text-[9px] font-bold px-1 py-0 rounded-none uppercase tracking-tighter opacity-70 ${t === "tier1" ? "bg-[#8b6f47]/15 text-[#8b6f47]" :
                                                t === "tier2" ? "bg-amber-500/15 text-amber-500" :
                                                    "bg-[#1a1a1a]/10 text-[#1a1a1a]/70"
                                                }`}>
                                                {t}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Tier badge */}
            {tierInfo && (
                <div className={`bg-[#ffffff] border-2 rounded-none p-5 mt-2 animate-in zoom-in-95 duration-300 shadow-xl ${formData.cityTier === "tier1" ? "border-[#8b6f47]/20 bg-[#8b6f47]/5" :
                    formData.cityTier === "tier2" ? "border-amber-500/20 bg-amber-500/5" :
                        "border-[#1a1a1a]/[0.06] bg-[#ffffff]/50"
                    }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className={`text-sm font-black px-3 py-1 rounded-none uppercase tracking-wider ${formData.cityTier === "tier1" ? "bg-[#8b6f47]/15 text-[#8b6f47]" :
                                formData.cityTier === "tier2" ? "bg-amber-500/15 text-amber-500" :
                                    "bg-[#1a1a1a]/10 text-[#1a1a1a]/70"
                                }`}>
                                {tierInfo.label}
                            </span>
                            <span className="text-[#5a5a5a] text-xs font-semibold uppercase tracking-widest">
                                Location Class
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-[#5a5a5a] text-[10px] font-bold uppercase block -mb-1">Tier Multiplier</span>
                            <span className={`text-2xl font-black italic tracking-tight ${formData.cityTier === "tier1" ? "text-[#8b6f47]" :
                                formData.cityTier === "tier2" ? "text-amber-500" :
                                    "text-[#1a1a1a]/70"
                                }`}>
                                {tierInfo.multiplier}×
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#1a1a1a]/[0.06]">
                        <p className="text-[#5a5a5a] text-xs leading-relaxed">
                            <span className="text-[#1a1a1a] font-semibold">{formData.city}, {formData.state}</span> —
                            Operational costs and logistics rates will be adjusted by the <span className={`font-bold underline underline-offset-4 decoration-current/30 ${formData.cityTier === "tier1" ? "text-[#8b6f47]" :
                                formData.cityTier === "tier2" ? "text-amber-500" :
                                    "text-[#1a1a1a]/70"
                                }`}>{tierInfo.label.toLowerCase()} multiplier</span>.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}

/* Step 3 — Location (State → City → Auto Tier) */

import { useMemo, useState } from "react";
import type { CalculatorFormData, CityTier } from "../data/types";
import { LOCATION_DATA, TIERS, THEME } from "../data/pricing-config";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
    updateFields: (partial: Partial<CalculatorFormData>) => void;
}

const labelStyle = "block text-sm font-medium mb-2 text-gray-400";
const inputStyle = "w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-gray-100 text-sm outline-none focus:border-red-600/50 transition-colors";
const dropdownStyle = "bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg mt-1.5 max-h-52 overflow-y-auto shadow-2xl z-50 relative pointer-events-auto";
const dropdownItemStyle = "flex justify-between items-center w-full bg-transparent border-none text-gray-200 px-4 py-2.5 cursor-pointer text-sm text-left hover:bg-red-600/10 transition-colors";

export function StepLocation({ formData, updateField, updateFields }: Props) {
    const [stateSearch, setStateSearch] = useState("");
    const [citySearch, setCitySearch] = useState("");

    const states = useMemo(() => Object.keys(LOCATION_DATA).sort(), []);
    const filteredStates = useMemo(() =>
        states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())),
        [stateSearch, states]);

    const cities = useMemo(() =>
        formData.state ? Object.keys(LOCATION_DATA[formData.state] || {}).sort() : [],
        [formData.state]);

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
            <h2 className="text-2xl font-bold mb-1 text-white">
                Project Location
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
                City tier affects pricing multiplier
            </p>

            {/* State picker */}
            <div className="mb-5">
                <label className={labelStyle}>State</label>
                <input
                    type="text"
                    title="Search for your state"
                    placeholder="Search state..."
                    value={formData.state || stateSearch}
                    onChange={e => {
                        setStateSearch(e.target.value);
                        if (formData.state) updateFields({ state: "", city: "", cityTier: "tier1" });
                    }}
                    className={inputStyle}
                />
                {(stateSearch && !formData.state) && (
                    <div className={dropdownStyle}>
                        {filteredStates.map(s => (
                            <button key={s} onClick={() => handleStateSelect(s)} className={dropdownItemStyle}>
                                {s}
                            </button>
                        ))}
                        {filteredStates.length === 0 && (
                            <div className="p-3 text-gray-500 text-xs text-center italic">No states found</div>
                        )}
                    </div>
                )}
                {/* Show state chips when no search text */}
                {!stateSearch && !formData.state && (
                    <div className="flex flex-wrap gap-2 mt-3 max-h-40 overflow-y-auto pr-1">
                        {states.map(s => (
                            <button key={s} onClick={() => handleStateSelect(s)}
                                className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-md px-3 py-1.5 cursor-pointer text-xs hover:border-red-600/50 hover:text-white transition-all">
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
                    <input
                        type="text"
                        title="Search for your city"
                        placeholder="Search city..."
                        value={formData.city || citySearch}
                        onChange={e => {
                            setCitySearch(e.target.value);
                            if (formData.city) updateFields({ city: "", cityTier: "tier1" });
                        }}
                        className={inputStyle}
                    />
                    {(citySearch && !formData.city) && (
                        <div className={dropdownStyle}>
                            {filteredCities.map(c => {
                                const t = LOCATION_DATA[formData.state]?.[c];
                                const tierColor = TIERS[t]?.color || "#555";
                                return (
                                    <button key={c} onClick={() => handleCitySelect(c)} className={dropdownItemStyle}>
                                        <span className="font-medium">{c}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${t === "tier1" ? "bg-red-500/10 text-red-500" :
                                            t === "tier2" ? "bg-amber-500/10 text-amber-500" :
                                                "bg-gray-500/10 text-gray-500"
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
                                const tierColor = TIERS[t]?.color || "#555";
                                return (
                                    <button key={c} onClick={() => handleCitySelect(c)}
                                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-1.5 cursor-pointer hover:border-red-600/50 transition-all group">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-300 text-xs group-hover:text-white transition-colors">{c}</span>
                                            <span className={`text-[9px] font-bold px-1 py-0 rounded uppercase tracking-tighter opacity-70 ${t === "tier1" ? "bg-red-500/10 text-red-500" :
                                                t === "tier2" ? "bg-amber-500/10 text-amber-500" :
                                                    "bg-gray-500/10 text-gray-500"
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
                <div className={`bg-[#1a1a1a] border-2 rounded-xl p-5 mt-2 animate-in zoom-in-95 duration-300 shadow-xl ${formData.cityTier === "tier1" ? "border-red-500/20 bg-red-500/5" :
                        formData.cityTier === "tier2" ? "border-amber-500/20 bg-amber-500/5" :
                            "border-gray-500/20 bg-gray-500/5"
                    }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className={`text-sm font-black px-3 py-1 rounded-md uppercase tracking-wider ${formData.cityTier === "tier1" ? "bg-red-500/10 text-red-500" :
                                formData.cityTier === "tier2" ? "bg-amber-500/10 text-amber-500" :
                                    "bg-gray-500/10 text-gray-500"
                                }`}>
                                {tierInfo.label}
                            </span>
                            <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                                Location Class
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-gray-500 text-[10px] font-bold uppercase block -mb-1">Tier Multiplier</span>
                            <span className={`text-2xl font-black italic tracking-tight ${formData.cityTier === "tier1" ? "text-red-500" :
                                formData.cityTier === "tier2" ? "text-amber-500" :
                                    "text-gray-500"
                                }`}>
                                {tierInfo.multiplier}×
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-gray-500 text-xs leading-relaxed">
                            <span className="text-gray-300 font-semibold">{formData.city}, {formData.state}</span> —
                            Operational costs and logistics rates will be adjusted by the <span className={`font-bold underline underline-offset-4 decoration-current/30 ${formData.cityTier === "tier1" ? "text-red-500" :
                                    formData.cityTier === "tier2" ? "text-amber-500" :
                                        "text-gray-500"
                                }`}>{tierInfo.label.toLowerCase()} multiplier</span>.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}

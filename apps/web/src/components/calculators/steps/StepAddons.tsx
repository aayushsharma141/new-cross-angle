/* Step 6 — Add-ons */

import { useMemo } from "react";
import type { CalculatorFormData } from "../data/types";
import { ADDONS, THEME, DEFAULT_PRICING_CONFIG } from "../data/pricing-config";
import { formatCurrency } from "../data/format-utils";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

export function StepAddons({ formData, updateField }: Props) {
    const addonTotal = useMemo(() => {
        let total = 0;
        const c = DEFAULT_PRICING_CONFIG.addons;
        if (formData.modularKitchen) total += c.modular_kitchen;
        if (formData.wardrobes > 0) total += formData.wardrobes * c.wardrobe_per_room;
        if (formData.falseCeiling) total += formData.area * c.false_ceiling_sqft;
        if (formData.smartHome) total += c.smart_home;
        if (formData.customFurniture) total += c.custom_furniture;
        if (formData.premiumLighting) total += c.premium_lighting;
        return total;
    }, [formData]);

    const isActive = (id: string): boolean => {
        switch (id) {
            case "modularKitchen": return formData.modularKitchen;
            case "wardrobes": return formData.wardrobes > 0;
            case "falseCeiling": return formData.falseCeiling;
            case "smartHome": return formData.smartHome;
            case "customFurniture": return formData.customFurniture;
            case "premiumLighting": return formData.premiumLighting;
            default: return false;
        }
    };

    const toggleAddon = (id: string) => {
        switch (id) {
            case "modularKitchen": updateField("modularKitchen", !formData.modularKitchen); break;
            case "wardrobes": updateField("wardrobes", formData.wardrobes > 0 ? 0 : Math.max(1, formData.bedrooms)); break;
            case "falseCeiling": updateField("falseCeiling", !formData.falseCeiling); break;
            case "smartHome": updateField("smartHome", !formData.smartHome); break;
            case "customFurniture": updateField("customFurniture", !formData.customFurniture); break;
            case "premiumLighting": updateField("premiumLighting", !formData.premiumLighting); break;
        }
    };

    const getAddonCost = (addon: typeof ADDONS[number]): string => {
        if (addon.unit === "per_sqft") return `${formatCurrency(formData.area * addon.cost)}`;
        if (addon.unit === "per_room" && addon.id === "wardrobes") {
            const count = formData.wardrobes || formData.bedrooms;
            return `${formatCurrency(count * addon.cost)} (${count} rooms)`;
        }
        return formatCurrency(addon.cost);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-1 text-white">
                Bespoke Commissions
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
                Curate your residence with signature add-ons
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ADDONS.map(addon => {
                    const active = isActive(addon.id);
                    return (
                        <button
                            key={addon.id}
                            title={`Add ${addon.label}`}
                            onClick={() => toggleAddon(addon.id)}
                            className={`group border-2 rounded-xl p-4 text-left transition-all duration-300 relative overflow-hidden ${active ? "bg-red-600/5 border-red-600 shadow-[0_0_20px_-5px_rgba(220,38,38,0.2)]" : "bg-[#121212] border-white/5 shadow-none"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-3xl filter drop-shadow-sm">{addon.icon}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider transition-colors ${active ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"
                                    }`}>
                                    {active ? "SELECTED" : "ADD"}
                                </span>
                            </div>

                            <div className="mb-1">
                                <div className={`font-bold text-sm ${active ? "text-red-400" : "text-white"}`}>
                                    {addon.label}
                                </div>
                                <div className="text-gray-500 text-[11px] leading-relaxed mt-0.5">
                                    {addon.desc}
                                </div>
                            </div>

                            <div className="mt-3 font-bold text-sm text-amber-400">
                                {getAddonCost(addon)}
                            </div>

                            {active && (
                                <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                                    <div className="w-full h-full bg-red-600/10 absolute rotate-45 translate-x-4 -translate-y-4" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Wardrobes counter */}
            {formData.wardrobes > 0 && (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 mt-4 flex items-center justify-between shadow-lg">
                    <div>
                        <span className="text-gray-100 text-sm font-medium">Walk-in Wardrobe Suites</span>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">One suite per master bedroom recommended</p>
                    </div>
                    <div className="flex items-center gap-3 bg-black/30 p-1.5 rounded-lg border border-white/5">
                        <button
                            title="Decrease wardobes"
                            onClick={() => updateField("wardrobes", Math.max(1, formData.wardrobes - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-[#252525] hover:bg-[#303030] text-white rounded-md transition-colors"
                        >−</button>
                        <span className="text-white font-bold w-6 text-center text-sm">{formData.wardrobes}</span>
                        <button
                            title="Increase wardrobes"
                            onClick={() => updateField("wardrobes", Math.min(10, formData.wardrobes + 1))}
                            className="w-8 h-8 flex items-center justify-center bg-[#252525] hover:bg-[#303030] text-white rounded-md transition-colors"
                        >+</button>
                    </div>
                </div>
            )}

            {/* Total */}
            {addonTotal > 0 && (
                <div className="bg-red-600/5 border-l-4 border-red-600 rounded-xl p-4 mt-4 flex justify-between items-center shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Bespoke Inclusions</span>
                        <span className="text-gray-500 text-[10px] mt-0.5">Added to final valuation</span>
                    </div>
                    <span className="text-xl font-black italic tracking-tight text-red-400">
                        {formatCurrency(addonTotal)}
                    </span>
                </div>
            )}

        </div>
    );
}

/* Step 6 — Add-ons */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Utensils, Shirt, Sparkles, Smartphone, Sofa, Lightbulb } from "lucide-react";
import type { CalculatorFormData } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { ADDONS as DEFAULT_ADDONS, DEFAULT_PRICING_CONFIG } from "../data/pricing-config";
import { formatCurrency } from "../data/format-utils";
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

export function StepAddons({ formData, updateField }: Props) {
    const { data: addons = DEFAULT_ADDONS } = useFlowConfig<typeof DEFAULT_ADDONS>("addons");

    const AddonIconMap: Record<string, React.ReactNode> = {
        modularKitchen: <Utensils size={32} strokeWidth={1.5} />,
        wardrobes: <Shirt size={32} strokeWidth={1.5} />,
        falseCeiling: <Sparkles size={32} strokeWidth={1.5} />,
        smartHome: <Smartphone size={32} strokeWidth={1.5} />,
        customFurniture: <Sofa size={32} strokeWidth={1.5} />,
        premiumLighting: <Lightbulb size={32} strokeWidth={1.5} />,
    };

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

    const getAddonCost = (addon: typeof DEFAULT_ADDONS[number]): string => {
        if (addon.unit === "per_sqft") return `${formatCurrency(formData.area * addon.cost)}`;
        if (addon.unit === "per_room" && addon.id === "wardrobes") {
            const count = formData.wardrobes || formData.bedrooms;
            return `${formatCurrency(count * addon.cost)} (${count} rooms)`;
        }
        return formatCurrency(addon.cost);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                variants={cardListContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
                {addons.map(addon => {
                    const active = isActive(addon.id);
                    return (
                        <motion.button
                            type="button"
                            key={addon.id}
                            title={`Add ${addon.label}`}
                            variants={cardListItem}
                            whileHover={CARD_INTERACTIONS.whileHover}
                            whileTap={CARD_INTERACTIONS.whileTap}
                            onClick={() => toggleAddon(addon.id)}
                            className={selectableCardClassLight(active, "group p-4 text-left")}
                        >
                            {active && (
                                <motion.span
                                    aria-hidden="true"
                                    className="absolute inset-0 pointer-events-none"
                                    animate={breathingAnimationLight}
                                    transition={breathingTransitionLight}
                                />
                            )}
                            
                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <span className="text-[#8b6f47] drop-shadow-sm">{AddonIconMap[addon.id] || addon.icon}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider transition-colors ${active ? "bg-[#8b6f47] text-white" : "bg-[#1a1a1a]/10 text-[#5a5a5a]"
                                    }`}>
                                    {active ? "SELECTED" : "ADD"}
                                </span>
                            </div>

                            <div className="mb-1 relative z-10">
                                <div className={`font-bold text-sm transition-colors ${active ? "text-[#8b6f47]" : "text-[#1a1a1a]"}`}>
                                    {addon.label}
                                </div>
                                <div className="text-[#5a5a5a] text-[11px] leading-relaxed mt-0.5">
                                    {addon.desc}
                                </div>
                            </div>

                            <div className="mt-3 font-black text-sm text-[#8b6f47] relative z-10">
                                {getAddonCost(addon)}
                            </div>
                        </motion.button>
                    );
                })}
            </motion.div>

            <div className="mt-6 p-4 bg-[#8b6f47]/5 border border-[#8b6f47]/20 rounded-[8px] flex justify-between items-center">
                <span className="text-[#1a1a1a] font-bold text-sm">Add-ons Subtotal</span>
                <span className={`font-black text-lg ${addonTotal > 0 ? "text-[#8b6f47]" : "text-[#5a5a5a] text-sm"}`}>
                    {addonTotal > 0 ? formatCurrency(addonTotal) : "None selected"}
                </span>
            </div>
        </div>
    );
}

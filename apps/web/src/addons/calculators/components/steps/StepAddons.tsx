/* Step 6 — Add-ons */


import { Utensils, Shirt, Sparkles, Smartphone, Sofa, Lightbulb } from "lucide-react";
import type { CalculatorFormData } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { ADDONS as DEFAULT_ADDONS } from "../data/pricing-config";
import { formatCurrency } from "../data/format-utils";
import {
    selectableCardClassLight,
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
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {addons.map(addon => {
                    const active = isActive(addon.id);
                    return (
                        <button
                            type="button"
                            key={addon.id}
                            title={`Add ${addon.label}`}
                            onClick={() => toggleAddon(addon.id)}
                            className={`${selectableCardClassLight(active, "group p-4 text-left hover:-translate-y-0.5 active:scale-95 transition-transform duration-200")} ${active ? "bg-[#7a5c30]/[0.12]" : "bg-white/70 hover:bg-[#7a5c30]/[0.05]"}`}
                        >
                            {active && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 pointer-events-none animate-pulse shadow-[0_0_24px_rgba(139,111,71,0.25)] rounded-[8px]"
                                />
                            )}
                            
                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <span className="text-kiro-accent drop-shadow-sm">{AddonIconMap[addon.id] || addon.icon}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider transition-colors ${active ? "bg-kiro-accent text-white" : "bg-kiro-ink/10 text-kiro-inkSoft"
                                    }`}>
                                    {active ? "SELECTED" : "ADD"}
                                </span>
                            </div>

                            <div className="mb-1 relative z-10">
                                <div className={`font-bold text-sm transition-colors ${active ? "text-kiro-accent" : "text-kiro-ink"}`}>
                                    {addon.label}
                                </div>
                                <div className="text-kiro-inkSoft text-[13px] leading-relaxed mt-0.5">
                                    {addon.desc}
                                </div>
                            </div>

                            <div className="mt-3 font-black text-sm text-kiro-accent relative z-10">
                                {getAddonCost(addon)}
                            </div>
                        </button>
                    );
                })}
            </div>

        </div>
    );
}

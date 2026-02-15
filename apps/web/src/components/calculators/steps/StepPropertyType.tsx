/* Step 1 — Property Type selection */

import type { CalculatorFormData, PropertyType } from "../data/types";
import { PROPERTY_TYPES, THEME } from "../data/pricing-config";

interface Props {
    formData: CalculatorFormData;
    updateField: <K extends keyof CalculatorFormData>(field: K, value: CalculatorFormData[K]) => void;
}

export function StepPropertyType({ formData, updateField }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-1 text-white">
                What type of property?
            </h2>
            <p className="text-gray-400 mb-8 text-sm">
                Select the property type to get started
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {PROPERTY_TYPES.map(pt => {
                    const selected = formData.propertyType === pt.id;
                    return (
                        <button
                            key={pt.id}
                            onClick={() => updateField("propertyType", pt.id as PropertyType)}
                            className={`
                                group border-2 rounded-xl p-5 text-center transition-all duration-300 relative overflow-hidden
                                ${selected
                                    ? "bg-zinc-800/80 border-red-600 scale-[1.03] shadow-[0_0_30px_-5px_rgba(220,38,38,0.2)]"
                                    : "bg-zinc-900 border-white/5 hover:border-white/10"
                                }
                            `}
                        >
                            <div className="text-4xl mb-3 filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">{pt.icon}</div>

                            <div className="mb-1">
                                <div className={`font-bold text-sm tracking-tight ${selected ? "text-red-400" : "text-white"}`}>
                                    {pt.label}
                                </div>
                                <div className="text-gray-500 text-[10px] leading-relaxed mt-1 uppercase tracking-tighter">
                                    {pt.desc}
                                </div>
                            </div>

                            {selected && (
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

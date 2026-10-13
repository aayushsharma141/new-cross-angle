/* Step 3 — Location (State → City → Auto Tier) */

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { CalculatorFormData, CityTier } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { CenterDialog } from "@/addons/_shared/CenterDialog";
import { usePricingConfig } from "../hooks/usePricingConfig";

interface Props {
    formData: CalculatorFormData;
    updateFields: (partial: Partial<CalculatorFormData>) => void;
}

const labelStyle = "block text-sm font-medium mb-2 text-kiro-inkSoft";
const triggerStyle = "flex w-full items-center justify-between gap-3 rounded-[8px] border border-kiro-ink/[0.08] bg-white px-4 py-3 text-left text-sm transition-colors hover:border-kiro-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-kiro-ink/[0.08]";

const tierBadge = (t: string) =>
    t === "tier1" ? "bg-kiro-accent/15 text-kiro-accent" :
    t === "tier2" ? "bg-amber-500/15 text-amber-700" :
    "bg-kiro-ink/10 text-kiro-ink/70";

interface PickerItem { value: string; badge?: { label: string; tier: string } }

/** Searchable list inside a centered pop-up. Picking an item closes it. */
function PickerDialog({ open, onOpenChange, title, description, searchLabel, items, selected, emptyText, onSelect }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    searchLabel: string;
    items: PickerItem[];
    selected: string;
    emptyText: string;
    onSelect: (value: string) => void;
}) {
    const [query, setQuery] = useState("");
    const shown = useMemo(
        () => items.filter(i => i.value.toLowerCase().includes(query.trim().toLowerCase())),
        [items, query],
    );

    return (
        <CenterDialog
            open={open}
            onOpenChange={(next) => { if (!next) setQuery(""); onOpenChange(next); }}
            title={title}
            description={description}
        >
            <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a5a5a]" aria-hidden="true" />
                <input
                    type="search"
                    aria-label={searchLabel}
                    placeholder={searchLabel}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full rounded-[8px] border border-[#e8e4dd] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#1a1a1a]/40 focus:border-[#70593a]"
                />
            </div>
            <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label={title}>
                {shown.map(item => (
                    <li key={item.value}>
                        <button
                            type="button"
                            aria-pressed={item.value === selected}
                            onClick={() => { setQuery(""); onSelect(item.value); }}
                            className={`flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] ${
                                item.value === selected ? "bg-[#70593a]/10 font-semibold" : "hover:bg-[#faf8f5]"
                            }`}
                        >
                            <span>{item.value}</span>
                            <span className="flex items-center gap-2">
                                {item.badge && (
                                    <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold uppercase tracking-wide ${tierBadge(item.badge.tier)}`}>
                                        {item.badge.label}
                                    </span>
                                )}
                                {item.value === selected && <Check className="h-4 w-4 text-[#70593a]" aria-hidden="true" />}
                            </span>
                        </button>
                    </li>
                ))}
                {shown.length === 0 && (
                    <li className="px-3 py-6 text-center text-sm text-[#5a5a5a]">{emptyText}</li>
                )}
            </ul>
        </CenterDialog>
    );
}

export function StepLocation({ formData, updateFields }: Props) {
    const { data: LOCATION_DATA } = useFlowConfig<Record<string, Record<string, string>>>("location_data");
    const { data: TIERS } = useFlowConfig<Record<string, { label: string; multiplier: number }>>("city_tiers");
    const { config: pricing } = usePricingConfig();

    const [picker, setPicker] = useState<"state" | "city" | null>(null);

    const stateItems = useMemo<PickerItem[]>(
        () => Object.keys(LOCATION_DATA || {}).sort().map(value => ({ value })),
        [LOCATION_DATA],
    );

    const cityItems = useMemo<PickerItem[]>(() => {
        if (!formData.state || !LOCATION_DATA) return [];
        const stateCities = LOCATION_DATA[formData.state] || {};
        return Object.keys(stateCities).sort().map(value => {
            const tier = stateCities[value];
            return { value, badge: { label: TIERS?.[tier]?.label || tier, tier } };
        });
    }, [formData.state, LOCATION_DATA, TIERS]);

    const handleStateSelect = (state: string) => {
        if (state !== formData.state) updateFields({ state, city: "", cityTier: "tier1" });
        setPicker(null);
        // The next question follows naturally: open the city list for the chosen state.
        setTimeout(() => setPicker("city"), 250);
    };

    const handleCitySelect = (city: string) => {
        const tier = LOCATION_DATA[formData.state]?.[city] as CityTier;
        updateFields(tier ? { city, cityTier: tier } : { city });
        setPicker(null);
    };

    // Label from the city-tier list; multiplier from pricing, which is what the estimate uses.
    const tierInfo = formData.cityTier && TIERS[formData.cityTier]
        ? { ...TIERS[formData.cityTier], multiplier: pricing.city_multipliers[formData.cityTier] ?? TIERS[formData.cityTier].multiplier }
        : null;

    return (
        <div>
            {/* State */}
            <div className="mb-5">
                <span id="state-label" className={labelStyle}>State</span>
                <button
                    type="button"
                    aria-labelledby="state-label state-value"
                    aria-haspopup="dialog"
                    onClick={() => setPicker("state")}
                    className={triggerStyle}
                >
                    <span id="state-value" className={formData.state ? "font-medium text-kiro-ink" : "text-kiro-ink/50"}>
                        {formData.state || "Choose your state"}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-kiro-inkSoft" aria-hidden="true" />
                </button>
            </div>

            {/* City */}
            <div className="mb-5">
                <span id="city-label" className={labelStyle}>City</span>
                <button
                    type="button"
                    aria-labelledby="city-label city-value"
                    aria-haspopup="dialog"
                    disabled={!formData.state}
                    onClick={() => setPicker("city")}
                    className={triggerStyle}
                >
                    <span id="city-value" className={formData.city ? "font-medium text-kiro-ink" : "text-kiro-ink/50"}>
                        {formData.city || (formData.state ? "Choose your city" : "Choose a state first")}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-kiro-inkSoft" aria-hidden="true" />
                </button>
            </div>

            <PickerDialog
                open={picker === "state"}
                onOpenChange={(open) => setPicker(open ? "state" : null)}
                title="Choose your state"
                description="Where the project is located."
                searchLabel="Search states"
                items={stateItems}
                selected={formData.state}
                emptyText="No state matches that search."
                onSelect={handleStateSelect}
            />
            <PickerDialog
                open={picker === "city"}
                onOpenChange={(open) => setPicker(open ? "city" : null)}
                title={`Choose your city${formData.state ? ` in ${formData.state}` : ""}`}
                description="The tag shows the city's cost tier."
                searchLabel="Search cities"
                items={cityItems}
                selected={formData.city}
                emptyText="No city matches that search."
                onSelect={handleCitySelect}
            />

            {/* Tier badge */}
            {tierInfo && formData.city && (
                <div className={`relative border-2 rounded-xl p-5 mt-2 animate-in zoom-in-95 duration-300 overflow-hidden ${
                    formData.cityTier === "tier1" ? "border-kiro-accent/30 bg-gradient-to-br from-kiro-accent/[0.08] to-kiro-accent/[0.03]" :
                    formData.cityTier === "tier2" ? "border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] to-amber-500/[0.03]" :
                    "border-kiro-ink/[0.06] bg-white/60"
                }`}>
                    {/* Left accent bar */}
                    <div className={`absolute left-0 inset-y-0 w-1 rounded-l-xl ${
                        formData.cityTier === "tier1" ? "bg-gradient-to-b from-kiro-accent to-kiro-accent/30" :
                        formData.cityTier === "tier2" ? "bg-gradient-to-b from-amber-500 to-amber-500/30" :
                        "bg-kiro-ink/20"
                    }`} aria-hidden="true" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className={`text-sm font-black px-3 py-1 rounded-full uppercase tracking-wide ${
                                formData.cityTier === "tier1" ? "bg-kiro-accent/15 text-kiro-accent" :
                                formData.cityTier === "tier2" ? "bg-amber-500/15 text-amber-700" :
                                "bg-kiro-ink/10 text-kiro-ink/70"
                            }`}>
                                {tierInfo.label}
                            </span>
                            <span className="text-kiro-inkSoft text-xs font-semibold uppercase tracking-wide">
                                Location Class
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-kiro-inkSoft text-[12px] font-bold uppercase block -mb-1">Tier Multiplier</span>
                            <span className={`text-2xl font-black italic tracking-tight ${
                                formData.cityTier === "tier1" ? "text-kiro-accent" :
                                formData.cityTier === "tier2" ? "text-amber-700" :
                                "text-kiro-ink/70"
                            }`}>
                                {tierInfo.multiplier}×
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-kiro-ink/[0.06]">
                        <p className="text-kiro-inkSoft text-xs leading-relaxed">
                            <span className="text-kiro-ink font-semibold">{formData.city}, {formData.state}</span> —
                            Operational costs and logistics rates will be adjusted by the <span className={`font-bold underline underline-offset-4 decoration-current/30 ${
                                formData.cityTier === "tier1" ? "text-kiro-accent" :
                                formData.cityTier === "tier2" ? "text-amber-700" :
                                "text-kiro-ink/70"
                            }`}>{tierInfo.label.toLowerCase()} multiplier</span>.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}

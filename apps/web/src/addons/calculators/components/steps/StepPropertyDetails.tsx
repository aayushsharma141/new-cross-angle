/* Step 2 — Property Details */

import { motion } from "framer-motion";
import type { CalculatorFormData } from "../data/types";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import {
    BHK_PRESETS as DEFAULT_BHK_PRESETS,
    VILLA_BHK as DEFAULT_VILLA_BHK,
    PROJECT_STAGES_MAP as DEFAULT_PROJECT_STAGES_MAP,
    RENOVATION_STAGES as DEFAULT_RENOVATION_STAGES,
    RENOVATION_ROOMS as DEFAULT_RENOVATION_ROOMS,
} from "../data/pricing-config";
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
    updateFields: (partial: Partial<CalculatorFormData>) => void;
}

/* ─── Helpers ─── */

function Counter({ label, value, onChange, min = 0, max = 20 }: {
    label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
    return (
        <div className="flex items-center justify-between rounded-[8px] px-4 py-2.5 border bg-[#ffffff]/80 border-[#1a1a1a]/[0.06] hover:border-[#1a1a1a]/[0.12] transition-all duration-300" role="group" aria-label={`${label}: ${value}`}>
            <span className="text-sm font-medium text-[#1a1a1a]/90" id={`counter-${label.replace(/\s/g, '-').toLowerCase()}`}>{label}</span>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    aria-label={`Decrease ${label}`}
                    disabled={value <= min}
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-full border text-base transition-all duration-200 bg-[#ffffff] border-[#1a1a1a]/[0.08] text-[#1a1a1a]/80 hover:bg-[#8b6f47] hover:text-white hover:border-[#8b6f47] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47]"
                >
                    −
                </button>
                <span className="font-mono font-semibold w-6 text-center text-[#1a1a1a] text-[15px] tabular-nums" aria-live="polite" aria-atomic="true">{value}</span>
                <button
                    type="button"
                    aria-label={`Increase ${label}`}
                    disabled={value >= max}
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-full border text-base transition-all duration-200 bg-[#ffffff] border-[#1a1a1a]/[0.08] text-[#1a1a1a]/80 hover:bg-[#8b6f47] hover:text-white hover:border-[#8b6f47] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47]"
                >
                    +
                </button>
            </div>
        </div>
    );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active ? "true" : "false"}
            className={`
                flex-1 min-w-[120px] px-4 py-4 rounded-[8px] border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2
                ${active
                    ? "bg-[rgba(209,175,110,0.08)] border-[#8b6f47] text-[#8b6f47] shadow-[0_4px_20px_rgba(209,175,110,0.15)] -translate-y-0.5 font-bold"
                    : "bg-[#ffffff]/80 border-[#1a1a1a]/[0.06] text-[#1a1a1a]/80 hover:border-[#8b6f47]/40 hover:-translate-y-0.5 hover:text-[#1a1a1a] font-medium"
                }
            `}
        >
            <span className="text-2xl">{label.split(' ')[0]}</span>
            <span className="text-xs tracking-wider uppercase mt-1">{label.split(' ').slice(1).join(' ')}</span>
        </button>
    );
}

/* ─── Component ─── */

export function StepPropertyDetails({ formData, updateField, updateFields }: Props) {
    const { data: bhkPresets = DEFAULT_BHK_PRESETS } = useFlowConfig<typeof DEFAULT_BHK_PRESETS>("bhk_presets");
    const { data: villaBhk = DEFAULT_VILLA_BHK } = useFlowConfig<typeof DEFAULT_VILLA_BHK>("villa_bhk");
    const { data: projectStagesMap = DEFAULT_PROJECT_STAGES_MAP } = useFlowConfig<typeof DEFAULT_PROJECT_STAGES_MAP>("project_stages_map");
    const { data: renovationStages = DEFAULT_RENOVATION_STAGES } = useFlowConfig<typeof DEFAULT_RENOVATION_STAGES>("renovation_stages");
    const { data: renovationRooms = DEFAULT_RENOVATION_ROOMS } = useFlowConfig<typeof DEFAULT_RENOVATION_ROOMS>("renovation_rooms");

    const pt = formData.propertyType;
    const isApartment = pt === "apartment" || pt === "independent_floor";
    const isVilla = pt === "villa";
    const isOffice = pt === "office";
    const isRenovation = pt === "renovation";
    const isTurnkey = pt === "turnkey";

    const bhkMap = isVilla ? villaBhk : bhkPresets;
    const stages = pt ? projectStagesMap[pt] || [] : [];

    const applyBHK = (bhk: string) => {
        const preset = bhkMap[bhk];
        if (!preset) return;
        updateFields({
            bhk,
            bedrooms: preset.bedrooms,
            bathrooms: preset.bathrooms,
            livingRooms: preset.livingRooms,
            kitchen: preset.kitchen,
            balconies: preset.balconies,
            toilets: preset.toilets,
            area: preset.suggestedArea,
        });
    };

    const toggleRenovationRoom = (room: string) => {
        const rooms = formData.renovationRooms.includes(room)
            ? formData.renovationRooms.filter(r => r !== room)
            : [...formData.renovationRooms, room];
        updateField("renovationRooms", rooms);
    };

    const labelStyle = "block text-sm font-medium mb-2 text-gray-400";

    return (
        <div>

            {/* ── BHK selection (not for office/renovation) ── */}
            {(isApartment || isVilla || isTurnkey) && (
                <div className="mb-6">
                    <label className={labelStyle}>Configuration</label>
                    <motion.div
                        variants={cardListContainer}
                        initial="hidden"
                        animate="show"
                        className="flex flex-wrap gap-2"
                    >
                        {Object.keys(bhkMap).map(bhk => {
                            const active = formData.bhk === bhk;
                            return (
                                <motion.button
                                    type="button"
                                    key={bhk}
                                    variants={cardListItem}
                                    whileHover={CARD_INTERACTIONS.whileHover}
                                    whileTap={CARD_INTERACTIONS.whileTap}
                                    onClick={() => applyBHK(bhk)}
                                    className={selectableCardClassLight(active, `px-4.5 py-2 text-sm ${active ? "font-bold text-[#8b6f47]" : "font-normal text-[#1a1a1a]/80"}`)}
                                >
                                    {active && (
                                        <motion.span
                                            aria-hidden="true"
                                            className="absolute inset-0 pointer-events-none"
                                            animate={breathingAnimationLight}
                                            transition={breathingTransitionLight}
                                        />
                                    )}
                                    {bhk}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>
            )}

            {/* ── Area slider ── */}
            <div className="mb-6">
                <label htmlFor="area-slider" className={labelStyle}>
                    Carpet Area: <span className="font-bold text-[#8b6f47]">{formData.area.toLocaleString()} sq ft</span>
                </label>
                <div className="flex items-center gap-4">
                    <input
                        id="area-slider"
                        type="range"
                        aria-label={`Carpet area: ${formData.area} square feet`}
                        min={200} max={15000} step={50}
                        value={formData.area}
                        onChange={e => updateField("area", Number(e.target.value))}
                        className="flex-1 h-2 bg-[#ffffff] border border-[#1a1a1a]/[0.06] rounded-full appearance-none cursor-pointer accent-[#8b6f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                    />
                    <input
                        type="number"
                        aria-label="Carpet area in square feet"
                        min={200} max={15000} step={50}
                        value={formData.area}
                        onChange={e => updateField("area", Number(e.target.value))}
                        className="w-24 bg-[#ffffff] !bg-[#ffffff] border border-[#1a1a1a]/[0.08] focus:border-[#8b6f47] rounded-[8px] px-3 py-1.5 text-[#1a1a1a] !text-[#1a1a1a] text-sm outline-none transition-all shadow-inner placeholder:text-[#1a1a1a]/30 text-center font-mono font-semibold focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:ring-offset-2"
                    />
                </div>
                <div className="flex justify-between text-[#5a5a5a] text-xs mt-1">
                    <span>200 sq ft</span><span>15,000 sq ft</span>
                </div>
            </div>

            {/* ── Room counters (not for office) ── */}
            {!isOffice && (
                <div className="mb-6">
                    <label className={labelStyle}>Room Configuration</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Counter label="Bedrooms" value={formData.bedrooms} onChange={v => updateField("bedrooms", v)} />
                        <Counter label="Bathrooms" value={formData.bathrooms} onChange={v => updateField("bathrooms", v)} />
                        <Counter label="Living Rooms" value={formData.livingRooms} onChange={v => updateField("livingRooms", v)} />
                        <Counter label="Kitchen" value={formData.kitchen} onChange={v => updateField("kitchen", v)} />
                        <Counter label="Balconies" value={formData.balconies} onChange={v => updateField("balconies", v)} />
                        <Counter label="Toilets" value={formData.toilets} onChange={v => updateField("toilets", v)} />
                    </div>
                </div>
            )}

            {/* ── Villa amenities ── */}
            {isVilla && (
                <div className="mb-6">
                    <label className={labelStyle} id="amenities-label">Amenities</label>
                    <div className="flex flex-wrap gap-2" role="group" aria-labelledby="amenities-label">
                        <ToggleChip label="🏊 Swimming Pool" active={formData.hasPool} onClick={() => updateField("hasPool", !formData.hasPool)} />
                        <ToggleChip label="🌿 Garden" active={formData.hasGarden} onClick={() => updateField("hasGarden", !formData.hasGarden)} />
                        <ToggleChip label="💪 Gym" active={formData.hasGym} onClick={() => updateField("hasGym", !formData.hasGym)} />
                        <ToggleChip label="🎬 Home Theater" active={formData.hasHomeTheater} onClick={() => updateField("hasHomeTheater", !formData.hasHomeTheater)} />
                        <ToggleChip label="🏠 Servant Quarters" active={formData.hasServantQuarters} onClick={() => updateField("hasServantQuarters", !formData.hasServantQuarters)} />
                        <ToggleChip label="🚗 Covered Parking" active={formData.hasCoveredParking} onClick={() => updateField("hasCoveredParking", !formData.hasCoveredParking)} />
                    </div>
                </div>
            )}

            {/* ── Office sections ── */}
            {isOffice && (
                <div className="mb-8">
                    <label className={labelStyle}>Office Sections</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <Counter label="Cabins" value={formData.cabins} onChange={v => updateField("cabins", v)} />
                        <Counter label="Conference Rooms" value={formData.conferenceRooms} onChange={v => updateField("conferenceRooms", v)} />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                        <ToggleChip label="🪟 Reception" active={formData.hasReception} onClick={() => updateField("hasReception", !formData.hasReception)} />
                        <ToggleChip label="☕ Pantry" active={formData.hasPantry} onClick={() => updateField("hasPantry", !formData.hasPantry)} />
                        <ToggleChip label="🖥️ Server Room" active={formData.hasServerRoom} onClick={() => updateField("hasServerRoom", !formData.hasServerRoom)} />
                        <ToggleChip label="📋 Training Room" active={formData.hasTrainingRoom} onClick={() => updateField("hasTrainingRoom", !formData.hasTrainingRoom)} />
                        <ToggleChip label="🛋️ Lounge" active={formData.hasLounge} onClick={() => updateField("hasLounge", !formData.hasLounge)} />
                    </div>
                </div>
            )}

            {/* ── Independent floor ── */}
            {pt === "independent_floor" && (
                <div className="mb-6">
                    <label className={labelStyle}>Building Details</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Counter label="Total Floors" value={formData.floors} min={1} onChange={v => updateField("floors", v)} />
                    </div>
                    <div className="mt-4">
                        <label className="block text-xs font-medium mb-2 text-gray-400">Which Floor?</label>
                        <div className="flex flex-wrap gap-1.5">
                            {["Ground", "1st", "2nd", "3rd", "4th+"].map(f => {
                                const active = formData.floorNumber === f;
                                return (
                                    <button
                                        key={f}
                                        onClick={() => updateField("floorNumber", f)}
                                        className={`
                                            px-3 py-1.5 rounded-none text-xs border transition-all duration-200
                                            ${active
                                                ? "bg-[#8b6f47]/15 border-[#8b6f47] text-[#8b6f47] shadow-[0_0_10px_rgba(209,175,110,0.2)]"
                                                : "bg-[#ffffff] border-[#1a1a1a]/[0.06] text-[#1a1a1a]/70 hover:border-[#8b6f47]/40 hover:text-[#1a1a1a]"
                                            }
                                        `}
                                    >
                                        {f}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Renovation scope ── */}
            {isRenovation && (
                <div className="mb-6">
                    <label className={labelStyle}>Renovation Scope</label>
                    <div className="flex flex-col gap-2">
                        {renovationStages.map(s => {
                            const active = formData.renovationScope === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => updateField("renovationScope", s.id)}
                                    className={`
                                        px-5 py-4 rounded-[8px] border text-left transition-all duration-300 cursor-pointer
                                        ${active
                                            ? "bg-[rgba(209,175,110,0.08)] border-[#8b6f47] shadow-[0_4px_20px_rgba(209,175,110,0.15)] -translate-y-0.5"
                                            : "bg-[#ffffff]/80 border-[#1a1a1a]/[0.06] hover:border-[#8b6f47]/40 hover:-translate-y-0.5"
                                        }
                                    `}
                                >
                                    <div className={`text-sm font-semibold transition-colors ${active ? "text-[#8b6f47]" : "text-[#1a1a1a]"}`}>{s.label}</div>
                                    <div className={`text-[11px] mt-0.5 transition-colors ${active ? "text-[#1a1a1a]/70" : "text-[#5a5a5a]"}`}>{s.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                    {formData.renovationScope === "room" && (
                        <div className="mt-4">
                            <label className="block text-xs font-medium mb-2 text-gray-400">Select Rooms to Renovate</label>
                            <div className="flex flex-wrap gap-2">
                                {renovationRooms.map(r => (
                                    <ToggleChip
                                        key={r} label={r}
                                        active={formData.renovationRooms.includes(r)}
                                        onClick={() => toggleRenovationRoom(r)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Project stage ── */}
            {stages.length > 0 && (
                <div className="mb-3">
                    <label className={labelStyle}>Project Stage</label>
                    <div className="flex flex-col gap-2">
                        {stages.map(s => {
                            const active = formData.stage === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => updateField("stage", s.id)}
                                    className={`
                                        px-5 py-4 rounded-[8px] border text-left transition-all duration-300 cursor-pointer
                                        ${active
                                            ? "bg-[rgba(209,175,110,0.08)] border-[#8b6f47] shadow-[0_4px_20px_rgba(209,175,110,0.15)] -translate-y-0.5"
                                            : "bg-[#ffffff]/80 border-[#1a1a1a]/[0.06] hover:border-[#8b6f47]/40 hover:-translate-y-0.5"
                                        }
                                    `}
                                >
                                    <div className={`text-sm font-semibold transition-colors ${active ? "text-[#8b6f47]" : "text-[#1a1a1a]"}`}>{s.l}</div>
                                    <div className={`text-[11px] mt-0.5 transition-colors ${active ? "text-[#1a1a1a]/70" : "text-[#5a5a5a]"}`}>{s.d}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

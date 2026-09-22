/* Step 2 — Property Details */


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
} from "@/addons/_shared/card-styles";
import { 
    Waves, Leaf, Dumbbell, Tv, Home, CarFront, 
    Monitor, Coffee, Server, Presentation, Sofa 
} from "lucide-react";

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
        <div className="flex items-center justify-between rounded-[8px] px-4 py-2.5 border bg-kiro-surface/80 border-kiro-ink/[0.06] hover:border-kiro-ink/[0.12] transition-all duration-300" role="group" aria-label={`${label}: ${value}`}>
            <span className="text-sm font-medium text-kiro-ink/90" id={`counter-${label.replace(/\s/g, '-').toLowerCase()}`}>{label}</span>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    aria-label={`Decrease ${label}`}
                    disabled={value <= min}
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-full border text-base transition-all duration-200 bg-kiro-surface border-kiro-ink/[0.08] text-kiro-ink/80 hover:bg-kiro-accent hover:text-white hover:border-kiro-accent hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent"
                >
                    −
                </button>
                <span className="font-mono font-semibold w-6 text-center text-kiro-ink text-[15px] tabular-nums" aria-live="polite" aria-atomic="true">{value}</span>
                <button
                    type="button"
                    aria-label={`Increase ${label}`}
                    disabled={value >= max}
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-full border text-base transition-all duration-200 bg-kiro-surface border-kiro-ink/[0.08] text-kiro-ink/80 hover:bg-kiro-accent hover:text-white hover:border-kiro-accent hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent"
                >
                    +
                </button>
            </div>
        </div>
    );
}

function ToggleChip({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            {...(active ? { "aria-pressed": "true" } : { "aria-pressed": "false" })}
            className={`
                flex-1 min-w-[120px] px-4 py-4 rounded-[8px] border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2
                ${active
                    ? "bg-kiro-accent/[0.18] border-kiro-accent text-kiro-accent font-bold shadow-[0_4px_24px_rgba(139,111,71,0.22)] -translate-y-0.5 scale-[1.02] ring-2 ring-kiro-accent/30"
                    : "bg-kiro-surface/80 border-kiro-ink/[0.06] text-kiro-ink/80 font-medium hover:bg-kiro-accentSoft hover:border-kiro-accent/55 hover:-translate-y-0.5 hover:text-kiro-ink hover:shadow-[0_4px_16px_rgba(139,111,71,0.1)]"
                }
            `}
        >
            <Icon className={`w-6 h-6 mb-1 ${active ? 'text-kiro-accent drop-shadow-[0_0_6px_rgba(139,111,71,0.4)]' : 'text-kiro-ink/60 group-hover:text-kiro-ink/80'}`} />
            <span className="text-sm tracking-wide mt-1">{label}</span>
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

    const labelStyle = "block text-sm font-medium mb-2 text-gray-500";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12">
                {/* ── Left: Configuration & Counters ── */}
                <div className="space-y-8">
                    {/* ── BHK selection ── */}
                    {(isApartment || isVilla || isTurnkey) && (
                        <div>
                            <span className={labelStyle}>Configuration</span>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(bhkMap).map(bhk => {
                                    const active = formData.bhk === bhk;
                                    return (
                                        <button
                                            type="button"
                                            key={bhk}
                                            onClick={() => applyBHK(bhk)}
                                            className={`${selectableCardClassLight(active, `px-4.5 py-2 text-sm ${active ? "font-bold text-kiro-accent" : "font-normal text-kiro-ink/80"}`)} ${active ? "bg-[#7a5c30]/[0.12]" : "bg-white/70 hover:bg-[#7a5c30]/[0.05]"}`}
                                        >
                                            {active && (
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute inset-0 pointer-events-none"
                                                />
                                            )}
                                            {bhk}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Progressive Disclosure for Counters ── */}
                    {(!((isApartment || isVilla || isTurnkey) && !formData.bhk)) && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
                            {/* Room counters (not for office) */}
                            {!isOffice && (
                                <div>
                                    <span className={labelStyle}>Room Configuration</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Counter label="Bedrooms" value={formData.bedrooms} onChange={v => updateField("bedrooms", v)} />
                                        <Counter label="Bathrooms" value={formData.bathrooms} onChange={v => updateField("bathrooms", v)} />
                                        <Counter label="Living Rooms" value={formData.livingRooms} onChange={v => updateField("livingRooms", v)} />
                                        <Counter label="Kitchen" value={formData.kitchen} onChange={v => updateField("kitchen", v)} />
                                        <Counter label="Balconies" value={formData.balconies} onChange={v => updateField("balconies", v)} />
                                        <Counter label="Toilets" value={formData.toilets} onChange={v => updateField("toilets", v)} />
                                    </div>
                                </div>
                            )}

                            {/* Villa amenities */}
                            {isVilla && (
                                <div>
                                    <span className={labelStyle} id="amenities-label">Amenities</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-labelledby="amenities-label">
                                        <ToggleChip icon={Waves} label="Pool" active={formData.hasPool} onClick={() => updateField("hasPool", !formData.hasPool)} />
                                        <ToggleChip icon={Leaf} label="Garden" active={formData.hasGarden} onClick={() => updateField("hasGarden", !formData.hasGarden)} />
                                        <ToggleChip icon={Dumbbell} label="Gym" active={formData.hasGym} onClick={() => updateField("hasGym", !formData.hasGym)} />
                                        <ToggleChip icon={Tv} label="Theater" active={formData.hasHomeTheater} onClick={() => updateField("hasHomeTheater", !formData.hasHomeTheater)} />
                                        <ToggleChip icon={Home} label="Quarters" active={formData.hasServantQuarters} onClick={() => updateField("hasServantQuarters", !formData.hasServantQuarters)} />
                                        <ToggleChip icon={CarFront} label="Parking" active={formData.hasCoveredParking} onClick={() => updateField("hasCoveredParking", !formData.hasCoveredParking)} />
                                    </div>
                                </div>
                            )}

                            {/* Office sections */}
                            {isOffice && (
                                <div>
                                    <span className={labelStyle}>Office Sections</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                        <Counter label="Cabins" value={formData.cabins} onChange={v => updateField("cabins", v)} />
                                        <Counter label="Conference Rooms" value={formData.conferenceRooms} onChange={v => updateField("conferenceRooms", v)} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <ToggleChip icon={Monitor} label="Reception" active={formData.hasReception} onClick={() => updateField("hasReception", !formData.hasReception)} />
                                        <ToggleChip icon={Coffee} label="Pantry" active={formData.hasPantry} onClick={() => updateField("hasPantry", !formData.hasPantry)} />
                                        <ToggleChip icon={Server} label="Server Room" active={formData.hasServerRoom} onClick={() => updateField("hasServerRoom", !formData.hasServerRoom)} />
                                        <ToggleChip icon={Presentation} label="Training Room" active={formData.hasTrainingRoom} onClick={() => updateField("hasTrainingRoom", !formData.hasTrainingRoom)} />
                                        <ToggleChip icon={Sofa} label="Lounge" active={formData.hasLounge} onClick={() => updateField("hasLounge", !formData.hasLounge)} />
                                    </div>
                                </div>
                            )}

                            {/* Independent floor */}
                            {pt === "independent_floor" && (
                                <div>
                                    <span className={labelStyle}>Building Details</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                        <Counter label="Total Floors" value={formData.floors} min={1} onChange={v => updateField("floors", v)} />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-medium mb-2 text-gray-500">Which Floor?</span>
                                        <div className="flex flex-wrap gap-2">
                                            {["Ground", "1st", "2nd", "3rd", "4th+"].map(f => {
                                                const active = formData.floorNumber === f;
                                                return (
                                                    <button
                                                        key={f}
                                                        onClick={() => updateField("floorNumber", f)}
                                                        className={`
                                                            px-4 py-2 rounded-md text-sm border transition-all duration-200
                                                            ${active
                                                                ? "bg-kiro-accent/[0.18] border-kiro-accent text-kiro-accent font-bold shadow-[0_4px_20px_rgba(139,111,71,0.2)] ring-1 ring-kiro-accent/30"
                                                                : "bg-kiro-surface border-kiro-ink/[0.06] text-kiro-ink/70 hover:bg-kiro-accentSoft hover:border-kiro-accent/55 hover:text-kiro-ink hover:shadow-[0_2px_12px_rgba(139,111,71,0.08)]"
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

                            {/* Renovation scope */}
                            {isRenovation && (
                                <div>
                                    <span className={labelStyle}>Renovation Scope</span>
                                    <div className="grid grid-cols-1 gap-3">
                                        {renovationStages.map(s => {
                                            const active = formData.renovationScope === s.id;
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => updateField("renovationScope", s.id)}
                                                    className={`
                                                        px-5 py-4 rounded-[8px] border text-left transition-all duration-300 cursor-pointer
                                                        ${active
                                                            ? "bg-kiro-accent/[0.18] border-kiro-accent ring-2 ring-kiro-accent/30 shadow-[0_4px_24px_rgba(139,111,71,0.22)] -translate-y-0.5 scale-[1.01]"
                                                            : "bg-kiro-surface/80 border-kiro-ink/[0.06] hover:bg-kiro-accentSoft hover:border-kiro-accent/55 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(139,111,71,0.1)]"
                                                        }
                                                    `}
                                                >
                                                    <div className={`text-sm font-semibold transition-colors ${active ? "text-kiro-accent" : "text-kiro-ink group-hover:text-kiro-ink"}`}>{s.label}</div>
                                                    <div className={`text-[13px] mt-0.5 transition-colors ${active ? "text-kiro-ink/70" : "text-kiro-inkSoft group-hover:text-kiro-ink/80"}`}>{s.desc}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {formData.renovationScope === "room" && (
                                        <div className="mt-5">
                                            <span className="block text-xs font-medium mb-2 text-gray-500">Select Rooms to Renovate</span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {renovationRooms.map(r => (
                                                    <ToggleChip
                                                        key={r}
                                                        icon={Home} // Fallback icon for renovation rooms
                                                        label={r}
                                                        active={formData.renovationRooms.includes(r)}
                                                        onClick={() => toggleRenovationRoom(r)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right: Area Slider ── */}
                <div>
                    {(!((isApartment || isVilla || isTurnkey) && !formData.bhk)) && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 sticky top-6">
                            <div className="bg-kiro-surface/50 border border-kiro-ink/5 rounded-xl p-6 backdrop-blur-sm">
                                <label htmlFor="area-slider" className={labelStyle}>
                                    Carpet Area
                                </label>
                                <div className="text-3xl font-bold text-kiro-accent mb-6 font-mono">
                                    {formData.area.toLocaleString()} <span className="text-sm text-kiro-ink/50 font-sans">sq ft</span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <input
                                        id="area-slider"
                                        type="range"
                                        aria-label={`Carpet area: ${formData.area} square feet`}
                                        min={200} max={15000} step={50}
                                        value={formData.area}
                                        onChange={e => updateField("area", Number(e.target.value))}
                                        className="w-full h-2 bg-kiro-surface border border-kiro-ink/[0.06] rounded-full appearance-none cursor-pointer accent-kiro-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                                    />
                                    <input
                                        type="number"
                                        aria-label="Carpet area in square feet"
                                        min={200} max={15000} step={50}
                                        value={formData.area}
                                        onChange={e => updateField("area", Number(e.target.value))}
                                        className="w-full bg-kiro-surface !bg-kiro-surface border border-kiro-ink/[0.08] focus:border-kiro-accent rounded-[8px] px-3 py-2 text-kiro-ink !text-kiro-ink text-sm outline-none transition-all shadow-inner placeholder:text-kiro-ink/30 text-center font-mono font-semibold focus-visible:ring-2 focus-visible:ring-kiro-accent focus-visible:ring-offset-2"
                                    />
                                </div>
                                <div className="flex justify-between text-kiro-inkSoft text-xs mt-2">
                                    <span>200</span><span>15,000+</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom: Segmented Stage Controls ── */}
            {(!((isApartment || isVilla || isTurnkey) && !formData.bhk)) && stages.length > 0 && (
                <div className="mt-12 pt-8 border-t border-kiro-ink/10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <span className={labelStyle}>Project Stage</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {stages.map(s => {
                            const active = formData.stage === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => updateField("stage", s.id)}
                                    className={`
                                        px-4 py-4 rounded-[8px] border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-full
                                        ${active
                                            ? "bg-kiro-accent/[0.18] border-kiro-accent font-bold shadow-[0_4px_24px_rgba(139,111,71,0.22)] -translate-y-0.5 scale-[1.02] ring-2 ring-kiro-accent/30"
                                            : "bg-kiro-surface/80 border-kiro-ink/[0.06] hover:bg-kiro-accentSoft hover:border-kiro-accent/55 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(139,111,71,0.1)]"
                                        }
                                    `}
                                >
                                    <div className={`text-sm font-semibold transition-colors ${active ? "text-kiro-accent" : "text-kiro-ink group-hover:text-kiro-ink"}`}>{s.l}</div>
                                    <div className={`text-[12px] mt-1.5 transition-colors leading-relaxed ${active ? "text-kiro-ink/70" : "text-kiro-inkSoft group-hover:text-kiro-ink/80"}`}>{s.d}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/* Step 2 — Property Details */

import type { CalculatorFormData } from "../data/types";
import {
    BHK_PRESETS, VILLA_BHK, PROJECT_STAGES_MAP,
    RENOVATION_STAGES, RENOVATION_ROOMS, THEME,
} from "../data/pricing-config";

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
        <div className="flex items-center justify-between rounded-none px-4 py-2.5 border bg-site-bg-card border-site-border">
            <span className="text-sm font-medium text-site-text-heading">{label}</span>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-none border text-lg transition-colors bg-site-bg-card border-site-border text-site-text hover:bg-site-bg-card-hover hover:text-site-crimson"
                >
                    −
                </button>
                <span className="font-semibold w-6 text-center text-site-text-heading">{value}</span>
                <button
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-none border text-lg transition-colors bg-site-bg-card border-site-border text-site-text hover:bg-site-bg-card-hover hover:text-site-crimson"
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
            className={`
                px-3.5 py-2 rounded-none text-xs transition-all duration-200 border 
                ${active
                    ? "font-semibold bg-site-crimson/10 border-site-crimson text-site-crimson shadow-[0_0_10px_rgba(227, 83, 54,0.1)]"
                    : "font-normal bg-site-bg-card border-site-border text-site-text-muted hover:border-site-crimson/30 hover:text-site-text"
                }
            `}
        >
            {label}
        </button>
    );
}

/* ─── Component ─── */

export function StepPropertyDetails({ formData, updateField, updateFields }: Props) {
    const pt = formData.propertyType;
    const isApartment = pt === "apartment" || pt === "independent_floor";
    const isVilla = pt === "villa";
    const isOffice = pt === "office";
    const isRenovation = pt === "renovation";
    const isTurnkey = pt === "turnkey";

    const bhkMap = isVilla ? VILLA_BHK : BHK_PRESETS;
    const stages = pt ? PROJECT_STAGES_MAP[pt] || [] : [];

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
            <h2 className="text-2xl font-bold mb-1 text-site-text-heading uppercase">
                Property Details
            </h2>
            <p className="text-site-text-muted mb-6 text-sm">
                Tell us more about your {formData.propertyType?.replace("_", " ")}
            </p>

            {/* ── BHK selection (not for office/renovation) ── */}
            {(isApartment || isVilla || isTurnkey) && (
                <div className="mb-6">
                    <label className={labelStyle}>Configuration</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(bhkMap).map(bhk => {
                            const active = formData.bhk === bhk;
                            return (
                                <button
                                    key={bhk}
                                    onClick={() => applyBHK(bhk)}
                                    className={`
                                        px-4.5 py-2 rounded-none text-sm transition-all duration-200 border-2
                                        ${active
                                            ? "font-bold bg-site-crimson/10 border-site-crimson text-site-crimson shadow-[0_0_15px_rgba(227, 83, 54,0.1)]"
                                            : "font-normal bg-site-bg-card border-site-border text-site-text hover:border-site-crimson/30"
                                        }
                                    `}
                                >
                                    {bhk}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Area slider ── */}
            <div className="mb-6">
                <label className={labelStyle}>
                    Carpet Area: <span className="font-bold text-site-crimson">{formData.area.toLocaleString()} sq ft</span>
                </label>
                <input
                    type="range"
                    title="Carpet Area"
                    min={200} max={15000} step={50}
                    value={formData.area}
                    onChange={e => updateField("area", Number(e.target.value))}
                    className="w-full h-2 bg-site-bg-card rounded-none appearance-none cursor-pointer accent-site-crimson"
                />
                <div className="flex justify-between text-site-text-meta text-xs mt-1">
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
                    <label className={labelStyle}>Amenities</label>
                    <div className="flex flex-wrap gap-2">
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
                <div className="mb-6">
                    <label className={labelStyle}>Office Sections</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <Counter label="Cabins" value={formData.cabins} onChange={v => updateField("cabins", v)} />
                        <Counter label="Conference Rooms" value={formData.conferenceRooms} onChange={v => updateField("conferenceRooms", v)} />
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                                            px-3 py-1.5 rounded-none text-xs border transition-colors
                                            ${active
                                                ? "bg-site-crimson/10 border-site-crimson text-site-crimson shadow-[0_0_10px_rgba(227, 83, 54,0.1)]"
                                                : "bg-site-bg-card border-site-border text-site-text-muted hover:border-site-crimson/30 hover:text-site-text"
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
                        {RENOVATION_STAGES.map(s => {
                            const active = formData.renovationScope === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => updateField("renovationScope", s.id)}
                                    className={`
                                        px-4 py-3 rounded-none border-2 text-left transition-all duration-200
                                        ${active
                                            ? "bg-site-crimson/10 border-site-crimson shadow-[0_0_15px_rgba(227, 83, 54,0.1)]"
                                            : "bg-site-bg-card border-site-border hover:border-site-crimson/30"
                                        }
                                    `}
                                >
                                    <div className={`text-sm font-semibold ${active ? "text-site-crimson" : "text-site-text-heading"}`}>{s.label}</div>
                                    <div className="text-site-text-muted text-xs mt-0.5">{s.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                    {formData.renovationScope === "room" && (
                        <div className="mt-4">
                            <label className="block text-xs font-medium mb-2 text-gray-400">Select Rooms to Renovate</label>
                            <div className="flex flex-wrap gap-2">
                                {RENOVATION_ROOMS.map(r => (
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
                                        px-4 py-3 rounded-none border-2 text-left transition-all duration-200
                                        ${active
                                            ? "bg-site-crimson/10 border-site-crimson shadow-[0_0_15px_rgba(227, 83, 54,0.1)]"
                                            : "bg-site-bg-card border-site-border hover:border-site-crimson/30"
                                        }
                                    `}
                                >
                                    <div className={`text-sm font-semibold ${active ? "text-site-crimson" : "text-site-text-heading"}`}>{s.l}</div>
                                    <div className="text-site-text-muted text-xs mt-0.5">{s.d}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

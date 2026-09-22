import { useMemo } from "react";
import { CalculatorFormData, EstimateResult } from "./data/types";
import { formatCurrency } from "./data/format-utils";
import { 
    MapPin, Sparkles, CheckCircle2, AlertTriangle, 
    TrendingUp, ShieldAlert, Sparkle, LayoutDashboard
} from "lucide-react";
import type { ExecutionBlueprint } from "./data/engines/types";

interface DossierPanelProps {
    formData: CalculatorFormData;
    estimate: EstimateResult | null;
    executionBlueprint: ExecutionBlueprint | null;
}

export function ProjectDossierPanel({ formData, estimate, executionBlueprint }: DossierPanelProps) {
    const costBounds = useMemo(() => getActiveCostBounds(formData, estimate), [formData, estimate]);
    const confidence = useMemo(() => calculateConfidence(formData), [formData]);
    const health = useMemo(() => getProjectHealth(formData, costBounds), [formData, costBounds]);

    return (
        <aside className="hidden lg:flex flex-col bg-[#090909] border-l border-white/10 p-6 xl:p-8 sticky top-0 h-[100dvh] overflow-y-auto z-20 w-[360px] xl:w-[400px] text-[#D9D9D9]">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <LayoutDashboard className="w-4 h-4 text-kiro-accent" />
                <h2 className="text-[12px] font-bold text-[#9E9E9E] uppercase tracking-wide">Active Project Dossier</h2>
            </div>
            
            {/* Stripe/Notion style single visual container */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 shadow-2xl space-y-5">
                <EstimateSection costBounds={costBounds} formData={formData} />
                
                <hr className="border-white/5" />
                
                <BlueprintSection formData={formData} costBounds={costBounds} />
                
                {costBounds && (costBounds.design > 0 || costBounds.addons > 0) && (
                    <>
                        <hr className="border-white/5" />
                        <CostBreakdownSection costBounds={costBounds} />
                    </>
                )}
                
                <hr className="border-white/5" />
                
                <ConfidenceSection confidence={confidence} />
                
                {formData.propertyType && (
                    <>
                        <hr className="border-white/5" />
                        <ProjectHealthSection health={health} />
                    </>
                )}
                
                <hr className="border-white/5" />
                
                <RecommendationSection formData={formData} executionBlueprint={executionBlueprint} />
            </div>
        </aside>
    );
}

// ─── 1. Estimate Section ───────────────────────────────────────────────────────

function EstimateSection({ 
    costBounds, 
    formData 
}: { 
    costBounds: ReturnType<typeof getActiveCostBounds>; 
    formData: CalculatorFormData 
}) {
    if (!costBounds) {
        return (
            <div className="space-y-2">
                <h3 className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wide">Project Estimate</h3>
                <div className="text-sm font-medium text-[#9E9E9E]/60 italic">
                    Awaiting property selections...
                </div>
            </div>
        );
    }

    const { min, max, isIndicative } = costBounds;

    return (
        <div className="space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wide">
                    {isIndicative ? "Indicative Estimate Range" : "Refined Estimate Bounds"}
                </h3>
                {isIndicative && (
                    <span className="bg-kiro-accent/10 border border-kiro-accent/20 px-2 py-0.5 rounded text-[8px] font-bold text-kiro-accent uppercase tracking-wider">
                        Indicative
                    </span>
                )}
            </div>

            <div>
                <div className="flex items-center gap-1.5 mb-1 text-[13px] text-[#9E9E9E] font-medium">
                    <div className={`w-1.5 h-1.5 rounded-full ${isIndicative ? "bg-amber-500" : "bg-green-500 animate-pulse"}`} />
                    <span>{isIndicative ? "Continuous Projection" : "Live Cost Model"}</span>
                </div>
                <div className="text-[20px] xl:text-[23px] font-serif font-semibold text-white tracking-tight leading-none py-1">
                    {formatCurrency(min)} - {formatCurrency(max)}
                </div>
            </div>

            {/* Visual Budget Alignment Pointer */}
            <div className="pt-2 pb-1 relative">
                <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 opacity-60" />
                </div>
                {formData.budgetAmount && (
                    <div 
                        className="absolute -top-0.5 w-2.5 h-2.5 bg-kiro-accent border border-[#090909] rounded-full shadow-md transition-all duration-500 ease-out"
                        style={{ 
                            left: `${Math.min(95, Math.max(5, ((formData.budgetAmount - min) / (max - min || 1)) * 100))}%` 
                        }}
                    />
                )}
                <div className="flex justify-between text-[8px] font-mono text-[#9E9E9E] mt-1.5">
                    <span>Min</span>
                    <span>Target Budget</span>
                    <span>Max</span>
                </div>
            </div>
        </div>
    );
}

// ─── 2. Blueprint Section ──────────────────────────────────────────────────────

function BlueprintSection({ 
    formData,
    costBounds
}: { 
    formData: CalculatorFormData;
    costBounds: ReturnType<typeof getActiveCostBounds>;
}) {
    const formatType = (val?: string | null) => val ? val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, " ") : "—";
    
    return (
        <div className="space-y-2.5">
            <h3 className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wide">Project Specifications</h3>

            <div className="space-y-0.5 divide-y divide-white/5">
                <BlueprintRow label="Property Type" value={formatType(formData.propertyType)} />
                {formData.propertyType !== "office" && (
                    <BlueprintRow label="Configuration" value={formData.bhk || (formData.bedrooms ? `${formData.bedrooms} BHK` : "—")} />
                )}
                {formData.propertyType === "office" && (
                    <BlueprintRow label="Workspaces" value={`${formData.cabins} Cabins · ${formData.conferenceRooms} Conf`} />
                )}
                <BlueprintRow label="Carpet Area" value={formData.area ? `${formData.area.toLocaleString()} sq ft` : "—"} />
                <BlueprintRow icon={<MapPin className="w-3 h-3" />} label="Location" value={formData.city ? `${formData.city}, ${formData.state}` : (formData.state || "—")} />
                {costBounds?.addons && costBounds.addons > 0 ? (
                    <BlueprintRow label="Bespoke Add-ons" value={formatCurrency(costBounds.addons)} />
                ) : null}
            </div>
        </div>
    );
}

function BlueprintRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-2 text-[12px]">
            <div className="flex items-center gap-2 text-[#9E9E9E]">
                {icon ? <span className="text-kiro-accent">{icon}</span> : null}
                <span>{label}</span>
            </div>
            <span className={`font-medium ${value === "—" ? "text-[#9E9E9E]/30" : "text-white"}`}>
                {value}
            </span>
        </div>
    );
}

// ─── 3. Cost Breakdown Section ─────────────────────────────────────────────────

function CostBreakdownSection({ costBounds }: { costBounds: NonNullable<ReturnType<typeof getActiveCostBounds>> }) {
    const { design, execution, addons } = costBounds;
    const total = design + execution + addons;
    
    const designPct = Math.round((design / total) * 100);
    const executionPct = Math.round((execution / total) * 100);
    const addonsPct = Math.round((addons / total) * 100);

    const conicGradient = `conic-gradient(#3f3f46 0% ${executionPct}%, #818cf8 ${executionPct}% ${executionPct + designPct}%, #fb8c00 ${executionPct + designPct}% 100%)`;

    return (
        <div className="space-y-3">
            <h3 className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wide">Cost Allocation</h3>
            
            <div className="flex items-center gap-6 pt-1">
                <div className="relative w-16 h-16 shrink-0 rounded-full" style={{ background: conicGradient }}>
                    <div className="absolute inset-1.5 bg-[#111111] rounded-full flex flex-col items-center justify-center">
                        <span className="text-[13px] font-bold text-white leading-tight">
                            {formatCurrency(total / 2).replace(/\.00/g, "").replace(/₹/g, "")}
                        </span>
                        <span className="text-[6px] text-[#9E9E9E] uppercase tracking-wider font-semibold">Avg</span>
                    </div>
                </div>

                <div className="flex-1 space-y-1.5">
                    {execution > 0 && <BreakdownLegend color="bg-[#3f3f46]" label="Build & Execution" pct={`${executionPct}%`} val={formatCurrency(execution)} />}
                    {design > 0 && <BreakdownLegend color="bg-[#818cf8]" label="Design Fees" pct={`${designPct}%`} val={formatCurrency(design)} />}
                    {addons > 0 && <BreakdownLegend color="bg-[#fb8c00]" label="Bespoke Add-ons" pct={`${addonsPct}%`} val={formatCurrency(addons)} />}
                </div>
            </div>
        </div>
    );
}

function BreakdownLegend({ color, label, pct, val }: { color: string; label: string; pct: string; val: string }) {
    return (
        <div className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                <span className="text-[#9E9E9E] truncate max-w-[80px]">{label}</span>
            </div>
            <div className="flex gap-2 font-mono">
                <span className="text-[#9E9E9E] w-5 text-right">{pct}</span>
                <span className="text-white font-semibold text-right">{val}</span>
            </div>
        </div>
    );
}

// ─── 4. Confidence Section ────────────────────────────────────────────────────

function ConfidenceSection({ confidence }: { confidence: ReturnType<typeof calculateConfidence> }) {
    const { score, missing } = confidence;

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wide">Confidence Score</h3>
                <span className="text-xs font-bold text-kiro-accent font-mono">{score}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-kiro-accent transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${score}%` }}
                />
            </div>
            {missing.length > 0 ? (
                <div className="pt-1 space-y-1.5">
                    <span className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider block">To improve accuracy:</span>
                    <div className="flex flex-wrap gap-1">
                        {missing.slice(0, 3).map(m => (
                            <span key={m} className="inline-flex items-center gap-1 text-[8px] bg-white/5 text-[#9E9E9E] px-1.5 py-0.5 rounded font-medium">
                                + {m}
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-green-500 text-[9px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> High Precision model
                </div>
            )}
        </div>
    );
}

// ─── 5. Project Health Section ─────────────────────────────────────────────────

function ProjectHealthSection({ health }: { health: ReturnType<typeof getProjectHealth> }) {
    const { status, desc, budgetHealth, timelineHealth, scopeHealth } = health;

    const statusConfig = {
        Optimal: { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, color: "text-green-500" },
        Viable: { icon: <TrendingUp className="w-3.5 h-3.5 text-kiro-accent" />, color: "text-kiro-accent" },
        Stretched: { icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />, color: "text-amber-500" },
        Deficit: { icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />, color: "text-rose-500" },
        Pending: { icon: null, color: "text-[#9E9E9E]" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;

    return (
        <div className="space-y-3 animate-in fade-in duration-300">
            <h3 className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wide">Project Feasibility</h3>

            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                    {config.icon}
                    <span className={`text-[12px] font-bold ${config.color}`}>{status}</span>
                </div>
                <p className="text-[12px] text-[#9E9E9E] leading-snug">
                    {desc}
                </p>

                {/* Subsystem Health Lights */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5">
                    <HealthStatusIndicator label="Budget" status={budgetHealth} />
                    <HealthStatusIndicator label="Timeline" status={timelineHealth} />
                    <HealthStatusIndicator label="Scope" status={scopeHealth} />
                </div>
            </div>
        </div>
    );
}

function HealthStatusIndicator({ label, status }: { label: string; status: "optimal" | "viable" | "stretched" | "deficit" | "warning" | "defined" | "vague" }) {
    const config = {
        optimal: { dot: "bg-green-500", text: "Optimal" },
        viable: { dot: "bg-green-400", text: "Viable" },
        stretched: { dot: "bg-amber-400", text: "Stretched" },
        deficit: { dot: "bg-rose-500", text: "Deficit" },
        warning: { dot: "bg-amber-500 animate-pulse", text: "Risk" },
        defined: { dot: "bg-kiro-accent", text: "Selected" },
        vague: { dot: "bg-white/10", text: "Unset" }
    };

    const c = config[status as keyof typeof config] || config.vague;

    return (
        <div className="text-center p-1.5 bg-white/5 rounded">
            <span className="text-[8px] text-[#9E9E9E] block uppercase tracking-wider font-semibold mb-0.5">{label}</span>
            <div className="flex items-center justify-center gap-1">
                <span className={`w-1 h-1 rounded-full ${c.dot}`} />
                <span className="text-[9px] font-bold text-white">{c.text}</span>
            </div>
        </div>
    );
}

// ─── 6. AI Recommendation Section ──────────────────────────────────────────────

function RecommendationSection({ 
    formData,
    executionBlueprint
}: { 
    formData: CalculatorFormData;
    executionBlueprint: ExecutionBlueprint | null;
}) {
    const hasEnoughSignals = !!(formData.propertyType && formData.area && formData.selectedService);
    const reco = executionBlueprint?.recommendation;

    return (
        <div className="bg-[#181818] border border-white/5 rounded-xl p-4 relative overflow-hidden animate-in fade-in duration-500">
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
                <Sparkles className="w-3 h-3 text-kiro-accent" />
                <span className="text-[9px] font-bold text-[#D9D9D9] uppercase tracking-wider">
                    {reco ? "AI Strategic Advice" : "AI Recommendation"}
                </span>
            </div>
            
            {reco ? (
                <div className="space-y-2 relative z-10">
                    <h4 className="text-[12px] font-bold text-white">{reco.strategyLabel}</h4>
                    <p className="text-[12px] text-[#9E9E9E] leading-relaxed">
                        {reco.summary}
                    </p>
                    <p className="text-[12px] text-[#9E9E9E]/80 italic leading-relaxed">
                        "{reco.reasoning}"
                    </p>
                </div>
            ) : hasEnoughSignals ? (
                <div className="space-y-2 relative z-10">
                    <p className="text-[12px] text-[#9E9E9E] leading-relaxed">
                        Based on selections, we suggest:
                    </p>
                    <div className="flex items-center justify-between gap-2 bg-[#111111] p-2 rounded border border-white/5 text-[13px] font-bold text-white">
                        <span className="truncate">
                            {formData.selectedService === "C5" ? `${formData.executionTier || "Premium"} Commission` : "Design Stewardship"}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-kiro-accent animate-ping" />
                    </div>
                </div>
            ) : (
                <div className="space-y-1.5 relative z-10">
                    <p className="text-[12px] text-[#9E9E9E] leading-relaxed">
                        Select parameters to unlock AI recommendations.
                    </p>
                    <div className="flex items-center gap-1 text-[8px] text-[#c9a96e] font-bold uppercase tracking-wider">
                        <Sparkle className="w-2.5 h-2.5" /> Awaiting signals
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── 7. Calculation Helpers ──────────────────────────────────────────────────

function getActiveCostBounds(formData: CalculatorFormData, estimate: EstimateResult | null) {
    if (estimate && estimate.total && estimate.total.min > 0) {
        return {
            min: estimate.total.min,
            max: estimate.total.max,
            design: estimate.designCost.min + estimate.gstOnDesign + estimate.supervisionCost + estimate.extraVisitsCost,
            execution: estimate.executionCost.min + estimate.contingency.min + estimate.pmFee.min,
            addons: estimate.addonCost,
            isIndicative: false
        };
    }

    if (!formData.propertyType) {
        return null;
    }

    const area = formData.area || 1000;
    const multipliers: Record<string, number> = { metro: 1.2, tier1: 1.1, tier2: 1.0 };
    const m = multipliers[formData.cityTier] || 1.0;

    let baseMinRate = 1200;
    let baseMaxRate = 2500;

    switch (formData.propertyType) {
        case "apartment":
        case "independent_floor":
            baseMinRate = 1200;
            baseMaxRate = 2500;
            break;
        case "villa":
            baseMinRate = 1800;
            baseMaxRate = 4000;
            break;
        case "office":
            baseMinRate = 800;
            baseMaxRate = 1800;
            break;
        case "renovation":
            baseMinRate = 500;
            baseMaxRate = 1500;
            break;
        case "turnkey":
            baseMinRate = 1500;
            baseMaxRate = 3000;
            break;
    }

    const min = area * baseMinRate * m;
    const max = area * baseMaxRate * m;

    let addonCost = 0;
    if (formData.modularKitchen) addonCost += 1500000;
    if (formData.wardrobes > 0) addonCost += formData.wardrobes * 800000;
    if (formData.falseCeiling) addonCost += area * 450;
    if (formData.smartHome) addonCost += 2500000;
    if (formData.customFurniture) addonCost += 5000000;
    if (formData.premiumLighting) addonCost += 1200000;

    const finalMin = min + addonCost;
    const finalMax = max + addonCost;

    return {
        min: finalMin,
        max: finalMax,
        design: min * 0.25,
        execution: min * 0.75,
        addons: addonCost,
        isIndicative: true
    };
}

function calculateConfidence(formData: CalculatorFormData) {
    let score = 0;
    const missing: string[] = [];

    if (formData.propertyType) {
        score += 15;
    } else {
        missing.push("Property Type");
    }

    if (formData.area && formData.area > 200) {
        score += 15;
    } else {
        missing.push("Carpet Area");
    }

    const hasRooms = formData.bedrooms > 0 || formData.livingRooms > 0 || formData.cabins > 0;
    if (hasRooms) {
        score += 15;
    } else {
        missing.push("Room Layout");
    }

    if (formData.city && formData.state) {
        score += 15;
    } else {
        missing.push("City/State");
    }

    if (formData.budgetPreset || formData.budgetAmount > 500000) {
        score += 15;
    } else {
        missing.push("Target Budget");
    }

    if (formData.selectedService) {
        score += 15;
    } else {
        missing.push("Service Tier");
    }

    if (formData.startTiming) {
        score += 10;
    } else {
        missing.push("Timeline");
    }

    return { score, missing };
}

function getProjectHealth(formData: CalculatorFormData, costBounds: ReturnType<typeof getActiveCostBounds>) {
    if (!costBounds) {
        return {
            status: "Pending",
            score: 0,
            label: "Awaiting inputs",
            desc: "Provide property and budget details to evaluate project health.",
            budgetHealth: "vague" as const,
            timelineHealth: "vague" as const,
            scopeHealth: "vague" as const
        };
    }

    const budget = formData.budgetAmount;
    const { min, max } = costBounds;

    let budgetHealth: "optimal" | "viable" | "stretched" | "deficit" = "deficit";
    let label = "Deficit";
    let desc = "Bespoke additions or property size exceeds the specified budget allocation.";
    let score = 25;

    if (budget >= max * 1.1) {
        budgetHealth = "optimal";
        label = "Optimal";
        desc = "Your budget is highly aligned and supports premium scope extensions.";
        score = 95;
    } else if (budget >= min && budget < max * 1.1) {
        budgetHealth = "viable";
        label = "Viable";
        desc = "Your budget is healthy and covers the estimated cost range comfortably.";
        score = 80;
    } else if (budget >= min * 0.7 && budget < min) {
        budgetHealth = "stretched";
        label = "Stretched";
        desc = "Tight margin. Selections may need to be value-engineered to fit.";
        score = 50;
    }

    let timelineHealth: "optimal" | "warning" | "vague" = "optimal";
    if (formData.startTiming === "Immediate") {
        const isComplex = formData.selectedService === "C5" || formData.area > 4000 || formData.modularKitchen;
        if (isComplex) {
            timelineHealth = "warning";
        }
    } else if (!formData.startTiming) {
        timelineHealth = "vague";
    }

    const scopeHealth = formData.selectedService ? "defined" : "vague";

    return {
        status: label,
        score,
        label,
        desc,
        budgetHealth,
        timelineHealth,
        scopeHealth: scopeHealth as "defined" | "vague"
    };
}

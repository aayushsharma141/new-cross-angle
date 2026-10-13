import { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { icons } from "@/design-system/tokens/icons";
import { Save, RotateCcw, Loader2, MapPin, Paintbrush, HardHat, Plug, BrainCircuit, Target } from "lucide-react";
import { AdminFormCard, AdminSafeAction } from "@/components/admin/shared";
import type { PricingConfig } from "@/addons/calculators/components/data/types";
import { DEFAULT_PRICING_CONFIG } from "@/addons/calculators/components/data/pricing-config";
import type { useEstimatorRegistry } from "@/lib/registry/EstimatorRegistry";
import { ConfigLoadError } from "./ConfigLoadError";

/** Values that would silently zero out or invert customer quotes if saved. */
export function validatePricing(c: PricingConfig): string[] {
    const errors: string[] = [];
    const bad = (v: unknown) => typeof v !== "number" || !Number.isFinite(v) || v < 0;
    for (const [k, v] of Object.entries(c.design)) if (bad(v)) errors.push(`Design: ${formatLabel(k)} must be 0 or more`);
    for (const [k, v] of Object.entries(c.addons ?? {})) if (bad(v)) errors.push(`Add-on: ${formatLabel(k)} must be 0 or more`);
    for (const [k, v] of Object.entries(c.scoring_weights)) if (bad(v)) errors.push(`Scoring: ${formatLabel(k)} must be 0 or more`);
    for (const [k, v] of Object.entries(c.city_multipliers)) {
        if (bad(v) || v <= 0 || v > 5) errors.push(`City multiplier "${k}" must be above 0 and at most 5`);
    }
    for (const [k, r] of Object.entries(c.execution)) {
        if (bad(r.min) || bad(r.max) || r.min <= 0) errors.push(`${formatLabel(k)} package: rates must be above 0`);
        else if (r.max < r.min) errors.push(`${formatLabel(k)} package: max rate is below min rate`);
    }
    for (const [k, v] of Object.entries(c.logic)) {
        if (bad(v) || v > 100) errors.push(`${formatLabel(k)} must be between 0 and 100`);
    }
    return errors;
}

const formatLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface Props {
  registry: ReturnType<typeof useEstimatorRegistry>;
}

export default function PricingIntelligenceWorkspace({ registry }: Props) {
    const { data: currentConfig, save, isSaving, loadFailed, retry } = registry.pricingRates;
    
    // Local state for editing
    const [config, setConfig] = useState<PricingConfig>(currentConfig || DEFAULT_PRICING_CONFIG);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync with registry on load
    useEffect(() => {
        if (currentConfig) {
            setConfig(currentConfig);
            setHasChanges(false);
        }
    }, [currentConfig]);

    // Helper to update nested config
    const updateConfig = (path: string[], value: number): void => {
        setConfig((prev) => {
            const next = JSON.parse(JSON.stringify(prev)) as PricingConfig;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let obj: any = next;
            for (let i = 0; i < path.length - 1; i++) {
                if (!obj[path[i]]) obj[path[i]] = {};
                obj = obj[path[i]];
            }
            obj[path[path.length - 1]] = value;
            return next;
        });
        setHasChanges(true);
    };

    const handleReset = async () => {
        setConfig(currentConfig || DEFAULT_PRICING_CONFIG);
        setHasChanges(false);
    };

    const errors = useMemo(() => validatePricing(config), [config]);

    const handleSave = async () => {
        if (errors.length > 0) return;
        try {
            await save(config);
            setHasChanges(false);
        } catch {
            // useFlowConfig's onError already shows the failure toast; edits stay unsaved.
        }
    };

    if (loadFailed) return <ConfigLoadError what="pricing" onRetry={retry} />;

    return (
        <div className="flex flex-col space-y-6 pb-20">
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up-1 { animation: fadeUp 0.3s ease-out both; }
                .fade-up-2 { animation: fadeUp 0.3s 0.1s ease-out both; }
            `}</style>
            
            <div className="fade-up-1 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[hsl(var(--admin-text))]">Pricing Intelligence</h2>
                  <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">Configure baseline rates, multipliers, and regional coefficients.</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <AdminSafeAction
                            icon={RotateCcw}
                            label="Discard"
                            confirmLabel="Discard unsaved?"
                            onConfirm={handleReset}
                            danger={true}
                        />
                    )}
                    <Button
                        onClick={() => void handleSave()}
                        disabled={!hasChanges || isSaving || errors.length > 0}
                        className="bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-primary))]/90 h-9"
                    >
                        {isSaving ? (
                            <Loader2 className={`${icons.sm} mr-2 animate-spin`} />
                        ) : (
                            <Save className={`${icons.sm} mr-2`} />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {errors.length > 0 && (
                <div role="alert" className="rounded-lg border border-[hsl(var(--admin-danger))]/30 bg-[hsl(var(--admin-danger))]/5 px-4 py-3 text-xs text-[hsl(var(--admin-text))]">
                    <p className="font-semibold mb-1">Fix these before saving — they would change every customer quote:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[hsl(var(--admin-text-muted))]">
                        {errors.map((e) => <li key={e}>{e}</li>)}
                    </ul>
                </div>
            )}

            <div className="space-y-4 fade-up-2">
                <AdminFormCard title="Design Rates" icon={Paintbrush} iconClassName="text-purple-400">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                        {Object.entries(config.design).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))] truncate">{formatLabel(key)}</span>
                                <Input type="number" min={0} value={val} onChange={(e) => updateConfig(["design", key], parseFloat(e.target.value) || 0)} className="h-8 w-24 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                            </div>
                        ))}
                    </div>
                </AdminFormCard>

                <AdminFormCard title="Execution Tiers (₹/sqft)" icon={HardHat} iconClassName="text-amber-400">
                    {(Object.keys(config.execution) as Array<keyof typeof config.execution>).map((tierKey) => {
                        const tier = config.execution[tierKey];
                        return (
                            <div key={tierKey} className="flex items-center gap-3 py-2 border-b border-[hsl(var(--admin-border))]/30 last:border-0">
                                <span className="text-[11px] font-medium text-[hsl(var(--admin-text))] capitalize w-24 shrink-0">{formatLabel(tierKey)}</span>
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">Min</span>
                                    <Input type="number" min={0} value={tier.min} onChange={(e) => updateConfig(["execution", tierKey, "min"], parseInt(e.target.value) || 0)} className="h-8 w-24 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                    <span className="text-[10px] text-[hsl(var(--admin-text-muted))] ml-2">Max</span>
                                    <Input type="number" min={0} value={tier.max} onChange={(e) => updateConfig(["execution", tierKey, "max"], parseInt(e.target.value) || 0)} className="h-8 w-24 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                </div>
                            </div>
                        );
                    })}
                </AdminFormCard>

                <AdminFormCard title="Add-on Costs (₹)" icon={Plug} iconClassName="text-pink-400">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                        {config.addons && Object.entries(config.addons).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))] truncate">{formatLabel(key)}</span>
                                <Input type="number" min={0} value={val} onChange={(e) => updateConfig(["addons", key], parseInt(e.target.value) || 0)} className="h-8 w-24 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                            </div>
                        ))}
                    </div>
                </AdminFormCard>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <AdminFormCard title="City Multipliers" icon={MapPin} iconClassName="text-blue-400">
                        <div className="space-y-3">
                        {Object.entries(config.city_multipliers).map(([city, multiplier]) => (
                            <div key={city} className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))] capitalize">{city}</span>
                                <Input type="number" min={0} step="0.01" value={multiplier} onChange={(e) => updateConfig(["city_multipliers", city], parseFloat(e.target.value) || 0)} className="h-8 w-20 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                            </div>
                        ))}
                        </div>
                    </AdminFormCard>

                    <AdminFormCard title="Logic Factors" icon={BrainCircuit} iconClassName="text-green-400">
                        <div className="space-y-3">
                        {Object.entries(config.logic).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))]">{formatLabel(key)}</span>
                                <Input type="number" min={0} step="0.01" value={val} onChange={(e) => updateConfig(["logic", key], parseFloat(e.target.value) || 0)} className="h-8 w-20 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                            </div>
                        ))}
                        </div>
                    </AdminFormCard>

                    <AdminFormCard title="Scoring Weights" icon={Target} iconClassName="text-indigo-400">
                        <div className="space-y-3">
                        {Object.entries(config.scoring_weights).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))]">{formatLabel(key)}</span>
                                <Input type="number" min={0} value={val} onChange={(e) => updateConfig(["scoring_weights", key], parseInt(e.target.value) || 0)} className="h-8 w-16 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                            </div>
                        ))}
                        </div>
                    </AdminFormCard>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Separator } from "@/components/ui/primitives/separator";
import { icons } from "@/design-system/tokens/icons";
import { Save, RotateCcw, Loader2, Clock, MapPin, Paintbrush, HardHat, Eye, Plug, BrainCircuit, Target } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { PricingConfig } from "@/addons/calculators/components/data/types";
import { DEFAULT_PRICING_CONFIG } from "@/addons/calculators/components/data/pricing-config";
import { calculateEstimate } from "@/addons/calculators/components/data/calculation-engine";
import type { CalculatorFormData } from "@/addons/calculators/components/data/types";
import { AdminFormCard, AdminSafeAction } from "@/components/admin/shared";

const formatLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function AdminEstimateRates() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch current config
    const { data: rateData, isLoading } = useQuery<{ id?: string; config: PricingConfig; updated_at?: string } | null>({
        queryKey: ["estimate-rates"],
        queryFn: async (): Promise<{ id?: string; config: PricingConfig; updated_at?: string } | null> => {
            const { data, error } = await supabase
                .from("estimate_rates")
                .select("*")
                .order("updated_at", { ascending: false })
                .limit(1)
                .single();

            if (error) {
                // If no row exists, we might want to return null or defaults
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return data as unknown as { id?: string; config: PricingConfig; updated_at?: string };
        },
    });

    useEffect(() => {
        if (rateData?.config) {
            const loadedConfig = rateData.config;
            const merged = { ...DEFAULT_PRICING_CONFIG, ...loadedConfig };
            setConfig(merged);
            setHasChanges(false);
        }
    }, [rateData]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (): Promise<void> => {
            // Upsert mechanism: if id exists update, else insert
            const payload = {
                config: config as unknown as Record<string, unknown>,
                updated_at: new Date().toISOString(),
            };

            if (rateData?.id) {
                const { error } = await supabase
                    .from("estimate_rates")
                    .update(payload)
                    .eq("id", rateData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("estimate_rates")
                    .insert([payload]);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["estimate-rates"] });
            setHasChanges(false);
            toast({ title: "Rates Updated", description: "Pricing configuration saved successfully." });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        },
    });

    // Helper to update nested config
    const updateConfig = (path: string[], value: number): void => {
        setConfig((prev) => {
            const next = JSON.parse(JSON.stringify(prev)) as PricingConfig;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let obj: any = next;
            for (let i = 0; i < path.length - 1; i++) {
                if (!obj[path[i]]) obj[path[i]] = {}; // Safety init
                obj = obj[path[i]];
            }
            obj[path[path.length - 1]] = value;
            return next;
        });
        setHasChanges(true);
    };

    const handleReset = async (): Promise<void> => {
        if (rateData?.config) {
            const loadedConfig = rateData.config;
            setConfig({ ...DEFAULT_PRICING_CONFIG, ...loadedConfig });
        } else {
            setConfig(DEFAULT_PRICING_CONFIG);
        }
        setHasChanges(false);
    };

    // Live Preview using calculation engine
    const sampleEstimate = (() => {
        const dummyData: CalculatorFormData = {
            area: 1500,
            city: "Metro",
            propertyType: "apartment",
            bhk: "3 BHK",
            stage: "new_build",
            floors: 1,
            floorNumber: null,
            livingRooms: 1,
            bedrooms: 3,
            bathrooms: 3,
            toilets: 1,
            kitchen: 1,
            balconies: 2,
            renovationScope: null,
            renovationRooms: [],
            renovationPropertyType: null,
            selectedService: "C5",
            executionTier: "standard",
            projectMonths: 6,
            startTiming: "1-3 Months",
            extraVisits: 5,

            budgetAmount: 3000000,
            budgetPreset: "Premium",
            name: "Preview User",
            email: "preview@example.com",
            phone: "9999999999",
            modularKitchen: true,
            wardrobes: 2,
            falseCeiling: false,
            smartHome: false,
            customFurniture: false,
            premiumLighting: false,
        } as unknown as CalculatorFormData;
        // Just use the engine!
        return calculateEstimate(dummyData, config);
    })();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className={`${icons.xl} animate-spin text-primary`} />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 pb-20">
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
                .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
                .fade-up-3 { animation: fadeUp var(--anim-duration) var(--anim-stagger-3) var(--anim-ease) both; }
            `}</style>

            
            <div className="fade-up-1">
                <ModuleActions>
                    <div className="flex items-center gap-2">
                        {rateData?.updated_at && (
                            <span className="text-xs text-[hsl(var(--admin-text-muted))] flex items-center gap-1 bg-[hsl(var(--admin-card))] px-2 py-1 rounded-md border border-[hsl(var(--admin-border))]">
                                <Clock className={icons.xs} />
                                Updated {new Date(rateData.updated_at).toLocaleDateString("en-IN")}
                            </span>
                        )}
                        {hasChanges && (
                            <AdminSafeAction
                                icon={RotateCcw}
                                label="Reset"
                                confirmLabel="Discard unsaved?"
                                onConfirm={handleReset}
                                danger={true}
                            />
                        )}
                        <Button
                            onClick={() => saveMutation.mutate()}
                            disabled={!hasChanges || saveMutation.isPending}
                            className="bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-primary))]/90 h-9"
                        >
                            {saveMutation.isPending ? (
                                <Loader2 className={`${icons.sm} mr-2 animate-spin`} />
                            ) : (
                                <Save className={`${icons.sm} mr-2`} />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </ModuleActions>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-5 fade-up-2">
                {/* Config Forms */}
                <div className="space-y-4">

                    {/* Design Rates */}
                    <AdminFormCard title="Design Rates" icon={Paintbrush} iconClassName="text-purple-400">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                            {Object.entries(config.design).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-[hsl(var(--admin-text-muted))] truncate">{formatLabel(key)}</span>
                                    <Input type="number" value={val} onChange={(e) => updateConfig(["design", key], parseFloat(e.target.value) || 0)} className="h-7 w-24 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                </div>
                            ))}
                        </div>
                    </AdminFormCard>

                    {/* Execution Rates */}
                    <AdminFormCard title="Execution Tiers (₹/sqft)" icon={HardHat} iconClassName="text-amber-400">
                        {(Object.keys(config.execution) as Array<keyof typeof config.execution>).map((tierKey) => {
                            const tier = config.execution[tierKey];
                            return (
                                <div key={tierKey} className="flex items-center gap-3 py-1.5 border-b border-[hsl(var(--admin-border))]/30 last:border-0">
                                    <span className="text-[11px] font-medium text-[hsl(var(--admin-text))] capitalize w-20 shrink-0">{formatLabel(tierKey)}</span>
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">Min</span>
                                        <Input type="number" value={tier.min} onChange={(e) => updateConfig(["execution", tierKey, "min"], parseInt(e.target.value) || 0)} className="h-7 w-24 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                        <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">Max</span>
                                        <Input type="number" value={tier.max} onChange={(e) => updateConfig(["execution", tierKey, "max"], parseInt(e.target.value) || 0)} className="h-7 w-24 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                    </div>
                                </div>
                            );
                        })}
                    </AdminFormCard>

                    {/* Add-ons */}
                    <AdminFormCard title="Add-on Costs (₹)" icon={Plug} iconClassName="text-pink-400">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                            {config.addons && Object.entries(config.addons).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-[hsl(var(--admin-text-muted))] truncate">{formatLabel(key)}</span>
                                    <Input type="number" value={val} onChange={(e) => updateConfig(["addons", key], parseInt(e.target.value) || 0)} className="h-7 w-24 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                </div>
                            ))}
                        </div>
                    </AdminFormCard>

                    {/* City Multipliers, Logic, Scoring */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <AdminFormCard title="City Multipliers" icon={MapPin} iconClassName="text-blue-400">
                            <div className="space-y-2">
                            {Object.entries(config.city_multipliers).map(([city, multiplier]) => (
                                <div key={city} className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-[hsl(var(--admin-text-muted))] capitalize">{city}</span>
                                    <Input type="number" step="0.01" value={multiplier} onChange={(e) => updateConfig(["city_multipliers", city], parseFloat(e.target.value) || 0)} className="h-7 w-20 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                </div>
                            ))}
                            </div>
                        </AdminFormCard>

                        <AdminFormCard title="Logic Factors" icon={BrainCircuit} iconClassName="text-green-400">
                            <div className="space-y-2">
                            {Object.entries(config.logic).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-[hsl(var(--admin-text-muted))]">{formatLabel(key)}</span>
                                    <Input type="number" step="0.01" value={val} onChange={(e) => updateConfig(["logic", key], parseFloat(e.target.value) || 0)} className="h-7 w-20 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                </div>
                            ))}
                            </div>
                        </AdminFormCard>

                        <AdminFormCard title="Scoring Weights" icon={Target} iconClassName="text-indigo-400">
                            <div className="space-y-2">
                            {Object.entries(config.scoring_weights).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-[hsl(var(--admin-text-muted))]">{formatLabel(key)}</span>
                                    <Input type="number" value={val} onChange={(e) => updateConfig(["scoring_weights", key], parseInt(e.target.value) || 0)} className="h-7 w-16 text-xs text-right bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
                                </div>
                            ))}
                            </div>
                        </AdminFormCard>
                    </div>

                </div>

                {/* Live Preview Panel */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <div className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-emerald-400" />
                            <div>
                                <h3 className="text-sm font-bold text-[hsl(var(--admin-text))]">Live Preview</h3>
                                <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">1500 sqft • Metro • Standard</p>
                            </div>
                        </div>

                        <Separator className="bg-[hsl(var(--admin-border))]" />

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--admin-text-muted))]">Design Fee</span>
                                <span className="font-medium text-[hsl(var(--admin-text))]">{formatCurrency(sampleEstimate.designCost.min)} – {formatCurrency(sampleEstimate.designCost.max)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--admin-text-muted))]">Execution</span>
                                <span className="font-medium text-[hsl(var(--admin-text))]">{formatCurrency(sampleEstimate.executionCost.min)} – {formatCurrency(sampleEstimate.executionCost.max)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[hsl(var(--admin-text-muted))]">Add-ons</span>
                                <span className="font-medium text-[hsl(var(--admin-text))]">{formatCurrency(sampleEstimate.addonCost)}</span>
                            </div>
                            <div className="text-[10px] text-[hsl(var(--admin-text-muted))]">Incl. GST ({config.logic.gst_pct}%)</div>
                        </div>

                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Total Estimate</p>
                            <p className="text-lg font-bold text-emerald-300 mt-1">{formatCurrency(sampleEstimate.total.min)} – {formatCurrency(sampleEstimate.total.max)}</p>
                        </div>

                        {hasChanges && (
                            <p className="text-[10px] text-amber-500 text-center animate-pulse">⚠️ Unsaved changes</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

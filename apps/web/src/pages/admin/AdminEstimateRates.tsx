import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { icons } from "@/design-system/tokens/icons";
import { Save, RotateCcw, Loader2, Clock, IndianRupee, MapPin, Paintbrush, HardHat, Eye, Plug, BrainCircuit, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PricingConfig } from "@/addons/calculators/components/data/types";
import { DEFAULT_PRICING_CONFIG } from "@/addons/calculators/components/data/pricing-config";
import { calculateEstimate } from "@/addons/calculators/components/data/calculation-engine";
import type { CalculatorFormData } from "@/addons/calculators/components/data/types";

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

    const handleReset = (): void => {
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
        <div className="flex flex-col space-y-6 animate-in fade-in duration-500 pb-20">
            <AdminBreadcrumb items={[{ label: 'Rate Config' }]} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">
                        Rate Configuration
                    </h2>
                    <p className="text-[hsl(var(--admin-muted))]">
                        Manage pricing rates used by the cost estimator.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {rateData?.updated_at && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                            <Clock className={icons.xs} />
                            Updated {new Date(rateData.updated_at).toLocaleDateString("en-IN")}
                        </span>
                    )}
                    <Button variant="outline" onClick={handleReset} disabled={!hasChanges} className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    <Button
                        onClick={() => saveMutation.mutate()}
                        disabled={!hasChanges || saveMutation.isPending}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 border-0"
                    >
                        {saveMutation.isPending ? (
                            <Loader2 className={`${icons.sm} mr-2 animate-spin`} />
                        ) : (
                            <Save className={`${icons.sm} mr-2`} />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                {/* Config Forms */}
                <div className="space-y-8">

                    {/* Design Rates */}
                    <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-2xl transition-all duration-300 hover:shadow-purple-500/10 hover:border-white/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                                <Paintbrush className={icons.md} />
                            </div>
                            <div>
                                <h3 className="font-display font-semibold text-lg text-[hsl(var(--admin-foreground))]">Design Rates</h3>
                                <p className="text-xs text-[hsl(var(--admin-muted))]">Consultancy, 2D/3D rates, and supervision</p>
                            </div>
                        </div>
                        <div className="relative z-10 grid grid-cols-2 gap-5">
                            {Object.entries(config.design).map(([key, val]) => (
                                <div key={key}>
                                    <Label className="text-sm text-slate-300">{formatLabel(key)}</Label>
                                    <Input
                                        type="number"
                                        value={val}
                                        onChange={(e) => updateConfig(["design", key], parseFloat(e.target.value) || 0)}
                                        className="mt-1 bg-black/20 border-white/10 text-white focus-visible:ring-purple-500/50"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Execution Rates */}
                    <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-2xl transition-all duration-300 hover:shadow-amber-500/10 hover:border-white/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20">
                                <HardHat className={icons.md} />
                            </div>
                            <div>
                                <h3 className="font-display font-semibold text-lg text-[hsl(var(--admin-foreground))]">Execution Tiers</h3>
                                <p className="text-xs text-[hsl(var(--admin-muted))]">Budget-based execution rate bands (₹/sq ft)</p>
                            </div>
                        </div>
                        <div className="relative z-10 space-y-5">
                            {(Object.keys(config.execution) as Array<keyof typeof config.execution>).map((tierKey) => {
                                const tier = config.execution[tierKey];
                                return (
                                    <div key={tierKey} className="grid grid-cols-3 gap-4 items-end rounded-xl border border-white/5 bg-black/20 p-5 transition-all hover:bg-black/40 hover:border-white/10 group/tier">
                                        <div className="col-span-3 lg:col-span-1">
                                            <Label className="text-xs font-bold uppercase text-amber-500/70 mb-1 block group-hover/tier:text-amber-400 transition-colors">Tier Name</Label>
                                            <p className="font-medium text-sm text-slate-200">{formatLabel(tierKey)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-400">Min Rate (₹)</Label>
                                            <Input
                                                type="number"
                                                value={tier.min}
                                                onChange={(e) => updateConfig(["execution", tierKey, "min"], parseInt(e.target.value) || 0)}
                                                className="mt-1 bg-white/5 border-white/10 text-white focus-visible:ring-amber-500/50"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-400">Max Rate (₹)</Label>
                                            <Input
                                                type="number"
                                                value={tier.max}
                                                onChange={(e) => updateConfig(["execution", tierKey, "max"], parseInt(e.target.value) || 0)}
                                                className="mt-1 bg-white/5 border-white/10 text-white focus-visible:ring-amber-500/50"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Add-ons */}
                    <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-2xl transition-all duration-300 hover:shadow-pink-500/10 hover:border-white/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/20">
                                <Plug className={icons.md} />
                            </div>
                            <div>
                                <h3 className="font-display font-semibold text-lg text-[hsl(var(--admin-foreground))]">Add-on Costs</h3>
                                <p className="text-xs text-[hsl(var(--admin-muted))]">Flat rates for additional modules</p>
                            </div>
                        </div>
                        <div className="relative z-10 grid grid-cols-2 gap-5">
                            {config.addons && Object.entries(config.addons).map(([key, val]) => (
                                <div key={key}>
                                    <Label className="text-sm text-slate-300">{formatLabel(key)}</Label>
                                    <Input
                                        type="number"
                                        value={val}
                                        onChange={(e) => updateConfig(["addons", key], parseInt(e.target.value) || 0)}
                                        className="mt-1 bg-black/20 border-white/10 text-white focus-visible:ring-pink-500/50"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* City Multipliers & Logic */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-2xl transition-all duration-300 hover:shadow-blue-500/10 hover:border-white/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
                                    <MapPin className={icons.md} />
                                </div>
                                <div>
                                    <h3 className="font-display font-semibold text-lg text-[hsl(var(--admin-foreground))]">City Multipliers</h3>
                                    <p className="text-xs text-[hsl(var(--admin-muted))]">Regional price factors</p>
                                </div>
                            </div>
                            <div className="relative z-10 space-y-5">
                                {Object.entries(config.city_multipliers).map(([city, multiplier]) => (
                                    <div key={city}>
                                        <Label className="text-sm text-slate-300">{formatLabel(city)}</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={multiplier}
                                            onChange={(e) =>
                                                updateConfig(["city_multipliers", city], parseFloat(e.target.value) || 0)
                                            }
                                            className="mt-1 bg-black/20 border-white/10 text-white focus-visible:ring-blue-500/50"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-2xl transition-all duration-300 hover:shadow-green-500/10 hover:border-white/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20">
                                    <BrainCircuit className={icons.md} />
                                </div>
                                <div>
                                    <h3 className="font-display font-semibold text-lg text-[hsl(var(--admin-foreground))]">Logic Factors</h3>
                                    <p className="text-xs text-[hsl(var(--admin-muted))]">Contingency, GST, PM fees</p>
                                </div>
                            </div>
                            <div className="relative z-10 space-y-5">
                                {Object.entries(config.logic).map(([key, val]) => (
                                    <div key={key}>
                                        <Label className="text-sm text-slate-300">{formatLabel(key)}</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={val}
                                            onChange={(e) => updateConfig(["logic", key], parseFloat(e.target.value) || 0)}
                                            className="mt-1 bg-black/20 border-white/10 text-white focus-visible:ring-green-500/50"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/10 hover:border-white/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                                    <Target className={icons.md} />
                                </div>
                                <div>
                                    <h3 className="font-display font-semibold text-lg text-[hsl(var(--admin-foreground))]">Lead Scoring</h3>
                                    <p className="text-xs text-[hsl(var(--admin-muted))]">Category weights (Total 100)</p>
                                </div>
                            </div>
                            <div className="relative z-10 space-y-5">
                                {Object.entries(config.scoring_weights).map(([key, val]) => (
                                    <div key={key}>
                                        <Label className="text-sm text-slate-300">{formatLabel(key)}</Label>
                                        <Input
                                            type="number"
                                            value={val}
                                            onChange={(e) => updateConfig(["scoring_weights", key], parseInt(e.target.value) || 0)}
                                            className="mt-1 bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500/50"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                </div>

                {/* Live Preview Panel */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-2xl relative overflow-hidden group transition-all hover:border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                                <Eye className={icons.md} />
                            </div>
                            <div>
                                <h3 className="font-display font-semibold text-lg text-[hsl(var(--admin-foreground))]">Live Preview</h3>
                                <p className="text-xs text-[hsl(var(--admin-muted))]">Sample: 1500 sqft, Metro, Turnkey, 3D, Modular Kitchen</p>
                            </div>
                        </div>

                        <Separator className="relative z-10 bg-white/10" />

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Design Fee</span>
                                <span className="font-medium text-slate-200">
                                    {formatCurrency(sampleEstimate.designCost.min)} - {formatCurrency(sampleEstimate.designCost.max)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Execution</span>
                                <span className="font-medium text-slate-200">
                                    {formatCurrency(sampleEstimate.executionCost.min)} - {formatCurrency(sampleEstimate.executionCost.max)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Add-ons</span>
                                <span className="font-medium text-slate-200">{formatCurrency(sampleEstimate.addonCost)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 pt-1">
                                <span>Includes GST ({config.logic.gst_pct}%) on Design</span>
                            </div>

                            <Separator className="relative z-10 bg-white/10" />

                            <div className="relative z-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 p-5 text-center space-y-1 shadow-inner">
                                <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">Total Estimate</p>
                                <p className="text-xl font-display font-bold text-emerald-50">
                                    {formatCurrency(sampleEstimate.total.min)} – {formatCurrency(sampleEstimate.total.max)}
                                </p>
                            </div>
                        </div>

                        {hasChanges && (
                            <p className="text-xs text-amber-500 text-center animate-pulse">
                                ⚠️ Unsaved changes
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

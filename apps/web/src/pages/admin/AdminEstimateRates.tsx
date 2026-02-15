import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Save, RotateCcw, Loader2, Clock, IndianRupee, MapPin, Paintbrush, HardHat, Eye, Plug, BrainCircuit, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PricingConfig } from "@/components/calculators/data/types";
import { DEFAULT_PRICING_CONFIG } from "@/components/calculators/data/pricing-config";
import { calculateEstimate } from "@/components/calculators/data/calculation-engine";
import type { CalculatorFormData } from "@/components/calculators/data/types";

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
    const { data: rateData, isLoading } = useQuery({
        queryKey: ["estimate-rates"],
        queryFn: async () => {
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
            return data;
        },
    });

    useEffect(() => {
        if (rateData?.config) {
            // Merge with default to ensure new fields are present if old config is loaded
            // But types are strict, so we might need to cast or carefully merge
            // For now, assume config structure updates are manual or we overwrite with default if structure is broken
            // A deep merge would be better, but let's trust the type for now or fallback
            const loadedConfig = rateData.config as unknown as PricingConfig;
            // Ensure all top-level keys exist (basic migration)
            const merged = { ...DEFAULT_PRICING_CONFIG, ...loadedConfig };
            // Ensure sub-objects exist too if needed, but simplistic merge for now
            setConfig(merged);
            setHasChanges(false);
        }
    }, [rateData]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            // Upsert mechanism: if id exists update, else insert
            const payload = {
                config: config as unknown,
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
            queryClient.invalidateQueries({ queryKey: ["estimate-rates"] });
            setHasChanges(false);
            toast({ title: "Rates Updated", description: "Pricing configuration saved successfully." });
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        },
    });

    // Helper to update nested config
    const updateConfig = (path: string[], value: number) => {
        setConfig((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            let obj = next;
            for (let i = 0; i < path.length - 1; i++) {
                if (!obj[path[i]]) obj[path[i]] = {}; // Safety init
                obj = obj[path[i]];
            }
            obj[path[path.length - 1]] = value;
            return next;
        });
        setHasChanges(true);
    };

    const handleReset = () => {
        if (rateData?.config) {
            const loadedConfig = rateData.config as unknown as PricingConfig;
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
            propertyType: "Apartment",
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

            budget: 3000000,
            timeline: "1-3 Months",
            scope: "Full Home",
            scopes: ["Turnkey Execution", "3D Design"], // Approximation
            designPackage: "standard_3d",
            roomRequirements: [],
            name: "Preview User",
            email: "preview@example.com",
            phone: "9999999999",
            modularKitchen: true,
            wardrobes: 2,
            falseCeiling: false,
            smartHome: false,
            customFurniture: false,
            premiumLighting: false,
            siteVisits: 8,
        };
        // Just use the engine!
        return calculateEstimate(dummyData, config);
    })();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-500 pb-20">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Rate Config</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

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
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {new Date(rateData.updated_at).toLocaleDateString("en-IN")}
                        </span>
                    )}
                    <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    <Button
                        onClick={() => saveMutation.mutate()}
                        disabled={!hasChanges || saveMutation.isPending}
                    >
                        {saveMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                {/* Config Forms */}
                <div className="space-y-8">

                    {/* Design Rates */}
                    <section className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <Paintbrush className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Design Rates</h3>
                                <p className="text-xs text-muted-foreground">Consultancy, 2D/3D rates, and supervision</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(config.design).map(([key, val]) => (
                                <div key={key}>
                                    <Label className="text-sm">{formatLabel(key)}</Label>
                                    <Input
                                        type="number"
                                        value={val}
                                        onChange={(e) => updateConfig(["design", key], parseFloat(e.target.value) || 0)}
                                        className="mt-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Execution Rates */}
                    <section className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                                <HardHat className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Execution Tiers</h3>
                                <p className="text-xs text-muted-foreground">Budget-based execution rate bands (₹/sq ft)</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {(Object.keys(config.execution) as Array<keyof typeof config.execution>).map((tierKey) => {
                                const tier = config.execution[tierKey];
                                return (
                                    <div key={tierKey} className="grid grid-cols-3 gap-3 items-end rounded-lg border p-4 bg-muted/20">
                                        <div className="col-span-3 lg:col-span-1">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Tier Name</Label>
                                            <p className="font-medium text-sm">{formatLabel(tierKey)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs">Min Rate (₹)</Label>
                                            <Input
                                                type="number"
                                                value={tier.min}
                                                onChange={(e) => updateConfig(["execution", tierKey, "min"], parseInt(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Max Rate (₹)</Label>
                                            <Input
                                                type="number"
                                                value={tier.max}
                                                onChange={(e) => updateConfig(["execution", tierKey, "max"], parseInt(e.target.value) || 0)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Add-ons */}
                    <section className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                                <Plug className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Add-on Costs</h3>
                                <p className="text-xs text-muted-foreground">Flat rates for additional modules</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {config.addons && Object.entries(config.addons).map(([key, val]) => (
                                <div key={key}>
                                    <Label className="text-sm">{formatLabel(key)}</Label>
                                    <Input
                                        type="number"
                                        value={val}
                                        onChange={(e) => updateConfig(["addons", key], parseInt(e.target.value) || 0)}
                                        className="mt-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* City Multipliers & Logic */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className="rounded-xl border bg-card p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">City Multipliers</h3>
                                    <p className="text-xs text-muted-foreground">Regional price factors</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(config.city_multipliers).map(([city, multiplier]) => (
                                    <div key={city}>
                                        <Label className="text-sm">{formatLabel(city)}</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={multiplier}
                                            onChange={(e) =>
                                                updateConfig(["city_multipliers", city], parseFloat(e.target.value) || 0)
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-xl border bg-card p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                                    <BrainCircuit className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Logic Factors</h3>
                                    <p className="text-xs text-muted-foreground">Contingency, GST, PM fees</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(config.logic).map(([key, val]) => (
                                    <div key={key}>
                                        <Label className="text-sm">{formatLabel(key)}</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={val}
                                            onChange={(e) => updateConfig(["logic", key], parseFloat(e.target.value) || 0)}
                                            className="mt-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-xl border bg-card p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                                    <Target className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Lead Scoring</h3>
                                    <p className="text-xs text-muted-foreground">Category weights (Total 100)</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(config.scoring_weights).map(([key, val]) => (
                                    <div key={key}>
                                        <Label className="text-sm">{formatLabel(key)}</Label>
                                        <Input
                                            type="number"
                                            value={val}
                                            onChange={(e) => updateConfig(["scoring_weights", key], parseInt(e.target.value) || 0)}
                                            className="mt-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                </div>

                {/* Live Preview Panel */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                                <Eye className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Live Preview</h3>
                                <p className="text-xs text-muted-foreground">Sample: 1500 sqft, Metro, Turnkey, 3D, Modular Kitchen</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Design Fee</span>
                                <span className="font-medium">
                                    {formatCurrency(sampleEstimate.designFee.min)} - {formatCurrency(sampleEstimate.designFee.max)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Execution</span>
                                <span className="font-medium">
                                    {formatCurrency(sampleEstimate.executionCost.min)} - {formatCurrency(sampleEstimate.executionCost.max)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Add-ons</span>
                                <span className="font-medium">{formatCurrency(sampleEstimate.addonCost.min)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                <span>Includes GST ({config.logic.gst_pct}%) on Design</span>
                            </div>

                            <Separator />

                            <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/10 p-4 text-center space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Estimate</p>
                                <p className="text-lg font-bold">
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

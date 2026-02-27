import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Activity, ShieldCheck, IndianRupee } from "lucide-react";

interface MaterialParams {
    pricePerSqFt: number;
    wastageFactor: number;
    yearlyMaintenance: number;
    valuePremiumPct: number;
}

const MATERIALS: Record<string, MaterialParams> = {
    "Italian Marble": { pricePerSqFt: 850, wastageFactor: 1.12, yearlyMaintenance: 4000, valuePremiumPct: 18 },
    "Indian Granite": { pricePerSqFt: 280, wastageFactor: 1.10, yearlyMaintenance: 1500, valuePremiumPct: 10 },
    "Vitrified Tiles": { pricePerSqFt: 120, wastageFactor: 1.08, yearlyMaintenance: 500, valuePremiumPct: 5 },
    "Hardwood Flooring": { pricePerSqFt: 450, wastageFactor: 1.15, yearlyMaintenance: 3000, valuePremiumPct: 14 },
    "Engineered Wood": { pricePerSqFt: 220, wastageFactor: 1.10, yearlyMaintenance: 1800, valuePremiumPct: 9 },
    "Luxury Vinyl": { pricePerSqFt: 95, wastageFactor: 1.05, yearlyMaintenance: 600, valuePremiumPct: 4 },
};

export const TactileInvestmentEngine = () => {
    const [area, setArea] = useState<string>("1000");
    const [matA, setMatA] = useState<string>("Italian Marble");
    const [matB, setMatB] = useState<string>("Vitrified Tiles");

    const numArea = Math.max(0, parseInt(area) || 0);

    const calculateParams = (materialKey: string) => {
        const mat = MATERIALS[materialKey];
        if (!mat) return null;

        const grossArea = numArea * mat.wastageFactor;
        const initialCost = grossArea * mat.pricePerSqFt;
        const tenYearMaint = mat.yearlyMaintenance * 10;
        const lifecycleTotal = initialCost + tenYearMaint;

        return { grossArea, initialCost, tenYearMaint, lifecycleTotal, premium: mat.valuePremiumPct };
    };

    const resultsA = calculateParams(matA);
    const resultsB = calculateParams(matB);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MaterialColumn = ({ material, label, setMaterial, results }: any) => (
        <div className="flex flex-col gap-6">
            <div className="space-y-4">
                <Label>{label}</Label>
                <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Material" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(MATERIALS).map(key => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {results && (
                <div className="bg-muted/50 rounded-xl p-6 space-y-5 border border-border/50">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Gross Area (w/ Wastage)
                        </span>
                        <span className="font-semibold">{Math.round(results.grossArea)} sqft</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" /> Initial Procurement
                        </span>
                        <span className="font-bold text-foreground">₹{Math.round(results.initialCost).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4" /> 10-Yr Maintenance
                        </span>
                        <span className="font-semibold text-orange-600/80">₹{results.tenYearMaint.toLocaleString()}</span>
                    </div>

                    <div className="h-px w-full bg-border" />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">TCO (10 Years)</span>
                        <span className="text-3xl font-serif font-bold text-primary">₹{Math.round(results.lifecycleTotal).toLocaleString()}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-sm text-primary flex items-center gap-2 font-medium">
                            <ShieldCheck className="w-4 h-4" /> Value Premium
                        </span>
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold">
                            +{results.premium}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle className="text-2xl font-serif">Tactile Investment Engine</CardTitle>
                <CardDescription>
                    Compare total lifecycle cost and value addition of different surface materials.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                <div className="max-w-xs space-y-4">
                    <Label className="text-base font-medium">Surface Area (sq. ft.)</Label>
                    <Input
                        type="number"
                        min="0"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="text-lg font-medium"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <MaterialColumn material={matA} label="Material A" setMaterial={setMatA} results={resultsA} />
                    <MaterialColumn material={matB} label="Material B" setMaterial={setMatB} results={resultsB} />
                </div>

            </CardContent>
        </Card>
    );
};

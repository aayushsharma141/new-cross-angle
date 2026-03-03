import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer, TrendingUp, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const ROOM_MULTIPLIERS: Record<string, number> = {
    "Kitchen": 0.85,
    "Master Bath": 0.75,
    "Living Room": 0.65,
    "Bedroom": 0.50,
};

const NEIGHBORHOOD_APPRECIATION: Record<string, number> = {
    "Premium": 0.08,
    "Mid-tier": 0.05,
    "Developing": 0.03,
};

export const DesignEquityForecaster = () => {
    const [investment, setInvestment] = useState<string>("500000");
    const [roomType, setRoomType] = useState<string>("Kitchen");
    const [neighborhood, setNeighborhood] = useState<string>("Premium");

    const numInvestment = Math.max(0, parseInt(investment) || 0);
    const roiMultiplier = ROOM_MULTIPLIERS[roomType] || 0.85;
    const rate = NEIGHBORHOOD_APPRECIATION[neighborhood] || 0.05;

    const immediateRecovery = numInvestment * roiMultiplier;
    const year5 = numInvestment * Math.pow(1 + rate, 5);
    const year10 = numInvestment * Math.pow(1 + rate, 10);
    const recoverabilityIndex = numInvestment > 0 ? (immediateRecovery / numInvestment) * 100 : 0;

    let badgeColor = "bg-red-100 text-red-800 border-red-200";
    if (recoverabilityIndex > 75) badgeColor = "bg-green-100 text-green-800 border-green-200";
    else if (recoverabilityIndex >= 50) badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-200";

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-primary/10">
            <CardHeader className="flex flex-row justify-between items-start">
                <div className="space-y-1.5">
                    <CardTitle className="text-2xl font-serif flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Design Equity Forecaster
                    </CardTitle>
                    <CardDescription>
                        Calculate the expected return on investment (ROI) and property value appreciation over time.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex gap-2">
                    <Printer className="w-4 h-4" /> Print Report
                </Button>
            </CardHeader>

            <CardContent className="space-y-8">

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Initial Investment (₹)</Label>
                        <Input
                            type="number"
                            min="0"
                            value={investment}
                            onChange={(e) => setInvestment(e.target.value)}
                            className="text-lg font-medium"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base font-medium">Room Type</Label>
                        <Select value={roomType} onValueChange={setRoomType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Room" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(ROOM_MULTIPLIERS).map(room => (
                                    <SelectItem key={room} value={room}>{room}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base font-medium">Neighborhood</Label>
                        <Select value={neighborhood} onValueChange={setNeighborhood}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Area" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(NEIGHBORHOOD_APPRECIATION).map(area => (
                                    <SelectItem key={area} value={area}>{area}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                                Recoverability Index
                            </p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-serif font-bold text-foreground">
                                    {Math.round(recoverabilityIndex)}
                                </span>
                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", badgeColor)}>
                                    Score
                                </span>
                            </div>
                        </div>
                        <div className="w-full md:w-auto p-4 bg-background rounded-xl border shadow-sm">
                            <p className="text-sm text-muted-foreground mb-1">Immediate Added Value</p>
                            <p className="text-2xl font-bold flex items-center text-primary">
                                <IndianRupee className="w-5 h-5 mr-1" />
                                {Math.round(immediateRecovery).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-border/60">
                                    <th className="pb-3 font-semibold text-muted-foreground">Timeline</th>
                                    <th className="pb-3 font-semibold text-muted-foreground">Appreciation Rate</th>
                                    <th className="pb-3 font-semibold text-muted-foreground text-right">Projected Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-border/40">
                                    <td className="py-4 font-medium">Today (Year 0)</td>
                                    <td className="py-4 text-muted-foreground">—</td>
                                    <td className="py-4 text-right font-bold text-foreground">
                                        ₹{numInvestment.toLocaleString()}
                                    </td>
                                </tr>
                                <tr className="border-b border-border/40">
                                    <td className="py-4 font-medium">Year 5</td>
                                    <td className="py-4 text-muted-foreground">{(rate * 100).toFixed(1)}% / yr</td>
                                    <td className="py-4 text-right font-bold text-primary">
                                        ₹{Math.round(year5).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 font-medium">Year 10</td>
                                    <td className="py-4 text-muted-foreground">{(rate * 100).toFixed(1)}% / yr</td>
                                    <td className="py-4 text-right font-bold text-primary">
                                        ₹{Math.round(year10).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <Button variant="outline" className="w-full sm:hidden" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" /> Print Report
                </Button>

            </CardContent>
        </Card>
    );
};

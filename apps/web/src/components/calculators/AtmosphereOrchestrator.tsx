import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Zap, IndianRupee, Sun, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const MOODS = [
    { id: "Warm", icon: Sun, color: "text-orange-500 hover:text-orange-600 border-orange-200", bg: "bg-orange-500/10" },
    { id: "Neutral", icon: Lightbulb, color: "text-yellow-500 hover:text-yellow-600 border-yellow-200", bg: "bg-yellow-500/10" },
    { id: "Cool", icon: Sparkles, color: "text-blue-500 hover:text-blue-600 border-blue-200", bg: "bg-blue-500/10" },
    { id: "Dramatic", icon: Zap, color: "text-purple-500 hover:text-purple-600 border-purple-200", bg: "bg-purple-500/10" },
] as const;

const MOOD_MULTIPLIERS: Record<string, number> = {
    Warm: 1.2,
    Neutral: 1.0,
    Cool: 0.9,
    Dramatic: 1.5,
};

type Mood = keyof typeof MOOD_MULTIPLIERS;

export const AtmosphereOrchestrator = () => {
    const [mood, setMood] = useState<Mood>("Neutral");
    const [intensity, setIntensity] = useState([50]);
    const [area, setArea] = useState<string>("500");

    const numArea = parseInt(area) || 0;
    const lux = intensity[0] * MOOD_MULTIPLIERS[mood] * (Math.max(0, numArea) / 10);
    const wattage = Math.ceil(lux / 50) * 40;
    const monthlyCostINR = ((wattage * 8 * 30) / 1000) * 8; // 8 hours/day, 30 days, ₹8/kWh

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle className="text-2xl font-serif flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-primary" />
                    Atmosphere Orchestrator
                </CardTitle>
                <CardDescription>
                    Plan the perfect lighting mood and estimate electrical load and monthly run costs.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Mood Selector */}
                <div className="space-y-4">
                    <Label className="text-base font-medium">Lighting Mood</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {MOODS.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id as Mood)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300",
                                    mood === m.id
                                        ? `border-${m.color.split('-')[1]}-500 shadow-md ${m.bg}`
                                        : "border-border hover:border-border/80 bg-background"
                                )}
                            >
                                <m.icon className={cn("w-6 h-6 mb-2", mood === m.id ? m.color.split(' ')[0] : "text-muted-foreground")} />
                                <span className={cn("text-sm font-medium", mood === m.id ? "text-foreground" : "text-muted-foreground")}>
                                    {m.id}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-medium">Intensity</Label>
                                <span className="text-sm text-muted-foreground">{intensity[0]}%</span>
                            </div>
                            <Slider
                                value={intensity}
                                onValueChange={setIntensity}
                                max={100}
                                min={10}
                                step={1}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-medium">Room Area (sq. ft.)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                placeholder="e.g. 500"
                                className="font-medium"
                            />
                        </div>
                    </div>

                    {/* Results Display */}
                    <div className="bg-primary/5 rounded-2xl p-6 space-y-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Illuminance</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold font-serif">{Math.round(lux).toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground">Lux</span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-primary/10" />

                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Electrical Load</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold font-serif">{wattage.toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground">Watts</span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-primary/10" />

                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Est. Monthly Cost (₹8/unit)</p>
                            <div className="flex items-baseline gap-2">
                                <IndianRupee className="w-5 h-5 text-primary" />
                                <span className="text-3xl font-bold font-serif text-primary">
                                    {Math.round(monthlyCostINR).toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground">/mo</span>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

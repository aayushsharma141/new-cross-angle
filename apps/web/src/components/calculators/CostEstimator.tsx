import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Check, ChevronRight, Calculator, RefreshCcw } from "lucide-react";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";

// Types
type RoomType = "living" | "kitchen" | "bedroom" | "bathroom" | "full_home";
type QualityTier = "essential" | "premium" | "luxury";

interface EstimateState {
    roomType: RoomType;
    area: number;
    quality: QualityTier;
}

const ROOM_TYPES: { id: RoomType; label: string; icon: string; baseRate: number }[] = [
    { id: "full_home", label: "Full Home", icon: "🏠", baseRate: 1200 },
    { id: "kitchen", label: "Kitchen", icon: "🍳", baseRate: 1800 },
    { id: "living", label: "Living Room", icon: "🛋️", baseRate: 900 },
    { id: "bedroom", label: "Bedroom", icon: "🛏️", baseRate: 1100 },
    { id: "bathroom", label: "Bathroom", icon: "🚿", baseRate: 2500 },
];

const QUALITY_TIERS: { id: QualityTier; label: string; multiplier: number; desc: string }[] = [
    { id: "essential", label: "Essential", multiplier: 1, desc: "Functional & durable. Laminates, standard fittings." },
    { id: "premium", label: "Premium", multiplier: 1.4, desc: "Stylish & refined. Acrylics, branded fittings, soft-close." },
    { id: "luxury", label: "Luxury", multiplier: 1.9, desc: "Top-tier opulence. Veneers, Italian marble, smart automation." },
];

export const CostEstimator = () => {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<EstimateState>({
        roomType: "full_home",
        area: 1000,
        quality: "premium",
    });

    const calculateEstimate = () => {
        const selectedRoom = ROOM_TYPES.find((r) => r.id === state.roomType);
        const selectedQuality = QUALITY_TIERS.find((q) => q.id === state.quality);

        if (!selectedRoom || !selectedQuality) return { min: 0, max: 0 };

        const baseCost = state.area * selectedRoom.baseRate * selectedQuality.multiplier;
        // Return a range +/- 10%
        return {
            min: Math.round((baseCost * 0.9) / 1000) * 1000,
            max: Math.round((baseCost * 1.1) / 1000) * 1000,
        };
    };

    const estimate = calculateEstimate();

    const nextStep = () => setStep((s) => Math.min(s + 1, 3));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));
    const reset = () => {
        setStep(1);
        setState({ roomType: "full_home", area: 1000, quality: "premium" });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3,
        }).format(val);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-primary/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
                            <Calculator className="w-6 h-6" />
                            Smart Estimator
                        </h2>
                        <p className="text-muted-foreground text-sm">Get a ballpark cost in 30 seconds</p>
                    </div>
                    <div className="text-xs font-mono bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full">
                        Step {step} of 3
                    </div>
                </div>

                <CardContent className="p-0">
                    <div className="p-6 min-h-[400px] flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-xl font-medium text-center mb-8">What are you planning to design?</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {ROOM_TYPES.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setState({ ...state, roomType: type.id })}
                                                className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 ${state.roomType === type.id
                                                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(195,0,0,0.1)]"
                                                    : "border-border bg-card"
                                                    }`}
                                            >
                                                <span className="text-4xl filter drop-shadow-sm">{type.icon}</span>
                                                <span className="font-medium">{type.label}</span>
                                                {state.roomType === type.id && (
                                                    <div className="absolute top-2 right-2 text-primary">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 max-w-2xl mx-auto w-full"
                                >
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-medium">Define your space size</h3>
                                        <p className="text-muted-foreground">Adjust the slider to match your carpet area</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Area (Sq. Ft.)</span>
                                            <span className="text-4xl font-bold text-primary">{state.area} <span className="text-lg text-muted-foreground font-normal">sq.ft</span></span>
                                        </div>

                                        <Slider
                                            value={[state.area]}
                                            min={100}
                                            max={5000}
                                            step={50}
                                            onValueChange={(val) => setState({ ...state, area: val[0] })}
                                            className="py-4"
                                        />

                                        <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                            <span>100 sq.ft</span>
                                            <span>5000 sq.ft</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <h3 className="text-xl font-medium text-center">Select your finish quality</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {QUALITY_TIERS.map((tier) => (
                                            <button
                                                key={tier.id}
                                                onClick={() => setState({ ...state, quality: tier.id })}
                                                className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 hover:border-primary/50 ${state.quality === tier.id
                                                    ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                                                    : "border-border bg-card group"
                                                    }`}
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-lg">{tier.label}</span>
                                                        {state.quality === tier.id && <Check className="w-5 h-5 text-primary" />}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{tier.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-6 bg-gradient-to-r from-background to-secondary/10 rounded-2xl border border-secondary/20">
                                        <div className="text-center space-y-2">
                                            <p className="text-muted-foreground uppercase tracking-widest text-xs">Estimated Project Cost</p>
                                            <div className="text-3xl md:text-5xl font-display font-bold text-primary">
                                                {formatCurrency(estimate.min)} - {formatCurrency(estimate.max)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">*This is a ballpark estimate. Final quote varies by material selection.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>

                <div className="p-6 bg-muted/30 border-t flex justify-between items-center">
                    {step === 3 ? (
                        <Button variant="outline" onClick={reset} className="gap-2">
                            <RefreshCcw className="w-4 h-4" /> Start Over
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={step === 1}
                            className={step === 1 ? "invisible" : ""}
                        >
                            Back
                        </Button>
                    )}

                    {step < 3 ? (
                        <Button onClick={nextStep} className="gap-2 btn-brand">
                            Next Step <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <LeadCaptureDialog
                            source="Cost Estimator"
                            metadata={{
                                estimateMin: estimate.min,
                                estimateMax: estimate.max,
                                config: state
                            }}
                            title="Save Your Estimate"
                            description="Enter your details to save this estimate and book a free consultation with our experts."
                            defaultMessage={`I'm interested in a ${state.roomType} design (${state.area} sqft, ${state.quality} finish). Estimate: ${formatCurrency(estimate.min)} - ${formatCurrency(estimate.max)}`}
                        >
                            <Button className="gap-2 btn-brand shadow-lg shadow-primary/25">
                                Book Free Consultation
                            </Button>
                        </LeadCaptureDialog>
                    )}
                </div>
            </Card>
        </div>
    );
};

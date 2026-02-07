import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X, ArrowRight, Check, Loader2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const SERVICE_TYPES = [
    { id: "full-home", name: "Full Home Renovation", baseRate: 1200 },
    { id: "kitchen", name: "Modular Kitchen", baseRate: 1500 },
    { id: "living", name: "Living Room", baseRate: 1000 },
    { id: "bedroom", name: "Bedroom/Wardrobes", baseRate: 900 },
    { id: "office", name: "Office/Commercial", baseRate: 1800 },
];

const QUALITY_TIERS = [
    { id: "essential", name: "Essential", multiplier: 1, desc: "Functional, standard finishes" },
    { id: "premium", name: "Premium", multiplier: 1.5, desc: "High-end finishes, branded fittings" },
    { id: "luxury", name: "Luxury", multiplier: 2.2, desc: "Imported materials, automation" },
];

export const CostCalculator = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [step, setStep] = useState(1);
    const [area, setArea] = useState([500]);
    const [service, setService] = useState(SERVICE_TYPES[0]);
    const [quality, setQuality] = useState(QUALITY_TIERS[1]); // Default to Premium
    const [estimate, setEstimate] = useState(0);
    const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Simple calculation logic
        const calculated = area[0] * service.baseRate * quality.multiplier;
        setEstimate(Math.round(calculated / 1000) * 1000); // Round to nearest 1000
    }, [area, service, quality]);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, you would save this lead to Supabase here
        console.log("Lead Captured:", { ...contactForm, estimate, service: service.name, quality: quality.name, area: area[0] });

        setIsSubmitting(false);
        setStep(3); // Result step
        toast({
            title: "Estimate Unlocked!",
            description: "We've sent a detailed breakdown to your email.",
        });
    };

    const reset = () => {
        setStep(1);
        setContactForm({ name: "", phone: "", email: "" });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={reset}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border">
                <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-serif">Renovation Estimator</DialogTitle>
                            <DialogDescription className="text-primary-foreground/70">
                                Get a ballpark figure in seconds.
                            </DialogDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={reset} className="absolute right-4 top-4 text-white/50 hover:text-white hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>What space are you planning?</Label>
                                        <Select
                                            value={service.id}
                                            onValueChange={(val) => setService(SERVICE_TYPES.find(s => s.id === val) || SERVICE_TYPES[0])}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SERVICE_TYPES.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <Label>Carpet Area (sq ft)</Label>
                                            <span className="font-mono text-primary font-bold">{area[0]} sq ft</span>
                                        </div>
                                        <Slider
                                            value={area}
                                            onValueChange={setArea}
                                            min={100}
                                            max={5000}
                                            step={50}
                                            className="py-4"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Desired Finish Quality</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {QUALITY_TIERS.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setQuality(t)}
                                                    className={`p-2 rounded-lg border text-sm transition-all ${quality.id === t.id
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                            : "border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    <div className="font-semibold mb-1">{t.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{quality.desc}</p>
                                    </div>
                                </div>

                                <Button className="w-full" onClick={handleNext} variant="gold">
                                    Next <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-6">
                                    <h3 className="text-lg font-medium">Almost there!</h3>
                                    <p className="text-muted-foreground text-sm">Where should we send your estimate?</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            required
                                            placeholder="John Doe"
                                            value={contactForm.name}
                                            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            required
                                            placeholder="+91 98765..."
                                            value={contactForm.phone}
                                            onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            value={contactForm.email}
                                            onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between">
                                        <span className="text-sm font-medium">Estimated Range:</span>
                                        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                                        {/* Blur/Hide the price until submission for conversion */}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Submit to unlock the instant estimate.
                                    </p>

                                    <Button type="submit" className="w-full" variant="gold" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock Estimate"}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6 space-y-6"
                            >
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-serif font-bold text-foreground">
                                        ₹{(estimate).toLocaleString('en-IN')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground px-8">
                                        Estimated cost for a {quality.name.toLowerCase()} {service.name.toLowerCase()} ({area[0]} sq ft).
                                    </p>
                                </div>

                                <div className="bg-secondary p-4 rounded-xl text-left space-y-3">
                                    <h4 className="font-semibold text-sm">Next Steps:</h4>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4" /> <span>Our team will call you within 24hrs.</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" /> <span>Detailed breakdown sent to {contactForm.email}.</span>
                                    </div>
                                </div>

                                <Button onClick={reset} variant="outline" className="w-full">
                                    Close Estimator
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserSignals, AestheticScores, Archetype } from "@/types/discovery";
import { track, trackLeadGateSubmitted } from "../infrastructure/analytics/tracker";

interface Props {
    sessionId: string | null;
    scores: AestheticScores;
    archetype: Archetype;
    signals: UserSignals;
    onComplete: () => void;
}

const LeadGatePhase = ({ sessionId, scores, archetype, signals, onComplete }: Props) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (sessionId) {
            track("gate_viewed", { sessionId, archetype: archetype.name });
        }
    }, [sessionId, archetype.name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            toast.error("Please provide your name and email.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Structure the payload for the edge function
            const payload = {
                name,
                email,
                phone,
                consent: true,
                results: {
                    archetype: archetype.name,
                    scores: scores,
                    project_type: signals.reflectionAnswers?.find(a => a.question.includes('space'))?.answer || 'residential',
                    // Defaulting for MVP if not specified in quiz
                },
                raw_data: signals
            };

            const { data, error } = await supabase.functions.invoke("submit-discovery-lead", {
                body: payload,
            });

            if (error || data?.error) {
                if (data?.error === "Email already registered") {
                    toast.success("Welcome back! Your aesthetic results are ready.");
                } else {
                    console.error("Submission error:", error || data?.error);
                    toast.error("There was a problem saving your profile, but you can still view your results.");
                }
            } else {
                toast.success("Profile saved successfully.");
                if (sessionId) {
                    trackLeadGateSubmitted(sessionId, email);
                }
            }

            onComplete();
        } catch (err) {
            console.error("Submission exception:", err);
            // Even if it fails, let them see results for better UX
            onComplete();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto w-full"
        >
            <div className="text-center mb-10">
                <h2 className="font-serif-display text-3xl font-medium mb-4">
                    Save Your Blueprint
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                    Love your results? Enter your details to save your Spatial Identity Blueprint and receive a personalized design consultation from our team.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-xs uppercase tracking-premium text-muted-foreground mb-2">
                            Full Name *
                        </label>
                        <Input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background/50 border-input h-12"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-xs uppercase tracking-premium text-muted-foreground mb-2">
                            Email Address *
                        </label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-background/50 border-input h-12"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-xs uppercase tracking-premium text-muted-foreground mb-2">
                            Phone Number <span className="text-foreground/30">(Optional)</span>
                        </label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-background/50 border-input h-12"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !email.trim()}
                    className="w-full h-14 text-base tracking-wide group relative overflow-hidden"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                        <>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Save & Get Consultation
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                            <div className="absolute inset-0 bg-primary/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </>
                    )}
                </Button>
            </form>
        </motion.div>
    );
};

export default LeadGatePhase;

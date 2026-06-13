import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserSignals, AestheticScores, Archetype } from "@/types/discovery";
import { trackLeadGateViewed, trackLeadGateSubmitted } from "../infrastructure/analytics/tracker";
import { useAnalytics } from "@/analytics/AnalyticsProvider";

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
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const analytics = useAnalytics();
    const analyticsTrack = analytics.track.bind(analytics);

    useEffect(() => {
        if (sessionId) {
            trackLeadGateViewed(analyticsTrack, sessionId, archetype.name);
        }
    }, [sessionId, archetype.name, analyticsTrack]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: { name?: string; email?: string } = {};
        if (!name.trim()) newErrors.name = "Name is required.";
        if (!email.trim()) newErrors.email = "Email is required.";
        
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please provide your name and email.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Strip large computed objects not needed in DB
            const { consultationIntelligence: _ci, ...signalsForDB } = signals as UserSignals & { consultationIntelligence?: unknown };

            const payload = {
                name,
                email,
                phone,
                session_id: sessionId,
                consent: true,
                results: {
                    archetype: archetype.name,
                    scores: scores,
                    project_type: signals.reflectionAnswers?.find(a => a.question.includes('space'))?.answer || 'residential',
                },
                raw_data: signalsForDB
            };

            const { data, error } = await supabase.functions.invoke("submit-discovery-lead", {
                body: payload,
            });

            if (error || data?.error) {
                if (data?.error === "Email already registered") {
                    toast.success("Welcome back! Your aesthetic results are ready.");
                } else {
                    // Non-critical — user still gets their results
                    console.warn("Submission error (non-blocking):", error || data?.error);
                    // Silent fail — don't show error toast, just proceed to results
                }
            } else {
                toast.success("Profile saved successfully.");
                if (data?.slug) {
                    try { localStorage.setItem("ca_quiz_slug", data.slug); } catch (e) { console.warn("Could not save slug:", e); }
                }
                if (sessionId) {
                    trackLeadGateSubmitted(analyticsTrack, sessionId, email);
                }
            }

            onComplete();
        } catch (err) {
            console.error("Submission exception:", err);
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
            className="flex h-full w-full items-center justify-center p-4 md:p-8 bg-transparent"
        >
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 max-w-[500px] w-full flex flex-col relative overflow-hidden">
                {/* Top thin line detail */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#233526]" />

                <div className="text-center mb-10">
                    <p className="tracking-[0.15em] text-[10px] uppercase font-bold text-[#5a5a5a] mb-4">ALMOST THERE</p>
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-[#1a1a1a] font-serif leading-tight">
                        Save Your Blueprint
                    </h2>
                    <p className="text-[#5a5a5a] text-sm leading-relaxed font-light">
                        Love your results? Enter your details to save your Spatial Identity Blueprint and receive a personalized design consultation from our team.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-[11px] uppercase tracking-[0.15em] text-[#5a5a5a] mb-2 font-semibold">
                                Full Name *
                            </label>
                            <Input
                                id="name"
                                type="text"
                                required
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "name-error" : undefined}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                                }}
                                className="bg-[#faf8f5] border border-[#e8e4dd] h-14 rounded-xl text-[#1a1a1a] placeholder:text-[#a0a0a0] focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:bg-white focus-visible:border-[#233526] transition-all px-4"
                                placeholder="Your name"
                            />
                            {errors.name && (
                                <p id="name-error" className="text-red-500 text-xs mt-1" aria-live="polite">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-[11px] uppercase tracking-[0.15em] text-[#5a5a5a] mb-2 font-semibold">
                                Email Address *
                            </label>
                            <Input
                                id="email"
                                type="email"
                                required
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                                }}
                                className="bg-[#faf8f5] border border-[#e8e4dd] h-14 rounded-xl text-[#1a1a1a] placeholder:text-[#a0a0a0] focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:bg-white focus-visible:border-[#233526] transition-all px-4"
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p id="email-error" className="text-red-500 text-xs mt-1" aria-live="polite">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-[11px] uppercase tracking-[0.15em] text-[#5a5a5a] mb-2 font-semibold">
                                Phone Number <span className="text-[#8c8c8c] lowercase tracking-normal font-normal ml-1">(Optional)</span>
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-[#faf8f5] border border-[#e8e4dd] h-14 rounded-xl text-[#1a1a1a] placeholder:text-[#a0a0a0] focus-visible:ring-2 focus-visible:ring-[#8b6f47] focus-visible:bg-white focus-visible:border-[#233526] transition-all px-4"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name.trim() || !email.trim()}
                            className="w-full h-14 bg-[#233526] text-white disabled:bg-[#e8e4dd] disabled:text-[#5a5a5a] disabled:opacity-100 rounded-xl text-sm font-semibold hover:bg-[#1a281c] transition-all duration-300 shadow-md group disabled:shadow-none"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-white/70" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Save & Get Consultation
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default LeadGatePhase;

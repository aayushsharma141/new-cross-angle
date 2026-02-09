import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight, RefreshCcw, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";

// Types
type StyleArchetype = "minimalist" | "luxury" | "boho" | "classic";

interface QuizOption {
    id: string;
    image: string;
    label: string;
    value: StyleArchetype;
}

interface Question {
    id: number;
    title: string;
    subtitle: string;
    options: QuizOption[];
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        title: "Pick a Living Room",
        subtitle: "Which space feels most like 'home' to you?",
        options: [
            {
                id: "q1-a",
                image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop",
                label: "Clean & Airy",
                value: "minimalist",
            },
            {
                id: "q1-b",
                image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop",
                label: "Rich & Polished",
                value: "luxury",
            },
            {
                id: "q1-c",
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop",
                label: "Cozy & Artistic",
                value: "boho",
            },
        ],
    },
    {
        id: 2,
        title: "Choose a Color Palette",
        subtitle: "What tones speak to you?",
        options: [
            {
                id: "q2-a",
                image: "https://images.unsplash.com/photo-1558603668-6570496b66f8?q=80&w=800&auto=format&fit=crop",
                label: "Warm & Traditional",
                value: "classic",
            },
            {
                id: "q2-b",
                image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop",
                label: "Whites & Greys",
                value: "minimalist",
            },
            {
                id: "q2-c",
                image: "https://images.unsplash.com/photo-1505691938895-1cd5874c1516?q=80&w=800&auto=format&fit=crop",
                label: "Gold & velvet",
                value: "luxury",
            },
        ],
    },
    {
        id: 3,
        title: "Select a Bedroom Vibe",
        subtitle: "Where would you sleep best?",
        options: [
            {
                id: "q3-a",
                image: "https://images.unsplash.com/photo-1522771753035-487717d72c02?q=80&w=800&auto=format&fit=crop",
                label: "Eclectic Mix",
                value: "boho",
            },
            {
                id: "q3-b",
                image: "https://images.unsplash.com/photo-1616594039964-40891a909d93?q=80&w=800&auto=format&fit=crop",
                label: "Timeless Wood",
                value: "classic",
            },
            {
                id: "q3-c",
                image: "https://images.unsplash.com/photo-1505693314120-0a44176374b1?q=80&w=800&auto=format&fit=crop",
                label: "Hotel Suite",
                value: "luxury",
            },
        ],
    },
];

const RESULTS: Record<StyleArchetype, { title: string; desc: string; image: string }> = {
    minimalist: {
        title: "Modern Minimalist",
        desc: "You love clean lines, clutter-free spaces, and a monochromatic palette. Less is definitely more for you.",
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=800&auto=format&fit=crop",
    },
    luxury: {
        title: "Contemporary Luxury",
        desc: "You appreciate the finer things. High-end finishes, statement lighting, and a polished, hotel-like atmosphere define your style.",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
    },
    boho: {
        title: "Bohemian Chic",
        desc: "Your style is relaxed, artistic, and full of life. You love plants, natural textures, and a mix of cultural patterns.",
        image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop",
    },
    classic: {
        title: "Timeless Classic",
        desc: "You honor tradition with a love for rich woods, warm colors, and symmetrical layouts that never go out of style.",
        image: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=800&auto=format&fit=crop",
    },
};

export const StyleQuiz = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<StyleArchetype[]>([]);
    const [result, setResult] = useState<StyleArchetype | null>(null);

    const handleSelection = (val: StyleArchetype) => {
        const newAnswers = [...answers, val];
        setAnswers(newAnswers);

        if (step < QUESTIONS.length - 1) {
            setTimeout(() => setStep(step + 1), 300); // Small delay for UX
        } else {
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers: StyleArchetype[]) => {
        const counts: Record<string, number> = {};
        finalAnswers.forEach((a) => (counts[a] = (counts[a] || 0) + 1));

        // Simple sort to find max
        const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as StyleArchetype;
        setResult(winner);
    };

    const reset = () => {
        setStep(0);
        setAnswers([]);
        setResult(null);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-md overflow-hidden min-h-[600px] flex flex-col relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 p-32 bg-secondary/5 rounded-full blur-3xl -z-10" />

                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-background/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-xl">Style Persona Quiz</h2>
                            {!result && <p className="text-xs text-muted-foreground">step {step + 1} of {QUESTIONS.length}</p>}
                        </div>
                    </div>
                    {!result && (
                        <div className="text-xs font-mono text-muted-foreground">
                            Define your aesthetic
                        </div>
                    )}
                </div>

                <CardContent className="flex-1 p-0 relative">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div
                                key={`question-${step}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 md:p-12 h-full flex flex-col"
                            >
                                <div className="text-center mb-10 space-y-2">
                                    <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                                        {QUESTIONS[step].title}
                                    </h3>
                                    <p className="text-lg text-muted-foreground">{QUESTIONS[step].subtitle}</p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6 flex-1 items-center">
                                    {QUESTIONS[step].options.map((option, idx) => (
                                        <motion.div
                                            key={option.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <button
                                                onClick={() => handleSelection(option.value)}
                                                className="group relative w-full aspect-[4/5] rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 text-left"
                                            >
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                                                <img
                                                    src={option.image}
                                                    alt={option.label}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />

                                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </span>
                                                    <h4 className="text-xl font-bold text-white shadow-sm">{option.label}</h4>
                                                </div>
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="p-0 h-full flex flex-col md:flex-row"
                            >
                                {/* Image Side */}
                                <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 md:hidden" />
                                    <img
                                        src={RESULTS[result].image}
                                        alt={RESULTS[result].title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-6 left-6 z-20 md:hidden text-white">
                                        <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Your Archetype</p>
                                        <h3 className="text-3xl font-display font-bold">{RESULTS[result].title}</h3>
                                    </div>
                                </div>

                                {/* Content Side */}
                                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-8">
                                    <div className="hidden md:block space-y-2">
                                        <p className="text-sm font-medium text-primary uppercase tracking-wider">Your Design Archetype</p>
                                        <h3 className="text-4xl lg:text-5xl font-display font-bold text-foreground">
                                            {RESULTS[result].title}
                                        </h3>
                                    </div>

                                    <div className="space-y-6">
                                        <p className="text-lg text-muted-foreground leading-relaxed">
                                            {RESULTS[result].desc}
                                        </p>

                                        <div className="p-6 bg-secondary/10 rounded-xl border border-secondary/20">
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-secondary" />
                                                Recommended for you
                                            </h4>
                                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                                <li>Curated material palette</li>
                                                <li>Custom moodboard</li>
                                                <li>Furniture selection guide</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <LeadCaptureDialog
                                            source="Style Quiz"
                                            metadata={{
                                                archetype: result,
                                                title: RESULTS[result].title,
                                                answers: answers
                                            }}
                                            title="Your FREE Design Report"
                                            description="Enter your details to receive your personalized style guide, color palette, and furniture recommendations."
                                            defaultMessage={`I got matched with ${RESULTS[result].title}! I'd like to know more about this style.`}
                                        >
                                            <Button size="lg" className="w-full sm:w-auto gap-2 shadow-xl shadow-primary/20">
                                                Get Full Design Report <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </LeadCaptureDialog>
                                        <Button variant="outline" size="lg" onClick={reset} className="w-full sm:w-auto gap-2">
                                            <RefreshCcw className="w-4 h-4" /> Retake Quiz
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {!result && (
                <p className="text-center text-sm text-muted-foreground mt-8">
                    <Link to="/contact-us" className="hover:text-primary transition-colors underline underline-offset-4">Skip quiz and talk to a designer</Link>
                </p>
            )}
        </div>
    );
};

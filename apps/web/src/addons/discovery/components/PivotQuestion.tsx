import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Wrench, Eye, Clock, Fingerprint, LucideIcon } from "lucide-react";

type PrimaryValue = "beauty" | "practicality" | "impression" | "longevity" | "identity";

interface PivotOption {
    id: PrimaryValue;
    label: string;
    sublabel: string;
    icon: LucideIcon;
    archetypeSignal: string; // which archetype this tilts toward
}

const OPTIONS: PivotOption[] = [
    {
        id: "beauty",
        label: "A Beautiful Home",
        sublabel: "Spaces that stop you every time you walk in. Aesthetics are not superficial — they are the point.",
        icon: Sparkles,
        archetypeSignal: "The Warm Contemporary",
    },
    {
        id: "practicality",
        label: "A Practical Home",
        sublabel: "Spaces that make daily life smoother, faster, and less frustrating. Design that disappears into function.",
        icon: Wrench,
        archetypeSignal: "The Functional Family Planner",
    },
    {
        id: "impression",
        label: "A Home That Impresses",
        sublabel: "A space that signals taste, success, and intention — to guests, clients, and yourself.",
        icon: Eye,
        archetypeSignal: "The Quiet Luxury Collector",
    },
    {
        id: "longevity",
        label: "A Home That Ages Well",
        sublabel: "Spaces designed to feel timeless in 20 years. Quality materials, considered proportions, no trends.",
        icon: Clock,
        archetypeSignal: "The Refined Modernist",
    },
    {
        id: "identity",
        label: "A Home That Reflects Me",
        sublabel: "A space that is unmistakably yours — shaped by your values, your story, your way of living.",
        icon: Fingerprint,
        archetypeSignal: "The Urban Minimalist",
    },
];

interface Props {
    onComplete: (data: { primaryValue: PrimaryValue }) => void;
}

/**
 * PivotQuestion — Phase 9 addition.
 *
 * The "What matters most?" question is heavily weighted in the scoring matrix.
 * It often predicts the archetype better than 10 other questions combined.
 * This is a deliberate design choice: ask the most powerful question last,
 * after the user has already committed to the quiz and is in an honest headspace.
 */
const PivotQuestion: React.FC<Props> = ({ onComplete }) => {
    const [hovered, setHovered] = useState<PrimaryValue | null>(null);
    const [selected, setSelected] = useState<PrimaryValue | null>(null);

    const handleSelect = (value: PrimaryValue) => {
        setSelected(value);
        // Brief pause so the selection state is visible before transition
        setTimeout(() => onComplete({ primaryValue: value }), 600);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
        >
            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl px-6 md:px-8 flex flex-col items-center overflow-y-auto py-8">
                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <span className="text-[10px] font-mono tracking-label uppercase text-kiro-accent font-bold">
                        Final Question · Most Important
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-serif text-3xl md:text-5xl font-normal text-kiro-ink mb-4 text-center leading-tight tracking-tight"
                >
                    What matters most?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="text-sm text-kiro-inkSoft text-center max-w-md mb-10 leading-relaxed font-light"
                >
                    One answer. Be honest — this single choice carries more weight than everything before it.
                </motion.p>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {OPTIONS.map((option, i) => {
                        const Icon = option.icon;
                        const isSelected = selected === option.id;
                        const isHovered = hovered === option.id;

                        return (
                            <motion.button
                                key={option.id}
                                type="button"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                                onClick={() => handleSelect(option.id)}
                                onMouseEnter={() => setHovered(option.id)}
                                onMouseLeave={() => setHovered(null)}
                                disabled={!!selected}
                                aria-pressed={isSelected}
                                className={`
                                    relative w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border text-left
                                    transition-all duration-300 group
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kiro-accent
                                    disabled:cursor-default
                                    ${i === OPTIONS.length - 1 && OPTIONS.length % 2 !== 0 ? 'md:col-span-2 md:w-1/2 md:justify-self-center' : ''}
                                    ${isSelected
                                        ? "border-kiro-accent bg-kiro-accent/[0.06] shadow-[0_0_20px_rgba(139,111,71,0.08)]"
                                        : "border-kiro-line bg-white/80 hover:border-kiro-accent/50 hover:bg-white hover:shadow-md"
                                    }
                                `}
                            >
                                {/* Icon */}
                                <div className={`
                                    flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center
                                    transition-all duration-300
                                    ${isSelected ? "bg-kiro-accent/10 text-kiro-accent" : "bg-kiro-bg text-kiro-accent/60 group-hover:text-kiro-accent group-hover:bg-kiro-accent/5"}
                                `}>
                                    <Icon size={20} />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-serif text-lg leading-snug mb-1 transition-colors duration-200 ${isSelected ? "text-kiro-ink" : "text-kiro-ink/80 group-hover:text-kiro-ink"}`}>
                                        {option.label}
                                    </p>
                                    <AnimatePresence>
                                        {(isHovered || isSelected) && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="text-xs text-kiro-inkSoft leading-relaxed font-light overflow-hidden"
                                            >
                                                {option.sublabel}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Arrow — indicates selected */}
                                <motion.div
                                    initial={false}
                                    animate={{ opacity: isSelected ? 1 : 0, x: isSelected ? 0 : -8 }}
                                    className="flex-shrink-0 text-kiro-accent"
                                >
                                    <ArrowRight size={18} />
                                </motion.div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Quiet note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-8 text-[10px] font-mono tracking-label uppercase text-kiro-inkSoft/60 text-center"
                >
                    No wrong answers · This is about you
                </motion.p>
            </div>
        </motion.div>
    );
};

export default PivotQuestion;

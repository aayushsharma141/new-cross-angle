import { motion } from "framer-motion";
import { Archetype, AestheticScores } from "@/types/discovery";
import { Button } from "@/components/ui/primitives/button";

interface Props {
    archetype: Archetype;
    scores: AestheticScores;
    onComplete: () => void;
}

const MiniResultPreview = ({ archetype, scores, onComplete }: Props) => {
    // Radar Chart Dimensions
    const size = 200;
    const center = size / 2;
    const radius = 80;

    const dimensions = [
        { key: "warmth", label: "Warmth" },
        { key: "minimalism", label: "Minimalism" },
        { key: "social", label: "Social Hub" },
        { key: "structure", label: "Structure" },
    ];

    const getPoint = (index: number, score: number, maxRadius: number) => {
        const angle = (index * (2 * Math.PI)) / dimensions.length - Math.PI / 2;
        const r = (score / 10) * maxRadius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    const points = dimensions.map((d, i) => getPoint(i, scores[d.key as keyof AestheticScores], radius));
    const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const bgPoints = [0.25, 0.5, 0.75, 1].map((scale) =>
        dimensions.map((_, i) => getPoint(i, scale * 10, radius))
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex flex-col items-center justify-center p-6 z-10"
        >
            <div className="max-w-md w-full bg-card/80 backdrop-blur-md rounded-2xl border border-border/40 p-8 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="text-center mb-8 relative">
                    <p className="text-[10px] tracking-[4px] text-gold uppercase mb-3 font-semibold">Your Aesthetic DNA</p>
                    <h2 className="font-serif-display text-4xl md:text-5xl mb-4 italic">{archetype.name}</h2>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {archetype.traits.slice(0, 3).map((trait) => (
                            <span key={trait} className="px-3 py-1 bg-foreground/5 border border-foreground/10 text-[10px] tracking-wider uppercase rounded-full text-muted-foreground">
                                {trait}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center mb-10 relative">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                        {/* Radar Grid */}
                        {bgPoints.map((points, idx) => (
                            <path
                                key={idx}
                                d={points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"}
                                fill="none"
                                stroke="currentColor"
                                className="text-foreground/5"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Axis Lines */}
                        {dimensions.map((_, i) => {
                            const p = getPoint(i, 10, radius);
                            return (
                                <line
                                    key={i}
                                    x1={center} y1={center}
                                    x2={p.x} y2={p.y}
                                    stroke="currentColor"
                                    className="text-foreground/10"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* DNA Polygon */}
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            d={pathData}
                            fill="hsl(var(--gold) / 0.15)"
                            stroke="hsl(var(--gold))"
                            strokeWidth="2"
                        />

                        {/* Labels */}
                        {dimensions.map((d, i) => {
                            const p = getPoint(i, 12, radius); // Move label slightly further out
                            return (
                                <text
                                    key={d.key}
                                    x={p.x}
                                    y={p.y}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    className="fill-muted-foreground font-mono text-[9px] uppercase tracking-tighter"
                                >
                                    {d.label}
                                </text>
                            );
                        })}
                    </svg>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={onComplete}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground tracking-widest font-semibold text-xs transition-all duration-300"
                    >
                        REVEAL YOUR FULL BLUEPRINT
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default MiniResultPreview;

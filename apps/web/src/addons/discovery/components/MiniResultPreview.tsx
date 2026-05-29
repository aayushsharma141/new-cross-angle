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
            className="fixed inset-0 flex flex-col items-center justify-center p-6 z-10 bg-black/5 backdrop-blur-[2px]"
        >
            <div className="max-w-[500px] w-full bg-white rounded-3xl border border-black/5 p-10 shadow-xl relative overflow-hidden">
                <div className="text-center mb-10 relative">
                    <p className="text-[10px] tracking-[0.2em] text-[#5a5a5a] uppercase mb-4 font-bold">Your Aesthetic DNA</p>
                    <h2 className="text-4xl md:text-5xl mb-5 text-[#1a1a1a] font-serif leading-tight">{archetype.name}</h2>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {archetype.traits.slice(0, 3).map((trait) => (
                            <span key={trait} className="px-3 py-1.5 bg-[#faf8f5] border border-[#e8e4dd] text-[10px] tracking-widest uppercase rounded-full text-[#1a1a1a] font-medium">
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
                                stroke="#e8e4dd"
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
                                    stroke="#e8e4dd"
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
                            fill="rgba(35, 53, 38, 0.08)"
                            stroke="#233526"
                            strokeWidth="1.5"
                        />

                        {/* Labels */}
                        {dimensions.map((d, i) => {
                            const p = getPoint(i, 12.5, radius); // Move label slightly further out
                            return (
                                <text
                                    key={d.key}
                                    x={p.x}
                                    y={p.y}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    className="fill-[#8c8c8c] font-sans font-medium text-[9px] uppercase tracking-widest"
                                >
                                    {d.label}
                                </text>
                            );
                        })}
                    </svg>
                </div>

                <div className="pt-2">
                    <Button
                        onClick={onComplete}
                        className="w-full h-14 bg-[#233526] text-white rounded-xl text-sm font-medium hover:bg-[#1a281c] transition-all duration-300 shadow-md"
                    >
                        REVEAL YOUR FULL BLUEPRINT
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default MiniResultPreview;

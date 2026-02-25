import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedCircularProgressProps {
    value: number; // 0–100
    max?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
    colorFrom?: string;
    colorTo?: string;
    className?: string;
    delay?: number;
}

export const AnimatedCircularProgress = ({
    value,
    max = 10,
    size = 100,
    strokeWidth = 4,
    label,
    sublabel,
    colorFrom = "#d4a853",
    colorTo = "#FDE68A",
    className,
    delay = 0,
}: AnimatedCircularProgressProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });

    const normalised = value / max;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const targetOffset = circumference * (1 - normalised);
    const gradId = `cpg-${label?.replace(/\s/g, "")}`;

    return (
        <div ref={ref} className={cn("flex flex-col items-center gap-3", className)}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="-rotate-90"
                >
                    <defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={colorFrom} />
                            <stop offset="100%" stopColor={colorTo} />
                        </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#${gradId})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={isInView ? { strokeDashoffset: targetOffset } : {}}
                        transition={{ duration: 1.4, delay, ease: "easeOut" }}
                    />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-serif-display text-xl text-white/90 leading-none">
                        {value}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">/{max}</span>
                </div>
            </div>
            {label && (
                <div className="text-center">
                    <p className="text-[11px] font-mono tracking-widest uppercase text-white/40">{label}</p>
                    {sublabel && (
                        <p className="text-[10px] text-white/25 mt-0.5 max-w-[120px] leading-snug">{sublabel}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnimatedCircularProgress;

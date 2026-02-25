import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";

interface Sparkle {
    id: number;
    x: string;
    y: string;
    size: number;
    delay: string;
    color: string;
}

interface SparklesTextProps {
    text: string;
    className?: string;
    sparkleColors?: string[];
    sparkleCount?: number;
}

const generateSparkle = (colors: string[]): Sparkle => ({
    id: Math.random(),
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: 8 + Math.random() * 8,
    delay: `${Math.random() * 1.5}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
});

export const SparklesText = ({
    text,
    className,
    sparkleColors = ["#FDE68A", "#FCD34D", "#F59E0B", "#FFFBEB"],
    sparkleCount = 8,
}: SparklesTextProps) => {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    const regenerate = useCallback(() => {
        setSparkles(Array.from({ length: sparkleCount }, () => generateSparkle(sparkleColors)));
    }, [sparkleCount, sparkleColors]);

    useEffect(() => {
        regenerate();
        const interval = setInterval(regenerate, 1800);
        return () => clearInterval(interval);
    }, [regenerate]);

    return (
        <span className={cn("relative inline-block", className)}>
            {sparkles.map((s) => (
                <span
                    key={s.id}
                    className="pointer-events-none absolute inline-flex items-center justify-center animate-sparkle-spin"
                    style={{ left: s.x, top: s.y, width: s.size, height: s.size, animationDelay: s.delay }}
                >
                    <svg
                        width={s.size}
                        height={s.size}
                        viewBox="0 0 160 160"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M80 7C80 7 84.2846 38.2295 90.3481 43.6909C96.4116 49.1524 127.898 50 127.898 50C127.898 50 96.4116 50.8476 90.3481 56.3091C84.2846 61.7705 80 93 80 93C80 93 75.7154 61.7705 69.6519 56.3091C63.5884 50.8476 32.102 50 32.102 50C32.102 50 63.5884 49.1524 69.6519 43.6909C75.7154 38.2295 80 7 80 7Z"
                            fill={s.color}
                        />
                    </svg>
                </span>
            ))}
            <strong className="relative font-bold">{text}</strong>
        </span>
    );
};

export default SparklesText;

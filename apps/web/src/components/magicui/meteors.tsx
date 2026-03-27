import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MeteorsProps {
    number?: number;
    className?: string;
}

export const Meteors = ({ number = 15, className }: MeteorsProps) => {
    const [meteorStyles, setMeteorStyles] = useState<
        Array<{ top: string; left: string; animationDelay: string; animationDuration: string }>
    >([]);

    useEffect(() => {
        const styles = Array.from({ length: number }, () => ({
            top: "-5%",
            left: `${Math.floor(Math.random() * 100)}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${5 + Math.random() * 8}s`,
        }));
        setMeteorStyles(styles);
    }, [number]);

    return (
        <>
            {meteorStyles.map((style, idx) => (
                <span
                    key={idx}
                    className={cn(
                        "pointer-events-none absolute left-1/2 top-1/2 h-px w-[120px] rotate-[215deg] animate-meteor-effect",
                        "bg-gradient-to-r from-white/60 via-white/20 to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.1)]",
                        className,
                    )}
                    style={{
                        top: style.top,
                        left: style.left,
                        animationDelay: style.animationDelay,
                        animationDuration: style.animationDuration,
                    }}
                >
                    <span className="absolute top-1/2 -translate-y-1/2 h-[1px] w-4 bg-white/80 blur-[1px] rounded-full" />
                </span>
            ))}
        </>
    );
};


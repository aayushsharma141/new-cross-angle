import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface NeonGradientCardProps {
    children: React.ReactNode;
    className?: string;
    borderSize?: number;
    borderRadius?: number;
    neonColors?: { firstColor: string; secondColor: string };
}

export const NeonGradientCard = ({
    children,
    className,
    borderSize = 2,
    borderRadius = 0,
    neonColors = { firstColor: "#d4a853", secondColor: "#8b5e1a" },
}: NeonGradientCardProps) => {
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setMouseX(e.clientX - rect.left);
        setMouseY(e.clientY - rect.top);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn("relative group", className)}
            style={{ borderRadius }}
        >
            {/* Neon glow border */}
            <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                    borderRadius,
                    padding: borderSize,
                    background: isHovered
                        ? `radial-gradient(200px circle at ${mouseX}px ${mouseY}px, ${neonColors.firstColor}80, ${neonColors.secondColor}40, transparent 70%)`
                        : `linear-gradient(135deg, ${neonColors.firstColor}30, ${neonColors.secondColor}20)`,
                }}
            >
                <div
                    className="h-full w-full bg-[#0D0A08]"
                    style={{ borderRadius: borderRadius - borderSize }}
                />
            </div>

            {/* Outer glow on hover */}
            <div
                className="absolute -inset-[1px] transition-opacity duration-500 pointer-events-none"
                style={{
                    borderRadius,
                    boxShadow: isHovered
                        ? `0 0 20px ${neonColors.firstColor}40, 0 0 40px ${neonColors.secondColor}20`
                        : "none",
                }}
            />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
};


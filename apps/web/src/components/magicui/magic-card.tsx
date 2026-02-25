import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface MagicCardProps {
    children: React.ReactNode;
    className?: string;
    gradientSize?: number;
    gradientColor?: string;
    gradientOpacity?: number;
}

export const MagicCard = ({
    children,
    className,
    gradientSize = 200,
    gradientColor = "#d4a853",
    gradientOpacity = 0.08,
}: MagicCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative overflow-hidden bg-[#0D0A08] border border-white/[0.06] transition-all duration-300",
                "hover:border-white/[0.12]",
                className,
            )}
        >
            {/* Spotlight gradient */}
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(${gradientSize}px circle at ${pos.x}px ${pos.y}px, ${gradientColor}${Math.round(gradientOpacity * 255).toString(16).padStart(2, "0")}, transparent 70%)`,
                }}
            />
            {children}
        </div>
    );
};

export default MagicCard;

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

interface DockItemProps {
    icon: React.ReactNode;
    label?: string;
    onClick?: () => void;
    className?: string;
}

interface DockProps {
    items: DockItemProps[];
    className?: string;
    iconSize?: number;
    magnification?: number;
}

const DockItem = ({
    icon,
    label,
    onClick,
    className,
    mouseX,
    iconSize,
    magnification,
}: DockItemProps & {
    mouseX: ReturnType<typeof useMotionValue<number>>;
    iconSize: number;
    magnification: number;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val) => {
        if (!ref.current) return 0;
        const rect = ref.current.getBoundingClientRect();
        return val - (rect.left + rect.width / 2);
    });

    const widthTransform = useTransform(
        distance,
        [-150, 0, 150],
        [iconSize, iconSize * magnification, iconSize],
    );
    const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <div className="group relative flex flex-col items-center">
            {/* Tooltip */}
            {label && (
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-[#0D0A08] border border-white/10 text-[10px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {label}
                </div>
            )}
            <motion.div
                ref={ref}
                style={{ width, height: width }}
                className={cn(
                    "flex items-center justify-center cursor-pointer",
                    "border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07]",
                    "transition-colors duration-200",
                    className,
                )}
                onClick={onClick}
                onMouseMove={(e) => {
                    mouseX.set(e.clientX);
                }}
            >
                {icon}
            </motion.div>
        </div>
    );
};

export const Dock = ({
    items,
    className,
    iconSize = 44,
    magnification = 1.6,
}: DockProps) => {
    const mouseX = useMotionValue(Infinity);

    return (
        <motion.div
            className={cn(
                "flex items-end gap-2 px-4 py-3 border border-white/[0.06] bg-black/40 backdrop-blur-xl",
                className,
            )}
            onMouseMove={(e) => mouseX.set(e.clientX)}
            onMouseLeave={() => mouseX.set(Infinity)}
        >
            {items.map((item, i) => (
                <DockItem
                    key={i}
                    mouseX={mouseX}
                    iconSize={iconSize}
                    magnification={magnification}
                    {...item}
                />
            ))}
        </motion.div>
    );
};

export default Dock;

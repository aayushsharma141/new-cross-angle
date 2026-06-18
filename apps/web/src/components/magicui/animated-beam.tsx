import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedBeamProps {
    containerRef: React.RefObject<HTMLElement>;
    fromRef: React.RefObject<HTMLElement>;
    toRef: React.RefObject<HTMLElement>;
    curvature?: number;
    reverse?: boolean;
    pathColor?: string;
    pathWidth?: number;
    pathOpacity?: number;
    gradientStartColor?: string;
    gradientStopColor?: string;
    delay?: number;
    duration?: number;
    className?: string;
}

export const AnimatedBeam = ({
    containerRef,
    fromRef,
    toRef,
    curvature = 0,
    reverse = false,
    pathColor = "rgba(255,255,255,0.1)",
    pathWidth = 2,
    pathOpacity = 0.6,
    gradientStartColor = "#F59E0B",
    gradientStopColor = "#FFFFFF",
    delay = 0,
    duration = 3,
    className,
}: AnimatedBeamProps) => {
    const gradientId = `beam-gradient-${Math.random().toString(36).slice(2)}`;
    const [pathData, setPathData] = useState("");
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updatePath = () => {
            if (!containerRef.current || !fromRef.current || !toRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const fromRect = fromRef.current.getBoundingClientRect();
            const toRect = toRef.current.getBoundingClientRect();

            const svgWidth = containerRect.width;
            const svgHeight = containerRect.height;
            setSvgDimensions({ width: svgWidth, height: svgHeight });

            const startX = fromRect.left - containerRect.left + fromRect.width / 2;
            const startY = fromRect.top - containerRect.top + fromRect.height / 2;
            const endX = toRect.left - containerRect.left + toRect.width / 2;
            const endY = toRect.top - containerRect.top + toRect.height / 2;

            const controlY = startY + curvature;
            setPathData(`M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`);
        };

        updatePath();
        const observer = new ResizeObserver(updatePath);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef, fromRef, toRef, curvature]);

    return (
        <svg
            fill="none"
            width={svgDimensions.width}
            height={svgDimensions.height}
            xmlns="http://www.w3.org/2000/svg"
            className={cn("pointer-events-none absolute left-0 top-0 transform-gpu", className)}
            viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        >
            <defs>
                <linearGradient
                    id={gradientId}
                    gradientUnits="userSpaceOnUse"
                    x1={reverse ? "100%" : "0%"}
                    x2={reverse ? "0%" : "100%"}
                >
                    <stop stopColor={gradientStartColor} stopOpacity="0" offset="0%" />
                    <stop stopColor={gradientStartColor} offset="30%" />
                    <stop stopColor={gradientStopColor} offset="60%" />
                    <stop stopColor={gradientStopColor} stopOpacity="0" offset="100%" />
                </linearGradient>
            </defs>
            {/* Static path */}
            <path
                d={pathData}
                stroke={pathColor}
                strokeWidth={pathWidth}
                strokeOpacity={pathOpacity}
                fill="none"
            />
            {/* Animated gradient beam */}
            <motion.path
                d={pathData}
                stroke={`url(#${gradientId})`}
                strokeWidth={pathWidth + 1}
                fill="none"
                strokeLinecap="round"
                initial={{
                    strokeDasharray: "12 200",
                    strokeDashoffset: 0,
                }}
                animate={{
                    strokeDashoffset: reverse ? 212 : -212,
                }}
                transition={{
                    duration,
                    delay,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </svg>
    );
};


import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface NumberTickerProps {
    value: number;
    decimalPlaces?: number;
    direction?: "up" | "down";
    delay?: number;
    duration?: number;
    className?: string;
}

export const NumberTicker = ({
    value,
    decimalPlaces = 0,
    direction = "up",
    delay = 0,
    duration = 1200,
    className,
}: NumberTickerProps) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-30px" });
    const [displayed, setDisplayed] = useState(direction === "up" ? 0 : value);

    useEffect(() => {
        if (!isInView) return;
        const timeout = setTimeout(() => {
            const from = direction === "up" ? 0 : value;
            const to = direction === "up" ? value : 0;
            const start = Date.now();

            const step = () => {
                const elapsed = Date.now() - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplayed(parseFloat((from + (to - from) * eased).toFixed(decimalPlaces)));
                if (progress < 1) requestAnimationFrame(step);
                else setDisplayed(to);
            };
            requestAnimationFrame(step);
        }, delay);
        return () => clearTimeout(timeout);
    }, [isInView, value, direction, delay, duration, decimalPlaces]);

    return (
        <span ref={ref} className={cn("tabular-nums", className)}>
            {displayed.toFixed(decimalPlaces)}
        </span>
    );
};

export default NumberTicker;

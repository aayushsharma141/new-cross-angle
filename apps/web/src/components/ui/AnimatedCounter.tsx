import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    className?: string;
    decimals?: number;
}

/**
 * Animated counter that counts up from 0 to target value
 * Uses intersection observer to trigger only when visible
 */
const AnimatedCounter = ({
    value,
    suffix = "",
    prefix = "",
    duration = 2,
    className = "",
    decimals = 0
}: AnimatedCounterProps) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!isInView || hasAnimated.current) return;

        hasAnimated.current = true;
        const startTime = Date.now();
        const endValue = value;

        const animate = () => {
            const now = Date.now();
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = endValue * easeOut;

            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value, duration]);

    const displayValue = decimals > 0
        ? count.toFixed(decimals)
        : Math.round(count).toLocaleString();

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3 }}
        >
            {prefix}{displayValue}{suffix}
        </motion.span>
    );
};

export default AnimatedCounter;

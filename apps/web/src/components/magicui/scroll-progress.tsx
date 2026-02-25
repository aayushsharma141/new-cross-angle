import { cn } from "@/lib/utils";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressProps {
    className?: string;
    color?: string;
}

export const ScrollProgress = ({
    className,
    color = "#d4a853",
}: ScrollProgressProps) => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] h-[2px] origin-left",
                className,
            )}
            style={{ scaleX, background: color }}
        />
    );
};

export default ScrollProgress;

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

interface HyperTextProps {
    text: string;
    duration?: number;
    className?: string;
    animateOnLoad?: boolean;
}

export const HyperText = ({
    text,
    duration = 800,
    className,
    animateOnLoad = true,
}: HyperTextProps) => {
    const [displayed, setDisplayed] = useState(animateOnLoad ? "" : text);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    const scramble = () => {
        const start = Date.now();
        const total = duration;

        const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / total, 1);
            const revealCount = Math.floor(progress * text.length);
            const scrambled = text
                .split("")
                .map((char, i) => {
                    if (i < revealCount) return char;
                    if (char === " ") return " ";
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                })
                .join("");
            setDisplayed(scrambled);
            if (progress < 1) requestAnimationFrame(step);
            else setDisplayed(text);
        };
        requestAnimationFrame(step);
    };

    useEffect(() => {
        if (animateOnLoad && isInView) scramble();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInView]);

    return (
        <span
            ref={ref}
            className={cn("inline-block font-mono cursor-default", className)}
            onMouseEnter={scramble}
        >
            {displayed || text}
        </span>
    );
};

export default HyperText;

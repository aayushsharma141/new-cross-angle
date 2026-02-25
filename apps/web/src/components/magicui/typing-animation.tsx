import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TypingAnimationProps {
    texts: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
}

export const TypingAnimation = ({
    texts,
    typingSpeed = 60,
    deletingSpeed = 35,
    pauseDuration = 2000,
    className,
}: TypingAnimationProps) => {
    const [displayed, setDisplayed] = useState("");
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) {
            const timer = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, pauseDuration);
            return () => clearTimeout(timer);
        }

        const currentText = texts[textIndex];

        if (!isDeleting) {
            if (displayed.length < currentText.length) {
                const timer = setTimeout(() => {
                    setDisplayed(currentText.slice(0, displayed.length + 1));
                }, typingSpeed);
                return () => clearTimeout(timer);
            } else {
                setIsPaused(true);
            }
        } else {
            if (displayed.length > 0) {
                const timer = setTimeout(() => {
                    setDisplayed(displayed.slice(0, -1));
                }, deletingSpeed);
                return () => clearTimeout(timer);
            } else {
                setIsDeleting(false);
                setTextIndex((i) => (i + 1) % texts.length);
            }
        }
    }, [displayed, isDeleting, isPaused, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <span className={cn("inline-block", className)}>
            {displayed}
            <span className="ml-0.5 inline-block w-[2px] h-[1em] bg-current align-middle animate-pulse" />
        </span>
    );
};

export default TypingAnimation;

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useGSAP } from "@/hooks/useGsap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface KineticTextProps {
    children: string;
    className?: string;
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
    preset?: "fade-up" | "char-reveal" | "word-reveal";
    stagger?: number;
    duration?: number;
    delay?: number;
}

export const KineticText = ({
    children,
    className,
    as: Component = "div",
    preset = "char-reveal",
    stagger = 0.03,
    duration = 0.8,
    delay = 0,
}: KineticTextProps) => {
    const { scope } = useGSAP((ctx) => {
        const chars = scope.current?.querySelectorAll(".kinetic-char");
        const words = scope.current?.querySelectorAll(".kinetic-word");
        const lines = scope.current?.querySelectorAll(".kinetic-line");

        if (preset === "char-reveal") {
            ctx.add(() => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: scope.current,
                        start: "top 85%",
                    },
                });

                tl.from(chars, {
                    y: "100%",
                    opacity: 0,
                    duration: duration,
                    stagger: stagger,
                    ease: "power4.out",
                    delay: delay,
                });
            });
        } else if (preset === "word-reveal") {
            ctx.add(() => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: scope.current,
                        start: "top 85%",
                    },
                });

                tl.from(words, {
                    y: 40,
                    opacity: 0,
                    duration: duration,
                    stagger: stagger * 2,
                    ease: "power3.out",
                    delay: delay,
                });
            });
        } else if (preset === "fade-up") {
            ctx.add(() => {
                gsap.from(scope.current, {
                    scrollTrigger: {
                        trigger: scope.current,
                        start: "top 85%",
                    },
                    y: 50,
                    opacity: 0,
                    duration: duration,
                    delay: delay,
                    ease: "power3.out"
                });
            });
        }
    }, [preset, duration, stagger, delay]);

    // Helper to split text
    const renderContent = () => {
        if (preset === "char-reveal") {
            return children.split("").map((char, i) => (
                <span
                    key={i}
                    className={cn(
                        "kinetic-char inline-block",
                        char === " " ? "whitespace-pre" : "whitespace-normal"
                    )}
                >
                    {char}
                </span>
            ));
        }

        if (preset === "word-reveal") {
            return children.split(" ").map((word, i) => (
                <span key={i} className="kinetic-word inline-block mr-[0.25em]">
                    {word}
                </span>
            ));
        }

        return children;
    };

    return (
        <Component
            ref={scope}
            className={cn("overflow-hidden", className)}
            aria-label={children} // Accessibility
        >
            {/* Screen reader only text for full context */}
            <span className="sr-only">{children}</span>
            {/* Visual split text with aria-hidden to avoid double reading */}
            <span aria-hidden="true">
                {renderContent()}
            </span>
        </Component>
    );
};

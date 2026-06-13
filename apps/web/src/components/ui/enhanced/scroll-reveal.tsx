import { cn } from "@/lib/utils";
import { useGSAP } from "@/hooks/useGsap";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    animation?: "fade-up" | "fade-in" | "scale-up" | "slide-in-right" | "slide-in-left";
    duration?: number;
    delay?: number;
    stagger?: number;
    threshold?: number; // 0 to 1
    once?: boolean;
}

export const ScrollReveal = ({
    children,
    className,
    animation = "fade-up",
    duration = 0.8,
    delay = 0,
    threshold = 0.2, // Trigger when 20% in view
    once = true,
}: ScrollRevealProps) => {
    const { scope } = useGSAP((ctx, gsap) => {
        // Initial states based on animation type
        let initialVars: Record<string, unknown> = {};

        switch (animation) {
            case "fade-up":
                initialVars = { y: 50, opacity: 0 };
                break;
            case "fade-in":
                initialVars = { opacity: 0 };
                break;
            case "scale-up":
                initialVars = { scale: 0.8, opacity: 0 };
                break;
            case "slide-in-right":
                initialVars = { x: 50, opacity: 0 };
                break;
            case "slide-in-left":
                initialVars = { x: -50, opacity: 0 };
                break;
        }

        ctx.add(() => {
            const element = scope.current?.children[0];
            if (!element) return;

            gsap.from(element, {
                ...initialVars,
                duration: duration,
                delay: delay,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: `top ${100 - (threshold * 100)}%`, // e.g., "top 80%"
                    toggleActions: once ? "play none none none" : "play reverse play reverse",
                }
            });
        });
    }, [animation, duration, delay, threshold, once]);

    return (
        <div ref={scope} className={cn(className)}>
            {children}
        </div>
    );
};

import { useEffect, useRef } from "react";

interface Props {
    /** Full rotation cycle in seconds. User requested 18-22s. */
    duration?: number;
    className?: string;
}

/**
 * Rotating conic-gradient glow that creates a slow, iridescent sheen.
 * Used behind the CTA / CTAContact section.
 * Pure CSS rotation – GPU-composited (no layout triggers).
 * Disabled for prefers-reduced-motion.
 */
const IridescenceGlow = ({ duration = 20, className = "" }: Props) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--ir-duration", `${duration}s`);
        el.classList.add("ir-animated");
    }, [duration]);

    return (
        <>
            <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .ir-animated .ir-orb {
            animation: ir-spin var(--ir-duration, 20s) linear infinite;
          }
        }
        @keyframes ir-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
            <div
                ref={ref}
                aria-hidden="true"
                className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
                style={{ zIndex: 0 }}
            >
                {/* Primary iridescent orb – centered, large, very blurred */}
                <div
                    className="ir-orb absolute"
                    style={{
                        width: "140%",
                        height: "140%",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              hsl(352 78% 31% / 0.06) 60deg,
              hsl(30 60% 70% / 0.04) 120deg,
              hsl(352 78% 45% / 0.05) 180deg,
              transparent 240deg,
              hsl(20 40% 60% / 0.03) 300deg,
              transparent 360deg
            )`,
                        filter: "blur(50px)",
                    }}
                />
                {/* Secondary warm accent */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: "40%",
                        height: "40%",
                        top: "30%",
                        left: "60%",
                        background: "radial-gradient(circle, hsl(352 78% 31% / 0.05) 0%, transparent 70%)",
                        filter: "blur(30px)",
                    }}
                />
            </div>
        </>
    );
};

export default IridescenceGlow;

import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface Ripple {
    id: number;
    x: number;
    y: number;
}

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    rippleColor?: string;
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
    ({ children, className, rippleColor = "rgba(212,168,83,0.3)", onClick, ...props }, ref) => {
        const [ripples, setRipples] = useState<Ripple[]>([]);

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const id = Date.now();
            setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
            setTimeout(() => setRipples((r) => r.filter((rr) => rr.id !== id)), 700);
            onClick?.(e);
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "relative overflow-hidden border border-white/15 px-8 py-3",
                    "text-sm tracking-[0.15em] uppercase text-white/60",
                    "transition-colors duration-300 hover:border-white/30 hover:text-white/90",
                    className,
                )}
                onClick={handleClick}
                {...props}
            >
                {ripples.map((r) => (
                    <span
                        key={r.id}
                        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-ripple rounded-full"
                        style={{
                            left: r.x,
                            top: r.y,
                            width: 10,
                            height: 10,
                            background: rippleColor,
                        }}
                    />
                ))}
                <span className="relative z-10">{children}</span>
            </button>
        );
    },
);
RippleButton.displayName = "RippleButton";
export default RippleButton;

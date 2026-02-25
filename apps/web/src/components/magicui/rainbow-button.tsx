import { cn } from "@/lib/utils";
import React from "react";

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "group relative inline-flex cursor-pointer items-center justify-center overflow-hidden",
                    "px-8 py-3 font-medium",
                    "text-sm tracking-[0.15em] uppercase text-white",
                    "transition-all duration-300 ease-in-out",
                    "animate-rainbow",
                    "bg-[length:200%] bg-[linear-gradient(#0D0A08,#0D0A08)_padding-box,_conic-gradient(from_var(--angle),#d4a853,#fff7d6,#f59e0b,#d4a853,#fff7d6,#d4a853)_border-box]",
                    "border-[1.5px] border-transparent",
                    "before:absolute before:inset-0 before:bg-[linear-gradient(#0D0A08,#0D0A08)] before:content-['']",
                    className,
                )}
                {...props}
            >
                <span className="relative z-10">{children}</span>
            </button>
        );
    },
);
RainbowButton.displayName = "RainbowButton";
export default RainbowButton;

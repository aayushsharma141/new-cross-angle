import { cn } from "@/lib/utils";

interface BorderBeamProps {
    size?: number;
    duration?: number;
    delay?: number;
    colorFrom?: string;
    colorTo?: string;
    className?: string;
}

export const BorderBeam = ({
    size = 200,
    duration = 8,
    delay = 0,
    colorFrom = "#d4a853",
    colorTo = "transparent",
    className,
}: BorderBeamProps) => {
    return (
        <div
            style={
                {
                    "--size": size,
                    "--duration": duration,
                    "--delay": `-${delay}s`,
                    "--color-from": colorFrom,
                    "--color-to": colorTo,
                    "--border-width": "1.5px",
                } as React.CSSProperties
            }
            className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit]",
                "[border:calc(var(--border-width)*1px)_solid_transparent]",
                "[background:linear-gradient(#0D0A08,#0D0A08)_padding-box,conic-gradient(from_calc(360deg*(var(--start)/100)),var(--color-to)_0deg,var(--color-from)_10deg,var(--color-to)_20deg)_border-box]",
                "animate-border-beam",
                className,
            )}
        />
    );
};

export default BorderBeam;

import { useId } from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    width?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    height?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    x?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cx?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cy?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cr?: any;
    className?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

function DotPattern({
    width = 16,
    height = 16,
    x = 0,
    y = 0,
    cx = 1,
    cy = 1,
    cr = 1,
    className,
    ...props
}: DotPatternProps) {
    const id = useId();

    return (
        <svg
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80",
                className,
            )}
            {...props}
        >
            <defs>
                <pattern
                    id={id}
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                    patternContentUnits="userSpaceOnUse"
                    x={x}
                    y={y}
                >
                    <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
        </svg>
    );
}

export default DotPattern;

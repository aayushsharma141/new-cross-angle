import { AlertTriangle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotlightCard, CountUp } from "@/components/ReactBits/index";
import { InlineHelp } from "@/design-system/components/ui/InlineHelp";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { SparklineChart } from "@/components/admin/analytics/SparklineChart";

interface AdminKPIProps {
    title: string;
    value: string | number;
    /** Pass the raw numeric value separately to enable CountUp animation */
    numericValue?: number;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: LucideIcon;
    variant?: "gold" | "secondary" | "accent";
    isLoading?: boolean;
    /** When true, the underlying data source failed — render `—` + warning chip. */
    isError?: boolean;
    /** Screen-reader-friendly error description (e.g. "Projects query failed"). */
    errorLabel?: string;
    sparklineData?: number[];
    tooltip?: string;
}

export function AdminKPI({
    title,
    value,
    numericValue,
    change,
    trend,
    icon: Icon,
    variant = "gold",
    isLoading = false,
    isError = false,
    errorLabel,
    sparklineData,
    tooltip,
}: AdminKPIProps) {
    const variants = {
        gold: "text-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary-muted))] border-[hsl(var(--admin-primary))]/20",
        secondary: "text-[hsl(var(--admin-info))] bg-[hsl(var(--admin-info-muted))] border-[hsl(var(--admin-info))]/20",
        accent: "text-[hsl(var(--admin-success))] bg-[hsl(var(--admin-success-muted))] border-[hsl(var(--admin-success))]/20",
    };

    const spotlightColors = {
        gold: "rgba(212, 175, 55, 0.18)",
        secondary: "rgba(96, 165, 250, 0.18)",
        accent: "rgba(52, 211, 153, 0.18)",
    };

    const sparklineColors = {
        gold: "hsl(var(--admin-primary))",
        secondary: "hsl(var(--admin-info))",
        accent: "hsl(var(--admin-success))",
    };

    // Use CountUp if a numeric value is provided and data is loaded (not "…")
    const isActuallyLoaded = !isLoading && !isError && value !== "…";
    const displayNumeric = numericValue !== undefined && isActuallyLoaded;

    return (
        <SpotlightCard
            spotlightColor={spotlightColors[variant]}
            className="rounded-xl border border-admin-border bg-admin-card group hover:border-admin-gold/30 transition-all duration-300"
        >
            <div className="relative overflow-hidden p-6" title={tooltip}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-admin-muted tracking-wide flex items-center gap-2">
                            {title}
                            {tooltip && (
                                <InlineHelp text={tooltip} />
                            )}
                            {isError && (
                                <span
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-admin-warning"
                                    role="img"
                                    aria-label={errorLabel ?? `${title} failed to load`}
                                    title={errorLabel ?? `${title} failed to load`}
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                </span>
                            )}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                            {isLoading ? (
                                <Skeleton className="h-8 w-24 bg-zinc-800/50" />
                            ) : isError ? (
                                <h3
                                    className="text-3xl font-display font-semibold text-admin-muted"
                                    aria-label={errorLabel ?? `${title} failed to load`}
                                >
                                    —
                                </h3>
                            ) : (
                                <h3 className="text-3xl font-display font-semibold text-admin-foreground">
                                    {displayNumeric ? (
                                        <CountUp
                                            to={numericValue}
                                            duration={1.6}
                                            delay={0.1}
                                            className="text-3xl font-display font-semibold text-admin-foreground"
                                        />
                                    ) : (
                                        value
                                    )}
                                </h3>
                            )}
                            {!isLoading && !isError && change && (
                                <span
                                    className={cn(
                                        "text-xs font-medium px-2 py-0.5 rounded-md",
                                        trend === "up" ? "text-[hsl(var(--admin-success))] bg-[hsl(var(--admin-success-muted))]" :
                                            trend === "down" ? "text-[hsl(var(--admin-danger))] bg-[hsl(var(--admin-danger-muted))]" : "text-admin-muted bg-[hsl(var(--admin-surface))]"
                                    )}
                                >
                                    {change}
                                </span>
                            )}
                            {isLoading && change && (
                                <Skeleton className="h-4 w-16 bg-zinc-800/30 rounded" />
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                        <div className={cn("p-3 rounded-lg border backdrop-blur-sm", variants[variant])}>
                            <Icon className="w-5 h-5" />
                        </div>
                        {sparklineData && !isLoading && !isError && (
                            <div className="mt-auto">
                                <SparklineChart data={sparklineData} color={sparklineColors[variant]} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative Glow */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl group-hover:from-admin-gold/5 transition-colors" />
            </div>
        </SpotlightCard>
    );
}

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotlightCard, CountUp } from "@/components/ReactBits";
import { Skeleton } from "@/components/ui/skeleton";

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
}

export function AdminKPI({
    title,
    value,
    numericValue,
    change,
    trend,
    icon: Icon,
    variant = "gold",
    isLoading = false
}: AdminKPIProps) {
    const variants = {
        gold: "text-admin-gold bg-admin-gold/10 border-admin-gold/20",
        secondary: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        accent: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    };

    const spotlightColors = {
        gold: "rgba(212, 175, 55, 0.18)",
        secondary: "rgba(96, 165, 250, 0.18)",
        accent: "rgba(52, 211, 153, 0.18)",
    };

    // Use CountUp if a numeric value is provided and data is loaded (not "…")
    const isActuallyLoaded = !isLoading && value !== "…";
    const displayNumeric = numericValue !== undefined && isActuallyLoaded;

    return (
        <SpotlightCard
            spotlightColor={spotlightColors[variant]}
            className="rounded-xl border border-admin-border bg-admin-card group hover:border-admin-gold/30 transition-all duration-300"
        >
            <div className="relative overflow-hidden p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-admin-muted uppercase tracking-wider">{title}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            {isLoading ? (
                                <Skeleton className="h-8 w-24 bg-zinc-800/50" />
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
                            {!isLoading && change && (
                                <span
                                    className={cn(
                                        "text-xs font-medium px-1.5 py-0.5 rounded",
                                        trend === "up" ? "text-emerald-400 bg-emerald-400/10" :
                                            trend === "down" ? "text-rose-400 bg-rose-400/10" : "text-admin-muted"
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
                    <div className={cn("p-3 rounded-lg border backdrop-blur-sm", variants[variant])}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>

                {/* Decorative Glow */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl group-hover:from-admin-gold/5 transition-colors" />
            </div>
        </SpotlightCard>
    );
}

import { LucideIcon, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    gradient?: string;
    bgGradient?: string;
    shadowColor?: string;
    className?: string;
    link?: string;
}

// Enhanced StatCard component with gradient backgrounds
export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    gradient = "from-orange-500 to-orange-600",
    bgGradient = "from-orange-500/10 to-orange-500/5",
    shadowColor = "shadow-orange-500/50",
    className,
    link
}: StatCardProps) {
    const cardContent = (
        <div className={cn(
            "relative overflow-hidden rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6 shadow-sm transition-all duration-300",
            link && "cursor-pointer hover:shadow-lg hover:-translate-y-1 group",
            className
        )}>
            {/* Background Gradient Blob */}
            <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl bg-gradient-to-br",
                bgGradient
            )} />

            <div className="relative">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "p-3 rounded-xl shadow-lg bg-gradient-to-br",
                        gradient,
                        shadowColor
                    )}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>

                    {trend && (
                        <div className={cn(
                            "px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1",
                            trend.isPositive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                            {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(trend.value)}%
                        </div>
                    )}
                </div>

                {/* Title */}
                <p className="text-sm font-medium text-[hsl(var(--admin-muted))] mb-1">
                    {title}
                </p>

                {/* Value */}
                <div className="flex items-baseline gap-2 mb-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[hsl(var(--admin-foreground))]">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h2>
                </div>

                {/* Subtitle */}
                {trend && (
                    <p className="text-xs text-[hsl(var(--admin-muted))]">
                        {trend.label}
                    </p>
                )}

                {/* Hover Arrow Indicator */}
                {link && (
                    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4 text-[hsl(var(--admin-muted))]" />
                    </div>
                )}
            </div>
        </div>
    );

    if (link) {
        return <Link to={link}>{cardContent}</Link>;
    }

    return cardContent;
}

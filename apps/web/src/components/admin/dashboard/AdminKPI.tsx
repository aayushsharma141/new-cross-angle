import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminKPIProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: LucideIcon;
    variant?: "gold" | "secondary" | "accent";
}

export function AdminKPI({ title, value, change, trend, icon: Icon, variant = "gold" }: AdminKPIProps) {
    const variants = {
        gold: "text-admin-gold bg-admin-gold/10 border-admin-gold/20",
        secondary: "text-blue-400 bg-blue-400/10 border-blue-400/20", // Using explicit colors for variation
        accent: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    };

    return (
        <div className="relative overflow-hidden rounded-xl border border-admin-border bg-admin-card p-6 group hover:border-admin-gold/30 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-admin-muted uppercase tracking-wider">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <h3 className="text-3xl font-display font-semibold text-admin-foreground">{value}</h3>
                        {change && (
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
                    </div>
                </div>
                <div className={cn("p-3 rounded-lg border backdrop-blur-sm", variants[variant])}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl group-hover:from-admin-gold/5 transition-colors" />
        </div>
    );
}

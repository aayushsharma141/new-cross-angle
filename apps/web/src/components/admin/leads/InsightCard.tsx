import { cn } from "@/lib/utils";
import { Surface } from "@/components/primitives/foundation";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  Bell,
  type LucideIcon,
} from "lucide-react";

type InsightType = "opportunity" | "risk" | "recommendation" | "alert";

interface Insight {
  type: InsightType;
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  trend?: "up" | "down" | "neutral";
  timestamp?: string;
}

interface InsightCardProps {
  insight: Insight;
  onDismiss?: () => void;
  className?: string;
}

const INSIGHT_CONFIG: Record<InsightType, {
  icon: LucideIcon;
  bg: string;
  border: string;
  text: string;
  label: string;
}> = {
  opportunity: {
    icon: TrendingUp,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    label: "Opportunity",
  },
  risk: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-500",
    label: "Risk",
  },
  recommendation: {
    icon: Lightbulb,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-500",
    label: "Insight",
  },
  alert: {
    icon: Bell,
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-500",
    label: "Alert",
  },
};

export function InsightCard({ insight, onDismiss, className }: InsightCardProps) {
  const config = INSIGHT_CONFIG[insight.type];
  const Icon = config.icon;

  return (
    <Surface variant="primary" radius="lg" border shadow="sm"
      className={cn(
        "border-l-4 bg-card/80 hover:bg-card transition-colors group",
        config.border,
        className
      )}
    >
      <div className="p-6 pt-0" className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", config.bg)}>
              <Icon className={cn("w-4 h-4", config.text)} />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.text)}>
                  {config.label}
                </span>
                {insight.trend && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    {insight.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                    {insight.trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
                    {insight.trend === "neutral" && <Minus className="w-3 h-3" />}
                    <span className={cn(
                      insight.trend === "up" && "text-emerald-500",
                      insight.trend === "down" && "text-red-500"
                    )}>
                      {insight.trend === "up" ? "Trending up" : insight.trend === "down" ? "Trending down" : "Stable"}
                    </span>
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm leading-tight">{insight.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 shrink-0">
            {insight.metric && (
              <div className="text-right">
                <div className="text-lg font-display font-bold leading-none">{insight.metric}</div>
                {insight.metricLabel && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">{insight.metricLabel}</div>
                )}
              </div>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-foreground text-xs px-1 py-0.5 rounded"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {insight.timestamp && (
          <div className="text-[10px] text-muted-foreground/60 pt-1 border-t border-border/50">
            {insight.timestamp}
          </div>
        )}
      </div>
    </Surface>
  );
}

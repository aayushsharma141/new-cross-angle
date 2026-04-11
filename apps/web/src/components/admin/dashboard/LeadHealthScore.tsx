import { cn } from "@/lib/utils";
import type { LeadHealth } from "@/lib/leadScoring";
import { AlertTriangle, CheckCircle, Clock, TrendingDown } from "lucide-react";

interface LeadHealthScoreProps {
  health: LeadHealth;
  /** show as compact inline chip vs full card */
  compact?: boolean;
}

export function LeadHealthScore({ health, compact = false }: LeadHealthScoreProps) {
  const { completeness, freshnessDays, isStale, riskLevel } = health;

  const riskConfig = {
    low:    { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle,    label: "Healthy" },
    medium: { color: "text-amber-500",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: Clock,          label: "Needs Attention" },
    high:   { color: "text-red-500",     bg: "bg-red-500/10",     border: "border-red-500/20",     icon: AlertTriangle,  label: "At Risk" },
  }[riskLevel];

  const Icon = riskConfig.icon;

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full border",
          riskConfig.color, riskConfig.bg, riskConfig.border
        )}
        title={`Health: ${riskConfig.label} | Completeness: ${completeness}% | Last activity: ${freshnessDays}d ago`}
      >
        <Icon className="h-2.5 w-2.5" /> {riskConfig.label}
      </span>
    );
  }

  return (
    <div className={cn("rounded-xl border p-4 space-y-3", riskConfig.bg, riskConfig.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", riskConfig.color)} />
          <span className={cn("text-sm font-semibold", riskConfig.color)}>
            {riskConfig.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">Health Score</span>
      </div>

      {/* Completeness bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Data Completeness</span>
          <span className="font-medium text-foreground">{completeness}%</span>
        </div>
        <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              completeness >= 80 ? "bg-emerald-500" : completeness >= 50 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Freshness */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {isStale ? (
          <>
            <TrendingDown className="h-3 w-3 text-amber-500" />
            <span className="text-amber-500">
              {freshnessDays}d inactive — needs follow-up
            </span>
          </>
        ) : (
          <>
            <Clock className="h-3 w-3" />
            <span>Last activity {freshnessDays}d ago</span>
          </>
        )}
      </div>
    </div>
  );
}

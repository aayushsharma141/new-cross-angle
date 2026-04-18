import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { leadRepo } from "@/repositories";
import { PageSkeleton } from "@/components/ui/enhanced/PageSkeleton";
import {
  calculateLeadScore,
  getLeadHealth,
  getLeadTemperature,
  buildForecast,
  formatINR,
  getWeightedValue,
  type Lead,
} from "@/lib/scoring/leadScoring";
import { leadStatusOptions } from "@/lib/validation/validations";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  DollarSign,
  Clock,
  Target,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import { AnalyticsKpiRow } from "@/components/admin/analytics/AnalyticsKpiRow";
import { FunnelWidget } from "@/components/admin/analytics/FunnelWidget";
import type { LucideIcon } from "lucide-react";

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  consultation_scheduled: "Consultation",
  proposal_sent: "Proposal",
  negotiation: "Negotiation",
  final_review: "Final Review",
  won: "Won",
  lost: "Lost",
};

const SOURCE_LABELS: Record<string, string> = {
  website_contact: "Website",
  estimator: "Estimator",
  style_quiz: "Style Quiz",
  welcome_popup: "Popup",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  referral: "Referral",
  other: "Other",
};

const CHART_COLORS = [
  "#F59E0B", "#10B981", "#6366F1", "#F43F5E",
  "#22D3EE", "#A78BFA", "#FB923C", "#84CC16",
];

// ──────────────────────────────────────────────────────────────
// Chart wrappers
// ──────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-admin-muted mb-3">
      {children}
    </h3>
  );
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-admin-card border border-admin-border rounded-xl p-4 analytics-glass", className)}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

export default function CrmAnalytics() {
  const { data: rawLeads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      try {
        const raw = await leadRepo.getLeads();
        if (!Array.isArray(raw)) return [];
        
        return (raw as unknown as Lead[]).map((l) => ({
          ...l,
          score: l.score ?? (l ? calculateLeadScore(l) : 0),
        }));
      } catch (err) {
        console.error("Error in lead queryFn:", err);
        return [];
      }
    },
  });

  const forecast = useMemo(() => {
    try {
      return buildForecast(rawLeads);
    } catch (err) {
      console.error("Forecast Error:", err);
      return { committed: 0, bestCase: 0, atRisk: [], stale: [], totalOpenValue: 0 };
    }
  }, [rawLeads]);

  // ── Funnel data — ordered pipeline stages
  const funnelData = useMemo(() => {
    try {
      const orderedStages = leadStatusOptions.filter((s) => s !== "won" && s !== "lost");
      return orderedStages
        .map((status) => {
          const leadsAtStage = rawLeads.filter((l) => l && l.status === status);
          const count = leadsAtStage.length;
          const value = leadsAtStage.reduce((sum, l) => sum + (l.budget_value_inr ?? 0), 0);
          return { name: STATUS_LABELS[status] ?? status, count, value };
        })
        .filter((d) => d.count > 0);
    } catch (err) {
      console.error("Funnel Data Error:", err);
      return [];
    }
  }, [rawLeads]);

  // ── Source distribution
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    rawLeads.forEach((l) => {
      const src = l.source || l.lead_source || "other";
      map[src] = (map[src] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([key, count]) => ({ name: SOURCE_LABELS[key] ?? key, count }))
      .sort((a, b) => b.count - a.count);
  }, [rawLeads]);

  // ── Temperature distribution
  const tempData = useMemo(() => {
    let hot = 0, warm = 0, cold = 0;
    rawLeads.forEach((l) => {
      const t = getLeadTemperature(l.score ?? 0).priority;
      if (t === "hot") hot++;
      else if (t === "warm") warm++;
      else cold++;
    });
    return [
      { name: "Hot 🔥", count: hot, fill: "#EF4444" },
      { name: "Warm 🌡️", count: warm, fill: "#F59E0B" },
      { name: "Cold ❄️", count: cold, fill: "#60A5FA" },
    ];
  }, [rawLeads]);

  // ── Stale leads
  const staleLeads = useMemo(
    () =>
      rawLeads
        .filter((l) => getLeadHealth(l).isStale && l.status !== "won" && l.status !== "lost")
        .sort((a, b) => getLeadHealth(b).freshnessDays - getLeadHealth(a).freshnessDays)
        .slice(0, 8),
    [rawLeads]
  );

  // ── Score distribution  
  const scoreData = useMemo(() => {
    const buckets: Record<string, number> = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
    rawLeads.forEach((l) => {
      const s = l.score ?? 0;
      if (s <= 20) buckets["0-20"]++;
      else if (s <= 40) buckets["21-40"]++;
      else if (s <= 60) buckets["41-60"]++;
      else if (s <= 80) buckets["61-80"]++;
      else buckets["81-100"]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [rawLeads]);

  // ── Won/Lost this month
  const wonCount = rawLeads.filter((l) => l.status === "won").length;
  const lostCount = rawLeads.filter((l) => l.status === "lost").length;
  const hotCount = rawLeads.filter((l) => (l.score ?? 0) >= 70).length;

  // ── Time to close (avg days from created_at → closed_at for won leads)
  const avgTimeToClose = useMemo(() => {
    const wonWithDates = rawLeads.filter(
      (l) => l.status === "won" && l.created_at && l.closed_at
    );
    if (!wonWithDates.length) return null;
    const totalDays = wonWithDates.reduce((sum, l) => {
      return sum + differenceInDays(new Date(l.closed_at!), new Date(l.created_at));
    }, 0);
    return Math.round(totalDays / wonWithDates.length);
  }, [rawLeads]);

  // ── Win rate
  const winRate = useMemo(() => {
    const closed = wonCount + lostCount;
    if (!closed) return null;
    return Math.round((wonCount / closed) * 100);
  }, [wonCount, lostCount]);

  if (isLoading) return <PageSkeleton />;

  if (!rawLeads || rawLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Users className="h-12 w-12 text-muted-foreground opacity-20" />
        <div className="text-center">
          <h2 className="text-lg font-medium">No Leads Found</h2>
          <p className="text-sm text-muted-foreground mt-1">Start by adding leads to see your analytics dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── Overview KPIs — Row 1 ── */}
      <AnalyticsKpiRow
        metrics={[
          {
            title: "Pipeline Value",
            value: formatINR(forecast.totalOpenValue),
            icon: DollarSign as LucideIcon,
            variant: "gold",
            change: `${formatINR(forecast.bestCase)} weighted`,
            trend: "neutral",
          },
          {
            title: "Committed",
            value: formatINR(forecast.committed),
            icon: TrendingUp as LucideIcon,
            variant: "accent",
            change: "Won + Negotiation + Final Review",
            trend: "up",
          },
          {
            title: "Hot Leads",
            value: String(hotCount),
            numericValue: hotCount,
            icon: Zap as LucideIcon,
            variant: "accent",
            change: `${Math.round((hotCount / Math.max(rawLeads.length, 1)) * 100)}% of pipeline`,
            trend: "neutral",
          },
          {
            title: "Deals Won",
            value: String(wonCount),
            numericValue: wonCount,
            icon: CheckCircle as LucideIcon,
            variant: "accent",
            change: winRate !== null ? `${winRate}% win rate` : undefined,
            trend: winRate !== null ? "up" : "neutral",
          },
        ]}
        isLoading={isLoading}
      />

      {/* ── Overview KPIs — Row 2 ── */}
      <AnalyticsKpiRow
        metrics={[
          {
            title: "Total Leads",
            value: String(rawLeads.length),
            numericValue: rawLeads.length,
            icon: Users as LucideIcon,
            variant: "secondary",
            change: `${wonCount + lostCount} closed`,
            trend: "neutral",
          },
          {
            title: "Stale Leads",
            value: String(forecast.stale.length),
            numericValue: forecast.stale.length,
            icon: AlertTriangle as LucideIcon,
            variant: "accent",
            change: forecast.stale.length > 0 ? "Needs follow-up" : "All fresh",
            trend: forecast.stale.length > 0 ? "down" : "up",
          },
          {
            title: "At Risk",
            value: String(forecast.atRisk.length),
            numericValue: forecast.atRisk.length,
            icon: Flame as LucideIcon,
            variant: "accent",
            change: "Hot leads, 7d+ inactive",
            trend: forecast.atRisk.length > 0 ? "down" : "up",
          },
          {
            title: "Avg Deal Size",
            value: formatINR(
              rawLeads.filter(l => (l.budget_value_inr ?? 0) > 0).reduce((s, l) => s + (l.budget_value_inr ?? 0), 0)
              / Math.max(rawLeads.filter(l => (l.budget_value_inr ?? 0) > 0).length, 1)
            ),
            icon: DollarSign as LucideIcon,
            variant: "gold",
            change: avgTimeToClose !== null ? `${avgTimeToClose}d avg close` : "No won deals yet",
            trend: "neutral",
          },
        ]}
        isLoading={isLoading}
      />

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Funnel */}
        <FunnelWidget
          data={funnelData.map((stage, i) => ({
            name: stage.name,
            value: stage.count,
            conversion: funnelData[0]?.count
              ? `${Math.round((stage.count / funnelData[0].count) * 100)}%`
              : "—",
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          title="Pipeline Funnel"
          description="Lead volume by stage"
          isLoading={isLoading}
        />

        {/* Source Distribution */}
        <ChartCard title="Lead Source Breakdown">
          <div className="flex gap-4 items-start">
            <ResponsiveContainer width="45%" height={160}>
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--admin-surface))",
                    border: "1px solid hsl(var(--admin-border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1 pt-2">
              {sourceData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature distribution */}
        <ChartCard title="Lead Temperature Distribution">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tempData} barSize={36}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--admin-surface))",
                  border: "1px solid hsl(var(--admin-border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {tempData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Score distribution */}
        <ChartCard title="Lead Score Distribution">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={scoreData} barSize={28}>
              <XAxis
                dataKey="range"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--admin-surface))",
                  border: "1px solid hsl(var(--admin-border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Stale Lead Queue ── */}
      {staleLeads.length > 0 && (
        <div className="bg-admin-card border border-amber-500/30 rounded-xl p-4 analytics-glass">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-500">
              Stale Lead Queue — {staleLeads.length} leads need follow-up
            </h3>
          </div>
          <div className="space-y-2">
            {staleLeads.map((lead) => {
              const health = getLeadHealth(lead);
              const tempInfo = getLeadTemperature(lead.score ?? 0);
              return (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-3 text-sm py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{lead.name}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full", tempInfo.color)}>
                      {tempInfo.emoji} {tempInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                    <span className="capitalize">{STATUS_LABELS[lead.status] ?? lead.status}</span>
                    <span className="text-amber-500 font-medium">
                      {health.freshnessDays}d inactive
                    </span>
                    {lead.budget_value_inr && (
                      <span className="text-emerald-400">{formatINR(lead.budget_value_inr)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InsightCard } from "@/components/admin/dashboard/InsightCard";
import { AdminKPI } from "@/components/admin/dashboard/AdminKPI";
import { ProjectPipelineChart } from "@/components/admin/analytics/ProjectPipelineChart";
import { PosthogFunnelChart } from "@/components/admin/analytics/PosthogFunnelChart";
import { Users, TrendingUp, Eye, Target, BarChart3 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { endOfDay, differenceInDays, subDays, format, startOfDay } from "date-fns";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface OverviewTabProps {
  date?: DateRange;
  changeTab: (tab: "overview" | "traffic" | "sales" | "system" | "content") => void;
}

const OverviewTab = ({ date, changeTab }: OverviewTabProps) => {
  const [closedInsights, setClosedInsights] = useState<Set<string>>(new Set());

  const handleDismissInsight = (id: string) => {
    setClosedInsights((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const currentFrom = date?.from;
  const currentTo = date?.to ? endOfDay(date.to) : undefined;
  const fromIso = currentFrom?.toISOString();
  const toIso = currentTo?.toISOString();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats-overview", date],
    queryFn: async () => {
      let previousFromIso: string | undefined;
      let previousToIso: string | undefined;

      if (currentFrom && currentTo) {
        const daysDiff = differenceInDays(currentTo, currentFrom) + 1;
        previousFromIso = subDays(currentFrom, daysDiff).toISOString();
        previousToIso = subDays(currentTo, daysDiff).toISOString();
      }

      let leadsQuery = supabase.from("leads").select("id, status", { count: "exact" });
      let estimateQuery = supabase.from("leads").select("id, estimated_min", { count: "exact" }).eq("lead_source", "estimator");

      if (fromIso) {
        leadsQuery = leadsQuery.gte("created_at", fromIso);
        estimateQuery = estimateQuery.gte("created_at", fromIso);
      }
      if (toIso) {
        leadsQuery = leadsQuery.lte("created_at", toIso);
        estimateQuery = estimateQuery.lte("created_at", toIso);
      }

      let prevLeadsQuery = supabase.from("leads").select("id", { count: "exact" });
      if (previousFromIso && previousToIso) {
        prevLeadsQuery = prevLeadsQuery.gte("created_at", previousFromIso).lte("created_at", previousToIso);
      }

      const trafficRes = await supabase.functions.invoke("posthog-query", {
        body: {
          action: "traffic-stats",
          from: fromIso || subDays(new Date(), 30).toISOString(),
          to: toIso || new Date().toISOString()
        }
      });

      const [leadsRes, estimateRes, prevLeadsRes] = await Promise.all([
        leadsQuery,
        estimateQuery,
        previousFromIso ? prevLeadsQuery : Promise.resolve({ count: 0, error: null }),
      ]);

      const leads = leadsRes.data || [];
      const totalLeads = leadsRes.count || 0;
      const wonLeads = leads.filter((l) => l.status === "won").length;
      const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

      const prevLeadsCount = prevLeadsRes.count || 0;
      const leadsTrend = prevLeadsCount > 0 ? Math.round(((totalLeads - prevLeadsCount) / prevLeadsCount) * 100) : totalLeads > 0 ? 100 : 0;

      const estimates = estimateRes.data || [];
      const pipelineValue = estimates.reduce((sum: number, e) => sum + (Number(e.estimated_min) || 0), 0);

      return {
        leads: totalLeads,
        leadsTrend,
        conversionRate,
        pipelineValue,
        pageViews: trafficRes.data?.views || 0,
      };
    },
  });

  // Lead trend over time
  const { data: leadTimeline = [] } = useQuery({
    queryKey: ["overview-lead-timeline", date],
    queryFn: async () => {
      const days = differenceInDays(currentTo || new Date(), currentFrom || subDays(new Date(), 30)) + 1;
      const numDays = Math.min(days, 30);
      const dateList = Array.from({ length: numDays }, (_, i) => subDays(currentTo || new Date(), numDays - 1 - i));
      const from = startOfDay(dateList[0]).toISOString();

      const { data } = await supabase
        .from("leads")
        .select("created_at")
        .gte("created_at", from)
        .lte("created_at", (currentTo || new Date()).toISOString());

      return dateList.map((d) => {
        const dayStr = format(d, "yyyy-MM-dd");
        const count = (data || []).filter((l) => format(new Date(l.created_at!), "yyyy-MM-dd") === dayStr).length;
        return { name: format(d, "MMM d"), leads: count };
      });
    },
  });

  // Lead status breakdown for mini bar chart
  const { data: statusBreakdown = [] } = useQuery({
    queryKey: ["overview-status-breakdown", date],
    queryFn: async () => {
      let query = supabase.from("leads").select("status");
      if (fromIso) query = query.gte("created_at", fromIso);
      if (toIso) query = query.lte("created_at", toIso);

      const { data } = await query;
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        counts[row.status] = (counts[row.status] || 0) + 1;
      }
      const colors: Record<string, string> = {
        new: "hsl(var(--admin-primary))",
        in_conversation: "hsl(var(--admin-primary))",
        meeting_planned: "hsl(var(--admin-primary))",
        quote_sent: "hsl(var(--admin-primary))",
        closing: "hsl(var(--admin-primary))",
        won: "hsl(var(--admin-success))",
        lost: "hsl(var(--admin-error))",
      };
      return Object.entries(counts).map(([name, value]) => ({ name, value, color: colors[name] || "hsl(0,0%,50%)" }));
    },
  });

  const fmt = (v: number | string | undefined | null): string => (v == null ? "..." : typeof v === "number" ? v.toLocaleString() : v);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {!closedInsights.has("conv-anomaly") && stats && stats.conversionRate < 15 && stats.leads > 5 && (
        <InsightCard
          title="Attention: Conversion Drop"
          description={`Your lead-to-project conversion rate is ${stats.conversionRate}% which is below the 15% benchmark. Check the Estimator stage drop-offs in Sales Insights.`}
          type="warning"
          actionLabel="View Sales Insights"
          onAction={() => changeTab("sales")}
          onDismiss={() => handleDismissInsight("conv-anomaly")}
        />
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminKPI
          title="Total Leads"
          value={fmt(stats?.leads)}
          numericValue={stats?.leads}
          change={stats ? `${stats.leadsTrend > 0 ? "+" : ""}${stats.leadsTrend}% vs previous period` : "..."}
          trend={stats?.leadsTrend === 0 ? "neutral" : (stats?.leadsTrend || 0) > 0 ? "up" : "down"}
          icon={Users}
          variant="gold"
          isLoading={isLoading}
          isError={!!error}
        />
        <AdminKPI
          title="Estimated Pipeline Value"
          value={`₹${((stats?.pipelineValue || 0) / 100000).toFixed(1)}L`}
          change="From estimator submissions"
          trend="up"
          icon={TrendingUp}
          variant="accent"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          numericValue={stats?.conversionRate}
          change="Lead to won ratio"
          trend={(stats?.conversionRate || 0) >= 20 ? "up" : "down"}
          icon={Target}
          variant="secondary"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Page Views"
          value={fmt(stats?.pageViews)}
          numericValue={stats?.pageViews}
          change="Website traffic in period"
          trend="up"
          icon={Eye}
          variant="secondary"
          isLoading={isLoading}
        />
      </div>

      {/* Lead Trend Area Chart */}
      <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
        <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Lead Acquisition Trend</h3>
        <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-6">New leads per day over the selected period</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={leadTimeline}>
            <defs>
              <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--admin-border))" opacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "hsl(var(--admin-text))" }} />
            <Area type="monotone" dataKey="leads" stroke="hsl(43, 74%, 49%)" strokeWidth={2} fill="url(#leadGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Pipeline Overview</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-6">Active projects by status</p>
          <ProjectPipelineChart />
        </div>

        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Lead Status</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">Current distribution</p>
          {statusBreakdown.length > 0 ? (
            <div className="space-y-3">
              {statusBreakdown.map((item) => {
                const max = Math.max(...statusBreakdown.map((s) => s.value));
                const pct = max > 0 ? (item.value / max) * 100 : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[hsl(var(--admin-text-muted))] capitalize">{item.name}</span>
                      <span className="text-xs font-bold text-[hsl(var(--admin-text))] tabular-nums">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[hsl(var(--admin-border))]/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-10">No leads in period</p>
          )}
        </div>
      </div>

      {/* PostHog Engine Funnels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1 flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" /> Discovery Engine Funnel</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">PostHog conversion metrics (Last 30 Days)</p>
          <div className="h-[200px]">
            <PosthogFunnelChart action="funnel-discovery" color="emerald" fromIso={fromIso} toIso={toIso} />
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Estimator Engine Funnel</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">PostHog conversion metrics (Last 30 Days)</p>
          <div className="h-[200px]">
            <PosthogFunnelChart action="funnel-estimator" color="blue" fromIso={fromIso} toIso={toIso} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;

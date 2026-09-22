import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminKPI } from "@/components/admin/dashboard/AdminKPI";
import { LeadFunnelChart } from "@/components/admin/analytics/LeadFunnelChart";
import { LeadSourceChart } from "@/components/admin/analytics/LeadSourceChart";
import { Layers, Zap, Target, TrendingUp } from "lucide-react";
import { DateRange } from "react-day-picker";
import { endOfDay, differenceInDays, subDays, format, startOfDay } from "date-fns";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";

interface SalesTabProps {
  date?: DateRange;
}

const SalesTab = ({ date }: SalesTabProps) => {
  const currentFrom = date?.from;
  const currentTo = date?.to ? endOfDay(date.to) : undefined;
  const fromIso = currentFrom?.toISOString();
  const toIso = currentTo?.toISOString();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats-sales", date],
    queryFn: async () => {
      let previousFromIso: string | undefined;
      let previousToIso: string | undefined;

      if (currentFrom && currentTo) {
        const daysDiff = differenceInDays(currentTo, currentFrom) + 1;
        previousFromIso = subDays(currentFrom, daysDiff).toISOString();
        previousToIso = subDays(currentTo, daysDiff).toISOString();
      }

      let leadsQuery = supabase.from("leads").select("id, status, lead_source, estimated_min, estimated_max, created_at, lead_score");
      if (fromIso) leadsQuery = leadsQuery.gte("created_at", fromIso);
      if (toIso) leadsQuery = leadsQuery.lte("created_at", toIso);

      let prevLeadsQuery = supabase.from("leads").select("id", { count: "exact" });
      if (previousFromIso && previousToIso) {
        prevLeadsQuery = prevLeadsQuery.gte("created_at", previousFromIso).lte("created_at", previousToIso);
      }

      const [leadsRes, prevLeadsRes] = await Promise.all([
        leadsQuery,
        previousFromIso ? prevLeadsQuery : Promise.resolve({ count: 0, error: null }),
      ]);

      const leads = leadsRes.data || [];
      const totalLeads = leads.length;
      const estimatorLeads = leads.filter((l) => l.lead_source === "estimator");
      const wonLeads = leads.filter((l) => l.status === "won").length;
      const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

      const pipelineValue = estimatorLeads.reduce((sum, l) => sum + (Number(l.estimated_min) || 0), 0);
      const avgEstimate = estimatorLeads.length > 0 ? Math.round(pipelineValue / estimatorLeads.length) : 0;
      const avgLeadScore = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length) : 0;

      const prevCount = prevLeadsRes.count || 0;
      const leadsTrend = prevCount > 0 ? Math.round(((totalLeads - prevCount) / prevCount) * 100) : totalLeads > 0 ? 100 : 0;

      return {
        totalLeads,
        estimatorLeads: estimatorLeads.length,
        wonLeads,
        conversionRate,
        pipelineValue,
        avgEstimate,
        avgLeadScore,
        leadsTrend,
        leads,
      };
    },
  });

  // Lead velocity over time
  const { data: leadVelocity = [] } = useQuery({
    queryKey: ["sales-lead-velocity", date],
    queryFn: async () => {
      const days = differenceInDays(currentTo || new Date(), currentFrom || subDays(new Date(), 30)) + 1;
      const numDays = Math.min(days, 30);
      const dateList = Array.from({ length: numDays }, (_, i) => subDays(currentTo || new Date(), numDays - 1 - i));
      const from = startOfDay(dateList[0]).toISOString();

      const { data } = await supabase
        .from("leads")
        .select("created_at, lead_source")
        .gte("created_at", from)
        .lte("created_at", (currentTo || new Date()).toISOString());

      return dateList.map((d) => {
        const dayStr = format(d, "yyyy-MM-dd");
        const dayLeads = (data || []).filter((l) => format(new Date(l.created_at!), "yyyy-MM-dd") === dayStr);
        return {
          name: format(d, "MMM d"),
          total: dayLeads.length,
          estimator: dayLeads.filter((l) => l.lead_source === "estimator").length,
        };
      });
    },
  });

  // Lead source breakdown
  const { data: sourceData = [] } = useQuery({
    queryKey: ["sales-source-breakdown", date],
    queryFn: async () => {
      let query = supabase.from("leads").select("lead_source");
      if (fromIso) query = query.gte("created_at", fromIso);
      if (toIso) query = query.lte("created_at", toIso);

      const { data } = await query;
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        const src = row.lead_source || "other";
        counts[src] = (counts[src] || 0) + 1;
      }
      const colors: Record<string, string> = {
        website_contact: "hsl(43, 74%, 49%)",
        estimator: "hsl(200, 70%, 50%)",
        style_quiz: "hsl(280, 60%, 55%)",
        whatsapp: "hsl(150, 60%, 45%)",
        instagram: "hsl(330, 70%, 55%)",
        referral: "hsl(30, 80%, 55%)",
        other: "hsl(0, 0%, 55%)",
      };
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value, color: colors[name] || "hsl(0,0%,55%)" }));
    },
  });

  // Recent high-value leads
  const { data: topLeads = [] } = useQuery({
    queryKey: ["sales-top-leads", date],
    queryFn: async () => {
      let query = supabase.from("leads").select("id, name, email, status, lead_source, estimated_min, lead_score, created_at");
      if (fromIso) query = query.gte("created_at", fromIso);
      if (toIso) query = query.lte("created_at", toIso);

      const { data } = await query.order("lead_score", { ascending: false, nullsFirst: false }).limit(6);
      return data || [];
    },
  });

  const fmt = (v: number | string | undefined | null): string => (v == null ? "…" : typeof v === "number" ? v.toLocaleString() : v);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminKPI
          title="Estimator Submissions"
          value={fmt(stats?.estimatorLeads)}
          numericValue={stats?.estimatorLeads}
          change={stats ? `${stats.leadsTrend > 0 ? "+" : ""}${stats.leadsTrend}% vs prev` : "…"}
          trend={(stats?.leadsTrend || 0) > 0 ? "up" : "neutral"}
          icon={Layers}
          variant="gold"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Pipeline Value"
          value={`₹${((stats?.pipelineValue || 0) / 100000).toFixed(1)}L`}
          change={`Avg ₹${fmt(stats?.avgEstimate || 0)} per lead`}
          trend="up"
          icon={TrendingUp}
          variant="accent"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          numericValue={stats?.conversionRate}
          change={`${stats?.wonLeads || 0} won of ${stats?.totalLeads || 0}`}
          trend={(stats?.conversionRate || 0) >= 20 ? "up" : "down"}
          icon={Target}
          variant="secondary"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Avg Lead Score"
          value={fmt(stats?.avgLeadScore)}
          numericValue={stats?.avgLeadScore}
          change="Quality indicator"
          trend={(stats?.avgLeadScore || 0) >= 50 ? "up" : "neutral"}
          icon={Zap}
          variant="secondary"
          isLoading={isLoading}
        />
      </div>

      {/* Lead Velocity Chart */}
      <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
        <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Lead Velocity</h3>
        <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-6">Daily lead acquisition — total vs estimator</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={leadVelocity}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="estGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--admin-border))" opacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "hsl(var(--admin-text))" }} />
            <Area type="monotone" dataKey="total" name="All Leads" stroke="hsl(43, 74%, 49%)" strokeWidth={2} fill="url(#totalGrad)" />
            <Area type="monotone" dataKey="estimator" name="Estimator" stroke="hsl(200, 70%, 50%)" strokeWidth={2} fill="url(#estGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel + Sources + Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Lead Funnel</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">Stage progression</p>
          <LeadFunnelChart />
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Lead Sources</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">Where leads come from</p>
          <LeadSourceChart />
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Source Breakdown</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">In selected period</p>
          {sourceData.length > 0 ? (
            <div className="space-y-3">
              {sourceData.map((item) => {
                const max = sourceData[0]?.value || 1;
                const pct = (item.value / max) * 100;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[hsl(var(--admin-text-muted))] capitalize">{item.name.replace(/_/g, " ")}</span>
                      <span className="text-xs font-bold text-[hsl(var(--admin-text))] tabular-nums">{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[hsl(var(--admin-border))]/50 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-8">No data</p>
          )}
        </div>
      </div>

      {/* Top Leads Table */}
      <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
        <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Top Leads by Score</h3>
        <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-5">Highest quality leads in the period</p>
        {topLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--admin-border))]/50">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Name</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Source</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Status</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Estimate</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {topLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[hsl(var(--admin-border))]/30 last:border-0">
                    <td className="py-2.5 pr-4">
                      <span className="text-[hsl(var(--admin-text))] truncate block max-w-[140px]">{lead.name}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs text-[hsl(var(--admin-text-muted))] capitalize">{(lead.lead_source || "other").replace(/_/g, " ")}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        lead.status === "won" ? "bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))]"
                        : lead.status === "lost" ? "bg-[hsl(var(--admin-danger))]/10 text-[hsl(var(--admin-danger))]"
                        : "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))]"
                      }`}>{lead.status}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className="text-xs font-bold text-[hsl(var(--admin-text))] tabular-nums">
                        {lead.estimated_min ? `₹${(Number(lead.estimated_min) / 1000).toFixed(0)}K` : "—"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`text-xs font-bold tabular-nums ${(lead.lead_score || 0) >= 70 ? "text-[hsl(var(--admin-success))]" : (lead.lead_score || 0) >= 40 ? "text-[hsl(var(--admin-primary))]" : "text-[hsl(var(--admin-text-muted))]"}`}>
                        {lead.lead_score || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-6">No leads in this period</p>
        )}
      </div>
    </div>
  );
};

export default SalesTab;

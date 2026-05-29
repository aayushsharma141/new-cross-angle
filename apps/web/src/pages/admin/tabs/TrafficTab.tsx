import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminKPI } from "@/components/admin/dashboard/AdminKPI";
import { Users, Clock, Zap, Globe, MousePointerClick, TrendingUp } from "lucide-react";
import { DateRange } from "react-day-picker";
import { endOfDay, differenceInDays, subDays, format, startOfDay } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface TrafficTabProps {
  date?: DateRange;
}

const TrafficTab = ({ date }: TrafficTabProps) => {
  const currentFrom = date?.from;
  const currentTo = date?.to ? endOfDay(date.to) : undefined;
  const fromIso = currentFrom?.toISOString();
  const toIso = currentTo?.toISOString();

  // Core traffic KPIs
  const { data: stats, isLoading } = useQuery({
    queryKey: ["traffic-stats", date],
    queryFn: async () => {
      let previousFromIso: string | undefined;
      let previousToIso: string | undefined;

      if (currentFrom && currentTo) {
        const daysDiff = differenceInDays(currentTo, currentFrom) + 1;
        previousFromIso = subDays(currentFrom, daysDiff).toISOString();
        previousToIso = subDays(currentTo, daysDiff).toISOString();
      }

      let viewsQuery = supabase.from("analytics_events").select("id", { count: "exact" }).eq("event_type", "page_view");
      if (fromIso) viewsQuery = viewsQuery.gte("occurred_at", fromIso);
      if (toIso) viewsQuery = viewsQuery.lte("occurred_at", toIso);

      let prevViewsQuery = supabase.from("analytics_events").select("id", { count: "exact" }).eq("event_type", "page_view");
      if (previousFromIso && previousToIso) {
        prevViewsQuery = prevViewsQuery.gte("occurred_at", previousFromIso).lte("occurred_at", previousToIso);
      }

      // Unique visitors (distinct user_id)
      let uniqueQuery = supabase.from("analytics_events").select("user_id").eq("event_type", "page_view");
      if (fromIso) uniqueQuery = uniqueQuery.gte("occurred_at", fromIso);
      if (toIso) uniqueQuery = uniqueQuery.lte("occurred_at", toIso);

      // Blog engagement events
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let engagementQuery = (supabase as any).from("blog_user_events").select("id", { count: "exact" });
      if (fromIso) engagementQuery = engagementQuery.gte("created_at", fromIso);
      if (toIso) engagementQuery = engagementQuery.lte("created_at", toIso);

      const [viewsRes, prevViewsRes, uniqueRes, engagementRes] = await Promise.all([
        viewsQuery,
        previousFromIso ? prevViewsQuery : Promise.resolve({ count: 0, error: null }),
        uniqueQuery,
        engagementQuery,
      ]);

      const views = viewsRes.count || 0;
      const prevViews = prevViewsRes.count || 0;
      const viewsTrend = prevViews > 0 ? Math.round(((views - prevViews) / prevViews) * 100) : views > 0 ? 100 : 0;

      // Count unique user_ids
      const uniqueVisitors = new Set((uniqueRes.data || []).map((r) => r.user_id).filter(Boolean)).size;

      return {
        views,
        viewsTrend,
        uniqueVisitors,
        engagementEvents: engagementRes.count || 0,
        avgPagesPerVisitor: uniqueVisitors > 0 ? (views / uniqueVisitors).toFixed(1) : "0",
      };
    },
  });

  // Traffic over time (area chart)
  const { data: trafficTimeline = [] } = useQuery({
    queryKey: ["traffic-timeline", date],
    queryFn: async () => {
      const days = differenceInDays(currentTo || new Date(), currentFrom || subDays(new Date(), 30)) + 1;
      const numDays = Math.min(days, 30);
      const dateList = Array.from({ length: numDays }, (_, i) => subDays(currentTo || new Date(), numDays - 1 - i));
      const from = startOfDay(dateList[0]).toISOString();

      const { data } = await supabase
        .from("analytics_events")
        .select("occurred_at")
        .eq("event_type", "page_view")
        .gte("occurred_at", from)
        .lte("occurred_at", (currentTo || new Date()).toISOString());

      return dateList.map((d) => {
        const dayStr = format(d, "yyyy-MM-dd");
        const count = (data || []).filter((e) => format(new Date(e.occurred_at), "yyyy-MM-dd") === dayStr).length;
        return { name: format(d, "MMM d"), views: count };
      });
    },
  });

  // Top pages
  const { data: topPages = [] } = useQuery({
    queryKey: ["top-pages", date],
    queryFn: async () => {
      let query = supabase.from("analytics_events").select("payload").eq("event_type", "page_view");
      if (fromIso) query = query.gte("occurred_at", fromIso);
      if (toIso) query = query.lte("occurred_at", toIso);

      const { data } = await query;
      const pageCounts: Record<string, number> = {};
      for (const row of data || []) {
        const path = (row.payload as Record<string, unknown>)?.path as string || "/unknown";
        pageCounts[path] = (pageCounts[path] || 0) + 1;
      }
      return Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([path, count]) => ({ path, count }));
    },
  });

  // Traffic by hour (bar chart)
  const { data: hourlyData = [] } = useQuery({
    queryKey: ["traffic-hourly", date],
    queryFn: async () => {
      let query = supabase.from("analytics_events").select("occurred_at").eq("event_type", "page_view");
      if (fromIso) query = query.gte("occurred_at", fromIso);
      if (toIso) query = query.lte("occurred_at", toIso);

      const { data } = await query;
      const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
      for (const row of data || []) {
        const h = new Date(row.occurred_at).getHours();
        hours[h].count++;
      }
      return hours.map((h) => ({ name: `${h.hour}:00`, views: h.count }));
    },
  });

  // Device/referrer breakdown
  const { data: sourceBreakdown = [] } = useQuery({
    queryKey: ["traffic-sources", date],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any).from("blog_user_events").select("referrer, device");
      if (fromIso) query = query.gte("created_at", fromIso);
      if (toIso) query = query.lte("created_at", toIso);

      const { data } = await query;
      const devices: Record<string, number> = {};
      for (const row of data || []) {
        const device = (row as { device?: string }).device || "unknown";
        const label = device === "mobile" ? "Mobile" : device === "tablet" ? "Tablet" : "Desktop";
        devices[label] = (devices[label] || 0) + 1;
      }
      const colors: Record<string, string> = { Desktop: "hsl(43, 74%, 49%)", Mobile: "hsl(200, 70%, 50%)", Tablet: "hsl(150, 60%, 45%)", unknown: "hsl(0, 0%, 50%)" };
      return Object.entries(devices).map(([name, value]) => ({ name, value, color: colors[name] || "hsl(0, 0%, 50%)" }));
    },
  });

  const fmt = (v: number | string | undefined | null): string => (v == null ? "..." : typeof v === "number" ? v.toLocaleString() : v);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminKPI
          title="Page Views"
          value={fmt(stats?.views)}
          numericValue={stats?.views}
          change={stats ? `${stats.viewsTrend > 0 ? "+" : ""}${stats.viewsTrend}% vs previous period` : "..."}
          trend={stats?.viewsTrend === 0 ? "neutral" : (stats?.viewsTrend || 0) > 0 ? "up" : "down"}
          icon={Globe}
          variant="gold"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Unique Visitors"
          value={fmt(stats?.uniqueVisitors)}
          numericValue={stats?.uniqueVisitors}
          change="Distinct sessions"
          trend="up"
          icon={Users}
          variant="secondary"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Pages / Visitor"
          value={fmt(stats?.avgPagesPerVisitor)}
          change="Avg engagement depth"
          trend="neutral"
          icon={MousePointerClick}
          variant="secondary"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Engagement Events"
          value={fmt(stats?.engagementEvents)}
          numericValue={stats?.engagementEvents}
          change="Clicks, scrolls, reads"
          trend="up"
          icon={Zap}
          variant="gold"
          isLoading={isLoading}
        />
      </div>

      {/* Traffic Over Time (Area Chart) */}
      <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
        <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Traffic Over Time</h3>
        <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-6">Daily page views for the selected period</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trafficTimeline}>
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--admin-border))" opacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "hsl(var(--admin-text))" }} />
            <Area type="monotone" dataKey="views" stroke="hsl(43, 74%, 49%)" strokeWidth={2} fill="url(#trafficGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Middle Row: Hourly + Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Hours */}
        <div className="lg:col-span-2 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Peak Traffic Hours</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-6">Page views by hour of day</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hourlyData} barSize={10}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 9 }} interval={2} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="views" radius={[3, 3, 0, 0]}>
                {hourlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.views > 0 ? "hsl(43, 74%, 49%)" : "hsl(var(--admin-border))"} opacity={entry.views > 0 ? 0.8 : 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Device Split</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">Visitor devices</p>
          {sourceBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={sourceBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} strokeWidth={0}>
                    {sourceBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {sourceBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))]">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-[hsl(var(--admin-text))] tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-10">No device data yet</p>
          )}
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
        <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Top Pages</h3>
        <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-5">Most visited pages in the selected period</p>
        {topPages.length > 0 ? (
          <div className="space-y-2">
            {topPages.map((page, i) => {
              const maxCount = topPages[0]?.count || 1;
              const pct = (page.count / maxCount) * 100;
              return (
                <div key={page.path} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] w-5 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[hsl(var(--admin-text))] truncate">{page.path}</span>
                      <span className="text-xs font-bold text-[hsl(var(--admin-text))] tabular-nums ml-3">{page.count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[hsl(var(--admin-border))]/50 overflow-hidden">
                      <div className="h-full rounded-full bg-[hsl(43,74%,49%)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-6">No page view data yet</p>
        )}
      </div>
    </div>
  );
};

export default TrafficTab;

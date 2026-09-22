import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Users, Activity, TrendingUp, Timer, Download, BarChart3, PieChartIcon,
  TrendingDown, Layers, RefreshCw, CalendarIcon, Monitor, UserCheck, Target
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { Calendar } from "@/components/ui/primitives/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/primitives/dialog";
import { ScrollArea } from "@/components/ui/primitives/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/components/Table";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import { icons } from "@/design-system/tokens/icons";

import { StatCard } from "@/components/admin/analytics/StatCard";
import { BreakdownBar } from "@/components/admin/analytics/BreakdownBar";
import { EngagementChart } from "@/components/admin/analytics/EngagementChart";
import { SessionsTable } from "@/components/admin/analytics/SessionsTable";
import { LeadsTab } from "@/components/admin/analytics/LeadsTab";
import {
  type SessionRow, type EventRow, type LeadRow,
  STAGE_ORDER, STAGE_LABELS, PRESET_RANGES,
  formatDuration, parseUA, computeModeStats, computeDropoffs, computeFunnel,
  computeBreakdown, scoreLeadIntent, toCsv, downloadCsv,
} from "@/components/admin/analytics/analytics-utils";


export default function AdminQuizAnalytics() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [activePreset, setActivePreset] = useState<number | null>(30);
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "leads">("analytics");
  const [viewingType, setViewingType] = useState<"all" | "completed">("all");
  const [posthogFunnel, setPosthogFunnel] = useState<Record<string, unknown>[]>([]);
  const [posthogRetention, setPosthogRetention] = useState<Record<string, unknown>[]>([]);
  const [posthogEstimator, setPosthogEstimator] = useState<Record<string, unknown>[]>([]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    const from = dateFrom ? startOfDay(dateFrom).toISOString() : null;
    const to = dateTo ? endOfDay(dateTo).toISOString() : null;

    // Generic over the PostgREST filter builder: whatever comes in comes back,
    // so callers keep their row typing instead of collapsing to any.
    const buildRangeQuery = <Q extends {
      gte(field: string, value: string): Q;
      lte(field: string, value: string): Q;
    }>(query: Q, dateField: string): Q => {
      let next = query;
      if (from) next = next.gte(dateField, from);
      if (to) next = next.lte(dateField, to);
      return next;
    };

    const loadFromReportingTable = async () => {
      const { data, error } = await supabase
        .from("analytics_reporting_daily")
        .select("*")
        .eq("module_name", "discovery")
        .order("date", { ascending: false })
        .limit(500);
      if (error) throw error;
      const rows = (data ?? []) as Array<Record<string, unknown>>;
      const syntheticSessions: SessionRow[] = [];
      const syntheticEvents: EventRow[] = [];
      const byDate: Record<string, Record<string, number>> = {};
      for (const row of rows) { const date = String(row.date); const metric = String(row.metric_name); const value = Number(row.metric_value); (byDate[date] ??= {})[metric] = value; }
      for (const [date, metrics] of Object.entries(byDate)) {
        const total = metrics["quiz_started"] ?? 0;
        const completed = metrics["quiz_completed"] ?? 0;
        for (let i = 0; i < total; i++) {
          const isCompleted = i < completed;
          const id = `${date}-synth-${i}`;
          syntheticSessions.push({ id, started_at: new Date(date).toISOString(), completed_at: isCompleted ? new Date(date).toISOString() : null, mode: "deep", is_completed: isCompleted, last_stage: isCompleted ? "results" : null, completion_time_seconds: metrics["avg_completion_seconds"] ?? null, user_agent: null, answers: {} });
          syntheticEvents.push({ id: `${id}-evt`, analytics_session_id: id, event_type: isCompleted ? "quiz_completed" : "quiz_started", stage_name: isCompleted ? "results" : null, meta: {}, created_at: new Date(date).toISOString() });
        }
      }
      return { sessions: syntheticSessions, events: syntheticEvents };
    };

    let leadsQuery = supabase.from("leads").select("id, name, email, phone, project_type, budget, start_timing, city, lead_source, source, source_url, created_at, internal_notes, form_data").or("lead_source.eq.style_quiz,lead_source.eq.aesthetic_discovery_engine").order("created_at", { ascending: false }).limit(500);
    leadsQuery = buildRangeQuery(leadsQuery, "created_at");

    try {
      const analyticsResult = await loadFromReportingTable().catch(() => ({ sessions: [], events: [] }));
      const [{ sessions: nextSessions, events: nextEvents }, leadsRes] = await Promise.all([Promise.resolve(analyticsResult), leadsQuery]);
      const nextLeads: LeadRow[] = ((leadsRes.data ?? []) as Array<Record<string, unknown>>).map((lead) => {
        const internalNotes = (lead.internal_notes ?? {}) as Record<string, unknown>;
        const rawData = (internalNotes.raw_data ?? {}) as Record<string, unknown>;
        const formData = (lead.form_data ?? {}) as Record<string, unknown>;
        return {
          id: String(lead.id), session_id: (typeof formData.analytics_session_id === "string" && formData.analytics_session_id) || (typeof internalNotes.analytics_session_id === "string" && internalNotes.analytics_session_id) || (typeof rawData.sessionId === "string" && rawData.sessionId) || null,
          name: String(lead.name ?? ""), email: String(lead.email ?? ""), phone: typeof lead.phone === "string" ? lead.phone : null, project_type: typeof lead.project_type === "string" ? lead.project_type : null, budget_range: typeof lead.budget === "string" ? lead.budget : null, timeline: typeof lead.start_timing === "string" ? lead.start_timing : null, city: typeof lead.city === "string" ? lead.city : null, lead_source: typeof lead.lead_source === "string" ? lead.lead_source : null, utm_source: typeof lead.source === "string" ? lead.source : null, utm_medium: null, utm_campaign: typeof lead.source_url === "string" ? lead.source_url : null, created_at: String(lead.created_at),
        };
      });
      // PostHog Data
      const fromIso = from || subDays(new Date(), 30).toISOString();
      const toIso = to || new Date().toISOString();
      const phFunnelRes = await supabase.functions.invoke("posthog-query", { body: { action: "funnel-discovery", from: fromIso, to: toIso } }).catch(() => ({ data: [] }));
      const phEstimatorRes = await supabase.functions.invoke("posthog-query", { body: { action: "funnel-estimator", from: fromIso, to: toIso } }).catch(() => ({ data: [] }));
      const phRetentionRes = await supabase.functions.invoke("posthog-query", { body: { action: "retention-summary", from: fromIso, to: toIso } }).catch(() => ({ data: [] }));

      setSessions(nextSessions); setEvents(nextEvents); setLeads(nextLeads);
      setPosthogFunnel(phFunnelRes.data || []);
      setPosthogEstimator(phEstimatorRes.data || []);
      setPosthogRetention(phRetentionRes.data || []);
    } finally { setLoading(false); setRefreshing(false); }
  }, [dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePreset = (days: number | null) => {
    setActivePreset(days);
    if (days === null) { setDateFrom(undefined); setDateTo(undefined); }
    else { setDateFrom(subDays(new Date(), days)); setDateTo(new Date()); }
  };

  const exportSessions = () => { downloadCsv(`sessions-${format(new Date(), "yyyy-MM-dd")}.csv`, toCsv(["ID", "Started At", "Completed At", "Mode", "Completed", "Last Stage", "Time (s)", "User Agent"], sessions.map((s) => [s.id, s.started_at, s.completed_at ?? "", s.mode, String(s.is_completed), s.last_stage ?? "", s.completion_time_seconds != null ? String(s.completion_time_seconds) : "", s.user_agent ?? ""]))); };
  const exportEvents = () => { downloadCsv(`events-${format(new Date(), "yyyy-MM-dd")}.csv`, toCsv(["ID", "Session ID", "Event Type", "Stage", "Meta", "Created At"], events.map((e) => [e.id, e.analytics_session_id ?? "", e.event_type, e.stage_name ?? "", JSON.stringify(e.meta ?? {}), e.created_at]))); };
  const exportLeads = () => { downloadCsv(`leads-${format(new Date(), "yyyy-MM-dd")}.csv`, toCsv(["ID", "Name", "Email", "Phone", "City", "Project Type", "Budget Range", "Timeline", "Session ID", "Created At"], leads.map((l) => [l.id, l.name, l.email, l.phone ?? "", l.city ?? "", l.project_type ?? "", l.budget_range ?? "", l.timeline ?? "", l.session_id ?? "", l.created_at]))); };

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.is_completed).length;
  const overallRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const completedTimes = sessions.map((s) => s.completion_time_seconds).filter(Boolean) as number[];
  const avgTime = completedTimes.length > 0 ? completedTimes.reduce((a, b) => a + b, 0) / completedTimes.length : null;
  const modeStats = computeModeStats(sessions);
  const dropoffs = computeDropoffs(sessions);
  const funnel = computeFunnel(sessions);
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);
  const recentEvents = events.slice(0, 20);

  const analyticsData = useMemo(() => {
    const dailyStatsMap: Record<string, { date: string; label: string; sessions: number; completions: number }> = {};
    sessions.forEach(s => { const d = format(new Date(s.started_at), 'yyyy-MM-dd'); if (!dailyStatsMap[d]) dailyStatsMap[d] = { date: d, label: format(new Date(s.started_at), 'MMM d'), sessions: 0, completions: 0 }; dailyStatsMap[d].sessions++; if (s.is_completed) dailyStatsMap[d].completions++; });
    const dailyStats = Object.values(dailyStatsMap).sort((a, b) => a.date.localeCompare(b.date)).map(({ label, sessions, completions }) => ({ date: label, sessions, completions }));
    const serviceDistributionMap: Record<string, number> = {};
    sessions.forEach(s => { if (s.answers?.services && Array.isArray(s.answers.services)) { (s.answers.services as string[]).forEach((svc) => { serviceDistributionMap[svc] = (serviceDistributionMap[svc] || 0) + 1; }); } });
    const serviceDistribution = Object.entries(serviceDistributionMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { dailyStats, serviceDistribution };
  }, [sessions]);

  const COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff', '#4c1d95'];
  const filteredSessions = useMemo(() => viewingType === 'completed' ? sessions.filter(s => s.is_completed) : sessions, [sessions, viewingType]);

  if (loading) { return (<div className="min-h-screen bg-background flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full" /></div>); }


  return (
      <div className="flex flex-col space-y-4 animate-in fade-in duration-700">

      {/* Quick Stats + Date Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mt-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400 whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          <span>{totalSessions} session{totalSessions !== 1 ? "s" : ""} · {leads.length} lead{leads.length !== 1 ? "s" : ""} recorded from Discovery</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto xl:justify-end bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-1.5 rounded-2xl">
          {PRESET_RANGES.map((p) => (<Button variant={activePreset === p.days ? "default" : "ghost"} size="sm" key={p.label} onClick={() => handlePreset(p.days)} className={cn("text-xs h-8 rounded-xl", activePreset === p.days ? "" : "text-zinc-400 hover:text-white hover:bg-white/5")}>{p.label}</Button>))}
          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
          <Popover><PopoverTrigger asChild><Button variant="ghost" size="sm" className={cn("text-xs gap-1.5 h-8 rounded-xl bg-black/40 border border-white/5 hover:bg-white/10 hover:text-white", !dateFrom ? "text-muted-foreground" : "text-zinc-200")}><CalendarIcon className={icons.xs} />{dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setActivePreset(null); }} disabled={(d) => d > new Date() || (dateTo ? d > dateTo : false)} initialFocus className="p-3 pointer-events-auto" /></PopoverContent></Popover>
          <span className="text-xs text-muted-foreground">→</span>
          <Popover><PopoverTrigger asChild><Button variant="ghost" size="sm" className={cn("text-xs gap-1.5 h-8 rounded-xl bg-black/40 border border-white/5 hover:bg-white/10 hover:text-white", !dateTo ? "text-muted-foreground" : "text-zinc-200")}><CalendarIcon className={icons.xs} />{dateTo ? format(dateTo, "MMM d, yyyy") : "To"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setActivePreset(null); }} disabled={(d) => d > new Date() || (dateFrom ? d < dateFrom : false)} initialFocus className="p-3 pointer-events-auto" /></PopoverContent></Popover>
          <div className="flex items-center gap-2 ml-auto sm:ml-0 border-l border-white/10 pl-3">
            <Popover><PopoverTrigger asChild><Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 rounded-xl bg-black/40 border-white/5 hover:bg-white/10 hover:text-white"><Download className={icons.sm} />Export</Button></PopoverTrigger><PopoverContent className="w-auto p-2" align="end"><div className="flex flex-col gap-1"><Button variant="ghost" size="sm" onClick={exportSessions} className="text-xs justify-start px-3 py-2 h-auto">Sessions CSV ({sessions.length} rows)</Button><Button variant="ghost" size="sm" onClick={exportEvents} className="text-xs justify-start px-3 py-2 h-auto">Events CSV ({events.length} rows)</Button><Button variant="ghost" size="sm" onClick={exportLeads} className="text-xs justify-start px-3 py-2 h-auto">Leads CSV ({leads.length} rows)</Button></div></PopoverContent></Popover>
            <Button variant="outline" size="sm" onClick={loadData} disabled={refreshing} className="text-xs gap-1.5 h-8 rounded-xl bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary"><RefreshCw className={cn(icons.xs, refreshing && "animate-spin")} />Refresh</Button>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-1 rounded-2xl w-fit">
        <Button variant="ghost" onClick={() => setActiveTab("analytics")} className={cn("px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2", activeTab === "analytics" ? "bg-primary/20 text-primary shadow-sm" : "text-zinc-500 hover:text-zinc-200")}><BarChart3 className={icons.sm} />Discovery Analytics</Button>
        <Button variant="ghost" onClick={() => setActiveTab("leads")} className={cn("px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2", activeTab === "leads" ? "bg-primary/20 text-primary shadow-sm" : "text-zinc-500 hover:text-zinc-200")}><UserCheck className={icons.sm} />Generated Leads{leads.length > 0 && <span className={cn("ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold", activeTab === "leads" ? "bg-primary/20 text-primary" : "bg-white/5 text-zinc-500")}>{leads.length}</span>}</Button>
      </div>


      {activeTab === "analytics" && (<>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
          <StatCard icon={Users} label="Total Sessions" value={totalSessions.toString()} sub="+12% vs last month" delay={0.1} />
          <StatCard icon={Activity} label="Completion Rate" value={`${overallRate.toFixed(1)}%`} sub="+5% vs last month" delay={0.2} />
          <StatCard icon={TrendingUp} label="Leads Generated" value={leads.length.toString()} sub="Active pipeline" delay={0.3} />
          <StatCard icon={Timer} label="Avg. Time" value={avgTime ? formatDuration(avgTime) : "—"} sub="Stable" delay={0.4} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <EngagementChart data={analyticsData.dailyStats} />
          {/* Service Distribution Pie */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.4 }} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-lg font-serif-display font-semibold mb-6 flex items-center gap-2"><PieChartIcon className={cn("text-rose-500", icons.md)} />Service Distribution</h3>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={analyticsData.serviceDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">{analyticsData.serviceDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", color: "#fff" }} itemStyle={{ color: "#e2e8f0" }} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">{analyticsData.serviceDistribution.map((entry, index) => (<div key={index} className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div><span>{entry.name} ({entry.value})</span></div>))}</div>
          </motion.div>
        </div>

        {/* Mode Breakdown */}
        {modeStats.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><Layers className={cn("text-muted-foreground", icons.md)} /> By Mode</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modeStats.map((m) => (<div key={m.mode} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"><div className="flex items-baseline justify-between mb-3"><span className="tracking-premium text-muted-foreground">{m.mode}</span><span className="text-2xl font-serif-display font-semibold">{m.rate.toFixed(1)}%</span></div><div className="h-2 rounded-full bg-white/5 overflow-hidden mb-3"><motion.div initial={{ width: 0 }} animate={{ width: `${m.rate}%` }} transition={{ delay: 0.4, duration: 0.6 }} className="h-full rounded-full" style={{ background: `hsl(var(--gold))` }} /></div><div className="flex justify-between text-xs text-muted-foreground"><span>{m.completed}/{m.total} completed</span>{m.avgTime !== null && <span>avg {formatDuration(m.avgTime)}</span>}</div></div>))}
            </div>
          </motion.section>
        )}

        {/* Device & Browser */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-10">
          <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><Monitor className={cn("text-muted-foreground", icons.md)} /> Device & Browser</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"><h3 className="tracking-premium text-muted-foreground mb-4">Device Type</h3><BreakdownBar items={computeBreakdown(sessions, "device")} delay={0.3} /></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"><h3 className="tracking-premium text-muted-foreground mb-4">Browser</h3><BreakdownBar items={computeBreakdown(sessions, "browser")} delay={0.35} /></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"><h3 className="tracking-premium text-muted-foreground mb-4">Operating System</h3><BreakdownBar items={computeBreakdown(sessions, "os")} delay={0.4} /></div>
          </div>
        </motion.section>

        {/* Funnel */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-10">
          <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><TrendingDown className={cn("text-muted-foreground", icons.md)} /> Stage Funnel</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            {funnel.map((f, i) => (<div key={f.stage} className="flex items-center gap-3"><span className="text-xs text-muted-foreground w-24 text-right shrink-0 truncate">{STAGE_LABELS[f.stage] ?? f.stage}</span><div className="flex-1 h-7 rounded bg-white/5 overflow-hidden relative"><motion.div initial={{ width: 0 }} animate={{ width: `${(f.count / maxFunnel) * 100}%` }} transition={{ delay: 0.3 + i * 0.04, duration: 0.5 }} className="h-full rounded" style={{ background: i === funnel.length - 1 && f.count > 0 ? `hsl(var(--gold))` : `hsl(var(--foreground) / ${0.15 + (1 - i / funnel.length) * 0.25})` }} /><span className="absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">{f.count}</span></div><span className="text-xs text-muted-foreground w-12 shrink-0">{f.pct.toFixed(0)}%</span></div>))}
          </div>
        </motion.section>

        {/* PostHog Charts */}
        {(posthogFunnel.length > 0 || posthogRetention.length > 0 || posthogEstimator.length > 0) && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {posthogFunnel.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><Target className={cn("text-muted-foreground", icons.md)} /> Discovery Engine Funnel (PostHog)</h2>
                <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={posthogFunnel.map((d: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                      step: d.step.replace('quiz_', '').replace('_', ' '),
                      count: d.count
                    }))}>
                      <defs>
                        <linearGradient id="phFunnelColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--gold))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--gold))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="step" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--gold))" strokeWidth={2} fillOpacity={1} fill="url(#phFunnelColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {posthogEstimator.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><Target className={cn("text-muted-foreground", icons.md)} /> Estimator Funnel (PostHog)</h2>
                <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={posthogEstimator.map((d: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                      step: d.step,
                      count: d.count
                    }))}>
                      <defs>
                        <linearGradient id="phEstimatorColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="step" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                      <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#phEstimatorColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {posthogRetention.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><RefreshCw className={cn("text-muted-foreground", icons.md)} /> Retention Curve (PostHog)</h2>
                <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={posthogRetention.map((d: any, i: number) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                      day: `Day ${i}`,
                      retention: typeof d.count === 'number' ? d.count : (d.values?.[0]?.count || 0)
                    }))}>
                      <defs>
                        <linearGradient id="phRetentionColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                      <Area type="monotone" dataKey="retention" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#phRetentionColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Drop-offs */}
        {dropoffs.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-10">
            <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2"><TrendingDown className={cn("text-muted-foreground", icons.md)} /> Drop-off Points</h2>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md divide-y divide-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              {dropoffs.map((d) => (<div key={d.stage} className="flex items-center justify-between px-6 py-4"><span className="text-sm">{STAGE_LABELS[d.stage] ?? d.stage}</span><div className="flex items-center gap-4"><span className="text-sm font-medium">{d.count} drop{d.count !== 1 ? "s" : ""}</span><span className="text-xs text-muted-foreground w-12 text-right">{d.pct.toFixed(1)}%</span></div></div>))}
            </div>
          </motion.section>
        )}

        {/* Sessions Table */}
        <SessionsTable sessions={filteredSessions} loading={loading} viewingType={viewingType} onViewingTypeChange={setViewingType} onSelectSession={setSelectedSession} />

        {/* Recent Events */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-16">
          <h2 className="text-lg font-serif-display font-medium mb-4">Recent Events</h2>
          {recentEvents.length === 0 ? (<p className="text-sm text-muted-foreground">No events recorded yet.</p>) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-x-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Table className="w-full text-sm"><TableHeader className="bg-white/5"><TableRow className="border-b border-white/10 text-left hover:bg-transparent"><TableHead className="px-6 py-4 font-medium text-muted-foreground tracking-premium border-none">Event</TableHead><TableHead className="px-6 py-4 font-medium text-muted-foreground tracking-premium border-none">Stage</TableHead><TableHead className="px-6 py-4 font-medium text-muted-foreground tracking-premium hidden sm:table-cell border-none">Meta</TableHead><TableHead className="px-6 py-4 font-medium text-muted-foreground tracking-premium text-right border-none">Time</TableHead></TableRow></TableHeader>
              <TableBody className="divide-y divide-white/5">{recentEvents.map((evt) => (<TableRow key={evt.id} className="hover:bg-white/5 transition-colors group border-t border-white/5"><TableCell className="px-6 py-4 font-mono text-xs text-foreground/80 group-hover:text-pink-400 transition-colors border-none">{evt.event_type}</TableCell><TableCell className="px-6 py-4 text-muted-foreground border-none">{evt.stage_name ? (STAGE_LABELS[evt.stage_name] ?? evt.stage_name) : "—"}</TableCell><TableCell className="px-6 py-4 text-xs text-muted-foreground hidden sm:table-cell max-w-[200px] truncate border-none">{evt.meta && Object.keys(evt.meta).length > 0 ? JSON.stringify(evt.meta) : "—"}</TableCell><TableCell className="px-6 py-4 text-xs text-muted-foreground text-right whitespace-nowrap border-none">{new Date(evt.created_at).toLocaleString()}</TableCell></TableRow>))}</TableBody></Table>
            </div>
          )}
        </motion.section>
      </>)}


      {activeTab === "leads" && (
        <LeadsTab
          leads={leads} sessions={sessions} dateFrom={dateFrom} dateTo={dateTo}
          activePreset={activePreset} refreshing={refreshing}
          onPreset={handlePreset} onDateFromChange={(d) => { setDateFrom(d); setActivePreset(null); }}
          onDateToChange={(d) => { setDateTo(d); setActivePreset(null); }}
          onExportLeads={exportLeads} onRefresh={loadData} onSelectLead={setSelectedLead}
        />
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 bg-admin-card border-admin-border text-admin-text">
          {selectedLead && (() => {
            const intent = scoreLeadIntent(selectedLead);
            return (<>
              <DialogHeader className="p-6 pb-4 border-b border-border">
                <DialogTitle className="text-lg font-serif-display">{selectedLead.name}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  Lead captured {new Date(selectedLead.created_at).toLocaleString()}
                  <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", intent.cls)}>{intent.label} Intent</span>
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 space-y-5">
                <div><h3 className="text-xs tracking-premium text-muted-foreground mb-3">CONTACT</h3><div className="space-y-2.5"><div className="text-sm">{selectedLead.email}</div>{selectedLead.phone && <div className="text-sm">{selectedLead.phone}</div>}{selectedLead.city && <div className="text-sm">{selectedLead.city}</div>}</div></div>
                <div><h3 className="text-xs tracking-premium text-muted-foreground mb-3">PROJECT DETAILS</h3><div className="grid grid-cols-3 gap-3"><div className="rounded-md border border-border p-3"><span className="text-[10px] tracking-premium text-muted-foreground block">TYPE</span><span className="text-sm font-medium">{selectedLead.project_type || "—"}</span></div><div className="rounded-md border border-border p-3"><span className="text-[10px] tracking-premium text-muted-foreground block">BUDGET</span><span className="text-sm font-medium">{selectedLead.budget_range || "—"}</span></div><div className="rounded-md border border-border p-3"><span className="text-[10px] tracking-premium text-muted-foreground block">TIMELINE</span><span className="text-sm font-medium">{selectedLead.timeline || "—"}</span></div></div></div>
                {selectedLead.session_id && <div><h3 className="text-xs tracking-premium text-muted-foreground mb-3">LINKED SESSION</h3><div className="rounded-md border border-border p-3"><p className="text-xs font-mono text-muted-foreground truncate">{selectedLead.session_id}</p><a href={`/results/${selectedLead.session_id}`} target="_blank" rel="noopener noreferrer" className="text-xs mt-1.5 inline-block hover:underline" style={{ color: "hsl(var(--gold))" }}>View results page →</a></div></div>}
              </div>
            </>);
          })()}
        </DialogContent>
      </Dialog>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 bg-admin-card border-admin-border text-admin-text">
          {selectedSession && (() => {
            const sessionEvents = events.filter((e) => e.analytics_session_id === selectedSession.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            const parsed = selectedSession.user_agent ? parseUA(selectedSession.user_agent) : null;
            return (<>
              <DialogHeader className="p-6 pb-4 border-b border-border">
                <DialogTitle className="text-lg font-serif-display">Session Detail</DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground mt-1">{selectedSession.id}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(85vh-120px)]">
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-md border border-border p-3"><span className="text-xs text-muted-foreground block mb-1">Status</span><span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", selectedSession.is_completed ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400")}>{selectedSession.is_completed ? "Completed" : "Dropped"}</span></div>
                    <div className="rounded-md border border-border p-3"><span className="text-xs text-muted-foreground block mb-1">Mode</span><span className="text-sm font-medium">{selectedSession.mode}</span></div>
                    <div className="rounded-md border border-border p-3"><span className="text-xs text-muted-foreground block mb-1">Last Stage</span><span className="text-sm font-medium">{selectedSession.last_stage ? (STAGE_LABELS[selectedSession.last_stage] ?? selectedSession.last_stage) : "-"}</span></div>
                    <div className="rounded-md border border-border p-3"><span className="text-xs text-muted-foreground block mb-1">Duration</span><span className="text-sm font-medium">{selectedSession.completion_time_seconds != null ? formatDuration(selectedSession.completion_time_seconds) : "—"}</span></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1"><p className="text-muted-foreground">Started: <span className="text-foreground">{new Date(selectedSession.started_at).toLocaleString()}</span></p>{selectedSession.completed_at && <p className="text-muted-foreground">Completed: <span className="text-foreground">{new Date(selectedSession.completed_at).toLocaleString()}</span></p>}</div>
                    {parsed && <div className="space-y-1"><p className="text-muted-foreground">Device: <span className="text-foreground">{parsed.device}</span></p><p className="text-muted-foreground">Browser: <span className="text-foreground">{parsed.browser} / {parsed.os}</span></p></div>}
                  </div>
                  <div><h3 className="text-sm font-medium mb-3">Journey Progress</h3><div className="flex gap-1">{STAGE_ORDER.map((stage) => { const reached = STAGE_ORDER.indexOf(selectedSession.last_stage ?? "") >= STAGE_ORDER.indexOf(stage); return (<div key={stage} className="flex-1 group relative"><div className={cn("h-2 rounded-full transition-colors", reached ? "bg-foreground/40" : "bg-muted")} style={reached && stage === selectedSession.last_stage ? { background: "hsl(var(--gold))" } : undefined} /><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{STAGE_LABELS[stage]}</span></div>); })}</div></div>
                  <div><h3 className="text-sm font-medium mb-3">Event Timeline ({sessionEvents.length} events)</h3>{sessionEvents.length === 0 ? <p className="text-xs text-muted-foreground">No events found for this session.</p> : (<div className="relative pl-4 border-l border-border space-y-0">{sessionEvents.map((evt, i) => { const prevTime = i > 0 ? new Date(sessionEvents[i - 1].created_at).getTime() : null; const currTime = new Date(evt.created_at).getTime(); const delta = prevTime ? (currTime - prevTime) / 1000 : null; return (<div key={evt.id} className="relative pb-4 last:pb-0"><div className="absolute -left-[calc(1rem+4.5px)] top-1.5 w-2 h-2 rounded-full bg-foreground/30 border border-background" /><div className="flex items-start gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-mono text-xs font-medium text-foreground">{evt.event_type}</span>{evt.stage_name && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{STAGE_LABELS[evt.stage_name] ?? evt.stage_name}</span>}{delta !== null && <span className="text-[10px] text-muted-foreground">+{delta < 60 ? `${delta.toFixed(1)}s` : `${(delta / 60).toFixed(1)}m`}</span>}</div>{evt.meta && Object.keys(evt.meta).length > 0 && <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate max-w-md">{JSON.stringify(evt.meta)}</p>}</div><span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{new Date(evt.created_at).toLocaleTimeString()}</span></div></div>); })}</div>)}</div>
                </div>
              </ScrollArea>
            </>);
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

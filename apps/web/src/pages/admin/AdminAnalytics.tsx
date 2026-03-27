import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Users,
  ArrowLeft,
  Activity,
  TrendingUp,
  Timer,
  Download,
  BarChart3,
  MousePointerClick,
  PieChartIcon,
  Clock,
  TrendingDown,
  Layers, RefreshCw, CalendarIcon, Monitor, Smartphone, Tablet, ChevronRight, X, Mail, Phone, MapPin, Briefcase, DollarSign, UserCheck, Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/components/Table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { icons } from "@/design-system/tokens/icons";

interface SessionRow {
  id: string;
  started_at: string;
  completed_at: string | null;
  mode: string;
  is_completed: boolean;
  last_stage: string;
  completion_time_seconds: number | null;
  user_agent: string | null;
  answers: Record<string, unknown>;
}

interface EventRow {
  id: string;
  analytics_session_id: string;
  event_type: string;
  stage_name: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

interface LeadRow {
  id: string;
  session_id: string;
  name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  budget_range: string | null;
  timeline: string | null;
  city: string | null;
  lead_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

interface StageDropoff {
  stage: string;
  count: number;
  pct: number;
}

interface ModeStats {
  mode: string;
  total: number;
  completed: number;
  rate: number;
  avgTime: number | null;
}

const STAGE_ORDER = [
  "welcome", "reflection", "lifestyle", "visual_instinct",
  "adjective_selection", "emotional_mapping", "material_resonance",
  "light_calibration", "pattern_preview", "analysis", "results",
];

const STAGE_LABELS: Record<string, string> = {
  welcome: "Welcome",
  reflection: "Reflection",
  lifestyle: "Lifestyle",
  visual_instinct: "Visual Instinct",
  adjective_selection: "Adjectives",
  emotional_mapping: "Emotional",
  material_resonance: "Material",
  light_calibration: "Light",
  pattern_preview: "Pattern",
  analysis: "Analysis",
  results: "Results",
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s} s`;
}

function computeModeStats(sessions: SessionRow[]): ModeStats[] {
  const byMode: Record<string, SessionRow[]> = {};
  for (const s of sessions) {
    (byMode[s.mode] ??= []).push(s);
  }
  return Object.entries(byMode).map(([mode, list]) => {
    const completed = list.filter((s) => s.is_completed);
    const times = completed.map((s) => s.completion_time_seconds).filter(Boolean) as number[];
    return {
      mode,
      total: list.length,
      completed: completed.length,
      rate: list.length > 0 ? (completed.length / list.length) * 100 : 0,
      avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null,
    };
  });
}

function computeDropoffs(sessions: SessionRow[]): StageDropoff[] {
  const incomplete = sessions.filter((s) => !s.is_completed);
  const counts: Record<string, number> = {};
  for (const s of incomplete) {
    counts[s.last_stage] = (counts[s.last_stage] ?? 0) + 1;
  }
  const total = incomplete.length || 1;
  return STAGE_ORDER
    .filter((stage) => counts[stage])
    .map((stage) => ({
      stage,
      count: counts[stage],
      pct: (counts[stage] / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

function computeFunnel(sessions: SessionRow[]): { stage: string; count: number; pct: number }[] {
  const stageCounts: Record<string, number> = {};
  for (const s of sessions) {
    const lastIdx = STAGE_ORDER.indexOf(s.last_stage);
    for (let i = 0; i <= lastIdx; i++) {
      const stage = STAGE_ORDER[i];
      stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
    }
  }
  const total = sessions.length || 1;
  return STAGE_ORDER.map((stage) => ({
    stage,
    count: stageCounts[stage] ?? 0,
    pct: ((stageCounts[stage] ?? 0) / total) * 100,
  }));
}


interface DeviceStat {
  label: string;
  count: number;
  pct: number;
}

function parseUA(ua: string): { browser: string; os: string; device: "Desktop" | "Mobile" | "Tablet" } {
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/CrOS/i.test(ua)) os = "ChromeOS";

  let device: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  if (/iPad|Tablet/i.test(ua)) device = "Tablet";
  else if (/Mobile|iPhone|Android(?!.*Tablet)/i.test(ua)) device = "Mobile";

  return { browser, os, device };
}

function computeBreakdown(sessions: SessionRow[], key: "browser" | "os" | "device"): DeviceStat[] {
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.user_agent) continue;
    const parsed = parseUA(s.user_agent);
    const val = parsed[key];
    counts[val] = (counts[val] ?? 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count, pct: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);
}

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

const BreakdownBar = ({ items, delay = 0 }: { items: DeviceStat[]; delay?: number }) => {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const Icon = DEVICE_ICONS[item.label];
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20 text-right shrink-0 truncate flex items-center justify-end gap-1.5">
              {Icon && <Icon className={icons.xs} />}
              {item.label}
            </span>
            <div className="flex-1 h-6 rounded bg-muted overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / max) * 100}%` }}
                transition={{ delay: delay + i * 0.04, duration: 0.5 }}
                className="h-full rounded"
                style={{ background: `hsl(var(--foreground) / ${0.18 + (1 - i / Math.max(items.length, 1)) * 0.22})` }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                {item.count}
              </span>
            </div>
            <span className="text-xs text-muted-foreground w-12 shrink-0">
              {item.pct.toFixed(0)}%
            </span>
          </div>
        );
      })}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground">No user agent data available.</p>
      )}
    </div>
  );
};

function scoreLeadIntent(lead: LeadRow): { label: string; cls: string } {
  let score = 0;
  const b = lead.budget_range || "";
  if (b.includes("50L+")) score += 3;
  else if (b.includes("15L")) score += 2;
  else if (b.includes("5L")) score += 1;

  const t = lead.timeline || "";
  if (t === "Immediately") score += 3;
  else if (t.startsWith("1–3")) score += 2;
  else if (t.startsWith("3–6")) score += 1;

  const p = lead.project_type || "";
  if (p === "New Home" || p === "Renovation") score += 2;
  else if (p === "Single Room" || p === "Office / Studio") score += 1;

  if (score >= 6) return { label: "High", cls: "bg-emerald-500/15 text-emerald-400" };
  if (score >= 3) return { label: "Medium", cls: "bg-amber-500/15 text-amber-400" };
  return { label: "Low", cls: "bg-muted text-muted-foreground" };
}

function computeLeadBreakdown(leads: LeadRow[], key: keyof LeadRow): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const l of leads) {
    const val = (l[key] as string) || "Not specified";
    counts[val] = (counts[val] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const PIE_COLORS = [
  "hsl(var(--foreground) / 0.75)",
  "hsl(var(--foreground) / 0.55)",
  "hsl(var(--foreground) / 0.4)",
  "hsl(var(--foreground) / 0.28)",
  "hsl(var(--foreground) / 0.18)",
  "hsl(var(--foreground) / 0.1)",
];

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  },
  cursor: { fill: "hsl(var(--muted) / 0.5)" },
};

const renderPieLabel = ({ name, percent }: { name: string; percent: number }) =>
  `${name} (${(percent * 100).toFixed(0)}%)`;



const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md p-6 flex flex-col gap-2 shadow-2xl hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
  >
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="flex items-center justify-between relative z-10">
      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
        <Icon className={cn("relative z-10", icons.md)} />
      </div>
      {sub && (
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest flex items-center gap-1">
          <TrendingUp className={icons.xs} />
          {sub}
        </span>
      )}
    </div>

    <div className="mt-2 relative z-10">
      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</h3>
      <p className="text-3xl font-serif font-bold tracking-tight text-white">{value}</p>
    </div>
  </motion.div>
);

const PRESET_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: null },
] as const;

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAnalytics() {
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
  const [leadTrendGranularity, setLeadTrendGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [viewingType, setViewingType] = useState<'all' | 'completed'>('all'); // New state for session table

  const loadData = useCallback(async () => {
    setRefreshing(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sessQuery: any = supabase.from("discovery_analytics_sessions")
      .select("*, answers") // Include answers for new session table
      .order("started_at", { ascending: false })
      .limit(1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let evtQuery: any = supabase.from("discovery_analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let leadsQuery: any = supabase.from("leads_master")
      .select("*")
      .eq("source", "discovery_engine")
      .order("created_at", { ascending: false })
      .limit(500);

    if (dateFrom) {
      const from = startOfDay(dateFrom).toISOString();
      sessQuery = sessQuery.gte("started_at", from);
      evtQuery = evtQuery.gte("created_at", from);
      leadsQuery = leadsQuery.gte("created_at", from);
    }
    if (dateTo) {
      const to = endOfDay(dateTo).toISOString();
      sessQuery = sessQuery.lte("started_at", to);
      evtQuery = evtQuery.lte("created_at", to);
      leadsQuery = leadsQuery.lte("created_at", to);
    }

    const [sessRes, evtRes, leadsRes] = await Promise.all([sessQuery, evtQuery, leadsQuery]);
    if (sessRes.data) setSessions(sessRes.data);
    if (evtRes.data) setEvents(evtRes.data);
    if (leadsRes.data) setLeads(leadsRes.data);
    setLoading(false);
    setRefreshing(false);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePreset = (days: number | null) => {
    setActivePreset(days);
    if (days === null) {
      setDateFrom(undefined);
      setDateTo(undefined);
    } else {
      setDateFrom(subDays(new Date(), days));
      setDateTo(new Date());
    }
  };

  const exportSessions = () => {
    const headers = ["ID", "Started At", "Completed At", "Mode", "Completed", "Last Stage", "Time (s)", "User Agent"];
    const rows = sessions.map((s) => [
      s.id, s.started_at, s.completed_at ?? "", s.mode,
      String(s.is_completed), s.last_stage,
      s.completion_time_seconds != null ? String(s.completion_time_seconds) : "",
      s.user_agent ?? "",
    ]);
    downloadCsv(`sessions-${format(new Date(), "yyyy-MM-dd")}.csv`, toCsv(headers, rows));
  };

  const exportEvents = () => {
    const headers = ["ID", "Session ID", "Event Type", "Stage", "Meta", "Created At"];
    const rows = events.map((e) => [
      e.id, e.analytics_session_id, e.event_type,
      e.stage_name ?? "", JSON.stringify(e.meta ?? {}), e.created_at,
    ]);
    downloadCsv(`events-${format(new Date(), "yyyy-MM-dd")}.csv`, toCsv(headers, rows));
  };

  const exportLeads = () => {
    const headers = ["ID", "Name", "Email", "Phone", "City", "Project Type", "Budget Range", "Timeline", "Session ID", "Created At"];
    const rows = leads.map((l) => [
      l.id, l.name, l.email, l.phone ?? "", l.city ?? "",
      l.project_type ?? "", l.budget_range ?? "", l.timeline ?? "",
      l.session_id, l.created_at,
    ]);
    downloadCsv(`leads-${format(new Date(), "yyyy-MM-dd")}.csv`, toCsv(headers, rows));
  };

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.is_completed).length;
  const overallRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const completedTimes = sessions
    .map((s) => s.completion_time_seconds)
    .filter(Boolean) as number[];
  const avgTime = completedTimes.length > 0
    ? completedTimes.reduce((a, b) => a + b, 0) / completedTimes.length
    : null;

  const modeStats = computeModeStats(sessions);
  const dropoffs = computeDropoffs(sessions);
  const funnel = computeFunnel(sessions);
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);

  // Recent events (last 20)
  const recentEvents = events.slice(0, 20);

  // New analytics data for charts
  const analyticsData = useMemo(() => {
    const dailyStatsMap: Record<string, { date: string; sessions: number; completions: number }> = {};
    sessions.forEach(s => {
      const date = format(new Date(s.started_at), 'MMM d');
      if (!dailyStatsMap[date]) {
        dailyStatsMap[date] = { date, sessions: 0, completions: 0 };
      }
      dailyStatsMap[date].sessions++;
      if (s.is_completed) {
        dailyStatsMap[date].completions++;
      }
    });
    const dailyStats = Object.values(dailyStatsMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const serviceDistributionMap: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.answers && s.answers.services && Array.isArray(s.answers.services)) {
        s.answers.services.forEach((service: string) => {
          serviceDistributionMap[service] = (serviceDistributionMap[service] || 0) + 1;
        });
      }
    });
    const serviceDistribution = Object.entries(serviceDistributionMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { dailyStats, serviceDistribution };
  }, [sessions]);

  const COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff', '#4c1d95'];

  const filteredSessions = useMemo(() => {
    if (viewingType === 'completed') {
      return sessions.filter(s => s.is_completed);
    }
    return sessions;
  }, [sessions, viewingType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Quick Stats header inside the tab content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          <span>{totalSessions} session{totalSessions !== 1 ? "s" : ""} · {leads.length} lead{leads.length !== 1 ? "s" : ""} recorded from Discovery</span>
        </div>

        {/* Quick Date Range (Placeholder) */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
          <Button variant="ghost" size="sm" className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-yellow-500 rounded-lg shadow-sm h-auto hover:bg-zinc-800 transition-all">30 Days</Button>
          <Button variant="ghost" size="sm" className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors h-auto">7 Days</Button>
          <Button variant="ghost" size="sm" className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors h-auto">24 Hours</Button>
        </div>
      </div>

      {/* Internal View Tabs: Analytics vs Leads (Discovery specific) */}
      <div className="flex gap-2 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-1 rounded-2xl w-fit">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("analytics")}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "analytics"
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-zinc-500 hover:text-zinc-200"
          )}
        >
          <BarChart3 className={icons.sm} />
          Discovery Analytics
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("leads")}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "leads"
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-zinc-500 hover:text-zinc-200"
          )}
        >
          <UserCheck className={icons.sm} />
          Generated Leads
          {leads.length > 0 && (
            <span className={cn(
              "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
              activeTab === "leads" ? "bg-primary/20 text-primary" : "bg-white/5 text-zinc-500"
            )}>
              {leads.length}
            </span>
          )}
        </Button>
      </div>

      {activeTab === "analytics" && (<>
        {/* Date Range Filter Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-2 mb-8"
        >
          {PRESET_RANGES.map((p) => (
            <Button
              variant={activePreset === p.days ? "default" : "secondary"}
              size="sm"
              key={p.label}
              onClick={() => handlePreset(p.days)}
              className="text-xs h-8"
            >
              {p.label}
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className={icons.xs} />
                {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(d) => { setDateFrom(d); setActivePreset(null); }}
                disabled={(d) => d > new Date() || (dateTo ? d > dateTo : false)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <span className="text-xs text-muted-foreground">→</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className={icons.xs} />
                {dateTo ? format(dateTo, "MMM d, yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(d) => { setDateTo(d); setActivePreset(null); }}
                disabled={(d) => d > new Date() || (dateFrom ? d < dateFrom : false)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 ml-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className={icons.sm} />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 pointer-events-auto" align="end">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportSessions}
                    className="text-xs justify-start px-3 py-2 h-auto"
                  >
                    Sessions CSV ({sessions.length} rows)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportEvents}
                    className="text-xs justify-start px-3 py-2 h-auto"
                  >
                    Events CSV ({events.length} rows)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportLeads}
                    className="text-xs justify-start px-3 py-2 h-auto"
                  >
                    Leads CSV ({leads.length} rows)
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={refreshing}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={cn(icons.xs, refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
          <StatCard
            icon={Users}
            label="Total Sessions"
            value={totalSessions.toString()}
            sub="+12% vs last month" // Placeholder, actual calculation needed
            delay={0.1}
          />
          <StatCard
            icon={Activity}
            label="Completion Rate"
            value={`${overallRate.toFixed(1)}%`}
            sub="+5% vs last month" // Placeholder, actual calculation needed
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            label="Leads Generated"
            value={leads.length.toString()}
            sub="Active pipeline" // Placeholder
            delay={0.3}
          />
          <StatCard
            icon={Timer}
            label="Avg. Time"
            value={avgTime ? formatDuration(avgTime) : "—"}
            sub="Stable" // Placeholder
            delay={0.4}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif-display font-semibold flex items-center gap-2">
                <MousePointerClick className={cn("text-pink-500", icons.md)} />
                Engagement Trends
              </h3>
              {/* Custom Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                  <span className="text-muted-foreground">Sessions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-muted-foreground">Completions</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analyticsData.dailyStats}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#ec4899" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completions"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCompletions)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Service Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="text-lg font-serif-display font-semibold mb-6 flex items-center gap-2">
              <PieChartIcon className={cn("text-rose-500", icons.md)} />
              Service Distribution
            </h3>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {analyticsData.serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend for Pie Chart */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {analyticsData.serviceDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mode Breakdown */}
        {modeStats.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
              <Layers className={cn("text-muted-foreground", icons.md)} /> By Mode
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modeStats.map((m) => (
                <div key={m.mode} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="tracking-premium text-muted-foreground">{m.mode}</span>
                    <span className="text-2xl font-serif-display font-semibold">{m.rate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.rate}%` }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: `hsl(var(--gold))` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{m.completed}/{m.total} completed</span>
                    {m.avgTime !== null && <span>avg {formatDuration(m.avgTime)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Device & Browser Breakdown */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-10"
        >
          <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
            <Monitor className={cn("text-muted-foreground", icons.md)} /> Device & Browser
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="tracking-premium text-muted-foreground mb-4">Device Type</h3>
              <BreakdownBar items={computeBreakdown(sessions, "device")} delay={0.3} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="tracking-premium text-muted-foreground mb-4">Browser</h3>
              <BreakdownBar items={computeBreakdown(sessions, "browser")} delay={0.35} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="tracking-premium text-muted-foreground mb-4">Operating System</h3>
              <BreakdownBar items={computeBreakdown(sessions, "os")} delay={0.4} />
            </div>
          </div>
        </motion.section>

        {/* Funnel Visualization */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
            <TrendingDown className={cn("text-muted-foreground", icons.md)} /> Stage Funnel
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            {funnel.map((f, i) => (
              <div key={f.stage} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 text-right shrink-0 truncate">
                  {STAGE_LABELS[f.stage] ?? f.stage}
                </span>
                <div className="flex-1 h-7 rounded bg-white/5 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(f.count / maxFunnel) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.5 }}
                    className="h-full rounded"
                    style={{
                      background:
                        i === funnel.length - 1 && f.count > 0
                          ? `hsl(var(--gold))`
                          : `hsl(var(--foreground) / ${0.15 + (1 - i / funnel.length) * 0.25})`,
                    }}
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                    {f.count}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground w-12 shrink-0">
                  {f.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Drop-off Stages */}
        {dropoffs.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
              <TrendingDown className={cn("text-muted-foreground", icons.md)} /> Drop-off Points
            </h2>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md divide-y divide-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              {dropoffs.map((d) => (
                <div key={d.stage} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm">{STAGE_LABELS[d.stage] ?? d.stage}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{d.count} drop{d.count !== 1 ? "s" : ""}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">{d.pct.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recent Discovery Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-serif-display font-semibold flex items-center gap-2">
              <Download className={cn("text-indigo-400", icons.md)} />
              Recent Discovery Sessions
            </h3>

            <div className="flex bg-background/50 backdrop-blur-sm rounded-lg p-1 border border-white/5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingType('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors h-auto ${viewingType === 'all' ? 'bg-white/10 text-foreground shadow-sm hover:bg-white/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                All Sessions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingType('completed')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors h-auto ${viewingType === 'completed' ? 'bg-white/10 text-foreground shadow-sm hover:bg-white/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Completed Leads
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full text-sm text-left">
              <TableHeader className="bg-white/5 text-muted-foreground font-medium border-b border-white/5">
                <TableRow>
                  <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Date</TableHead>
                  <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Session ID</TableHead>
                  <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Platform</TableHead>
                  <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Services</TableHead>
                  <TableHead className="px-6 py-4 font-medium border-none bg-transparent">Timeline</TableHead>
                  <TableHead className="px-6 py-4 font-medium text-right border-none bg-transparent">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell className="px-6 py-5 border-none"><div className="h-4 bg-white/10 rounded w-24"></div></TableCell>
                      <TableCell className="px-6 py-5 border-none"><div className="h-4 bg-white/10 rounded w-32"></div></TableCell>
                      <TableCell className="px-6 py-5 border-none"><div className="h-4 bg-white/10 rounded w-20"></div></TableCell>
                      <TableCell className="px-6 py-5 border-none"><div className="h-4 bg-white/10 rounded w-48"></div></TableCell>
                      <TableCell className="px-6 py-5 border-none"><div className="h-4 bg-white/10 rounded w-24"></div></TableCell>
                      <TableCell className="px-6 py-5 flex justify-end border-none"><div className="h-6 bg-white/10 rounded-full w-20"></div></TableCell>
                    </TableRow>
                  ))
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-12 text-center text-muted-foreground border-none">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                          <Users className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-base font-medium text-foreground">No sessions found</p>
                        <p className="text-sm">No discovery sessions match the current filter.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session: SessionRow) => (
                    <TableRow key={session.id} className="hover:bg-white/5 transition-colors group align-middle border-t border-white/5">
                      <TableCell className="px-6 py-4 whitespace-nowrap text-muted-foreground border-none">
                        {format(new Date(session.started_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-mono text-xs text-foreground/80 group-hover:text-pink-400 transition-colors border-none">
                        ...{session.id.slice(-8)}
                      </TableCell>
                      <TableCell className="px-6 py-4 border-none">
                        {(session.answers?.platform as string) || "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 max-w-xs truncate border-none" title={(session.answers?.services as string[] | undefined)?.join(", ")}>
                        {session.answers?.services ? (
                          <div className="flex gap-1.5 flex-wrap">
                            {(session.answers.services as string[]).slice(0, 2).map((s: string, i: number) => (
                              <span key={i} className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/20">
                                {s}
                              </span>
                            ))}
                            {(session.answers.services as string[]).length > 2 && (
                              <span className="bg-white/5 text-muted-foreground text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                                +{(session.answers.services as string[]).length - 2}
                              </span>
                            )}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 border-none">
                        {session.answers?.timeline ? (
                          <span className="flex items-center gap-1.5 text-xs">
                            <Clock className={cn("text-muted-foreground", icons.xs)} />
                            {session.answers.timeline as string}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right border-none">
                        {session.is_completed ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Captured Lead
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Incomplete
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Recent Events */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-lg font-serif-display font-medium mb-4">Recent Events</h2>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events recorded yet.</p>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-x-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Table className="w-full text-sm">
                <TableHeader className="bg-white/5">
                  <TableRow className="border-b border-white/10 text-left hover:bg-transparent">
                    <TableHead className="px-6 py-4 font-medium text-muted-foreground tracking-premium border-none">Event</TableHead>
                    <TableHead className="px-6 py-4 font-medium text-muted-foreground tracking-premium border-none">Stage</TableHead>
                    <TableHead className="px-6 py-4 font-medium text-muted-foreground tracking-premium hidden sm:table-cell border-none">Meta</TableHead>
                    <TableHead className="px-6 py-4 font-medium text-muted-foreground tracking-premium text-right border-none">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/5">
                  {recentEvents.map((evt) => (
                    <TableRow key={evt.id} className="hover:bg-white/5 transition-colors group border-t border-white/5">
                      <TableCell className="px-6 py-4 font-mono text-xs text-foreground/80 group-hover:text-pink-400 transition-colors border-none">{evt.event_type}</TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground border-none">
                        {evt.stage_name ? (STAGE_LABELS[evt.stage_name] ?? evt.stage_name) : "—"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs text-muted-foreground hidden sm:table-cell max-w-[200px] truncate border-none">
                        {evt.meta && Object.keys(evt.meta).length > 0
                          ? JSON.stringify(evt.meta)
                          : "—"}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs text-muted-foreground text-right whitespace-nowrap border-none">
                        {new Date(evt.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.section>
      </>)}

      {activeTab === "leads" && (<>
        {/* Date Range Filter Bar for Leads */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-2 mb-8"
        >
          {PRESET_RANGES.map((p) => (
            <Button
              variant={activePreset === p.days ? "default" : "secondary"}
              size="sm"
              key={p.label}
              onClick={() => handlePreset(p.days)}
              className="text-xs h-8"
            >
              {p.label}
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon size={14} />
                {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(d) => { setDateFrom(d); setActivePreset(null); }}
                disabled={(d) => d > new Date() || (dateTo ? d > dateTo : false)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <span className="text-xs text-muted-foreground">→</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !dateTo && "text-muted-foreground")}>
                <CalendarIcon size={14} />
                {dateTo ? format(dateTo, "MMM d, yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(d) => { setDateTo(d); setActivePreset(null); }}
                disabled={(d) => d > new Date() || (dateFrom ? d < dateFrom : false)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={exportLeads}
              className="text-xs gap-1.5"
            >
              <Download className={icons.sm} />
              Export Leads
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={refreshing}
              className="text-xs gap-1.5"
            >
              <RefreshCw size={14} className={cn(refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Lead Overview Stats - full width like reference image */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          <StatCard icon={UserCheck} label="Total Leads" value={String(leads.length)} delay={0} />
          <StatCard
            icon={MapPin}
            label="Cities"
            value={String(new Set(leads.map(l => l.city).filter(Boolean)).size)}
            sub="unique locations"
            delay={0.05}
          />
          <StatCard
            icon={Briefcase}
            label="Project Types"
            value={String(new Set(leads.map(l => l.project_type).filter(Boolean)).size)}
            sub="categories"
            delay={0.1}
          />
          <StatCard
            icon={DollarSign}
            label="High Intent"
            value={String(leads.filter(l => scoreLeadIntent(l).label === "High").length)}
            sub="qualified leads"
            delay={0.15}
          />
        </motion.div>

        {/* Lead Visualization Charts */}
        {leads.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
              <BarChart3 className={cn("text-muted-foreground", icons.md)} /> Lead Insights
            </h2>

            {/* Row 1: City Pie + Project Horizontal Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* City - Pie Chart */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="tracking-premium text-muted-foreground mb-4 flex items-center gap-2 text-xs">
                  <MapPin className={icons.sm} /> BY CITY
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={computeLeadBreakdown(leads, "city").slice(0, 6)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={35}
                        label={renderPieLabel}
                        labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                      >
                        {computeLeadBreakdown(leads, "city").slice(0, 6).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...CHART_TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Project Type - Horizontal Bar */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="tracking-premium text-muted-foreground mb-4 flex items-center gap-2 text-xs">
                  <Briefcase className={icons.sm} /> BY PROJECT TYPE
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={computeLeadBreakdown(leads, "project_type").slice(0, 6)} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip {...CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                        {computeLeadBreakdown(leads, "project_type").slice(0, 6).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Budget Vertical Bar + Intent Vertical Bar - full width */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Budget - Vertical Bar */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="tracking-premium text-muted-foreground mb-4 flex items-center gap-2 text-xs">
                  <DollarSign className={icons.sm} /> BY BUDGET RANGE
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={computeLeadBreakdown(leads, "budget_range").slice(0, 6)} margin={{ left: 0, right: 0, top: 4, bottom: 20 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip {...CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {computeLeadBreakdown(leads, "budget_range").slice(0, 6).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lead Count by Intent - Vertical Bar */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="tracking-premium text-muted-foreground mb-4 flex items-center gap-2 text-xs">
                  <UserCheck className={icons.sm} /> BY INTENT LEVEL
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const counts: Record<string, number> = {};
                        for (const l of leads) {
                          const intent = scoreLeadIntent(l).label;
                          counts[intent] = (counts[intent] ?? 0) + 1;
                        }
                        return ["High", "Medium", "Low"]
                          .filter(k => counts[k])
                          .map(name => ({ name, value: counts[name] }));
                      })()}
                      margin={{ left: 0, right: 0, top: 4, bottom: 4 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip {...CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        <Cell fill="hsl(142 71% 45% / 0.6)" />
                        <Cell fill="hsl(38 92% 50% / 0.6)" />
                        <Cell fill="hsl(var(--muted-foreground) / 0.4)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Lead Source Breakdown */}
        {leads.length > 0 && (() => {
          const sourceMap: Record<string, number> = {};
          for (const l of leads) {
            const src = l.lead_source || l.utm_source || "Unknown";
            sourceMap[src] = (sourceMap[src] ?? 0) + 1;
          }
          const sourceData = Object.entries(sourceMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
          const COLORS = [
            "hsl(var(--foreground) / 0.8)",
            "hsl(var(--foreground) / 0.6)",
            "hsl(var(--foreground) / 0.4)",
            "hsl(var(--foreground) / 0.25)",
            "hsl(var(--foreground) / 0.15)",
            "hsl(var(--foreground) / 0.1)",
          ];
          return (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-6"
            >
              <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
                <Globe className={cn("text-muted-foreground", icons.md)} /> Lead Sources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          strokeWidth={1}
                          stroke="hsl(var(--background))"
                        >
                          {sourceData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip {...CHART_TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sourceData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip {...CHART_TOOLTIP_STYLE} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Leads">
                          {sourceData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })()}

        {/* Lead Conversion Over Time */}
        {leads.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
              <TrendingDown className={cn("text-muted-foreground", icons.md)} /> Lead Conversion Over Time
            </h2>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={(() => {
                      const byDate: Record<string, { total: number; high: number; medium: number; low: number }> = {};
                      for (const l of leads) {
                        const d = new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        if (!byDate[d]) byDate[d] = { total: 0, high: 0, medium: 0, low: 0 };
                        byDate[d].total++;
                        const intent = scoreLeadIntent(l).label.toLowerCase() as "high" | "medium" | "low";
                        byDate[d][intent]++;
                      }
                      return Object.entries(byDate).map(([date, v]) => ({ date, ...v }));
                    })()}
                    margin={{ left: 0, right: 12, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line type="monotone" dataKey="total" stroke="hsl(var(--foreground) / 0.7)" strokeWidth={2} dot={{ r: 4 }} name="Total" />
                    <Line type="monotone" dataKey="high" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={{ r: 3 }} name="High Intent" />
                    <Line type="monotone" dataKey="medium" stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={{ r: 3 }} name="Medium Intent" />
                    <Line type="monotone" dataKey="low" stroke="hsl(var(--muted-foreground) / 0.5)" strokeWidth={1.5} dot={{ r: 3 }} name="Low Intent" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.section>
        )}

        {/* Lead Acquisition Trend (Cumulative) */}
        {leads.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif-display font-medium flex items-center gap-2">
                <TrendingDown className={cn("text-muted-foreground", icons.md)} /> Lead Acquisition Trend
              </h2>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
                {(["daily", "weekly", "monthly"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setLeadTrendGranularity(g)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-md transition-colors capitalize",
                      leadTrendGranularity === g
                        ? "bg-background text-foreground shadow-sm font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={(() => {
                      const sorted = [...leads].sort(
                        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                      );
                      const buckets: Record<string, number> = {};
                      for (const l of sorted) {
                        const d = new Date(l.created_at);
                        let key: string;
                        if (leadTrendGranularity === "daily") {
                          key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        } else if (leadTrendGranularity === "weekly") {
                          const weekStart = new Date(d);
                          weekStart.setDate(d.getDate() - d.getDay());
                          key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        } else {
                          key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                        }
                        buckets[key] = (buckets[key] ?? 0) + 1;
                      }
                      let cumulative = 0;
                      return Object.entries(buckets).map(([date, count]) => {
                        cumulative += count;
                        return { date, [leadTrendGranularity]: count, cumulative };
                      });
                    })()}
                    margin={{ left: 0, right: 12, top: 4, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="leadAcqGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="hsl(var(--foreground) / 0.6)"
                      strokeWidth={2}
                      fill="url(#leadAcqGradient)"
                      name="Cumulative Leads"
                    />
                    <Area
                      type="monotone"
                      dataKey={leadTrendGranularity}
                      stroke="hsl(142 71% 45% / 0.7)"
                      strokeWidth={1.5}
                      fill="hsl(142 71% 45% / 0.08)"
                      name={`${leadTrendGranularity.charAt(0).toUpperCase() + leadTrendGranularity.slice(1)} Leads`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.section>
        )}

        {/* Leads Management */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mb-16"
        >
          <h2 className="text-lg font-serif-display font-medium mb-4 flex items-center gap-2">
            <UserCheck className={cn("text-muted-foreground", icons.md)} /> Leads ({leads.length})
          </h2>
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads captured yet.</p>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-x-auto">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border text-left hover:bg-transparent">
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium border-none bg-transparent">Name</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium border-none bg-transparent">Email</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden sm:table-cell border-none bg-transparent">City</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden md:table-cell border-none bg-transparent">Project</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden md:table-cell border-none bg-transparent">Budget</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden lg:table-cell border-none bg-transparent">Timeline</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden lg:table-cell border-none bg-transparent">Source</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium hidden sm:table-cell border-none bg-transparent">Intent</TableHead>
                    <TableHead className="px-4 py-3 font-medium text-muted-foreground tracking-premium text-right border-none bg-transparent">Date</TableHead>
                    <TableHead className="px-4 py-3 w-10 border-none bg-transparent"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-muted/50 transition-colors cursor-pointer border-t border-border"
                    >
                      <TableCell className="px-4 py-2.5 font-medium border-none">{lead.name}</TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground text-xs border-none">{lead.email}</TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell border-none">{lead.city || "—"}</TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground hidden md:table-cell border-none">{lead.project_type || "—"}</TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground hidden md:table-cell border-none">{lead.budget_range || "—"}</TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell border-none">{lead.timeline || "—"}</TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell border-none">{lead.lead_source || lead.utm_source || "—"}</TableCell>
                      <TableCell className="px-4 py-2.5 hidden sm:table-cell border-none">
                        {(() => {
                          const intent = scoreLeadIntent(lead);
                          return (
                            <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", intent.cls)}>
                              {intent.label}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-xs text-muted-foreground text-right whitespace-nowrap border-none">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground border-none">
                        <ChevronRight className={icons.sm} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.section>
      </>)}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-lg p-0 gap-0">
          {selectedLead && (() => {
            const linkedSession = sessions.find((s) => {
              // Match via discovery_session_id if analytics sessions link to discovery sessions
              return false;
            });

            return (<>
              <DialogHeader className="p-6 pb-4 border-b border-border">
                <DialogTitle className="text-lg font-serif-display">{selectedLead.name}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  Lead captured {new Date(selectedLead.created_at).toLocaleString()}
                  {(() => {
                    const intent = scoreLeadIntent(selectedLead);
                    return (
                      <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", intent.cls)}>
                        {intent.label} Intent
                      </span>
                    );
                  })()}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-5">
                {/* Contact Info */}
                <div>
                  <h3 className="text-xs tracking-premium text-muted-foreground mb-3">CONTACT</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail className={cn("text-muted-foreground shrink-0", icons.sm)} />
                      <a href={`mailto:${selectedLead.email}`} className="text-foreground hover:underline">{selectedLead.email}</a>
                    </div>
                    {selectedLead.phone && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <Phone className={cn("text-muted-foreground shrink-0", icons.sm)} />
                        <a href={`tel:${selectedLead.phone}`} className="text-foreground hover:underline">{selectedLead.phone}</a>
                      </div>
                    )}
                    {selectedLead.city && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <MapPin className={cn("text-muted-foreground shrink-0", icons.sm)} />
                        <span>{selectedLead.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h3 className="text-xs tracking-premium text-muted-foreground mb-3">PROJECT DETAILS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-md border border-border p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Briefcase className={icons.xs} />
                        <span className="text-[10px] tracking-premium">TYPE</span>
                      </div>
                      <span className="text-sm font-medium">{selectedLead.project_type || "—"}</span>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <DollarSign className={icons.xs} />
                        <span className="text-[10px] tracking-premium">BUDGET</span>
                      </div>
                      <span className="text-sm font-medium">{selectedLead.budget_range || "—"}</span>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Timer className={icons.xs} />
                        <span className="text-[10px] tracking-premium">TIMELINE</span>
                      </div>
                      <span className="text-sm font-medium">{selectedLead.timeline || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Source Info */}
                {(selectedLead.lead_source || selectedLead.utm_source) && (
                  <div>
                    <h3 className="text-xs tracking-premium text-muted-foreground mb-3">SOURCE</h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Globe className={cn("text-muted-foreground shrink-0", icons.sm)} />
                        <span>{selectedLead.lead_source || selectedLead.utm_source}</span>
                      </div>
                      {selectedLead.utm_medium && (
                        <div className="text-xs text-muted-foreground ml-6">
                          Medium: {selectedLead.utm_medium}
                        </div>
                      )}
                      {selectedLead.utm_campaign && (
                        <div className="text-xs text-muted-foreground ml-6">
                          Campaign: {selectedLead.utm_campaign}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Session Link */}
                <div>
                  <h3 className="text-xs tracking-premium text-muted-foreground mb-3">LINKED SESSION</h3>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs font-mono text-muted-foreground truncate">{selectedLead.session_id}</p>
                    <a
                      href={`/results/${selectedLead.session_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs mt-1.5 inline-block hover:underline"
                      style={{ color: "hsl(var(--gold))" }}
                    >
                      View results page →
                    </a>
                  </div>
                </div>
              </div>
            </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0">
          {selectedSession && (() => {
            const sessionEvents = events
              .filter((e) => e.analytics_session_id === selectedSession.id)
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            const parsed = selectedSession.user_agent ? parseUA(selectedSession.user_agent) : null;

            return (<>
              <DialogHeader className="p-6 pb-4 border-b border-border">
                <DialogTitle className="text-lg font-serif-display">Session Detail</DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground mt-1">
                  {selectedSession.id}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(85vh-120px)]">
                <div className="p-6 space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground block mb-1">Status</span>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                        selectedSession.is_completed
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      )}>
                        {selectedSession.is_completed ? "Completed" : "Dropped"}
                      </span>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground block mb-1">Mode</span>
                      <span className="text-sm font-medium">{selectedSession.mode}</span>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground block mb-1">Last Stage</span>
                      <span className="text-sm font-medium">{STAGE_LABELS[selectedSession.last_stage] ?? selectedSession.last_stage}</span>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground block mb-1">Duration</span>
                      <span className="text-sm font-medium">
                        {selectedSession.completion_time_seconds != null
                          ? formatDuration(selectedSession.completion_time_seconds)
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Timestamps & Device */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Started: <span className="text-foreground">{new Date(selectedSession.started_at).toLocaleString()}</span></p>
                      {selectedSession.completed_at && (
                        <p className="text-muted-foreground">Completed: <span className="text-foreground">{new Date(selectedSession.completed_at).toLocaleString()}</span></p>
                      )}
                    </div>
                    {parsed && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Device: <span className="text-foreground">{parsed.device}</span></p>
                        <p className="text-muted-foreground">Browser: <span className="text-foreground">{parsed.browser} / {parsed.os}</span></p>
                      </div>
                    )}
                  </div>

                  {/* Stage progress visualization */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Journey Progress</h3>
                    <div className="flex gap-1">
                      {STAGE_ORDER.map((stage) => {
                        const reached = STAGE_ORDER.indexOf(selectedSession.last_stage) >= STAGE_ORDER.indexOf(stage);
                        return (
                          <div key={stage} className="flex-1 group relative">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-colors",
                                reached ? "bg-foreground/40" : "bg-muted"
                              )}
                              style={reached && stage === selectedSession.last_stage ? { background: "hsl(var(--gold))" } : undefined}
                            />
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {STAGE_LABELS[stage]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Event Timeline */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Event Timeline ({sessionEvents.length} events)</h3>
                    {sessionEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No events found for this session.</p>
                    ) : (
                      <div className="relative pl-4 border-l border-border space-y-0">
                        {sessionEvents.map((evt, i) => {
                          const prevTime = i > 0 ? new Date(sessionEvents[i - 1].created_at).getTime() : null;
                          const currTime = new Date(evt.created_at).getTime();
                          const delta = prevTime ? (currTime - prevTime) / 1000 : null;

                          return (
                            <div key={evt.id} className="relative pb-4 last:pb-0">
                              <div className="absolute -left-[calc(1rem+4.5px)] top-1.5 w-2 h-2 rounded-full bg-foreground/30 border border-background" />
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-medium text-foreground">{evt.event_type}</span>
                                    {evt.stage_name && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                        {STAGE_LABELS[evt.stage_name] ?? evt.stage_name}
                                      </span>
                                    )}
                                    {delta !== null && (
                                      <span className="text-[10px] text-muted-foreground">
                                        +{delta < 60 ? `${delta.toFixed(1)}s` : `${(delta / 60).toFixed(1)}m`}
                                      </span>
                                    )}
                                  </div>
                                  {evt.meta && Object.keys(evt.meta).length > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate max-w-md">
                                      {JSON.stringify(evt.meta)}
                                    </p>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                                  {new Date(evt.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

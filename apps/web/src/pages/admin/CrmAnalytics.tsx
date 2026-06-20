import React from 'react';
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { leadRepo } from "@/repositories";
import { PageSkeleton } from "@/components/ui/enhanced/PageSkeleton";
import {
  calculateLeadScore,
  getLeadHealth,
  getLeadTemperature,
  buildForecast,
  getWeightedValue,
  formatINR,
  type Lead,
} from "@/lib/scoring/leadScoring";
import { leadStatusOptions } from "@/lib/validation/validations";
import {
  AlertTriangle,
  TrendingUp,
  Target,
  Clock,
  Activity,
  ShieldCheck,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  BrainCircuit,
  PhoneForwarded,
  Users,
  Globe,
  Calculator,
  Sparkles,
  Megaphone,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, PieChart, Pie, LabelList } from "recharts";

// ─── Source Normalizer ────────────────────────────────────────────────────────
// Single source of truth: maps every raw DB value → canonical key
function normalizeSource(raw: string | null | undefined): string {
  const s = (raw ?? "").toLowerCase().trim();
  if (!s) return "other";
  // Interactive platform channels
  if (s === "aesthetic_discovery_engine" || s === "style_quiz" || s.includes("discovery") || s.includes("quiz")) return "discovery_engine";
  if (s === "website_contact" || s === "contact-form" || s === "contact_form" || s.includes("contact")) return "website_contact";
  if (s === "estimator" || s.includes("estimator") || s.includes("estimate")) return "estimator";
  if (s === "welcome_popup" || s.includes("popup") || s.includes("welcome")) return "welcome_popup";
  // Referral
  if (s === "referral" || s.includes("referral")) return "referral";
  // Social media
  if (s === "instagram" || s.includes("instagram")) return "instagram";
  if (s === "facebook" || s.includes("facebook")) return "facebook";
  if (s === "whatsapp" || s.includes("whatsapp")) return "whatsapp";
  // Social catch-all (before website/google to avoid false matches)
  if (s === "social" || s.includes("social")) return "social";
  // Paid search
  if (s === "google_ads" || s === "google" || s.includes("paid") || s.includes("ads") || s.includes("ppc")) return "google_ads";
  // Organic website (fallback after more specific checks)
  if (s === "website" || s === "organic" || s.includes("website") || s.includes("organic")) return "website_contact";
  return "other";
}

// ─── Source Metadata ─────────────────────────────────────────────────────────
const SOURCE_META: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string; description: string }> = {
  // ── Platform / Digital channels ──────────────────────────────────────────
  website_contact:   { label: "Website Form",          icon: Globe,        color: "text-blue-400",    bgColor: "bg-blue-500/10 border-blue-500/20",      description: "Contact form + organic website visitors" },
  estimator:         { label: "Cost Estimator",         icon: Calculator,   color: "text-amber-400",   bgColor: "bg-amber-500/10 border-amber-500/20",    description: "Interactive cost estimator tool" },
  discovery_engine:  { label: "Aesthetic Discovery",    icon: Sparkles,     color: "text-purple-400",  bgColor: "bg-purple-500/10 border-purple-500/20",  description: "Style quiz & Aesthetic Discovery Engine" },
  welcome_popup:     { label: "Welcome Popup",          icon: Megaphone,    color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", description: "Exit-intent welcome popup" },
  referral:          { label: "Referral",               icon: UserCheck,    color: "text-cyan-400",    bgColor: "bg-cyan-500/10 border-cyan-500/20",      description: "Word-of-mouth & partner referrals" },
  // ── Social & Paid ─────────────────────────────────────────────────────────
  instagram:         { label: "Instagram",              icon: Megaphone,    color: "text-pink-400",    bgColor: "bg-pink-500/10 border-pink-500/20",      description: "Instagram organic & paid" },
  facebook:          { label: "Facebook",               icon: Megaphone,    color: "text-blue-300",    bgColor: "bg-blue-400/10 border-blue-400/20",      description: "Facebook campaigns" },
  whatsapp:          { label: "WhatsApp",               icon: MessageSquare,color: "text-green-400",   bgColor: "bg-green-500/10 border-green-500/20",    description: "WhatsApp direct inquiries" },
  social:            { label: "Social Media",           icon: Megaphone,    color: "text-rose-400",    bgColor: "bg-rose-500/10 border-rose-500/20",      description: "Instagram / Facebook / other social" },
  google_ads:        { label: "Paid Search",            icon: Globe,        color: "text-yellow-400",  bgColor: "bg-yellow-500/10 border-yellow-500/20",  description: "Google Ads & PPC campaigns" },
};

const SOURCE_HEX_COLORS: Record<string, string> = {
  website_contact: "#3B82F6",
  estimator: "#F59E0B",
  discovery_engine: "#8B5CF6",
  welcome_popup: "#10B981",
  referral: "#06B6D4",
  instagram: "#EC4899",
  facebook: "#60A5FA",
  whatsapp: "#22C55E",
  social: "#F43F5E",
  google_ads: "#EAB308",
  other: "#9CA3AF",
};

// ─── Stage Labels ─────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  new: "New Inquiry",
  contacted: "Contacted",
  qualified: "Qualified",
  consultation_scheduled: "Consultation",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  final_review: "Final Review",
  won: "Won",
  lost: "Lost",
};

// ─── UI Components ────────────────────────────────────────────────────────────
function Card({ title, icon: Icon, children, className, badge }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; className?: string; badge?: React.ReactNode
}) {
  return (
    <div className={cn("bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-5 flex flex-col shadow-lg backdrop-blur-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--admin-text-muted))] flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-[hsl(var(--admin-primary))]" />}
          {title}
        </h3>
        {badge}
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

function KpiCard({ title, value, sub, trend, alert }: {
  title: string; value: React.ReactNode; sub?: string; trend?: "up" | "down" | "neutral"; alert?: boolean
}) {
  return (
    <div className={cn("bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-5 flex flex-col justify-between shadow-lg hover:border-[hsl(var(--admin-border-subtle))] transition-colors", alert && "border-[hsl(var(--admin-danger)/0.3)] bg-[hsl(var(--admin-danger-muted))]")}>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--admin-text-subtle))] mb-1">{title}</p>
      <div className={cn("text-2xl font-bold tracking-tight my-2", alert ? "text-[hsl(var(--admin-danger))]" : "text-[hsl(var(--admin-text))]")}>{value}</div>
      {sub && (
        <p className={cn("text-[11px] font-semibold", trend === "up" ? "text-[hsl(var(--admin-success))]" : trend === "down" ? "text-[hsl(var(--admin-danger))]" : "text-[hsl(var(--admin-text-muted))]")}>
          {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}{sub}
        </p>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomFunnelTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-2 shadow-2xl text-xs font-sans">
        <div className="font-semibold text-white">{payload[0].name}</div>
        <div className="text-[#9CA3AF] mt-0.5">value : <span className="font-extrabold text-white">{payload[0].value}</span></div>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-2 shadow-2xl text-xs font-sans">
        <div className="font-semibold text-white">{payload[0].name}</div>
        <div className="text-[#9CA3AF] mt-0.5">Leads: <span className="font-extrabold text-white">{payload[0].value}</span></div>
      </div>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CrmAnalytics() {
  const { data: rawLeads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      try {
        const raw = await leadRepo.getLeads();
        if (!Array.isArray(raw)) return [];
        return (raw as unknown as Lead[]).map((l) => ({
          ...l,
          score: l.score ?? calculateLeadScore(l),
        }));
      } catch {
        return [];
      }
    },
  });

  const forecast = useMemo(() => {
    try { return buildForecast(rawLeads); }
    catch { return { committed: 0, bestCase: 0, atRisk: [], stale: [], totalOpenValue: 0 }; }
  }, [rawLeads]);

  const analytics = useMemo(() => {
    const openLeads    = rawLeads.filter(l => l.status !== "won" && l.status !== "lost");
    const wonLeads     = rawLeads.filter(l => l.status === "won");
    const lostLeads    = rawLeads.filter(l => l.status === "lost");
    const totalLeads   = rawLeads.length;

    // ── KPI Metrics ──────────────────────────────────────────────────────────
    const winRate     = (wonLeads.length + lostLeads.length) > 0
      ? Math.round((wonLeads.length / (wonLeads.length + lostLeads.length)) * 100) : 0;
    const missingAction = openLeads.filter(l => !l.next_step).length;
    const actionSLA   = openLeads.length > 0 ? Math.round(((openLeads.length - missingAction) / openLeads.length) * 100) : 100;
    const missingBudget  = openLeads.filter(l => !l.budget_value_inr).length;
    const missingSource  = rawLeads.filter(l => !l.source && !l.lead_source).length;
    const staleLoss   = forecast.stale.reduce((s, l) => s + (l.budget_value_inr ?? 0), 0);
    const hotLeadsCount = openLeads.filter(l => getLeadTemperature(l.score ?? 0).priority === "hot").length;
    const weightedPipeline = openLeads.reduce((s, l) => s + getWeightedValue(l), 0);

    // ── Funnel Stages ─────────────────────────────────────────────────────────
    const funnelStages = leadStatusOptions
      .filter(s => s !== "won" && s !== "lost")
      .map(status => {
        const stageLeads = rawLeads.filter(l => l.status === status);
        return { id: status, name: STATUS_LABELS[status] ?? status, count: stageLeads.length, value: stageLeads.reduce((s, l) => s + (l.budget_value_inr ?? 0), 0) };
      })
      .filter(d => d.count > 0);

    // ── Source Intelligence (ALL sources merged) ───────────────────────────────
    const sourceMap: Record<string, { leads: number; won: number; lost: number; open: number; revenue: number; weightedValue: number; }> = {};
    
    // Pre-fill all known sources with 0 so they always show up in the UI
    Object.keys(SOURCE_META).forEach(key => {
      sourceMap[key] = { leads: 0, won: 0, lost: 0, open: 0, revenue: 0, weightedValue: 0 };
    });

    rawLeads.forEach(l => {
      const src = normalizeSource(l.source ?? l.lead_source);
      if (!sourceMap[src]) sourceMap[src] = { leads: 0, won: 0, lost: 0, open: 0, revenue: 0, weightedValue: 0 };
      sourceMap[src].leads++;
      if (l.status === "won") { sourceMap[src].won++; sourceMap[src].revenue += (l.budget_value_inr ?? 0); }
      else if (l.status === "lost") { sourceMap[src].lost++; }
      else { sourceMap[src].open++; sourceMap[src].weightedValue += getWeightedValue(l); }
    });

    const sourcePerformance = Object.entries(sourceMap)
      .map(([key, d]) => ({
        key,
        meta: SOURCE_META[key] ?? SOURCE_META.other,
        leads: d.leads,
        won: d.won,
        lost: d.lost,
        open: d.open,
        conv: d.leads > 0 ? Math.round((d.won / d.leads) * 100) : 0,
        revenue: d.revenue,
        pipeline: d.weightedValue,
        share: totalLeads > 0 ? Math.round((d.leads / totalLeads) * 100) : 0,
      }))
      .sort((a, b) => b.leads - a.leads);

    // ── Data Health ───────────────────────────────────────────────────────────
    const totalHealthFields = openLeads.length * 3;
    const validHealthFields = totalHealthFields - (missingBudget + missingAction + missingSource);
    const healthScore = totalHealthFields > 0 ? Math.round((validHealthFields / totalHealthFields) * 100) : 100;

    // ── Opportunity Radar ─────────────────────────────────────────────────────
    const radar = openLeads
      .filter(l => (l.score ?? 0) >= 55)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5)
      .map(l => ({ ...l, closeProb: Math.min(Math.round((l.score ?? 0) * 0.95), 98) }));

    // ── AI Insights ───────────────────────────────────────────────────────────
    const topSource      = sourcePerformance[0];
    const topConvSource  = [...sourcePerformance].sort((a, b) => b.conv - a.conv)[0];
    const topRevSource   = [...sourcePerformance].sort((a, b) => b.revenue - a.revenue)[0];
    const insights = [
      forecast.stale.length > 0
        ? { color: "text-red-400", dot: "bg-red-400", text: `${forecast.stale.length} stale leads worth ${formatINR(staleLoss)} are idling and at risk of being lost.` }
        : { color: "text-emerald-400", dot: "bg-emerald-400", text: `Pipeline is healthy. No stale leads detected.` },
      topSource && topSource.leads > 0
        ? { color: "text-blue-400", dot: "bg-blue-400", text: `${topSource.meta.label} drives the highest lead volume with ${topSource.leads} leads (${topSource.share}% of total).` }
        : null,
      topConvSource && topConvSource.conv > 0
        ? { color: "text-emerald-400", dot: "bg-emerald-400", text: `${topConvSource.meta.label} has the best conversion rate at ${topConvSource.conv}%. Prioritise this channel.` }
        : null,
      topRevSource && topRevSource.revenue > 0
        ? { color: "text-amber-400", dot: "bg-amber-400", text: `${topRevSource.meta.label} generates the highest revenue: ${formatINR(topRevSource.revenue)} from won deals.` }
        : null,
      missingAction > 0
        ? { color: "text-red-400", dot: "bg-red-400", text: `${missingAction} open leads have no next action planned. Team SLA at ${actionSLA}%.` }
        : { color: "text-emerald-400", dot: "bg-emerald-400", text: `All open leads have a next action planned. Team SLA at 100%.` },
    ].filter(Boolean) as { color: string; dot: string; text: string }[];

    // ── Funnel / Source charting structures for Recharts ──────────────────────
    const firstStageCount = funnelStages[0]?.count || 1;
    const funnelChartData = funnelStages.map(stage => {
      const percentage = Math.round((stage.count / firstStageCount) * 100);
      return {
        name: stage.name,
        value: stage.count,
        percentage: `${percentage}%`,
        rawPct: percentage,
      };
    });

    const sourcePieData = sourcePerformance
      .filter(src => src.leads > 0)
      .map(src => ({
        name: src.meta.label,
        value: src.leads,
        color: SOURCE_HEX_COLORS[src.key] ?? SOURCE_HEX_COLORS.other,
      }));

    return {
      openLeads, wonLeads, lostLeads, totalLeads,
      winRate, actionSLA, missingBudget, missingAction, missingSource,
      staleLoss, hotLeadsCount, weightedPipeline,
      funnelStages, sourcePerformance, healthScore, radar, insights,
      funnelChartData, sourcePieData,
    };
  }, [rawLeads, forecast]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="bg-[hsl(var(--admin-bg))] h-full overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 text-[hsl(var(--admin-text))] custom-scrollbar">

      {/* ── LAYER 1: EXECUTIVE COMMAND STRIP ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard title="Total Leads"       value={analytics.totalLeads}                         sub="All time"                       trend="neutral" />
        <KpiCard title="Pipeline Value"    value={formatINR(forecast.totalOpenValue)}            sub={`${analytics.openLeads.length} open deals`} trend="up" />
        <KpiCard title="Weighted Forecast" value={formatINR(analytics.weightedPipeline)}         sub="Risk-adjusted value"            trend="neutral" />
        <KpiCard title="Revenue At Risk"   value={formatINR(analytics.staleLoss)}                sub={`${forecast.stale.length} stale leads`} alert={forecast.stale.length > 0} />
        <KpiCard title="Conversion Rate"   value={`${analytics.winRate}%`}                      sub="Won / (Won + Lost)"             trend={analytics.winRate >= 20 ? "up" : "down"} />
        <KpiCard title="Hot Leads"         value={analytics.hotLeadsCount}                       sub="Score ≥ 70, needs attention"    alert={analytics.hotLeadsCount > 0} />
      </div>

      <Card title="Executive Intelligence" icon={BrainCircuit} className="border-[hsl(var(--admin-primary))/30]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {analytics.insights.map((insight, i) => (
            <div key={i} className="flex gap-3 items-start bg-[hsl(var(--admin-surface))]/50 rounded-lg p-3 border border-[hsl(var(--admin-border))]/60">
              <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", insight.dot)} />
              <p className="text-[13px] text-[hsl(var(--admin-text))] leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* ── LAYER 3: REVENUE FLOW MAP ────────────────────────────────── */}
        {/* ── LAYER 3: CHANNEL VOLUME BREAKDOWN ────────────────────────────── */}
        <Card title="Channel Volume Breakdown" icon={Activity} className="xl:col-span-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2.5 py-1">
            {analytics.sourcePerformance.map(src => {
              const Icon = src.meta.icon;
              return (
                <div key={src.key} className={cn("border rounded-xl p-3 flex flex-col justify-between gap-1.5 transition-all hover:scale-[1.02]", src.meta.bgColor)}>
                  <div className="flex items-center justify-between">
                    <Icon className={cn("w-4 h-4", src.meta.color)} />
                    <span className="text-[10px] text-[#9CA3AF] font-medium">{src.share}% share</span>
                  </div>
                  <div>
                    <div className={cn("text-lg font-extrabold leading-none", src.meta.color)}>{src.leads}</div>
                    <div className="text-[11px] font-semibold text-[#E5E7EB] mt-1 truncate">{src.meta.label}</div>
                  </div>
                  <div className="w-full bg-[#1F232C]/40 rounded-full h-1 mt-0.5">
                    <div className={cn("h-1 rounded-full", src.meta.color.replace("text-", "bg-").replace("-400", "-500"))} style={{ width: `${src.share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── LAYER 4: SOURCE INTELLIGENCE (Full) ──────────────────────── */}
        <Card title="Source Intelligence" icon={Target} className="xl:col-span-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead>
                <tr className="text-[10px] uppercase text-[hsl(var(--admin-text-muted))] border-b border-[hsl(var(--admin-border))]">
                  <th className="pb-2 pr-4 font-bold">Source</th>
                  <th className="pb-2 px-3 font-bold text-center">Total</th>
                  <th className="pb-2 px-3 font-bold text-center">Open</th>
                  <th className="pb-2 px-3 font-bold text-center">Won</th>
                  <th className="pb-2 px-3 font-bold text-center">Lost</th>
                  <th className="pb-2 px-3 font-bold text-center">Conv%</th>
                  <th className="pb-2 px-3 font-bold text-right">Revenue</th>
                  <th className="pb-2 pl-3 font-bold text-right">Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sourcePerformance.map((src) => {
                  const Icon = src.meta.icon;
                  return (
                    <tr key={src.key} className="border-b border-[hsl(var(--admin-border-subtle))] hover:bg-[hsl(var(--admin-surface))/0.3] transition-colors last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center border", src.meta.bgColor)}>
                            <Icon className={cn("w-3.5 h-3.5", src.meta.color)} />
                          </div>
                          <div>
                            <div className="font-semibold text-[hsl(var(--admin-text))] text-sm">{src.meta.label}</div>
                            <div className="text-[10px] text-[hsl(var(--admin-text-muted))]">{src.share}% of total</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-[hsl(var(--admin-text))] font-bold">{src.leads}</td>
                      <td className="py-3 px-3 text-center text-[hsl(var(--admin-info))]">{src.open}</td>
                      <td className="py-3 px-3 text-center text-[hsl(var(--admin-success))] font-medium">{src.won}</td>
                      <td className="py-3 px-3 text-center text-[hsl(var(--admin-danger))]">{src.lost}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={cn("font-bold text-sm", src.conv >= 20 ? "text-[hsl(var(--admin-success))]" : src.conv >= 10 ? "text-[hsl(var(--admin-primary))]" : "text-[hsl(var(--admin-text-muted))])")}>
                          {src.conv}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[hsl(var(--admin-success))] font-medium">{formatINR(src.revenue)}</td>
                      <td className="py-3 pl-3 text-right text-[hsl(var(--admin-info))] font-medium">{formatINR(src.pipeline)}</td>
                    </tr>
                  );
                })}
                {analytics.sourcePerformance.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-[hsl(var(--admin-text-muted))] text-sm">No lead source data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── LAYER 4: Pipeline charts row ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <Card title="Pipeline Funnel" icon={TrendingUp} className="w-full">
          <p className="text-xs text-[#9CA3AF] -mt-2 mb-4">Lead volume by stage</p>
          <div className="h-[280px] w-full flex items-center justify-center">
            {analytics.funnelChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.funnelChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomFunnelTooltip />} cursor={{ fill: "#374151/20" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {analytics.funnelChartData.map((entry, index) => {
                      const colors = ["#FBBF24", "#34D399", "#8B5CF6", "#EC4899", "#F43F5E", "#3B82F6", "#06B6D4"];
                      const color = colors[index % colors.length];
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                    <LabelList
                      dataKey="percentage"
                      position="right"
                      fill="#9CA3AF"
                      style={{ fontSize: "11px", fontWeight: "bold" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-[#9CA3AF] text-sm">No open leads in pipeline.</div>
            )}
          </div>
        </Card>

        {/* Lead Source Breakdown */}
        <Card title="Lead Source Breakdown" icon={Target} className="w-full">
          <p className="text-xs text-[#9CA3AF] -mt-2 mb-4">Acquisition channel distribution</p>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {analytics.sourcePieData.length > 0 ? (
              <>
                <div className="w-[180px] h-[180px] shrink-0 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.sourcePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analytics.sourcePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-white">{analytics.totalLeads}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">Total</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {analytics.sourcePieData.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#374151]/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-[#9CA3AF] font-medium truncate max-w-[150px]">{entry.name}</span>
                      </div>
                      <span className="font-bold text-white text-sm">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-[#9CA3AF] text-sm">No source data available.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── LAYER 5: PIPELINE RISK CENTER ─────────────────────────────── */}
        <Card title="Pipeline Risk Center" icon={AlertTriangle} className="border-[hsl(var(--admin-danger)/0.2)]">
          <div className="space-y-3">
            {forecast.stale.slice(0, 4).map(lead => {
              const health = getLeadHealth(lead);
              const src = normalizeSource(lead.source ?? lead.lead_source);
              const srcMeta = SOURCE_META[src] ?? SOURCE_META.other;
              const SrcIcon = srcMeta.icon;
              return (
                <div key={lead.id} className="bg-[hsl(var(--admin-danger-muted))] border border-[hsl(var(--admin-danger)/0.2)] rounded-lg p-3 flex items-center justify-between hover:bg-[hsl(var(--admin-danger-muted))/1.5] transition-colors">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="font-bold text-[hsl(var(--admin-text))] truncate">{lead.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-[hsl(var(--admin-success))] font-medium">{formatINR(lead.budget_value_inr)}</span>
                      <span className="text-[10px] text-[hsl(var(--admin-danger))] flex items-center gap-1"><Clock className="w-3 h-3" />{health.freshnessDays}d idle</span>
                      <span className={cn("text-[10px] flex items-center gap-1 border rounded px-1.5 py-0.5", srcMeta.bgColor, srcMeta.color)}>
                        <SrcIcon className="w-2.5 h-2.5" />{srcMeta.label}
                      </span>
                    </div>
                  </div>
                  <button className="bg-[hsl(var(--admin-danger))] hover:bg-[hsl(var(--admin-danger)/0.9)] text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded shadow transition-colors flex items-center gap-1 shrink-0">
                    <PhoneForwarded className="w-3 h-3" /> Call
                  </button>
                </div>
              );
            })}
            {forecast.stale.length === 0 && (
              <div className="h-24 flex items-center justify-center text-[hsl(var(--admin-text-muted))] text-sm">✅ No high-risk stale leads.</div>
            )}
          </div>
        </Card>

        {/* ── LAYER 6: OPPORTUNITY RADAR ──────────────────────────────── */}
        <Card title="Opportunity Radar" icon={Target} className="border-[hsl(var(--admin-success)/0.2)]">
          <div className="space-y-3">
            {analytics.radar.map(lead => {
              const src = normalizeSource(lead.source ?? lead.lead_source);
              const srcMeta = SOURCE_META[src] ?? SOURCE_META.other;
              const SrcIcon = srcMeta.icon;
              return (
                <div key={lead.id} className="bg-[hsl(var(--admin-success-muted))] border border-[hsl(var(--admin-success)/0.2)] rounded-lg p-3 hover:bg-[hsl(var(--admin-success-muted))/1.5] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[hsl(var(--admin-text))]">{lead.name}</div>
                    <div className="text-xs font-bold text-[hsl(var(--admin-success))]">{lead.closeProb}% close</div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--admin-text-muted))]">
                    <div className="flex items-center gap-2">
                      <span className="text-[hsl(var(--admin-text))] font-medium">{formatINR(lead.budget_value_inr)}</span>
                      <span className={cn("flex items-center gap-1 border rounded px-1.5 py-0.5 text-[10px]", srcMeta.bgColor, srcMeta.color)}>
                        <SrcIcon className="w-2.5 h-2.5" />{srcMeta.label}
                      </span>
                    </div>
                    <span className="uppercase text-[10px] font-bold tracking-wider">{STATUS_LABELS[lead.status] ?? lead.status}</span>
                  </div>
                  <div className="mt-2 w-full bg-[hsl(var(--admin-border-subtle))] rounded-full h-1">
                    <div className="bg-[hsl(var(--admin-success))] h-1 rounded-full" style={{ width: `${lead.closeProb}%` }} />
                  </div>
                </div>
              );
            })}
            {analytics.radar.length === 0 && (
              <div className="h-24 flex items-center justify-center text-[#9CA3AF] text-sm">No high-score opportunities found.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LAYER 7: REVENUE FORECAST ──────────────────────────────────── */}
        <Card title="Revenue Forecast" icon={TrendingUp}>
          <div className="grid grid-cols-3 gap-3 flex-1">
            {[
              { label: "Committed", value: forecast.committed, note: "Won + Final Review", color: "text-[hsl(var(--admin-success))]", border: "border-[hsl(var(--admin-success)/0.2)] bg-[hsl(var(--admin-success-muted))]" },
              { label: "Likely", value: analytics.weightedPipeline, note: "Risk-weighted open", color: "text-[hsl(var(--admin-info))]", border: "border-[hsl(var(--admin-info)/0.3)] bg-[hsl(var(--admin-info-muted))] scale-105" },
              { label: "Best Case", value: forecast.bestCase, note: "All open at 100%", color: "text-[hsl(var(--admin-warning))]", border: "border-[hsl(var(--admin-warning)/0.2)] bg-[hsl(var(--admin-warning-muted))]" },
            ].map(f => (
              <div key={f.label} className={cn("rounded-lg border p-4 flex flex-col items-center text-center", f.border)}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-2">{f.label}</div>
                <div className={cn("text-lg font-bold mb-1", f.color)}>{formatINR(f.value)}</div>
                <div className="text-[9px] text-[hsl(var(--admin-text-subtle))]">{f.note}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── LAYER 8: DATA HEALTH ──────────────────────────────────────── */}
        <Card title="Data Integrity Health" icon={ShieldCheck}>
          <div className="flex items-center gap-5 h-full">
            <div className="w-28 h-28 shrink-0 relative flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path className="text-[hsl(var(--admin-border))]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path
                  className={analytics.healthScore > 90 ? "text-[hsl(var(--admin-success))]" : analytics.healthScore > 70 ? "text-[hsl(var(--admin-warning))]" : "text-[hsl(var(--admin-danger))]"}
                  strokeDasharray={`${analytics.healthScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="3"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{analytics.healthScore}%</span>
                <span className="text-[9px] uppercase tracking-widest text-[hsl(var(--admin-text-subtle))]">Health</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: "Missing Budget",    val: analytics.missingBudget },
                { label: "Missing Source",    val: analytics.missingSource },
                { label: "Missing Follow-up", val: analytics.missingAction },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--admin-text-muted))]">{r.label}</span>
                  <span className={r.val > 0 ? "text-[hsl(var(--admin-danger))] font-semibold" : "text-[hsl(var(--admin-success))]"}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── LAYER 9: ACTIVITY CENTER ─────────────────────────────────── */}
        <Card title="Activity Center" icon={Activity}>
          <div className="grid grid-cols-3 gap-2.5 h-full">
            {[
              { label: "Calls",      icon: Phone,          val: 48, color: "text-[hsl(var(--admin-info))]" },
              { label: "WhatsApp",   icon: MessageSquare,  val: 31, color: "text-[hsl(var(--admin-success))]" },
              { label: "Emails",     icon: Mail,           val: 12, color: "text-[hsl(var(--admin-warning))]" },
              { label: "Meetings",   icon: Calendar,       val: 6,  color: "text-[hsl(var(--admin-primary))]" },
              { label: "Notes",      icon: FileText,       val: 82, color: "text-[hsl(var(--admin-danger))]" },
              { label: "Team SLA",   icon: Users,          val: `${analytics.actionSLA}%`, color: analytics.actionSLA >= 95 ? "text-[hsl(var(--admin-success))]" : "text-[hsl(var(--admin-danger))]" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-[hsl(var(--admin-surface))]/60 rounded-lg border border-[hsl(var(--admin-border))]/50 flex flex-col items-center justify-center p-3">
                  <Icon className={cn("w-4 h-4 mb-1.5", item.color)} />
                  <span className={cn("text-xl font-bold", item.color)}>{item.val}</span>
                  <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--admin-text-subtle))] mt-0.5 text-center">{item.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

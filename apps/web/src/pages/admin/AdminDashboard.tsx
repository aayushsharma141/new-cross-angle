import { useEffect, useState, type ComponentType, type JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  Plus,
  TrendingUp,
  Download,
  Zap,
  Globe,
  Server,
  Package,
  Activity,
  BarChart3,
  Shield,
  Layers,
  ArrowRight,
  Clock,
  Send,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InsightCard } from "@/components/admin/dashboard/InsightCard";
import { AdminKPI } from "@/components/admin/dashboard/AdminKPI";
import { QuickActionButton } from "@/components/admin/QuickActions";
import { Button } from "@/components/ui/primitives/button";
import { ProjectPipelineChart } from "@/components/admin/analytics/ProjectPipelineChart";
import { LeadFunnelChart } from "@/components/admin/analytics/LeadFunnelChart";
import { LeadSourceChart } from "@/components/admin/analytics/LeadSourceChart";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";
import { CalendarDateRangePicker } from "@/components/ui/enhanced/date-range-picker";
import { useToast } from "@/hooks/useToast";
import { DateRange } from "react-day-picker";
import { subDays, endOfDay, formatDistanceToNow } from "date-fns";
import { useSystem } from "@/context/SystemContext";

interface DashboardStats {
  leads: number;
  projects: number;
  views: number;
  estimateLeads: number;
  conversionRate: number;
  avgRating: string;
  avgEstimate: number;
  cmsUpdates: number;
  mediaBytes: number;
  /** Number of data sources that failed to load. >0 means some KPIs show 0 due to errors. */
  failedSources: number;
}

type TabType = "website" | "server" | "product" | "system" | "business";

const TAB_IDS: TabType[] = ["business", "website", "product", "server", "system"];

const isTabType = (value: string | null): value is TabType =>
  value !== null && TAB_IDS.includes(value as TabType);

const formatStorage = (bytes: number): string => {
  if (bytes <= 0) return "0 MB";
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const downloadCsv = (filename: string, rows: string[][]): void => {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const AdminDashboard = (): JSX.Element => {
  const { toast } = useToast();
  const { health, refreshHealth } = useSystem();
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [closedInsights, setClosedInsights] = useState<Set<string>>(new Set());
  const activeTabParam = searchParams.get("tab");
  const activeTab: TabType = isTabType(activeTabParam) ? activeTabParam : "business";

  const handleDismissInsight = (id: string) => {
    setClosedInsights(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats", date],
    queryFn: async (): Promise<DashboardStats> => {
      const fromIso = date?.from?.toISOString();
      const toIso = date?.to ? endOfDay(date.to).toISOString() : undefined;

      let projectsQuery = supabase.from("projects").select("id, status, views", { count: "exact" });
      let leadsQuery = supabase.from("leads").select("id, status", { count: "exact" });
      const testimonialsQuery = supabase.from("testimonials").select("id, rating", { count: "exact" }).eq("active", true);
      let estimateQuery = supabase.from("leads").select("id, estimated_min", { count: "exact" }).eq("lead_source", "estimator");
      let blogsQuery = supabase.from("blog_posts").select("id", { count: "exact" });
      let websiteEventsQuery = supabase.from("website_events").select("id", { count: "exact" }).eq("event_type", "page_view");
      const mediaQuery = supabase.rpc("get_total_media_bytes");

      if (fromIso) {
        projectsQuery = projectsQuery.gte("created_at", fromIso);
        leadsQuery = leadsQuery.gte("created_at", fromIso);
        estimateQuery = estimateQuery.gte("created_at", fromIso);
        blogsQuery = blogsQuery.gte("created_at", fromIso);
        websiteEventsQuery = websiteEventsQuery.gte("created_at", fromIso);
      }

      if (toIso) {
        projectsQuery = projectsQuery.lte("created_at", toIso);
        leadsQuery = leadsQuery.lte("created_at", toIso);
        estimateQuery = estimateQuery.lte("created_at", toIso);
        blogsQuery = blogsQuery.lte("created_at", toIso);
        websiteEventsQuery = websiteEventsQuery.lte("created_at", toIso);
      }

      const settled = await Promise.allSettled([
        projectsQuery,
        leadsQuery,
        testimonialsQuery,
        estimateQuery,
        blogsQuery,
        websiteEventsQuery,
        mediaQuery,
      ]);

      // Log and count failures so we surface them instead of silently rendering 0
      const failedSources = settled.filter(r => r.status === 'rejected').length;
      if (failedSources > 0) {
        settled.forEach((r, i) => {
          if (r.status === 'rejected') {
            console.error(`[AdminDashboard] Data source #${i} failed:`, r.reason);
          }
        });
      }

      const ok = <T,>(r: PromiseSettledResult<T>): T | null =>
        r.status === 'fulfilled' ? r.value : null;

      const projectsRes   = ok(settled[0]);
      const leadsRes      = ok(settled[1]);
      const testimonialsRes = ok(settled[2]);
      const estimateRes   = ok(settled[3]);
      const blogsRes      = ok(settled[4]);
      const viewsRes      = ok(settled[5]);
      const mediaRes      = ok(settled[6]);

      const leads = (leadsRes as { data: Record<string, unknown>[] | null } | null)?.data || [];
      const totalLeads = (leadsRes as { count: number | null } | null)?.count || 0;
      const wonLeads = leads.filter((lead) => lead.status === "won").length;
      const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

      const ratings = ((testimonialsRes as { data: Record<string, unknown>[] | null } | null)?.data || [])
        .map((t) => t.rating)
        .filter((r): r is number => typeof r === "number");
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length).toFixed(1)
        : "—”";

      const estimates = (estimateRes as { data: Record<string, unknown>[] | null } | null)?.data || [];
      const avgEstimate = estimates.length > 0
        ? Math.round(estimates.reduce((sum: number, e) => sum + (Number(e.estimated_min) || 0), 0) / estimates.length)
        : 0;

      const mediaBytes = Number((mediaRes as { data: unknown } | null)?.data) || 0;

      return {
        leads: totalLeads,
        projects: (projectsRes as { count: number | null } | null)?.count || 0,
        views: (viewsRes as { count: number | null } | null)?.count || 0,
        estimateLeads: (estimateRes as { count: number | null } | null)?.count || 0,
        conversionRate,
        avgRating,
        avgEstimate,
        cmsUpdates: (blogsRes as { count: number | null } | null)?.count || 0,
        mediaBytes,
        failedSources,
      };
    },
  });

  const handleDownloadReport = (): void => {
    if (!stats) {
      toast({
        title: "Dashboard still loading",
        description: "Wait for the dashboard metrics to finish loading before exporting.",
        variant: "destructive",
      });
      return;
    }

    const fromLabel = date?.from?.toLocaleDateString() || "N/A";
    const toLabel = date?.to?.toLocaleDateString() || "N/A";

    downloadCsv(`admin-dashboard-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Metric", "Value"],
      ["Tab", activeTab],
      ["Date range", `${fromLabel} - ${toLabel}`],
      ["Total leads", String(stats.leads)],
      ["Projects", String(stats.projects)],
      ["Page views", String(stats.views)],
      ["Estimate requests", String(stats.estimateLeads)],
      ["Conversion rate", `${stats.conversionRate}%`],
      ["Average testimonial rating", stats.avgRating],
      ["Average estimate", String(stats.avgEstimate)],
      ["CMS updates", String(stats.cmsUpdates)],
      ["Media storage", formatStorage(stats.mediaBytes)],
      ["System health", health.status],
      ["Database", health.database],
      ["API", health.api],
      ["Storage", health.storage],
    ]);

    toast({
      title: "Report exported",
      description: "The dashboard CSV has been downloaded.",
    });
  };

  const tabs: { id: TabType; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { id: "business", label: "Business", icon: BarChart3 },
    { id: "website", label: "Website", icon: Globe },
    { id: "product", label: "Products", icon: Package },
    { id: "server", label: "Server", icon: Server },
    { id: "system", label: "System", icon: Activity },
  ];

  const fmt = (value: number | string | undefined | null): string =>
    value === undefined || value === null ? "..." : value.toLocaleString();

  const changeTab = (tab: TabType): void => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "business") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-serif text-[hsl(var(--admin-text))] tracking-tight">Dashboard</h2>
            <p className="text-[hsl(var(--admin-text-muted))] font-sans mt-1">CrossAngle Interior Business Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDateRangePicker date={date} setDate={setDate} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))] transition-all px-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="bg-[hsl(var(--admin-surface))] backdrop-blur-xl border border-[hsl(var(--admin-border))] p-1.5 rounded-2xl flex flex-wrap gap-2 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeTab(tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 group",
                  activeTab === tab.id
                    ? "bg-[hsl(var(--admin-primary))] text-black shadow-[0_0_20px_hsl(var(--admin-primary)/0.3)]"
                    : "text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-black" : "text-[hsl(var(--admin-text-subtle))] group-hover:text-[hsl(var(--admin-text-muted))]")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Data source failure warning ──────────────────────────────────────── */}
      {stats && stats.failedSources > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-400 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>{stats.failedSources}</strong> of 7 data source{stats.failedSources !== 1 ? 's' : ''} failed to
            load. Some metrics may show 0 instead of real values. Check the browser console for details.
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          {activeTab === "business" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {!closedInsights.has("conv-anomaly") && (
                <InsightCard 
                  title="Conversion Anomaly Detected"
                  description="Your lead-to-project conversion rate has dropped 12% this week. We recommend reviewing the Estimator stage drop-offs."
                  type="warning"
                  actionLabel="View Estimator Analytics"
                  onAction={() => changeTab("product")}
                  onDismiss={() => handleDismissInsight("conv-anomaly")}
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AdminKPI
                  title="Total Leads"
                  value={fmt(stats?.leads)}
                  numericValue={stats?.leads}
                  change={`${stats?.conversionRate || 0}% conversion`}
                  trend="up"
                  icon={Users}
                  variant="gold"
                  isLoading={statsLoading}
                />
                <AdminKPI
                  title="Pipeline Value"
                  value={`₹${((stats?.avgEstimate || 0) * (stats?.estimateLeads || 0) / 100000).toFixed(1)}L`}
                  change="Estimated pipeline"
                  trend="up"
                  icon={TrendingUp}
                  variant="accent"
                  isLoading={statsLoading}
                />
              </div>
              <ProjectPipelineChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LeadFunnelChart />
                <LeadSourceChart />
              </div>
            </div>
          )}

          {activeTab === "website" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <AdminKPI
                  title="Page Views"
                  value={fmt(stats?.views)}
                  numericValue={stats?.views}
                  change="Tracked events"
                  trend="neutral"
                  icon={Users}
                  variant="gold"
                  isLoading={statsLoading}
                />
                <AdminKPI
                  title="Telemetry"
                  value="Pending"
                  change="Engagement timing"
                  trend="neutral"
                  icon={Clock}
                  variant="secondary"
                  isLoading={statsLoading}
                />
                <AdminKPI
                  title="Bounce Rate"
                  value="Pending"
                  change="Needs analytics instrumentation"
                  trend="neutral"
                  icon={Zap}
                  variant="accent"
                  isLoading={statsLoading}
                />
              </div>
              <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[400px]">
                <Globe className="w-12 h-12 text-[hsl(var(--admin-primary))]/20 mb-4" />
                <h3 className="text-xl font-serif text-[hsl(var(--admin-text))]">Traffic Map Unavailable</h3>
                <p className="text-[hsl(var(--admin-text-muted))] text-sm max-w-xs mt-2">
                  Website event tracking is live, but location analytics has not been instrumented yet.
                </p>
              </div>
            </div>
          )}

          {activeTab === "product" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AdminKPI
                  title="Estimator Requests"
                  value={fmt(stats?.estimateLeads)}
                  numericValue={stats?.estimateLeads}
                  change="Qualified submissions"
                  trend="up"
                  icon={Layers}
                  variant="gold"
                  isLoading={statsLoading}
                />
                <AdminKPI
                  title="Avg. Estimate"
                  value={`₹${fmt(stats?.avgEstimate || 0)}`}
                  change="Average quote floor"
                  trend="neutral"
                  icon={Zap}
                  variant="accent"
                  isLoading={statsLoading}
                />
              </div>
              <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl p-6">
                <h3 className="text-lg font-serif text-[hsl(var(--admin-text))] mb-6">Lead Journey Performance</h3>
                <LeadFunnelChart />
              </div>
            </div>
          )}

          {activeTab === "server" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AdminKPI
                  title="Database"
                  value={health.database === "connected" ? "Online" : "Offline"}
                  change={`Checked ${formatDistanceToNow(new Date(health.lastChecked), { addSuffix: true })}`}
                  trend={health.database === "connected" ? "up" : "down"}
                  icon={Activity}
                  variant="secondary"
                />
                <AdminKPI
                  title="API"
                  value={health.api === "online" ? "Online" : "Offline"}
                  change="Supabase connectivity"
                  trend={health.api === "online" ? "up" : "down"}
                  icon={Zap}
                  variant="gold"
                />
              </div>
              <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6 overflow-hidden">
                <h3 className="text-lg font-serif text-[hsl(var(--admin-text))] mb-4">Infrastructure Logs</h3>
                <RecentActivityFeed dateRange={date} />
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <AdminKPI
                  title="CMS Updates"
                  value={fmt(stats?.cmsUpdates)}
                  numericValue={stats?.cmsUpdates}
                  change="Published content"
                  trend="neutral"
                  icon={Package}
                  variant="gold"
                  isLoading={statsLoading}
                />
                <AdminKPI
                  title="Media Load"
                  value={formatStorage(stats?.mediaBytes || 0)}
                  change="Supabase storage"
                  trend="neutral"
                  icon={Layers}
                  variant="secondary"
                  isLoading={statsLoading}
                />
                <AdminKPI
                  title="Security"
                  value={health.status === "healthy" ? "Healthy" : health.status === "degraded" ? "Degraded" : "Error"}
                  change="Live system status"
                  trend={health.status === "healthy" ? "up" : "down"}
                  icon={Shield}
                  variant="accent"
                />
              </div>
              <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl p-6">
                <h3 className="text-lg font-serif text-[hsl(var(--admin-text))] mb-4">Admin Audit Trail</h3>
                <RecentActivityFeed dateRange={date} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[hsl(var(--admin-card))] backdrop-blur-xl border border-[hsl(var(--admin-border))] rounded-2xl p-6">
            <h3 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <QuickActionButton icon={Plus} label="New Lead" href="/admin/crm/leads" gradient="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/50]" />
              <QuickActionButton icon={Package} label="CMS Build" href="/admin/cms/portfolio" gradient="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/50]" />
              <QuickActionButton icon={Send} label="Outreach" href="/admin/discovery/analytics" gradient="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/50]" />
              <QuickActionButton icon={Layers} label="Resources" href="/admin/cms/media" gradient="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/50]" />
            </div>
          </div>

          <div className="bg-[hsl(var(--admin-card))] backdrop-blur-xl border border-[hsl(var(--admin-border))] rounded-2xl p-6">
            <h3 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest mb-5">System Health</h3>
            <div className="space-y-4">
              {[
                {
                  name: "Database Cluster",
                  status: health.database === "connected" ? "Connected" : "Disconnected",
                  color: health.database === "connected" ? "text-[hsl(var(--admin-success))]" : "text-[hsl(var(--admin-danger))]",
                },
                {
                  name: "Supabase API",
                  status: health.api === "online" ? "Online" : "Offline",
                  color: health.api === "online" ? "text-[hsl(var(--admin-success))]" : "text-[hsl(var(--admin-danger))]",
                },
                {
                  name: "Media Storage",
                  status: health.storage === "available" ? "Available" : health.storage === "full" ? "Near Capacity" : "Error",
                  color: health.storage === "available" ? "text-[hsl(var(--admin-success))]" : health.storage === "full" ? "text-[hsl(var(--admin-warning))]" : "text-[hsl(var(--admin-danger))]",
                },
              ].map((item) => (
                <div key={item.name} className="flex justify-between items-center text-[13px]">
                  <span className="text-[hsl(var(--admin-text-muted))] font-sans">{item.name}</span>
                  <span className={cn("font-bold flex items-center gap-1.5", item.color)}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link to="/admin/discovery/analytics" className="block bg-[hsl(var(--admin-primary))]/5 border border-[hsl(var(--admin-primary))]/20 rounded-2xl p-6 group hover:bg-[hsl(var(--admin-primary))]/10 transition-all">
            <h3 className="text-sm font-bold text-[hsl(var(--admin-primary))] flex items-center justify-between mb-2">
              System Optimization
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-[hsl(var(--admin-text-muted))] text-xs leading-relaxed">
              New lead patterns detected from Discovery Engine. Review intent analytics to optimize conversion.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


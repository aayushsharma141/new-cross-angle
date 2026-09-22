import { useEffect, useState, lazy, Suspense, type JSX, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Send,
  Download,
  Loader2,
} from "lucide-react";

import { CalendarDateRangePicker } from "@/components/ui/enhanced/date-range-picker";
import { useToast } from "@/hooks/useToast";
import { DateRange } from "react-day-picker";
import { subDays, endOfDay } from "date-fns";
import { useSystem } from "@/context/SystemContext";
import { ModuleLayout, ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { useAdminDisplayName } from "@/hooks/useAdminDisplayName";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/primitives/button";

const OverviewTab = lazy(() => import("./tabs/OverviewTab"));
const TrafficTab = lazy(() => import("./tabs/TrafficTab"));
const SalesTab = lazy(() => import("./tabs/SalesTab"));
const SystemTab = lazy(() => import("./tabs/SystemTab"));
const ContentTab = lazy(() => import("./tabs/ContentTab"));
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";

type TabType = "overview" | "traffic" | "sales" | "system" | "content";

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

const TabFallback = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center h-64 flex-col gap-2">
    <Loader2 className="w-8 h-8 animate-spin text-admin-primary/50" />
    {label && <span className="text-xs text-[hsl(var(--admin-muted))]">Loading {label}…</span>}
  </div>
);

const AdminDashboard = (): JSX.Element => {
  const { toast } = useToast();
  const { health, refreshHealth } = useSystem();
  const { displayName } = useAdminDisplayName();
  const { can } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabType) || "overview";
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => { void refreshHealth(); }, [refreshHealth]);

  const changeTab = (tabId: TabType) => {
    setSearchParams({ tab: tabId });
  };

  const handleDownloadReport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const fromIso = date?.from?.toISOString();
      const toIso = date?.to ? endOfDay(date.to).toISOString() : undefined;

      let leadsQuery = supabase.from("leads").select("id, status", { count: "exact" });
      let projectsQuery = supabase.from("projects").select("id", { count: "exact" });
      let blogsQuery = supabase.from("blog_posts").select("id", { count: "exact" });
      const testimonialsQuery = supabase.from("testimonials").select("id, rating", { count: "exact" }).eq("active", true);
      const mediaQuery = supabase.rpc("get_total_media_bytes");

      if (fromIso) {
        leadsQuery = leadsQuery.gte("created_at", fromIso);
        projectsQuery = projectsQuery.gte("created_at", fromIso);
        blogsQuery = blogsQuery.gte("created_at", fromIso);
      }
      if (toIso) {
        leadsQuery = leadsQuery.lte("created_at", toIso);
        projectsQuery = projectsQuery.lte("created_at", toIso);
        blogsQuery = blogsQuery.lte("created_at", toIso);
      }

      const trafficResPromise = supabase.functions.invoke("posthog-query", {
        body: {
          action: "traffic-stats",
          from: fromIso || subDays(new Date(), 30).toISOString(),
          to: toIso || new Date().toISOString()
        }
      });

      const [leadsRes, projectsRes, blogsRes, trafficRes, testimonialsRes, mediaRes] = await Promise.all([
        leadsQuery, projectsQuery, blogsQuery, trafficResPromise, testimonialsQuery, mediaQuery,
      ]);

      const leads = leadsRes.data || [];
      const totalLeads = leadsRes.count || 0;
      const wonLeads = leads.filter((l: { status?: string | null }) => l.status === "won").length;
      const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
      const ratings = (testimonialsRes.data || [])
        .map((t: { rating?: number | null }) => t.rating)
        .filter((r: number | null | undefined): r is number => typeof r === "number");
      const avgRating = ratings.length > 0
        ? (ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length).toFixed(1)
        : "N/A";

      downloadCsv(`admin-dashboard-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`, [
        ["Metric", "Value"],
        ["Tab", activeTab],
        ["Date range", `${date?.from?.toLocaleDateString() ?? "N/A"} - ${date?.to?.toLocaleDateString() ?? "N/A"}`],
        ["Total leads", String(totalLeads)],
        ["Conversion rate", `${conversionRate}%`],
        ["Projects", String(projectsRes.count || 0)],
        ["Page views", String(trafficRes.data?.views || 0)],
        ["Blog posts", String(blogsRes.count || 0)],
        ["Avg testimonial rating", avgRating],
        ["Media storage", formatStorage(Number(mediaRes.data) || 0)],
        ["System health", health.status],
      ]);

      toast({ title: "Report exported", description: "Dashboard CSV downloaded." });
    } catch {
      toast({ title: "Export Failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const tabContent = (label: string, node: JSX.Element) => (
    <Suspense fallback={<TabFallback label={label} />}>
      <ErrorBoundary fallback={<div className="text-red-500 p-4">Failed to load {label}</div>}>
        {node}
      </ErrorBoundary>
    </Suspense>
  );

  const dashboardTabs = useMemo(() => [
    { label: "Executive Overview", path: "/admin/dashboard?tab=overview", group: "Dashboard" },
    { label: "Sales & Leads", path: "/admin/dashboard?tab=sales", group: "Dashboard" },
    { label: "Website Traffic", path: "/admin/dashboard?tab=traffic", group: "Dashboard" },
    { label: "Content & Media", path: "/admin/dashboard?tab=content", group: "Dashboard" },
    { label: "System Health", path: "/admin/dashboard?tab=system", group: "Dashboard" },
  ], []);

  // Make default route match activeTab visually
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "overview" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <ModuleLayout
      title={`${getGreeting()}, ${displayName || "Executive"}`}
      description="Here's your high-level business overview for this period."
      tabs={dashboardTabs}
    >
      <ModuleActions>
          <div className="flex items-center gap-3">
            <CalendarDateRangePicker date={date} setDate={setDate} />
            {can('dashboard', 'automate') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/admin/system/settings?tab=reports"}
                className="bg-admin-primary text-black border-transparent hover:bg-admin-primary/90 px-4"
              >
                <Send className="w-4 h-4 mr-2" /> Automate Report
              </Button>
            )}
            {can('dashboard', 'export') && (
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting}
                onClick={() => { void handleDownloadReport(); }}
                className="bg-admin-surface border-admin-border text-admin-text hover:bg-admin-surface-hover px-4"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export Data
              </Button>
            )}
          </div>
      </ModuleActions>

      {/* Body: active tab + right sidebar */}
      <div className="flex flex-1 min-h-0 mt-4 gap-4 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto pr-2 custom-scrollbar fade-in">
            {activeTab === "overview" && tabContent("Overview", <OverviewTab date={date} changeTab={changeTab} />)}
            {activeTab === "sales" && tabContent("Sales & Leads", <SalesTab date={date} />)}
            {activeTab === "traffic" && tabContent("Traffic", <TrafficTab date={date} />)}
            {activeTab === "content" && tabContent("Content & Media", <ContentTab date={date} />)}
            {activeTab === "system" && tabContent("System Health", <SystemTab date={date} />)}
          </div>
        </div>

        {/* Right sidebar â€” fixed width, scrollable independently */}
        <div className="w-[300px] shrink-0 overflow-y-auto hidden xl:block custom-scrollbar">
          <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6 min-h-full">
            <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Recent System Activity</h3>
            <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">Latest actions and changes</p>
            <RecentActivityFeed dateRange={date} />
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default AdminDashboard;

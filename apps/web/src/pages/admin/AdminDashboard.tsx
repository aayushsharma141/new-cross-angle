import { useEffect, useState, lazy, Suspense, type JSX } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Plus,
  Layers,
  ArrowRight,
  Send,
  Package,
  Globe,
  Activity,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react";
import { QuickActionButton } from "@/components/admin/QuickActions";
import { Button } from "@/components/ui/primitives/button";
import { CalendarDateRangePicker } from "@/components/ui/enhanced/date-range-picker";
import { useToast } from "@/hooks/useToast";
import { DateRange } from "react-day-picker";
import { subDays, endOfDay } from "date-fns";
import { useSystem } from "@/context/SystemContext";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminTabSlider } from "@/components/admin/ui/AdminTabSlider";
import { useAdminDisplayName } from "@/hooks/useAdminDisplayName";
import { usePermissions } from "@/hooks/usePermissions";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";

const OverviewTab = lazy(() => import("./tabs/OverviewTab"));
const TrafficTab = lazy(() => import("./tabs/TrafficTab"));
const SalesTab = lazy(() => import("./tabs/SalesTab"));
const SystemTab = lazy(() => import("./tabs/SystemTab"));
const ContentTab = lazy(() => import("./tabs/ContentTab"));

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

const TabFallback = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-admin-primary/50" />
  </div>
);

const AdminDashboard = (): JSX.Element => {
  const { toast } = useToast();
  const { health, refreshHealth } = useSystem();
  const { displayName } = useAdminDisplayName();
  const { can, role } = usePermissions();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => { void refreshHealth(); }, [refreshHealth]);

  const changeTab = (tabId: TabType) => setActiveTab(tabId);

  const handleDownloadReport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const fromIso = date?.from?.toISOString();
      const toIso = date?.to ? endOfDay(date.to).toISOString() : undefined;

      let leadsQuery = supabase.from("leads").select("id, status", { count: "exact" });
      let projectsQuery = supabase.from("projects").select("id", { count: "exact" });
      let blogsQuery = supabase.from("blog_posts").select("id", { count: "exact" });
      let viewsQuery = supabase.from("analytics_events").select("id", { count: "exact" }).eq("event_type", "page_view");
      const testimonialsQuery = supabase.from("testimonials").select("id, rating", { count: "exact" }).eq("active", true);
      const mediaQuery = supabase.rpc("get_total_media_bytes");

      if (fromIso) {
        leadsQuery = leadsQuery.gte("created_at", fromIso);
        projectsQuery = projectsQuery.gte("created_at", fromIso);
        blogsQuery = blogsQuery.gte("created_at", fromIso);
        viewsQuery = viewsQuery.gte("occurred_at", fromIso);
      }
      if (toIso) {
        leadsQuery = leadsQuery.lte("created_at", toIso);
        projectsQuery = projectsQuery.lte("created_at", toIso);
        blogsQuery = blogsQuery.lte("created_at", toIso);
        viewsQuery = viewsQuery.lte("occurred_at", toIso);
      }

      const [leadsRes, projectsRes, blogsRes, viewsRes, testimonialsRes, mediaRes] = await Promise.all([
        leadsQuery, projectsQuery, blogsQuery, viewsQuery, testimonialsQuery, mediaQuery,
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
        ["Page views", String(viewsRes.count || 0)],
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

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      {/* Shared header */}
      <AdminPageHeader
        title={`${getGreeting()}, ${displayName || "Executive"}`}
        description="Here's your high-level business overview for this period."
        actions={
          <div className="flex items-center gap-3">
            <CalendarDateRangePicker date={date} setDate={setDate} />
            {can('dashboard', 'automate') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({ title: "Automation Configured", description: "You will now receive this report weekly via email." })}
                className="bg-admin-primary text-black border-transparent hover:bg-admin-primary/90 px-4"
              >
                <Send className="w-4 h-4 mr-2" /> Automate Report
              </Button>
            )}
            {/* Export is available to all roles including viewer (safe read op) */}
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
        }
      />

      {/* Body: tab slider + right sidebar */}
      <div className="flex flex-1 min-h-0 mt-6 gap-6 overflow-hidden">
        {/* Tab slider takes remaining width */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <AdminTabSlider
            tabs={[
              {
                id: "overview",
                label: "Executive Overview",
                icon: BarChart3,
                content: tabContent("Overview", <OverviewTab date={date} changeTab={changeTab} />),
              },
              {
                id: "sales",
                label: "Sales & Leads",
                icon: Package,
                content: tabContent("Sales & Leads", <SalesTab date={date} />),
              },
              {
                id: "traffic",
                label: "Website Traffic",
                icon: Globe,
                content: tabContent("Traffic", <TrafficTab date={date} />),
              },
              {
                id: "content",
                label: "Content & Media",
                icon: Layers,
                content: tabContent("Content & Media", <ContentTab date={date} />),
              },
              {
                id: "system",
                label: "System Health",
                icon: Activity,
                content: tabContent("System Health", <SystemTab date={date} />),
              },
            ]}
          />
        </div>

        {/* Right sidebar — fixed width, scrollable independently */}
        <div className="w-[300px] shrink-0 space-y-5 overflow-y-auto hidden xl:block pt-16">
          <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-2xl p-5">
            <h3 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {can('leads', 'create') && (
                <QuickActionButton icon={Plus} label="New Lead" href="/admin/crm/leads" gradient="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/50]" />
              )}
              {can('content', 'edit') && (
                <QuickActionButton icon={Package} label="CMS Build" href="/admin/cms/portfolio" gradient="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/50]" />
              )}
              <QuickActionButton icon={Send} label="Outreach" href="/admin/discovery/analytics" gradient="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/50]" />
              <QuickActionButton icon={Layers} label="Resources" href="/admin/cms/media" gradient="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-primary))/50]" />
            </div>
          </div>

          <Link to="/admin/discovery/analytics" className="block bg-[hsl(var(--admin-primary))]/5 border border-[hsl(var(--admin-primary))]/20 rounded-2xl p-5 group hover:bg-[hsl(var(--admin-primary))]/10 transition-all">
            <h3 className="text-sm font-bold text-[hsl(var(--admin-primary))] flex items-center justify-between mb-2">
              Growth Insights
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-[hsl(var(--admin-text-muted))] text-xs leading-relaxed">
              New visitor patterns detected. Review lead behaviour insights to improve conversions.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

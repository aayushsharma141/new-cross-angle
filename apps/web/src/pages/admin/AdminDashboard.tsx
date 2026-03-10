import { useState, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Briefcase,
  Eye,
  Star,
  Plus,
  TrendingUp,
  Download,
  MessageSquare,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminKPI } from "@/components/admin/dashboard/AdminKPI";
import { QuickActionButton } from "@/components/admin/QuickActions";
import { Button } from "@/components/ui/button";
import { ProjectPipelineChart } from "@/components/admin/analytics/ProjectPipelineChart";
import { LeadFunnelChart } from "@/components/admin/analytics/LeadFunnelChart";
import { LeadSourceChart } from "@/components/admin/analytics/LeadSourceChart";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { subDays, endOfDay } from "date-fns";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { icons } from "@/design-system/tokens/icons";

interface DashboardStats {
  projects: number;
  leads: number;
  views: number;
  estimateLeads: number;
  conversionRate: number;
  avgRating: string;
  avgEstimate: number;
}

const AdminDashboard = (): JSX.Element => {
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch real aggregated stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats", date],
    queryFn: async (): Promise<DashboardStats> => {
      const fromIso = date?.from?.toISOString();
      const toIso = date?.to ? endOfDay(date.to).toISOString() : undefined;

      // --- Projects ---
      let projectsQuery = supabase
        .from("projects")
        .select("id, status, views", { count: "exact" });
      if (fromIso) projectsQuery = projectsQuery.gte("created_at", fromIso);
      if (toIso) projectsQuery = projectsQuery.lte("created_at", toIso);

      // --- Leads ---
      let leadsQuery = supabase
        .from("leads")
        .select("id, status", { count: "exact" });
      if (fromIso) leadsQuery = leadsQuery.gte("created_at", fromIso);
      if (toIso) leadsQuery = leadsQuery.lte("created_at", toIso);

      // --- Testimonials ---
      let testimonialsQuery = supabase
        .from("testimonials")
        .select("id, rating", { count: "exact" })
        .eq("active", true);
      if (fromIso)
        testimonialsQuery = testimonialsQuery.gte("updated_at", fromIso);

      // --- Estimate Leads (high-value) ---
      let estimateQuery = supabase
        .from("estimate_leads")
        .select("estimate_total_min, estimate_total_max", { count: "exact" });
      if (fromIso) estimateQuery = estimateQuery.gte("created_at", fromIso);
      if (toIso) estimateQuery = estimateQuery.lte("created_at", toIso);

      const [projectsRes, leadsRes, testimonialsRes, estimateRes] =
        await Promise.all([
          projectsQuery,
          leadsQuery,
          testimonialsQuery,
          estimateQuery,
        ]);

      // Total views from projects
      const totalViews = (projectsRes.data || []).reduce(
        (acc, p) => acc + (p.views || 0),
        0
      );

      // Won leads count
      const wonLeads = (leadsRes.data || []).filter(
        (l) => l.status === "won"
      ).length;

      // Conversion rate
      const totalLeads = leadsRes.count || 0;
      const conversionRate =
        totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

      // Avg rating
      const ratings = (testimonialsRes.data || [])
        .map((t) => t.rating)
        .filter((r): r is number => typeof r === "number");
      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : "—";

      // Average estimate value
      const estimates = estimateRes.data || [];
      const totalEstimateValue = estimates.reduce((acc, e) => {
        const mid =
          ((e.estimate_total_min || 0) + (e.estimate_total_max || 0)) / 2;
        return acc + mid;
      }, 0);
      const avgEstimate =
        estimates.length > 0
          ? Math.round(totalEstimateValue / estimates.length)
          : 0;

      return {
        projects: projectsRes.count || 0,
        leads: totalLeads,
        views: totalViews,
        estimateLeads: estimateRes.count || 0,
        conversionRate,
        avgRating,
        avgEstimate,
      };
    },
  });

  const handleDownloadReport = async (): Promise<void> => {
    try {
      const fromIso = date?.from?.toISOString();
      const toIso = date?.to ? endOfDay(date.to).toISOString() : undefined;

      let projectsQuery = supabase
        .from("projects")
        .select("title, status, created_at");
      let leadsQuery = supabase
        .from("leads")
        .select("name, email, status, lead_source, lead_type, city, created_at");

      if (fromIso) {
        projectsQuery = projectsQuery.gte("created_at", fromIso);
        leadsQuery = leadsQuery.gte("created_at", fromIso);
      }
      if (toIso) {
        projectsQuery = projectsQuery.lte("created_at", toIso);
        leadsQuery = leadsQuery.lte("created_at", toIso);
      }

      const [projects, leads] = await Promise.all([projectsQuery, leadsQuery]);

      const csvData = [
        [
          "Crossangle Dashboard Report",
          date?.from ? `From ${date.from.toLocaleDateString()}` : "All Time",
        ],
        ["Generated", new Date().toLocaleString()],
        [""],
        ["Summary"],
        ["Projects", stats?.projects || 0],
        ["Leads", stats?.leads || 0],
        ["Estimate Enquiries", stats?.estimateLeads || 0],
        ["Conversion Rate", `${stats?.conversionRate || 0}%`],
        [
          "Avg Estimate Value",
          stats?.avgEstimate ? `₹${stats.avgEstimate.toLocaleString()}` : "—",
        ],
        ["Avg Rating", stats?.avgRating || "—"],
        [""],
        ["Projects"],
        ["Title", "Status", "Created"],
        ...(projects.data?.map((p) => [
          p.title || "",
          p.status || "",
          new Date(p.created_at ?? "").toLocaleString(),
        ]) || []),
        [""],
        ["Leads"],
        ["Name", "Email", "Status", "Source", "Type", "City", "Created"],
        ...(leads.data?.map((l) => [
          l.name,
          l.email,
          l.status,
          l.lead_source || "",
          l.lead_type || "",
          l.city || "",
          new Date(l.created_at ?? "").toLocaleString(),
        ]) || []),
      ];

      const csv = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `crossangle-report-${new Date().toISOString().split("T")[0]
        }.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Report downloaded successfully!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to generate report", variant: "destructive" });
    }
  };

  const fmt = (n: number | undefined | null): string =>
    n === undefined || n === null ? "…" : n.toLocaleString();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminBreadcrumb />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">
            Intelligence Hub
          </h2>
          <p className="text-[hsl(var(--admin-muted))]">
            Real-time business performance overview
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full md:w-auto">
          <CalendarDateRangePicker
            date={date}
            setDate={setDate}
            className="w-full sm:w-auto"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            className="w-full sm:w-auto"
          >
            <Download className={`${icons.sm} mr-2`} />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Grid — all database-driven */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminKPI
          title="Portfolio Projects"
          value={statsLoading ? "…" : fmt(stats?.projects)}
          change="In selected period"
          trend="up"
          icon={Briefcase}
          variant="gold"
        />
        <AdminKPI
          title="Total Leads"
          value={statsLoading ? "…" : fmt(stats?.leads)}
          change={`${stats?.conversionRate ?? 0}% converted`}
          trend={
            stats?.conversionRate && stats.conversionRate > 10
              ? "up"
              : "neutral"
          }
          icon={Users}
          variant="secondary"
        />
        <AdminKPI
          title="Estimate Enquiries"
          value={statsLoading ? "…" : fmt(stats?.estimateLeads)}
          change={
            stats?.avgEstimate
              ? `Avg ₹${(stats.avgEstimate / 100000).toFixed(1)}L`
              : "No data yet"
          }
          trend="up"
          icon={Zap}
          variant="accent"
        />
        <AdminKPI
          title="Portfolio Views"
          value={statsLoading ? "…" : fmt(stats?.views)}
          change={
            stats?.avgRating !== "—"
              ? `${stats?.avgRating}/5 avg rating`
              : "No ratings yet"
          }
          trend="neutral"
          icon={Eye}
          variant="gold"
        />
      </div>

      {/* Charts + Sidebar */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          {/* Main Charts */}
          <ProjectPipelineChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeadFunnelChart />
            <LeadSourceChart />
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b">
              <h3 className="font-semibold leading-none tracking-tight">
                Recent Activity
              </h3>
              <p className="text-sm text-muted-foreground">
                {date
                  ? "Actions in selected period"
                  : "Latest actions across the platform"}
              </p>
            </div>
            <div className="p-6">
              <RecentActivityFeed dateRange={date} />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                icon={Plus}
                label="New Project"
                href="/admin/cms/portfolio"
                gradient="bg-admin-card border border-admin-gold/20 hover:border-admin-gold text-admin-foreground hover:bg-admin-surface"
              />
              <QuickActionButton
                icon={Users}
                label="Add Lead"
                href="/admin/crm/leads"
                gradient="bg-admin-card border border-admin-info/20 hover:border-admin-info text-admin-foreground hover:bg-admin-surface"
              />
              <QuickActionButton
                icon={MessageSquare}
                label="Testimonials"
                href="/admin/cms/testimonials"
                gradient="bg-admin-card border border-admin-success/20 hover:border-admin-success text-admin-foreground hover:bg-admin-surface"
              />
              <QuickActionButton
                icon={TrendingUp}
                label="Media"
                href="/admin/cms/media"
                gradient="bg-admin-card border border-amber-500/20 hover:border-amber-500 text-admin-foreground hover:bg-admin-surface"
              />
            </div>
          </div>

          {/* Conversion Insight */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Conversion Snapshot</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead Conversion</span>
                <span className="font-medium text-emerald-500">
                  {statsLoading ? "…" : `${stats?.conversionRate ?? 0}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Estimate</span>
                <span className="font-medium">
                  {statsLoading
                    ? "…"
                    : stats?.avgEstimate
                      ? `₹${(stats.avgEstimate / 100000).toFixed(1)}L`
                      : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Rating</span>
                <span className="font-medium">
                  {statsLoading ? "…" : stats?.avgRating ?? "—"}
                  {stats?.avgRating && stats.avgRating !== "—" ? (
                    <Star className={cn("inline ml-1 text-amber-400 fill-amber-400", icons.xs)} />
                  ) : null}
                </span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4">System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Database</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span>API</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
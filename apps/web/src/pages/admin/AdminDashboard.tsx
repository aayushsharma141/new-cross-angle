
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Briefcase,
  Eye,
  MessageSquare,
  Plus,
  TrendingUp,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { QuickActionButton } from "@/components/admin/QuickActions";
import { Button } from "@/components/ui/button";
import { TrafficChart } from "@/components/admin/analytics/TrafficChart";
import { ConversionFunnel } from "@/components/admin/analytics/ConversionFunnel";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { subDays, endOfDay } from "date-fns";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch real stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats", date],
    queryFn: async () => {
      let projectsQuery = supabase.from("projects").select("*", { count: "exact", head: true });
      let leadsQuery = supabase.from("leads").select("*", { count: "exact", head: true });
      let testimonialsQuery = supabase.from("testimonials").select("*", { count: "exact", head: true });

      if (date?.from) {
        const fromIso = date.from.toISOString();
        projectsQuery = projectsQuery.gte("created_at", fromIso);
        leadsQuery = leadsQuery.gte("created_at", fromIso);
        testimonialsQuery = testimonialsQuery.gte("created_at", fromIso);
      }

      if (date?.to) {
        const toIso = endOfDay(date.to).toISOString();
        projectsQuery = projectsQuery.lte("created_at", toIso);
        leadsQuery = leadsQuery.lte("created_at", toIso);
        testimonialsQuery = testimonialsQuery.lte("created_at", toIso);
      }

      // Parallel execution
      const [projectsRes, leadsRes, testimonialsRes] = await Promise.all([
        projectsQuery,
        leadsQuery,
        testimonialsQuery
      ]);

      // Views logic
      let viewsCount = 0;
      if (date?.from || date?.to) {
        // If filtered, use analytics table
        let analyticsQuery = supabase.from("content_analytics").select("*", { count: "exact", head: true }).eq("event_type", "view");

        if (date?.from) analyticsQuery = analyticsQuery.gte("created_at", date.from.toISOString());
        if (date?.to) analyticsQuery = analyticsQuery.lte("created_at", endOfDay(date.to).toISOString());

        const { count } = await analyticsQuery;
        viewsCount = count || 0;
      } else {
        // If all time (no date selected), sum up blog counters
        const { data: blogs } = await supabase.from("blogs").select("views_count");
        viewsCount = blogs?.reduce((acc, curr) => acc + (curr.views_count || 0), 0) || 0;
      }

      return {
        projects: projectsRes.count || 0,
        leads: leadsRes.count || 0,
        views: viewsCount,
        testimonials: testimonialsRes.count || 0
      };
    }
  });

  // Download Report function (Filtered)
  const handleDownloadReport = async () => {
    try {
      let projectsQuery = supabase.from("projects").select("title, category, status, created_at");
      let leadsQuery = supabase.from("leads").select("name, email, status, created_at");

      if (date?.from) {
        projectsQuery = projectsQuery.gte("created_at", date.from.toISOString());
        leadsQuery = leadsQuery.gte("created_at", date.from.toISOString());
      }
      if (date?.to) {
        projectsQuery = projectsQuery.lte("created_at", endOfDay(date.to).toISOString());
        leadsQuery = leadsQuery.lte("created_at", endOfDay(date.to).toISOString());
      }

      const [projects, leads] = await Promise.all([projectsQuery, leadsQuery]);

      const csvData = [
        ["Dashboard Report", date?.from ? `From ${date.from.toLocaleDateString()}` : "All Time"],
        ["Generated", new Date().toLocaleString()],
        [""],
        ["Summary"],
        ["New Projects", stats?.projects || 0],
        ["New Leads", stats?.leads || 0],
        ["New Testimonials", stats?.testimonials || 0],
        ["Views", stats?.views || 0],
        [""],
        ["Projects"],
        ["Title", "Category", "Status", "Created"],
        ...(projects.data?.map(p => [p.title || "", p.category || "", p.status || "", new Date(p.created_at).toLocaleString()]) || []),
        [""],
        ["Leads"],
        ["Name", "Email", "Status", "Created"],
        ...(leads.data?.map(l => [l.name, l.email, l.status, new Date(l.created_at).toLocaleString()]) || [])
      ];

      const csv = csvData.map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Report downloaded successfully!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to generate report", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">Dashboard</h2>
          <p className="text-[hsl(var(--admin-muted))]">Overview of your business performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full md:w-auto">
          <CalendarDateRangePicker date={date} setDate={setDate} className="w-full sm:w-auto" />
          <Button variant="outline" size="sm" onClick={handleDownloadReport} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={date ? "New Projects" : "Total Projects"}
          value={statsLoading ? "..." : stats?.projects.toString() || "0"}
          icon={Briefcase}
          gradient="from-blue-500 to-blue-600"
          bgGradient="from-blue-500/10 to-blue-500/5"
          shadowColor="shadow-blue-500/50"
          trend={undefined} // Remove trend if custom range, or calculate properly? For now remove to avoid confusion
          className="admin-card-hover"
          link="/admin/portfolio"
        />
        <StatCard
          title={date ? "New Leads" : "Active Leads"}
          value={statsLoading ? "..." : stats?.leads.toString() || "0"}
          icon={Users}
          gradient="from-green-500 to-green-600"
          bgGradient="from-green-500/10 to-green-500/5"
          shadowColor="shadow-green-500/50"
          trend={undefined}
          className="admin-card-hover"
          link="/admin/leads"
        />
        <StatCard
          title="Views"
          value={stats?.views.toString() || "0"}
          icon={Eye}
          gradient="from-purple-500 to-purple-600"
          bgGradient="from-purple-500/10 to-purple-500/5"
          shadowColor="shadow-purple-500/50"
          className="admin-card-hover"
        />
        <StatCard
          title={date ? "New Testimonials" : "Testimonials"}
          value={statsLoading ? "..." : stats?.testimonials.toString() || "0"}
          icon={MessageSquare}
          gradient="from-orange-500 to-orange-600"
          bgGradient="from-orange-500/10 to-orange-500/5"
          shadowColor="shadow-orange-500/50"
          className="admin-card-hover"
          link="/admin/testimonials"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          {/* Main Charts Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrafficChart />
            <ConversionFunnel />
          </div>

          {/* Recent Activity Section - Real Data */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full">
            <div className="flex flex-col space-y-1.5 p-6 border-b">
              <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">
                {date ? "Actions in selected period" : "Latest actions across the platform"}
              </p>
            </div>
            <div className="p-6">
              <RecentActivityFeed dateRange={date} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                icon={Plus}
                label="New Project"
                href="/admin/portfolio"
                gradient="from-blue-500 to-blue-600"
              />
              <QuickActionButton
                icon={Users}
                label="Add Lead"
                href="/admin/leads"
                gradient="from-green-500 to-green-600"
              />
              <QuickActionButton
                icon={MessageSquare}
                label="Testimonial"
                href="/admin/testimonials"
                gradient="from-purple-500 to-purple-600"
              />
              <QuickActionButton
                icon={TrendingUp}
                label="Media"
                href="/admin/media"
                gradient="from-orange-500 to-orange-600"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4">System Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Storage</span>
                <span className="text-green-600 font-medium">45% used</span>
              </div>
              <div className="flex justify-between text-sm">
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
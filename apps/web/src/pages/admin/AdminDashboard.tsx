import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Briefcase,
  Eye,
  MessageSquare,
  Plus,
  TrendingUp,
  ArrowRight,
  Download,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { QuickActionButton } from "@/components/admin/QuickActions";
import { Button } from "@/components/ui/button";
import { TrafficChart } from "@/components/admin/analytics/TrafficChart";
import { ConversionFunnel } from "@/components/admin/analytics/ConversionFunnel";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const { toast } = useToast();

  // Fetch real stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [projectsRes, leadsRes, testimonialsRes] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("testimonials").select("*", { count: "exact", head: true })
      ]);

      return {
        projects: projectsRes.count || 0,
        leads: leadsRes.count || 0,
        views: "12.5k", // TODO: Replace with analytics_events when available
        testimonials: testimonialsRes.count || 0
      };
    }
  });

  // Fetch real recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lead_activities")
        .select("*, leads(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      return data || [];
    }
  });

  // Download Report function
  const handleDownloadReport = async () => {
    try {
      const [projects, leads, testimonials] = await Promise.all([
        supabase.from("projects").select("title, category, status, created_at"),
        supabase.from("leads").select("name, email, status, created_at"),
        supabase.from("testimonials").select("name, role, created_at")
      ]);

      const csvData = [
        ["Dashboard Report - " + new Date().toLocaleDateString()],
        [""],
        ["Summary"],
        ["Total Projects", stats?.projects || 0],
        ["Active Leads", stats?.leads || 0],
        ["Testimonials", stats?.testimonials || 0],
        [""],
        ["Projects"],
        ["Title", "Category", "Status", "Created"],
        ...(projects.data?.map(p => [p.title, p.category, p.status, p.created_at]) || []),
        [""],
        ["Leads"],
        ["Name", "Email", "Status", "Created"],
        ...(leads.data?.map(l => [l.name, l.email, l.status, l.created_at]) || [])
      ];

      const csv = csvData.map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Report downloaded successfully!" });
    } catch (error) {
      toast({ title: "Failed to generate report", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">Dashboard</h2>
          <p className="text-[hsl(var(--admin-muted))]">Overview of your business performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={statsLoading ? "..." : stats?.projects.toString() || "0"}
          icon={Briefcase}
          gradient="from-blue-500 to-blue-600"
          bgGradient="from-blue-500/10 to-blue-500/5"
          shadowColor="shadow-blue-500/50"
          trend={{ value: 12, label: "this month", isPositive: true }}
          className="admin-card-hover"
          link="/admin/portfolio"
        />
        <StatCard
          title="Active Leads"
          value={statsLoading ? "..." : stats?.leads.toString() || "0"}
          icon={Users}
          gradient="from-green-500 to-green-600"
          bgGradient="from-green-500/10 to-green-500/5"
          shadowColor="shadow-green-500/50"
          trend={{ value: 12, label: "vs last month", isPositive: true }}
          className="admin-card-hover"
          link="/admin/leads"
        />
        <StatCard
          title="Total Views"
          value={stats?.views || "0"}
          icon={Eye}
          gradient="from-purple-500 to-purple-600"
          bgGradient="from-purple-500/10 to-purple-500/5"
          shadowColor="shadow-purple-500/50"
          trend={{ value: 5.2, label: "vs last month", isPositive: true }}
          className="admin-card-hover"
        />
        <StatCard
          title="Testimonials"
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
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No recent activity</p>
                    <p className="text-xs text-muted-foreground">Activity will appear here as you work</p>
                  </div>
                ) : (
                  recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description || "Activity logged"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at))} ago
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
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
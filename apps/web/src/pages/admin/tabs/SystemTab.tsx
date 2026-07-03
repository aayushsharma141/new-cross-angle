import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminKPI } from "@/components/admin/dashboard/AdminKPI";
import { Database, HardDrive, Shield, Server } from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import { useSystem } from "@/context/SystemContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";

interface SystemTabProps {
  date?: DateRange;
}

const formatStorage = (bytes: number): string => {
  if (bytes <= 0) return "0 MB";
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const SystemTab = ({ date: _date }: SystemTabProps) => {
  const { health } = useSystem();
  const { can } = usePermissions();

  // Storage & table stats
  const { data: sysStats, isLoading } = useQuery({
    queryKey: ["system-stats"],
    queryFn: async () => {
      const [mediaRes, leadsRes, projectsRes, blogsRes, eventsRes] = await Promise.all([
        supabase.rpc("get_total_media_bytes"),
        supabase.from("leads").select("id", { count: "exact" }),
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("blog_posts").select("id", { count: "exact" }),
        supabase.from("analytics_reporting_daily").select("metric_value").eq("metric_name", "page_views"),
      ]);

      return {
        mediaBytes: Number(mediaRes.data) || 0,
        totalLeads: leadsRes.count || 0,
        totalProjects: projectsRes.count || 0,
        totalBlogs: blogsRes.count || 0,
        totalEvents: (eventsRes.data || []).reduce((acc: number, row: { metric_value: number }) => acc + row.metric_value, 0),
      };
    },
  });

  const storageUsedGB = (sysStats?.mediaBytes || 0) / (1024 * 1024 * 1024);
  const storageTotalGB = 20;
  const storagePercent = Math.min((storageUsedGB / storageTotalGB) * 100, 100);

  const tableData = [
    { name: "Leads", count: sysStats?.totalLeads || 0 },
    { name: "Projects", count: sysStats?.totalProjects || 0 },
    { name: "Blogs", count: sysStats?.totalBlogs || 0 },
    { name: "Events", count: sysStats?.totalEvents || 0 },
  ];

  const allHealthy = health.database === "connected" && health.api === "online" && health.storage === "available";

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminKPI
          title="Database"
          value={health.database === "connected" ? "Online" : "Offline"}
          change={`Checked ${formatDistanceToNow(new Date(health.lastChecked), { addSuffix: true })}`}
          trend={health.database === "connected" ? "up" : "down"}
          icon={Database}
          variant={health.database === "connected" ? "gold" : "accent"}
        />
        <AdminKPI
          title="API Services"
          value={health.api === "online" ? "Online" : "Offline"}
          change="Cloud service status"
          trend={health.api === "online" ? "up" : "down"}
          icon={Server}
          variant="secondary"
        />
        <AdminKPI
          title="Media Storage"
          value={formatStorage(sysStats?.mediaBytes || 0)}
          change={`${storagePercent.toFixed(1)}% of ${storageTotalGB}GB used`}
          trend={storagePercent > 80 ? "down" : "neutral"}
          icon={HardDrive}
          variant="secondary"
          isLoading={isLoading}
        />
        <AdminKPI
          title="System Status"
          value={allHealthy ? "All Clear" : "Issues"}
          change={allHealthy ? "All services operational" : "Check health panel"}
          trend={allHealthy ? "up" : "down"}
          icon={Shield}
          variant={allHealthy ? "gold" : "accent"}
        />
      </div>

      {/* Health + Integrations + Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-5">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              { name: "Data Storage", status: health.database === "connected" ? "Connected" : "Disconnected", ok: health.database === "connected" },
              { name: "Cloud Services", status: health.api === "online" ? "Online" : "Offline", ok: health.api === "online" },
              { name: "Media Storage", status: health.storage === "available" ? "Available" : "Issue", ok: health.storage === "available" },
            ].map((item) => (
              <div key={item.name} className="flex justify-between items-center text-[13px]">
                <span className="text-[hsl(var(--admin-text-muted))]">{item.name}</span>
                <span className={cn("font-bold flex items-center gap-1.5", item.ok ? "text-[hsl(var(--admin-success))]" : "text-[hsl(var(--admin-danger))]")}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-5">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest mb-4">Active Integrations</h3>
          <div className="space-y-3">
            {[
              {
                name: "Supabase (DB & Auth)",
                // Individually probed: DB query fires on every refreshHealth call
                ok: health.database === "connected",
                status: health.database === "connected" ? "Connected" : "Disconnected",
                probe: "Direct DB probe",
              },
              {
                name: "PostHog (Analytics)",
                // Probed via edge function gateway — posthog-query invocation in SystemContext
                ok: health.api === "online",
                status: health.api === "online" ? "Reachable" : "Unreachable",
                probe: "Edge fn gateway",
              },
              {
                name: "Resend (Email)",
                // Not independently probed — status reflects edge function gateway reachability
                ok: health.api === "online",
                status: health.api === "online" ? "Gateway OK" : "Gateway Down",
                probe: "Not independently probed",
              },
              {
                name: "Vercel (Hosting)",
                // Hosting status cannot be reliably determined client-side
                ok: null,
                status: "No probe available",
                probe: "Deployment status only",
              },
            ].map((item) => (
              <div key={item.name} className="flex justify-between items-start gap-2 text-[13px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[hsl(var(--admin-text-muted))]">{item.name}</span>
                  <span className="text-[10px] text-[hsl(var(--admin-text-muted))]/60">{item.probe}</span>
                </div>
                <span className={cn(
                  "font-bold flex items-center gap-1.5 shrink-0 text-right",
                  item.ok === true  && "text-[hsl(var(--admin-success))]",
                  item.ok === false && "text-[hsl(var(--admin-danger))]",
                  item.ok === null  && "text-[hsl(var(--admin-text-muted))]",
                )}>
                  {item.ok !== null && (
                    <div className={cn("w-1.5 h-1.5 rounded-full bg-current", item.ok && "animate-pulse")} />
                  )}
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          {can('settings', 'view') && (
            <Link to="/admin/system/settings" className="mt-4 block text-xs text-center text-[hsl(var(--admin-primary))] hover:underline font-bold">
              Manage Integrations
            </Link>
          )}
        </div>

        {/* Storage Usage Visual */}
        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-5">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest mb-4">Storage Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[hsl(var(--admin-text-muted))]">Used</span>
                <span className="font-bold text-[hsl(var(--admin-text))]">{formatStorage(sysStats?.mediaBytes || 0)} / {storageTotalGB}GB</span>
              </div>
              <div className="h-3 rounded-full bg-[hsl(var(--admin-border))]/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${storagePercent}%`,
                    background: storagePercent > 80 ? "hsl(0, 60%, 50%)" : storagePercent > 50 ? "hsl(43, 74%, 49%)" : "hsl(150, 60%, 45%)",
                  }}
                />
              </div>
            </div>
            <h4 className="text-xs font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest mt-4 mb-2">Database Records</h4>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={tableData} barSize={20}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tableData.map((_, i) => (
                    <Cell key={i} fill={["hsl(43, 74%, 49%)", "hsl(200, 70%, 50%)", "hsl(150, 60%, 45%)", "hsl(280, 60%, 55%)"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemTab;

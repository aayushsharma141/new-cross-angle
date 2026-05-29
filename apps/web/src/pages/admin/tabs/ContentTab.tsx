import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminKPI } from "@/components/admin/dashboard/AdminKPI";
import { Package, Layers, Eye, Users, FileText, TrendingUp } from "lucide-react";
import { DateRange } from "react-day-picker";
import { endOfDay, format, subDays, startOfDay } from "date-fns";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface ContentTabProps {
  date?: DateRange;
}

const formatStorage = (bytes: number): string => {
  if (bytes <= 0) return "0 MB";
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const CATEGORY_COLORS = [
  "hsl(43, 74%, 49%)",
  "hsl(200, 70%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(280, 60%, 55%)",
  "hsl(350, 65%, 50%)",
  "hsl(30, 80%, 55%)",
  "hsl(0, 0%, 55%)",
];

const ContentTab = ({ date }: ContentTabProps) => {
  // Core stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["content-tab-stats", date],
    queryFn: async () => {
      const fromIso = date?.from?.toISOString();
      const toIso = date?.to ? endOfDay(date.to).toISOString() : undefined;

      let blogsQuery = supabase.from("blog_posts").select("id", { count: "exact" });
      if (fromIso) blogsQuery = blogsQuery.gte("created_at", fromIso);
      if (toIso) blogsQuery = blogsQuery.lte("created_at", toIso);

      const [blogsRes, mediaRes, projectsRes, testimonialsRes, viewsRes] = await Promise.all([
        blogsQuery,
        supabase.rpc("get_total_media_bytes"),
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("testimonials").select("id", { count: "exact" }).eq("active", true),
        supabase.from("projects").select("views"),
      ]);

      const totalViews = (viewsRes.data || []).reduce((sum, p) => sum + (p.views || 0), 0);

      return {
        blogCount: blogsRes.count || 0,
        mediaBytes: Number(mediaRes.data) || 0,
        projectCount: projectsRes.count || 0,
        testimonialCount: testimonialsRes.count || 0,
        totalViews,
      };
    },
  });

  // Top content (projects by views)
  const { data: topContent = [] } = useQuery({
    queryKey: ["top-content-by-views"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, views, status, style_tags, created_at")
        .order("views", { ascending: false, nullsFirst: false })
        .limit(6);
      return data || [];
    },
  });

  // Category distribution from blog tags
  const { data: categoryData = [] } = useQuery({
    queryKey: ["content-category-distribution"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("tags");
      const tagCounts: Record<string, number> = {};
      for (const post of data || []) {
        for (const tag of post.tags || []) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
    },
  });

  // Publishing timeline (last 14 days)
  const { data: timeline = [] } = useQuery({
    queryKey: ["content-engagement-timeline"],
    queryFn: async () => {
      const days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i));
      const from = startOfDay(days[0]).toISOString();

      const [{ data: blogs }, { data: projects }] = await Promise.all([
        supabase.from("blog_posts").select("created_at").gte("created_at", from),
        supabase.from("projects").select("created_at").gte("created_at", from),
      ]);

      return days.map((d) => {
        const dayStr = format(d, "yyyy-MM-dd");
        const blogCount = (blogs || []).filter((p) => format(new Date(p.created_at!), "yyyy-MM-dd") === dayStr).length;
        const projCount = (projects || []).filter((p) => format(new Date(p.created_at!), "yyyy-MM-dd") === dayStr).length;
        return { name: format(d, "MMM d"), blogs: blogCount, projects: projCount };
      });
    },
  });

  const fmt = (v: number | undefined | null): string => (v == null ? "..." : v.toLocaleString());

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminKPI
          title="Total Content Views"
          value={fmt(stats?.totalViews)}
          numericValue={stats?.totalViews}
          change="All-time project views"
          trend="up"
          icon={Eye}
          variant="gold"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Published Articles"
          value={fmt(stats?.blogCount)}
          numericValue={stats?.blogCount}
          change="Blog posts in range"
          trend="neutral"
          icon={Package}
          variant="secondary"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Active Projects"
          value={fmt(stats?.projectCount)}
          numericValue={stats?.projectCount}
          change="Portfolio items"
          trend="neutral"
          icon={Layers}
          variant="secondary"
          isLoading={isLoading}
        />
        <AdminKPI
          title="Testimonials"
          value={fmt(stats?.testimonialCount)}
          numericValue={stats?.testimonialCount}
          change="Active social proof"
          trend="up"
          icon={Users}
          variant="gold"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Timeline */}
        <div className="lg:col-span-2 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Content Publishing Trend</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-6">Blogs & projects created over the last 14 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeline} barSize={14} barGap={2}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} interval={1} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "hsl(var(--admin-text))" }}
              />
              <Bar dataKey="blogs" name="Blog Posts" radius={[4, 4, 0, 0]} fill="hsl(43, 74%, 49%)" />
              <Bar dataKey="projects" name="Projects" radius={[4, 4, 0, 0]} fill="hsl(200, 70%, 50%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Donut */}
        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Category Distribution</h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">Blog posts by tag</p>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={58} strokeWidth={0}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 8, fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] truncate">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-[hsl(var(--admin-text))] tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-10">No tagged content yet</p>
          )}
        </div>
      </div>

      {/* Top Performing Content Table */}
      <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
        <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Top Performing Content</h3>
        <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-5">Projects ranked by total views</p>
        {topContent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--admin-border))]/50">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Title</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Category</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Status</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3">Views</th>
                </tr>
              </thead>
              <tbody>
                {topContent.map((item) => (
                  <tr key={item.id} className="border-b border-[hsl(var(--admin-border))]/30 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[hsl(var(--admin-primary))] shrink-0" />
                        <span className="text-[hsl(var(--admin-text))] truncate max-w-[200px]">{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-[hsl(var(--admin-text-muted))]">
                        {(item.style_tags || []).slice(0, 2).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        item.status === "live"
                          ? "bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))]"
                          : "bg-[hsl(var(--admin-warning))]/10 text-[hsl(var(--admin-warning))]"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-[hsl(var(--admin-text))] tabular-nums">{(item.views || 0).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-6">No project data yet</p>
        )}
      </div>

      {/* Media Storage KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <AdminKPI
          title="Media Storage"
          value={formatStorage(stats?.mediaBytes || 0)}
          change="Total cloud storage used"
          trend="neutral"
          icon={TrendingUp}
          variant="secondary"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ContentTab;

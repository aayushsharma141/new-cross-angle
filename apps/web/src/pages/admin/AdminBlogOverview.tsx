import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
    BarChart3,
    Eye,
    Clock,
    MousePointerClick,
    Users,
    TrendingUp,
    ArrowUpRight,
    Search,
    Filter,
    ArrowLeft,
    Scroll,
    Mail,
    Share2,
    CalendarIcon,
    RefreshCw
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Cell
} from "recharts";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { icons } from "@/design-system/tokens/icons";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */
interface ArticleMetric {
    id: string;
    title: string;
    views: number;
    avg_read_time: number;
    avg_scroll_depth: number;
    newsletter_signups: number;
    share_clicks: number;
}

interface DailyStat {
    date: string;
    views: number;
    events: number;
}

/* ───────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────── */
export default function AdminBlogOverview() {
    const [articleMetrics, setArticleMetrics] = useState<ArticleMetric[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [topStats, setTopStats] = useState({
        totalViews: 0,
        avgReadTime: 0,
        totalNewsletter: 0,
        avgCompletion: 0
    });

    const loadData = useCallback(async () => {
        setRefreshing(true);
        try {
            // 1. Fetch core blog data (only guaranteed columns)
            const { data: blogs } = await supabase
                .from('blogs')
                .select('id, title');

            // 1b. Fetch analytics (may not exist)
            let analyticsMap: Record<string, { views: number; read_time: number; scroll_depth: number }> = {};
            try {
                const { data: ad } = await supabase
                    .from('article_analytics')
                    .select('article_id, total_views, avg_read_time_seconds, avg_scroll_depth');
                if (ad) ad.forEach((a: any) => {
                    analyticsMap[a.article_id] = { views: a.total_views || 0, read_time: a.avg_read_time_seconds || 0, scroll_depth: a.avg_scroll_depth || 0 };
                });
            } catch { /* table may not exist */ }

            // 2. Fetch Newsletter Count
            const { count: newsCount } = await supabase
                .from('newsletter_subscribers')
                .select('*', { count: 'exact', head: true });

            // 3. Fetch Recent Events for Daily Trends
            const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
            const { data: events } = await supabase
                .from('blog_user_events')
                .select('created_at, event_type')
                .gte('created_at', thirtyDaysAgo);

            if (blogs) {
                const metrics: ArticleMetric[] = blogs.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    views: analyticsMap[a.id]?.views ?? 0,
                    avg_read_time: analyticsMap[a.id]?.read_time ?? 0,
                    avg_scroll_depth: analyticsMap[a.id]?.scroll_depth ?? 0,
                    newsletter_signups: 0,
                    share_clicks: 0
                }));
                setArticleMetrics(metrics.sort((a, b) => b.views - a.views));

                const totalViews = metrics.reduce((sum, m) => sum + m.views, 0);
                const avgRead = metrics.length ? metrics.reduce((sum, m) => sum + m.avg_read_time, 0) / metrics.length : 0;
                const avgScroll = metrics.length ? metrics.reduce((sum, m) => sum + m.avg_scroll_depth, 0) / metrics.length : 0;

                setTopStats({
                    totalViews,
                    avgReadTime: avgRead,
                    totalNewsletter: newsCount || 0,
                    avgCompletion: avgScroll
                });
            }

            if (events) {
                const dayMap: Record<string, DailyStat> = {};
                events.forEach(e => {
                    const d = format(new Date(e.created_at), 'MMM d');
                    if (!dayMap[d]) dayMap[d] = { date: d, views: 0, events: 0 };
                    if (e.event_type === 'page_view') dayMap[d].views++;
                    dayMap[d].events++;
                });
                setDailyStats(Object.values(dayMap));
            }

        } catch (err) {
            console.error("Failed to load blog analytics", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
        <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-md overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500/50 group-hover:bg-${color}-500 transition-colors`} />
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
                        <h3 className="text-2xl font-serif font-bold text-white tracking-tight">{value}</h3>
                        {sub && <p className="text-[10px] text-zinc-600 font-medium">{sub}</p>}
                    </div>
                    <div className={cn("p-2.5 rounded-xl bg-zinc-900 border border-zinc-800", `text-${color}-500 shadow-inner`)}>
                        <Icon size={18} strokeWidth={1.5} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <AdminBreadcrumb items={[{ label: 'Blog Settings', path: '/admin/cms/blogs' }, { label: 'Analytics' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif text-white tracking-tight">Content Intelligence</h1>
                    <p className="text-sm text-zinc-500 font-sans max-w-sm">
                        Analyzing how your articles resonate with the audience.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} disabled={refreshing} className="gap-2 border-zinc-800 text-zinc-400">
                    <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
                    Refresh Intelligence
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Eye}
                    label="Lifetime Views"
                    value={topStats.totalViews.toLocaleString()}
                    sub="Across all published articles"
                    color="blue"
                />
                <StatCard
                    icon={Clock}
                    label="Avg. Read Time"
                    value={`${(topStats.avgReadTime / 60).toFixed(1)}m`}
                    sub="Depth of engagement"
                    color="emerald"
                />
                <StatCard
                    icon={Scroll}
                    label="Avg. Completion"
                    value={`${topStats.avgCompletion.toFixed(0)}%`}
                    sub="Scroll depth benchmark"
                    color="amber"
                />
                <StatCard
                    icon={Mail}
                    label="List Growth"
                    value={topStats.totalNewsletter.toLocaleString()}
                    sub="Newsletter subscribers"
                    color="pink"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Chart */}
                <Card className="lg:col-span-2 bg-zinc-900/30 border-zinc-800/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-sm font-serif font-semibold text-zinc-200 flex items-center gap-2">
                            <TrendingUp className="text-primary w-4 h-4" />
                            Engagement Trends (Last 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyStats}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#C6A15B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: "8px", fontSize: "12px", color: "#eee" }}
                                />
                                <Area type="monotone" dataKey="views" stroke="#C6A15B" fillOpacity={1} fill="url(#colorViews)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Sidebar Top Lists */}
                <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-sm font-serif font-semibold text-zinc-200 flex items-center gap-2">
                            <MousePointerClick className="text-primary w-4 h-4" />
                            Engagement Leaders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-zinc-800/50">
                            {articleMetrics.slice(0, 6).map((art, i) => (
                                <div key={art.id} className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group">
                                    <span className="text-xs font-mono text-zinc-600">0{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-primary transition-colors">{art.title}</p>
                                        <div className="flex items-center gap-3 mt-1 opacity-60">
                                            <span className="text-[10px] flex items-center gap-1"><Eye size={10} /> {art.views}</span>
                                            <span className="text-[10px] flex items-center gap-1"><Scroll size={10} /> {art.avg_scroll_depth}%</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-primary" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

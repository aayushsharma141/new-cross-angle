import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import {
    Eye,
    Clock,
    MousePointerClick,
    ArrowUpRight,
    Scroll,
    Share2,
    RefreshCw,
    FileText,
    type LucideIcon,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/primitives/button";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { Surface } from "@/components/primitives/foundation";
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
    Cell,
} from "recharts";
import { queryKeys } from "@/lib/queryKeys";

/* ─── Types ─── */
interface ArticleMetric {
    id: string;
    title: string;
    slug: string;
    status: string;
    views: number;
    scrollDepth: number;
    readTime: number;
    ctaClicks: number;
    shares: number;
    created_at: string;
}

interface DailyStat {
    date: string;
    views: number;
    events: number;
}

interface BlogOverviewData {
    articles: ArticleMetric[];
    dailyStats: DailyStat[];
}

/* ─── Fetch function ─── */
async function fetchBlogOverview(): Promise<BlogOverviewData> {
    const { data: blogs } = await supabase
        .from("blog_posts")
        .select("id, title, slug, status, created_at")
        .order("created_at", { ascending: false });

    const ninetyDaysAgo = subDays(new Date(), 90).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: events } = await (supabase as any)
        .from("blog_user_events")
        .select("article_id, event_type, metadata, created_at")
        .gte("created_at", ninetyDaysAgo);

    const allEvents = (events || []) as {
        article_id: string | null;
        event_type: string;
        metadata: Record<string, unknown> | null;
        created_at: string;
    }[];

    // Aggregate per article
    const metricsMap: Record<string, { views: number; scrollDepth: number[]; readTime: number[]; ctaClicks: number; shares: number }> = {};

    for (const ev of allEvents) {
        const aid = ev.article_id || "__global__";
        if (!metricsMap[aid]) metricsMap[aid] = { views: 0, scrollDepth: [], readTime: [], ctaClicks: 0, shares: 0 };
        const m = metricsMap[aid];

        switch (ev.event_type) {
            case "article_view":
            case "page_view":
                m.views++;
                break;
            case "scroll_depth":
                m.scrollDepth.push(Number((ev.metadata as Record<string, unknown>)?.depth) || 0);
                break;
            case "reading_time":
                m.readTime.push(Number((ev.metadata as Record<string, unknown>)?.time_spent_seconds) || 0);
                break;
            case "cta_click":
                m.ctaClicks++;
                break;
            case "share_click":
                m.shares++;
                break;
        }
    }

    const articles: ArticleMetric[] = (blogs || []).map((blog) => {
        const m = metricsMap[blog.id] || { views: 0, scrollDepth: [], readTime: [], ctaClicks: 0, shares: 0 };
        return {
            id: blog.id,
            title: blog.title,
            slug: blog.slug,
            status: blog.status,
            views: m.views,
            scrollDepth: m.scrollDepth.length > 0 ? Math.round(m.scrollDepth.reduce((a, b) => a + b, 0) / m.scrollDepth.length) : 0,
            readTime: m.readTime.length > 0 ? Math.round(m.readTime.reduce((a, b) => a + b, 0) / m.readTime.length) : 0,
            ctaClicks: m.ctaClicks,
            shares: m.shares,
            created_at: blog.created_at || "",
        };
    });

    // Daily stats (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dayMap: Record<string, DailyStat> = {};
    for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "MMM d");
        dayMap[d] = { date: d, views: 0, events: 0 };
    }
    for (const ev of allEvents) {
        if (new Date(ev.created_at) < thirtyDaysAgo) continue;
        const d = format(new Date(ev.created_at), "MMM d");
        if (dayMap[d]) {
            if (ev.event_type === "article_view" || ev.event_type === "page_view") dayMap[d].views++;
            dayMap[d].events++;
        }
    }

    return {
        articles: articles.sort((a, b) => b.views - a.views),
        dailyStats: Object.values(dayMap),
    };
}

/* ─── Component ─── */
export default function AdminBlogOverview() {
    const queryClient = useQueryClient();

    const { data, isLoading, isRefetching } = useQuery({
        queryKey: queryKeys.blog.overview,
        queryFn: fetchBlogOverview,
    });

    const dailyStats = useMemo(() => data?.dailyStats ?? [], [data?.dailyStats]);
    const articles = useMemo(() => data?.articles ?? [], [data?.articles]);

    const topStats = useMemo(() => {
        const totalViews = articles.reduce((s, a) => s + a.views, 0);
        const avgReadTime = articles.length > 0 ? articles.reduce((s, a) => s + a.readTime, 0) / articles.length : 0;
        const avgScrollDepth = articles.length > 0 ? articles.reduce((s, a) => s + a.scrollDepth, 0) / articles.length : 0;
        const totalCta = articles.reduce((s, a) => s + a.ctaClicks, 0);
        const totalShares = articles.reduce((s, a) => s + a.shares, 0);
        return { totalViews, avgReadTime, avgScrollDepth, totalCta, totalShares };
    }, [articles]);

    const COLORS = ["hsl(43,74%,49%)", "hsl(200,70%,50%)", "hsl(150,60%,45%)", "hsl(280,60%,55%)", "hsl(350,65%,50%)", "hsl(30,80%,55%)"];

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Surface variant="primary" radius="lg" border shadow="sm" key={i} className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                            <div className="p-6 pt-0 space-y-3">
                                <Skeleton className="h-3 w-20 bg-[hsl(var(--admin-border))]" />
                                <Skeleton className="h-8 w-24 bg-[hsl(var(--admin-border))]" />
                            </div>
                        </Surface>
                    ))}
                </div>
                <Skeleton className="h-[300px] w-full bg-[hsl(var(--admin-border))]/30 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="w-full font-mono">
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
                .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
                .fade-up-3 { animation: fadeUp var(--anim-duration) var(--anim-stagger-3) var(--anim-ease) both; }
                .fade-up-4 { animation: fadeUp var(--anim-duration) var(--anim-stagger-4) var(--anim-ease) both; }
            `}</style>
            
                        
            <ModuleActions>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.blog.overview })}
                    disabled={isRefetching}
                    className="gap-2 border-[hsl(var(--admin-border))] text-[hsl(var(--admin-muted))]"
                >
                    <RefreshCw className={cn("w-3.5 h-3.5", isRefetching && "animate-spin")} />
                    Refresh
                </Button>
            </ModuleActions>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard icon={Eye} label="Total Views" value={topStats.totalViews.toLocaleString()} sub="Last 90 days" color="hsl(43,74%,49%)" />
                <KpiCard icon={Clock} label="Avg Read Time" value={`${(topStats.avgReadTime / 60).toFixed(1)}m`} sub="Per article" color="hsl(150,60%,45%)" />
                <KpiCard icon={Scroll} label="Avg Scroll Depth" value={`${topStats.avgScrollDepth}%`} sub="Content completion" color="hsl(200,70%,50%)" />
                <KpiCard icon={MousePointerClick} label="CTA Clicks" value={topStats.totalCta.toLocaleString()} sub="Conversions" color="hsl(280,60%,55%)" />
                <KpiCard icon={Share2} label="Shares" value={topStats.totalShares.toLocaleString()} sub="Social reach" color="hsl(350,65%,50%)" />
            </div>

            {/* Engagement Trend */}
            <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
                <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Engagement Trend</h3>
                <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-6">Daily views & events over the last 30 days</p>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={dailyStats}>
                        <defs>
                            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(43,74%,49%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(43,74%,49%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="eventsGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(200,70%,50%)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="hsl(200,70%,50%)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--admin-border))" opacity={0.3} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} interval={3} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "hsl(var(--admin-text))" }} />
                        <Area type="monotone" dataKey="views" name="Views" stroke="hsl(43,74%,49%)" strokeWidth={2} fill="url(#viewsGrad)" />
                        <Area type="monotone" dataKey="events" name="All Events" stroke="hsl(200,70%,50%)" strokeWidth={1.5} fill="url(#eventsGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Article Performance Table */}
            <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
                <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Article Performance</h3>
                <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-5">All articles ranked by engagement</p>
                {articles.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[hsl(var(--admin-border))]/50">
                                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Article</th>
                                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Status</th>
                                    <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Views</th>
                                    <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Read Time</th>
                                    <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3 pr-4">Scroll %</th>
                                    <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] pb-3">CTAs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.slice(0, 10).map((art) => (
                                    <tr key={art.id} className="border-b border-[hsl(var(--admin-border))]/30 last:border-0 group">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <FileText className="w-3.5 h-3.5 text-[hsl(var(--admin-primary))] shrink-0" />
                                                <span className="text-[hsl(var(--admin-text))] truncate max-w-[220px] group-hover:text-[hsl(var(--admin-primary))] transition-colors">{art.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                                art.status === "published" ? "bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))]" : "bg-[hsl(var(--admin-warning))]/10 text-[hsl(var(--admin-warning))]"
                                            }`}>{art.status}</span>
                                        </td>
                                        <td className="py-3 pr-4 text-right font-bold text-[hsl(var(--admin-text))] tabular-nums">{art.views}</td>
                                        <td className="py-3 pr-4 text-right text-[hsl(var(--admin-text-muted))] tabular-nums">{art.readTime > 0 ? `${(art.readTime / 60).toFixed(1)}m` : "—"}</td>
                                        <td className="py-3 pr-4 text-right text-[hsl(var(--admin-text-muted))] tabular-nums">{art.scrollDepth > 0 ? `${art.scrollDepth}%` : "—"}</td>
                                        <td className="py-3 text-right text-[hsl(var(--admin-text-muted))] tabular-nums">{art.ctaClicks || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-10 h-10 text-[hsl(var(--admin-primary))]/20 mx-auto mb-3" />
                        <p className="text-sm text-[hsl(var(--admin-text-muted))]">No blog articles yet. Publish your first article to see analytics.</p>
                    </div>
                )}
            </div>

            {/* Top Performers Quick View */}
            {articles.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Views Bar Chart */}
                    <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
                        <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Top Articles by Views</h3>
                        <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">Top 6 performing articles</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={articles.slice(0, 6)} layout="vertical" barSize={14}>
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} />
                                <YAxis type="category" dataKey="title" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--admin-text-muted))", fontSize: 10 }} width={120} tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + "…" : v} />
                                <Tooltip contentStyle={{ background: "hsl(var(--admin-card))", border: "1px solid hsl(var(--admin-border))", borderRadius: 8, fontSize: 11 }} />
                                <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                                    {articles.slice(0, 6).map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Engagement Leaders */}
                    <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
                        <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1">Engagement Leaders</h3>
                        <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">Highest scroll depth & read time</p>
                        <div className="space-y-1">
                            {articles
                                .filter((a) => a.scrollDepth > 0)
                                .sort((a, b) => b.scrollDepth - a.scrollDepth)
                                .slice(0, 6)
                                .map((art, i) => (
                                    <div key={art.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[hsl(var(--admin-primary))]/5 transition-colors group">
                                        <span className="text-[10px] font-mono text-[hsl(var(--admin-text-muted))] w-4">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-[hsl(var(--admin-text))] truncate group-hover:text-[hsl(var(--admin-primary))] transition-colors">{art.title}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[10px] text-[hsl(var(--admin-text-muted))] flex items-center gap-1"><Scroll size={9} /> {art.scrollDepth}%</span>
                                                <span className="text-[10px] text-[hsl(var(--admin-text-muted))] flex items-center gap-1"><Clock size={9} /> {(art.readTime / 60).toFixed(1)}m</span>
                                            </div>
                                        </div>
                                        <ArrowUpRight size={12} className="text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-primary))]" />
                                    </div>
                                ))}
                            {articles.filter((a) => a.scrollDepth > 0).length === 0 && (
                                <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-6">No scroll data yet — readers need to engage with articles</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── KPI Card ─── */
function KpiCard({ icon: Icon, label, value, sub, color }: { icon: LucideIcon; label: string; value: string; sub: string; color: string }) {
    return (
        <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300 opacity-50 group-hover:opacity-100" style={{ background: color }} />
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-widest">{label}</p>
                    <h3 className="text-xl font-bold text-[hsl(var(--admin-text))] tracking-tight">{value}</h3>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">{sub}</p>
                </div>
                <div className="p-2 rounded-xl bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))]" style={{ color }}>
                    <Icon size={16} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}

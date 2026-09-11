import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Eye,
    Clock,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    FileText,
    Search,
} from "lucide-react";
import { AdminMetricsPanel } from "@/components/admin/shared";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/design-system/components/Table";
import { Badge } from "@/components/primitives/interactive";

/* ───────────── Types ───────────── */
interface ArticleRow {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    views: number | null;
    read_time: number | null;
    scroll_depth: number | null;
}

type SortKey = "views" | "read_time" | "scroll_depth" | "created_at";
type SortDir = "asc" | "desc";

/* ───────────── Component ───────────── */
export default function AdminBlogPerformance() {
    const [articles, setArticles] = useState<ArticleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("views");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: blogData, error: blogErr } = await supabase
                .from("blog_posts")
                .select("id, title, slug, status, created_at, view_count")
                .order("created_at", { ascending: false });

            if (blogErr) {
                console.error("Error loading blogs", blogErr);
                setLoading(false);
                return;
            }

            // Fetch events from canonical blog_user_events store
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: eventsData, error: eventsErr } = await (supabase as any)
                .from("blog_user_events")
                .select("article_id, event_type, metadata");

            if (eventsErr) {
                console.warn("[AdminBlogPerformance] Failed to load events:", eventsErr);
            }

            const events = (eventsData || []) as {
                article_id: string | null;
                event_type: string;
                metadata: Record<string, unknown> | null;
            }[];

            const analyticsMap: Record<string, { views: number; readTimes: number[]; scrollDepths: number[] }> = {};

            for (const ev of events) {
                if (!ev.article_id) continue;
                if (!analyticsMap[ev.article_id]) {
                    analyticsMap[ev.article_id] = { views: 0, readTimes: [], scrollDepths: [] };
                }
                const m = analyticsMap[ev.article_id];
                if (ev.event_type === "article_view" || ev.event_type === "page_view") {
                    m.views++;
                } else if (ev.event_type === "scroll_depth") {
                    const depth = Number(ev.metadata?.depth);
                    if (!Number.isNaN(depth) && depth > 0) m.scrollDepths.push(depth);
                } else if (ev.event_type === "reading_time") {
                    const time = Number(ev.metadata?.time_spent_seconds);
                    if (!Number.isNaN(time) && time > 0) m.readTimes.push(time);
                }
            }

            setArticles((blogData || []).map((b: { id: string; title: string; slug: string; status: string; created_at: string; view_count: number | null }) => {
                const m = analyticsMap[b.id];
                const eventViews = m?.views ?? 0;
                const views = eventViews > 0 ? eventViews : (b.view_count ?? 0);
                const avgReadTime = m && m.readTimes.length > 0
                    ? Math.round(m.readTimes.reduce((acc, v) => acc + v, 0) / m.readTimes.length)
                    : 0;
                const avgScroll = m && m.scrollDepths.length > 0
                    ? Math.round(m.scrollDepths.reduce((acc, v) => acc + v, 0) / m.scrollDepths.length)
                    : 0;

                return {
                    id: b.id,
                    title: b.title,
                    slug: b.slug,
                    is_published: b.status === "published",
                    created_at: b.created_at,
                    views,
                    read_time: avgReadTime,
                    scroll_depth: avgScroll,
                };
            }));
        } catch (err) {
            console.error("Failed to load articles", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-[hsl(var(--admin-text-muted))]" />;
        return sortDir === "asc" ? (
            <ArrowUp className="w-3 h-3 text-[hsl(var(--admin-primary))]" />
        ) : (
            <ArrowDown className="w-3 h-3 text-[hsl(var(--admin-primary))]" />
        );
    };

    const sorted = [...articles]
        .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortKey === "created_at") {
                const av = new Date(a.created_at ?? 0).getTime();
                const bv = new Date(b.created_at ?? 0).getTime();
                return sortDir === "asc" ? av - bv : bv - av;
            }
            const av = (a[sortKey] as number) ?? 0;
            const bv = (b[sortKey] as number) ?? 0;
            return sortDir === "asc" ? av - bv : bv - av;
        });

    // Quick stats
    const totalViews = articles.reduce((s, a) => s + (a.views || 0), 0);
    const topArticle = articles.length
        ? articles.reduce((best, a) => ((a.views || 0) > (best.views || 0) ? a : best), articles[0])
        : null;
    const avgScroll = articles.length
        ? Math.round(articles.reduce((s, a) => s + (a.scroll_depth || 0), 0) / articles.length)
        : 0;

    const avgReadTime = articles.length
        ? Math.round(articles.reduce((s, a) => s + (a.read_time || 0), 0) / articles.length)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-[hsl(var(--admin-primary))]" />
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
            `}</style>
            
                        
            <ModuleActions>
                <Button variant="outline" size="sm" onClick={loadData} className="gap-2 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </Button>
            </ModuleActions>

            <div className="fade-up-1">
                <AdminMetricsPanel 
                    metrics={[
                        { label: "Total Views", value: totalViews.toLocaleString() },
                        { label: "Top Article", value: topArticle?.title?.substring(0, 20) || "—" },
                        { label: "Avg. Scroll", value: `${avgScroll}%` },
                        { label: "Avg. Read Time", value: avgReadTime ? `${(avgReadTime / 60).toFixed(1)}m` : "—" }
                    ]} 
                />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 mt-8 bg-[hsl(var(--admin-surface))] p-4 rounded-xl border border-[hsl(var(--admin-border))] fade-up-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--admin-text-muted))]" />
                    <Input
                        placeholder="Search articles�"
                        className="pl-10 bg-[hsl(var(--admin-background))] border-[hsl(var(--admin-border))] focus:border-[hsl(var(--admin-primary))]/50 rounded-xl text-[hsl(var(--admin-text))]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Performance table */}
            <div className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] overflow-hidden shadow-2xl mt-6 fade-up-3">
                <Table>
                    <TableHeader className="bg-[hsl(var(--admin-surface))]">
                        <TableRow className="border-[hsl(var(--admin-border-subtle))] hover:bg-transparent">
                            <TableHead className="text-[hsl(var(--admin-text-muted))] uppercase text-[10px] font-bold tracking-widest">
                                Article
                            </TableHead>
                            <TableHead className="text-[hsl(var(--admin-text-muted))] uppercase text-[10px] font-bold tracking-widest">
                                Status
                            </TableHead>
                            <TableHead
                                className="text-[hsl(var(--admin-text-muted))] uppercase text-[10px] font-bold tracking-widest cursor-pointer select-none"
                                onClick={() => handleSort("views")}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Views <SortIcon col="views" />
                                </span>
                            </TableHead>
                            <TableHead
                                className="text-[hsl(var(--admin-text-muted))] uppercase text-[10px] font-bold tracking-widest cursor-pointer select-none"
                                onClick={() => handleSort("read_time")}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Read Time <SortIcon col="read_time" />
                                </span>
                            </TableHead>
                            <TableHead
                                className="text-[hsl(var(--admin-text-muted))] uppercase text-[10px] font-bold tracking-widest cursor-pointer select-none"
                                onClick={() => handleSort("scroll_depth")}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Scroll Depth <SortIcon col="scroll_depth" />
                                </span>
                            </TableHead>
                            <TableHead className="text-[hsl(var(--admin-text-muted))] uppercase text-[10px] font-bold tracking-widest">
                                Published
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-[hsl(var(--admin-text-muted))]">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-8 h-8 text-[hsl(var(--admin-text-muted))]/60" />
                                        <p className="font-medium">No articles found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sorted.map((art) => (
                                <TableRow
                                    key={art.id}
                                    className="border-[hsl(var(--admin-border-subtle))] hover:bg-[hsl(var(--admin-surface-hover))] transition-colors"
                                >
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5 max-w-[280px]">
                                            <span className="font-bold text-[hsl(var(--admin-text))] text-sm truncate">
                                                {art.title}
                                            </span>
                                            <span className="text-[10px] text-[hsl(var(--admin-text-muted))] font-mono truncate">
                                                /blog/{art.slug}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[10px] uppercase font-bold tracking-widest",
                                                art.is_published
                                                    ? "bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))] border-[hsl(var(--admin-success))]/20"
                                                    : "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))] border-[hsl(var(--admin-border-subtle))]"
                                            )}
                                        >
                                            {art.is_published ? "Live" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-[hsl(var(--admin-text))] font-semibold">
                                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                                            {(art.views || 0).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-[hsl(var(--admin-text))] font-semibold">
                                            <Clock className="w-3.5 h-3.5 text-[hsl(var(--admin-success))]" />
                                            {art.read_time ? `${(art.read_time / 60).toFixed(1)}m` : "—"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-[hsl(var(--admin-surface-hover))] overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--admin-warning))] to-[hsl(var(--admin-primary))]"
                                                    style={{ width: `${art.scroll_depth || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-[hsl(var(--admin-text-muted))]">
                                                {art.scroll_depth || 0}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[hsl(var(--admin-text-muted))] text-xs font-medium">
                                        {format(new Date(art.created_at), "MMM d, yyyy")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

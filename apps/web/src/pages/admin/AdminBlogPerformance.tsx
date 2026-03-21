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
    Scroll,
    RefreshCw,
    FileText,
    Search,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/design-system/components/Table";
import { Badge } from "@/components/ui/badge";

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
                .from("blogs")
                .select("id, title, slug, is_published, created_at")
                .order("created_at", { ascending: false });

            if (blogErr) { console.error("Error loading blogs", blogErr); setLoading(false); return; }

            const analyticsMap: Record<string, { views: number; read_time: number; scroll_depth: number }> = {};
            try {
                const { data: ad } = await supabase
                    .from("article_analytics")
                    .select("article_id, total_views, avg_read_time_seconds, avg_scroll_depth");
                if (ad) ad.forEach((a: { article_id: string; total_views: number; avg_read_time_seconds: number; avg_scroll_depth: number }) => {
                    analyticsMap[a.article_id] = { views: a.total_views || 0, read_time: a.avg_read_time_seconds || 0, scroll_depth: a.avg_scroll_depth || 0 };
                });
            } catch { /* table may not exist */ }

            setArticles((blogData || []).map((b: { id: string; title: string; slug: string; is_published: boolean; created_at: string }) => ({
                id: b.id, title: b.title, slug: b.slug, is_published: b.is_published, created_at: b.created_at,
                views: analyticsMap[b.id]?.views ?? 0,
                read_time: analyticsMap[b.id]?.read_time ?? 0,
                scroll_depth: analyticsMap[b.id]?.scroll_depth ?? 0,
            })));
        } catch (err) { console.error("Failed to load articles", err); }
        setLoading(false);
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
        if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-zinc-600" />;
        return sortDir === "asc" ? (
            <ArrowUp className="w-3 h-3 text-primary" />
        ) : (
            <ArrowDown className="w-3 h-3 text-primary" />
        );
    };

    const sorted = [...articles]
        .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Quick KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-md">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Eye size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Views</p>
                            <p className="text-xl font-serif font-bold text-white">{totalViews.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-md">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Top Article</p>
                            <p className="text-sm font-bold text-white truncate max-w-[200px]">
                                {topArticle?.title ?? "—"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-md">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Scroll size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avg. Scroll</p>
                            <p className="text-xl font-serif font-bold text-white">{avgScroll}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-zinc-900/40 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/50">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search articles..."
                        className="pl-10 bg-black/40 border-zinc-700/50 focus:border-primary/50 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" onClick={loadData} className="gap-2 border-zinc-800 text-zinc-400 ml-auto">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </Button>
            </div>

            {/* Performance table */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-zinc-900/50">
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                                Article
                            </TableHead>
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                                Status
                            </TableHead>
                            <TableHead
                                className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest cursor-pointer select-none"
                                onClick={() => handleSort("views")}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Views <SortIcon col="views" />
                                </span>
                            </TableHead>
                            <TableHead
                                className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest cursor-pointer select-none"
                                onClick={() => handleSort("read_time")}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Read Time <SortIcon col="read_time" />
                                </span>
                            </TableHead>
                            <TableHead
                                className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest cursor-pointer select-none"
                                onClick={() => handleSort("scroll_depth")}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Scroll Depth <SortIcon col="scroll_depth" />
                                </span>
                            </TableHead>
                            <TableHead className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                                Published
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-8 h-8 text-zinc-700" />
                                        <p className="font-medium">No articles found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sorted.map((art) => (
                                <TableRow
                                    key={art.id}
                                    className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                                >
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5 max-w-[280px]">
                                            <span className="font-bold text-zinc-200 text-sm truncate">
                                                {art.title}
                                            </span>
                                            <span className="text-[10px] text-zinc-600 font-mono truncate">
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
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-zinc-800/50 text-zinc-500 border-zinc-700"
                                            )}
                                        >
                                            {art.is_published ? "Live" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                                            {(art.views || 0).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                            {art.read_time ? `${(art.read_time / 60).toFixed(1)}m` : "—"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-primary"
                                                    style={{ width: `${art.scroll_depth || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-zinc-400">
                                                {art.scroll_depth || 0}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-xs font-medium">
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

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
    MousePointerClick,
    Share2,
    Mail,
    Tag,
    RefreshCw,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/card";
import { AdminMetricsPanel } from "@/components/admin/shared";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";

/* ───────────── Types ───────────── */
interface EventRow {
    event_type: string;
    created_at: string;
    metadata: Record<string, unknown> | null;
}

interface EventBreakdown {
    name: string;
    count: number;
}

/* ───────────── Constants ───────────── */
const EVENT_LABELS: Record<string, string> = {
    page_view: "Page Views",
    scroll_depth: "Scroll Depth",
    read_time: "Read Time",
    cta_click: "CTA Clicks",
    share_click: "Share Clicks",
    tag_click: "Tag Clicks",
    newsletter_signup: "Newsletter Sign-ups",
};

const PIE_COLORS = ["#C6A15B", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

/* ───────────── Component ───────────── */
export default function AdminBlogEngagement() {
    const [events, setEvents] = useState<EventRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        setRefreshing(true);
        try {
            const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
            const { data, error } = await supabase
                .from("blog_user_events")
                .select("event_type, created_at, metadata")
                .gte("created_at", thirtyDaysAgo)
                .order("created_at", { ascending: false });

            if (data) setEvents(data as EventRow[]);
            if (error) console.error("Error loading events", error);
        } catch (err) {
            console.error("Failed to load engagement data", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    /* Computed breakdowns */
    const eventBreakdown = useMemo<EventBreakdown[]>(() => {
        const map: Record<string, number> = {};
        events.forEach((e) => {
            const key = e.event_type;
            map[key] = (map[key] || 0) + 1;
        });
        return Object.entries(map)
            .map(([name, count]) => ({
                name: EVENT_LABELS[name] || name,
                count,
            }))
            .sort((a, b) => b.count - a.count);
    }, [events]);

    const dailyEvents = useMemo(() => {
        const map: Record<string, number> = {};
        events.forEach((e) => {
            const d = format(new Date(e.created_at), "MMM d");
            map[d] = (map[d] || 0) + 1;
        });
        return Object.entries(map).map(([date, count]) => ({ date, count }));
    }, [events]);

    const totalEvents = events.length;
    const ctaClicks = events.filter((e) => e.event_type === "cta_click").length;
    const shareClicks = events.filter((e) => e.event_type === "share_click").length;
    const newsletterSignups = events.filter((e) => e.event_type === "newsletter_signup").length;

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
                <Button variant="outline" size="sm" onClick={loadData} disabled={refreshing} className="gap-2 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]">
                    <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
                    Refresh
                </Button>
            </ModuleActions>

            <div className="fade-up-1">
                <AdminMetricsPanel 
                    metrics={[
                        { label: "Total Events", value: totalEvents.toLocaleString(), icon: BarChart3 },
                        { label: "CTA Clicks", value: ctaClicks.toLocaleString(), icon: MousePointerClick },
                        { label: "Share Clicks", value: shareClicks.toLocaleString(), icon: Share2 },
                        { label: "Newsletter Sign-ups", value: newsletterSignups.toLocaleString(), icon: Mail }
                    ]} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8 fade-up-2">
                {/* Daily Events Bar Chart */}
                <Card className="lg:col-span-3 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-[hsl(var(--admin-text))] flex items-center gap-2">
                            <BarChart3 className="text-[hsl(var(--admin-primary))] w-4 h-4" />
                            Daily Engagement (Last 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {dailyEvents.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-[hsl(var(--admin-text-muted))] text-sm">
                                No engagement data captured yet.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyEvents}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--admin-card))",
                                            border: "1px solid hsl(var(--admin-border))",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                            color: "hsl(var(--admin-text))",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#C6A15B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Event Type Breakdown Pie */}
                <Card className="lg:col-span-2 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-[hsl(var(--admin-text))] flex items-center gap-2">
                            <Tag className="text-[hsl(var(--admin-primary))] w-4 h-4" />
                            Event Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {eventBreakdown.length === 0 ? (
                            <div className="flex items-center justify-center h-[260px] text-[hsl(var(--admin-text-muted))] text-sm">
                                No events recorded yet.
                            </div>
                        ) : (
                            <>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={eventBreakdown}
                                                dataKey="count"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                innerRadius={45}
                                                strokeWidth={0}
                                            >
                                                {eventBreakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: "hsl(var(--admin-card))",
                                                    border: "1px solid hsl(var(--admin-border))",
                                                    borderRadius: "8px",
                                                    fontSize: "12px",
                                                    color: "hsl(var(--admin-text))",
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 mt-2">
                                    {eventBreakdown.map((e, i) => (
                                        <div key={e.name} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                                                />
                                                <span className="text-[hsl(var(--admin-text-muted))] font-medium">{e.name}</span>
                                            </div>
                                            <span className="text-[hsl(var(--admin-text))] font-bold">{e.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

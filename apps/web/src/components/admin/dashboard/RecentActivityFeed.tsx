
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
    Activity,
    UserPlus,
    FileEdit,
    Briefcase,
    MessageSquare,
    Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/primitives/scroll-area";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { DateRange } from "react-day-picker";

interface ActivityItem {
    id: string;
    action: string;
    module: string;
    created_at: string;
    admin_id?: string;
    status: string;
    details?: Record<string, unknown> | null;
    profiles?: {
        full_name: string;
    };
}

export function RecentActivityFeed({ dateRange }: { dateRange?: DateRange }) {
    const { data: activities, isLoading } = useQuery({
        queryKey: ["recent-activity", dateRange],
        queryFn: async () => {
            let query = (supabase as any)
                .from("system_logs")
                .select("*, profiles(full_name)")
                .order("created_at", { ascending: false })
                .limit(20);

            if (dateRange?.from) {
                query = query.gte("created_at", dateRange.from.toISOString());
            }

            if (dateRange?.to) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                query = query.lte("created_at", toDate.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as unknown as ActivityItem[];
        },
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[150px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!activities?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-50" />
                <p>No recent activity in selected period.</p>
            </div>
        );
    }

    const getIcon = (item: ActivityItem) => {
        const module = item.module?.toLowerCase();
        if (module?.includes("blog")) return <FileEdit className="h-4 w-4" />;
        if (module?.includes("project") || module?.includes("portfolio")) return <Briefcase className="h-4 w-4" />;
        if (module?.includes("lead")) return <MessageSquare className="h-4 w-4" />;
        if (module?.includes("user") || module?.includes("auth")) return <UserPlus className="h-4 w-4" />;

        return <Shield className="h-4 w-4" />;
    };

    const getBadges = (status: string) => {
        const s = status.toLowerCase();
        if (s === "success") return "bg-admin-success/10 text-admin-success border-admin-success/20";
        if (s === "error" || s === "failed") return "bg-admin-danger/10 text-admin-danger border-admin-danger/20";
        return "bg-admin-surface text-admin-muted border-admin-border";
    };

    const getStatusLabel = (status: string): string => {
        const s = status.toLowerCase();
        if (s === "success") return "Completed";
        if (s === "error" || s === "failed") return "Failed";
        if (s === "pending") return "Pending";
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    const getModuleLabel = (module: string): string => {
        const map: Record<string, string> = {
            lead_activities: "CRM",
            leads: "CRM",
            content_versions: "Content",
            blog_posts: "Blog",
            projects: "Portfolio",
            media: "Media",
            testimonials: "Reviews",
            services: "Services",
            system_logs: "System",
            users: "Users",
            auth: "Access",
            settings: "Settings",
        };
        const key = module?.toLowerCase().replace(/\s+/g, "_");
        return map[key] || module.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const formatDetails = (details: Record<string, unknown>): string | null => {
        if (!details || Object.keys(details).length === 0) return null;
        const parts: string[] = [];
        if (details.old_status && details.new_status) {
            parts.push(`Status changed from "${details.old_status}" to "${details.new_status}"`);
        } else if (details.status) {
            parts.push(`Status: ${details.status}`);
        }
        if (details.name || details.title) {
            parts.push(`Item: ${details.name || details.title}`);
        }
        if (details.count) {
            parts.push(`${details.count} items affected`);
        }
        if (parts.length === 0) {
            // Fallback: show key-value pairs in readable form (no raw JSON)
            const readable = Object.entries(details)
                .filter(([, v]) => v !== null && v !== undefined && typeof v !== "object")
                .slice(0, 3)
                .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
                .join(" · ");
            return readable || null;
        }
        return parts.join(" · ");
    };

    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 group items-start border-b border-admin-border/50 pb-4 last:border-0 hover:bg-admin-surface/30 p-2 rounded-lg transition-colors">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${getBadges(activity.status)}`}>
                            {getIcon(activity)}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium leading-none text-admin-foreground">
                                    {activity.action}
                                </span>
                                <span className="text-[11px] text-admin-muted tabular-nums">
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </span>
                            </div>

                            <div className="text-xs text-admin-muted flex gap-2 items-center mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-[11px] border ${getBadges(activity.status)}`}>
                                    {getStatusLabel(activity.status)}
                                </span>
                                <span>
                                    • in <span className="text-admin-gold">{getModuleLabel(activity.module)}</span>
                                    {activity.profiles?.full_name && ` • by ${activity.profiles.full_name}`}
                                </span>
                            </div>

                            {activity.details && typeof activity.details === 'object' && Object.keys(activity.details).length > 0 && (() => {
                                const summary = formatDetails(activity.details as Record<string, unknown>);
                                return summary ? (
                                    <p className="mt-1.5 text-xs text-admin-muted/80 truncate max-w-[350px]">
                                        {summary}
                                    </p>
                                ) : null;
                            })()}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

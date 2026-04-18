
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
            let query = supabase
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
                                <span className="text-[10px] text-admin-muted tabular-nums">
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </span>
                            </div>

                            <div className="text-xs text-admin-muted flex gap-2 items-center mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getBadges(activity.status)}`}>
                                    {activity.status.toUpperCase()}
                                </span>
                                <span>
                                    • in <span className="text-admin-gold">{activity.module}</span>
                                    {activity.profiles?.full_name && ` • by ${activity.profiles.full_name}`}
                                </span>
                            </div>

                            {activity.details && typeof activity.details === 'object' && Object.keys(activity.details).length > 0 && (
                                <div className="mt-1.5 text-xs bg-admin-surface p-2 rounded border border-admin-border font-mono truncate max-w-[300px] text-admin-muted/80">
                                    {JSON.stringify(activity.details).slice(0, 80)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}


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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";

interface ActivityItem {
    id: string;
    action: string;
    entity_type: string;
    created_at: string;
    user_id?: string;
    details?: {
        invited_by?: string;
        email?: string;
        role?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
}

export function RecentActivityFeed({ dateRange }: { dateRange?: DateRange }) {
    const { data: activities, isLoading } = useQuery({
        queryKey: ["recent-activity", dateRange],
        queryFn: async () => {
            let query = supabase
                .from("audit_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20); // increased limit to ensure we see enough if filtered

            // Filtering logic
            if (dateRange?.from) {
                // Use ISO string, but careful with timestamp logic.
                // We want end of day for 'to'? or just raw date?
                // Usually dateRange from day picker is start of day.
                // If 'to' is undefined, it means single day selection.
                query = query.gte("created_at", dateRange.from.toISOString());
            }

            if (dateRange?.to) {
                // Set to end of day for 'to' date
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                query = query.lte("created_at", toDate.toISOString());
            } else if (dateRange?.from) {
                // If only 'from' is selected, assume it's a single day or range start?
                // Usually range picker handles 'to' as undefined while selecting.
                // Let's just filter by 'from' start if 'to' is missing, effectively >= from.
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
        // Handle specific actions first
        if (item.action === "USER_INVITED") return <UserPlus className="h-4 w-4" />;

        // Handle by entity type
        const type = item.entity_type?.toLowerCase();
        if (type?.includes("blog")) return <FileEdit className="h-4 w-4" />;
        if (type?.includes("project") || type?.includes("portfolio")) return <Briefcase className="h-4 w-4" />;
        if (type?.includes("lead")) return <MessageSquare className="h-4 w-4" />;
        if (type?.includes("user")) return <UserPlus className="h-4 w-4" />;

        return <Shield className="h-4 w-4" />;
    };

    const getBadges = (action: string) => {
        const act = action.toLowerCase();
        if (act.includes("create") || act.includes("invited")) return "bg-admin-success/10 text-admin-success border-admin-success/20";
        if (act.includes("update")) return "bg-admin-info/10 text-admin-info border-admin-info/20";
        if (act.includes("delete")) return "bg-admin-danger/10 text-admin-danger border-admin-danger/20";
        return "bg-admin-surface text-admin-muted border-admin-border";
    };

    const formatActionLabel = (item: ActivityItem) => {
        if (item.action === "USER_INVITED") return "User Invited";
        const entity = item.entity_type?.replace(/s$/, "") || "Item";
        const action = item.action || "Modified";
        return `${entity.charAt(0).toUpperCase() + entity.slice(1)} ${action.charAt(0).toUpperCase() + action.slice(1)}`;
    };

    const getUserLabel = (item: ActivityItem) => {
        if (item.details?.invited_by) return "Admin";
        if (item.user_id) return "User";
        return "System";
    };

    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 group items-start border-b border-admin-border/50 pb-4 last:border-0 hover:bg-admin-surface/30 p-2 rounded-lg transition-colors">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${getBadges(activity.action)}`}>
                            {getIcon(activity)}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium leading-none text-admin-foreground">
                                    {formatActionLabel(activity)}
                                </span>
                                <span className="text-[10px] text-admin-muted tabular-nums">
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </span>
                            </div>

                            <div className="text-xs text-admin-muted flex gap-2 items-center mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getBadges(activity.action)}`}>
                                    {activity.action.toUpperCase()}
                                </span>
                                <span>
                                    • by <span className="text-admin-gold">{getUserLabel(activity)}</span>
                                </span>
                            </div>

                            {activity.details && typeof activity.details === 'object' && Object.keys(activity.details).length > 0 && (
                                <div className="mt-1.5 text-xs bg-admin-surface p-2 rounded border border-admin-border font-mono truncate max-w-[300px] text-admin-muted/80">
                                    {activity.action === "USER_INVITED" ? (
                                        `Invited: ${activity.details.email} as ${activity.details.role}`
                                    ) : (
                                        JSON.stringify(activity.details).slice(0, 60) + (JSON.stringify(activity.details).length > 60 ? "..." : "")
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

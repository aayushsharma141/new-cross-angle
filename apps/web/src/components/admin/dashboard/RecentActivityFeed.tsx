import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
    Activity,
    AlertTriangle,
    Briefcase,
    Calculator,
    FileEdit,
    Image,
    MessageSquare,
    Settings,
    Shield,
    UserPlus,
    Users,
    type LucideIcon,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { ScrollArea } from "@/components/ui/primitives/scroll-area";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { auditService } from "@/services/AuditService";
import type { AuditAction, AuditEntityType, AuditLogEntry } from "@/types/audit";

interface RecentActivityFeedProps {
    dateRange?: DateRange;
    limit?: number;
    heightClassName?: string;
}

const ACTION_LABELS: Record<AuditAction, string> = {
    CREATE: "Created",
    UPDATE: "Updated",
    DELETE: "Deleted",
    VIEW: "Viewed",
    EXPORT: "Exported",
    LOGIN: "Signed in",
    LOGOUT: "Signed out",
    ROLE_CHANGE: "Changed role of",
    STATUS_CHANGE: "Changed status of",
    PUBLISH: "Published",
    UNPUBLISH: "Unpublished",
    APPROVE: "Approved",
    REJECT: "Rejected",
    ARCHIVE: "Archived",
    RESTORE: "Restored",
};

const ENTITY: Record<AuditEntityType, { label: string; icon: LucideIcon }> = {
    user: { label: "user", icon: UserPlus },
    lead: { label: "lead", icon: MessageSquare },
    project: { label: "project", icon: Briefcase },
    blog: { label: "blog post", icon: FileEdit },
    service: { label: "service", icon: Briefcase },
    testimonial: { label: "testimonial", icon: MessageSquare },
    team_member: { label: "team member", icon: Users },
    media: { label: "media file", icon: Image },
    settings: { label: "site settings", icon: Settings },
    estimate: { label: "estimate", icon: Calculator },
};

const toneFor = (action: AuditAction): string => {
    if (action === "DELETE" || action === "REJECT") return "bg-admin-danger/10 text-admin-danger border-admin-danger/20";
    if (action === "CREATE" || action === "PUBLISH" || action === "APPROVE") return "bg-admin-success/10 text-admin-success border-admin-success/20";
    return "bg-admin-surface text-admin-muted border-admin-border";
};

const describe = (entry: AuditLogEntry): string => {
    const verb = ACTION_LABELS[entry.action] ?? entry.action;
    const noun = ENTITY[entry.entity_type]?.label ?? entry.entity_type.replace(/_/g, " ");
    return `${verb} ${noun}`;
};

const summarize = (details: AuditLogEntry["details"]): string | null => {
    if (!details) return null;
    const name = details.title ?? details.name;
    if (typeof name === "string" && name) return name;
    if (typeof details.new_status === "string") return `Status: ${details.new_status}`;
    return null;
};

export function RecentActivityFeed({ dateRange, limit = 20, heightClassName = "h-[400px]" }: RecentActivityFeedProps) {
    const { data: activities, isLoading, isError } = useQuery({
        queryKey: ["recent-activity", dateRange, limit],
        queryFn: async () => {
            let dateTo: string | undefined;
            if (dateRange?.to) {
                const end = new Date(dateRange.to);
                end.setHours(23, 59, 59, 999);
                dateTo = end.toISOString();
            }
            const page = await auditService.getLogsPaginated({
                pageSize: limit,
                dateFrom: dateRange?.from?.toISOString(),
                dateTo,
            });
            return page.data;
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

    if (isError) {
        return (
            <div role="alert" className="flex flex-col items-center justify-center py-8 text-center text-admin-muted">
                <AlertTriangle className="h-8 w-8 mb-2 text-admin-danger opacity-70" />
                <p>Couldn't load activity. This is a loading error, not an empty log.</p>
            </div>
        );
    }

    if (!activities?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-50" />
                <p>{dateRange ? "No recent activity in selected period." : "No activity has been logged yet."}</p>
            </div>
        );
    }

    return (
        <ScrollArea className={`${heightClassName} pr-4`}>
            <ul className="space-y-3">
                {activities.map((entry) => {
                    const Icon = ENTITY[entry.entity_type]?.icon ?? Shield;
                    const summary = summarize(entry.details);
                    return (
                        <li key={entry.id} className="flex gap-4 items-start border-b border-admin-border/50 pb-4 last:border-0 p-2 rounded-lg">
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${toneFor(entry.action)}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <span className="text-sm font-medium leading-snug text-admin-foreground">
                                    {describe(entry)}
                                </span>
                                {summary && (
                                    <p className="text-xs text-admin-muted truncate" title={summary}>
                                        {summary}
                                    </p>
                                )}
                                <p className="text-[11px] text-admin-muted tabular-nums">
                                    <time dateTime={entry.created_at}>
                                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                                    </time>
                                    {entry.profiles?.full_name && ` · by ${entry.profiles.full_name}`}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </ScrollArea>
    );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
    User,
    MessageSquare,
    Phone,
    Mail,
    Calendar,
    ArrowRightLeft,
    FileText,
    Eye,
    Download
} from "lucide-react";

interface LeadTimelineProps {
    leadId: string;
}

const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'lead_created': return <User className="h-4 w-4" />;
        case 'status_changed': return <ArrowRightLeft className="h-4 w-4" />;
        case 'note_added': return <FileText className="h-4 w-4" />;
        case 'email_sent': return <Mail className="h-4 w-4" />;
        case 'call_made': return <Phone className="h-4 w-4" />;
        case 'meeting_scheduled': return <Calendar className="h-4 w-4" />;
        case 'project_viewed': return <Eye className="h-4 w-4" />;
        case 'brochure_downloaded': return <Download className="h-4 w-4" />;
        default: return <MessageSquare className="h-4 w-4" />;
    }
};

export function LeadTimeline({ leadId }: LeadTimelineProps) {
    const { data: activities, isLoading } = useQuery({
        queryKey: ['lead-timeline', leadId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('lead_activities')
                .select(`
          *,
          profiles:performed_by (
            full_name,
            avatar_url
          )
        `)
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    if (isLoading) return <div className="text-sm text-muted-foreground p-4">Loading history...</div>;

    if (!activities || activities.length === 0) {
        return <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg text-center">No activity recorded yet.</div>;
    }

    return (
        <div className="space-y-6 pl-2">
            {activities.map((activity: any, index: number) => (
                <div key={activity.id} className="relative flex gap-4">
                    {/* Vertical Line */}
                    {index !== activities.length - 1 && (
                        <div className="absolute left-[19px] top-8 bottom-[-24px] w-px bg-border" />
                    )}

                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
                        <ActivityIcon type={activity.activity_type} />
                    </div>

                    <div className="flex-1 pb-1 pt-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm text-foreground">{activity.description}</span>
                            <time className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </time>
                        </div>

                        {activity.profiles && (
                            <p className="text-xs text-muted-foreground mt-1">
                                by {activity.profiles.full_name || "System"}
                            </p>
                        )}

                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 text-xs bg-muted/50 p-2 rounded border font-mono">
                                {JSON.stringify(activity.metadata).slice(0, 100)}
                                {JSON.stringify(activity.metadata).length > 100 && "..."}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

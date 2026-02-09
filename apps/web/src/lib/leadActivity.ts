import { supabase } from "@/integrations/supabase/client";

export type ActivityType =
    | 'lead_created'
    | 'status_changed'
    | 'note_added'
    | 'email_sent'
    | 'call_made'
    | 'meeting_scheduled'
    | 'project_viewed'
    | 'brochure_downloaded';

export async function trackActivity(
    leadId: string,
    type: ActivityType,
    description: string,
    metadata?: any
) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('lead_activities').insert({
            lead_id: leadId,
            activity_type: type,
            description,
            metadata,
            performed_by: user?.id
        });
    } catch (error) {
        console.error("Failed to track activity:", error);
    }
}

import { supabase } from '@/integrations/supabase/client';
import type { LeadRepository, LeadPayload, Lead } from './interfaces/LeadRepository';

const CLOSED_STATUSES = new Set(['won', 'lost']);

export class SupabaseLeadRepo implements LeadRepository {
    async submitLead(payload: LeadPayload): Promise<void> {
        const { error } = await supabase.from('leads').insert(payload);
        if (error) throw error;
    }

    async getLeads(): Promise<Lead[]> {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500); // Safety cap — use pagination for large datasets
        if (error) throw error;
        return data as Lead[];
    }

    /** Update a lead's status only — used by drag-and-drop pipeline moves */
    async updateLeadStatus(id: string, status: string): Promise<void> {
        const now = new Date().toISOString();
        const extra: Record<string, string> = { last_activity_at: now };
        if (CLOSED_STATUSES.has(status)) extra.closed_at = now;

        const { error } = await supabase
            .from('leads')
            .update({ status, ...extra })
            .eq('id', id);
        if (error) throw error;
    }

    /** Persist any subset of Lead fields — canonical save from detail sheet */
    async updateLead(id: string, patch: Partial<LeadPayload>): Promise<void> {
        const now = new Date().toISOString();
        const extra: Record<string, string> = { last_activity_at: now };
        const patchStatus = (patch as Record<string, unknown>).status;
        if (typeof patchStatus === 'string' && CLOSED_STATUSES.has(patchStatus)) {
            extra.closed_at = now;
        }

        const sanitized = Object.fromEntries(
            Object.entries(patch).filter(([, v]) => v !== undefined)
        );
        const { error } = await supabase
            .from('leads')
            .update({ ...sanitized, ...extra })
            .eq('id', id);
        if (error) throw error;
    }

    async deleteLead(id: string): Promise<void> {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
    }
}

export const leadRepo = new SupabaseLeadRepo();

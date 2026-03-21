import { supabase } from '@/integrations/supabase/client';
import type { LeadRepository, LeadPayload, Lead } from './interfaces/LeadRepository';

export class SupabaseLeadRepo implements LeadRepository {
    async submitLead(payload: LeadPayload): Promise<void> {
        const { error } = await supabase.from('leads').insert(payload);
        if (error) throw error;
    }
    async getLeads(): Promise<Lead[]> {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Lead[];
    }
    async updateLeadStatus(id: string, status: string): Promise<void> {
        const { error } = await supabase.from('leads').update({ status }).eq('id', id);
        if (error) throw error;
    }
    async deleteLead(id: string): Promise<void> {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
    }
}
export const leadRepo = new SupabaseLeadRepo();

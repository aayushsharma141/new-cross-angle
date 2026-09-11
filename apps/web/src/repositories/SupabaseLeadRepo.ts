import { supabase } from '@/integrations/supabase/client';
import type { LeadRepository, LeadPayload, Lead } from './interfaces/LeadRepository';
import type { PaginationParams, FilterParams, SortParams } from '@/services/types';

const CLOSED_STATUSES = new Set(['won', 'lost']);

export class SupabaseLeadRepo implements LeadRepository {
    async submitLead(payload: LeadPayload): Promise<void> {
        const { error } = await supabase.from('leads').insert(payload as any);
        if (error) throw error;
    }

    async getLeads(filters?: FilterParams): Promise<Lead[]> {
        let query: any = supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    query = query.eq(key, value);
                }
            });
        }

        const { data, error } = await query.limit(500); // Safety cap — use pagination for large datasets
        if (error) throw error;
        return data as Lead[];
    }

    async getLeadsPaginated(
        params: PaginationParams & FilterParams & SortParams = {}
    ): Promise<{ data: Lead[]; total: number }> {
        const {
            page = 1,
            pageSize = 25,
            search,
            status,
            category,
            dateFrom,
            dateTo,
            column = 'created_at',
            direction = 'desc'
        } = params;

        let query: any = supabase
            .from('leads')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }
        if (status) {
            query = query.eq('status', status as any);
        }
        if (category) {
            query = query.eq('category', category);
        }
        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query
            .order(column, { ascending: direction === 'asc' })
            .range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: (data || []) as Lead[],
            total: count || 0,
        };
    }

    async getLeadById(id: string): Promise<Lead | null> {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data as Lead;
    }

    async createLead(payload: LeadPayload): Promise<Lead> {
        const { data, error } = await supabase
            .from('leads')
            .insert(payload as any)
            .select()
            .single();

        if (error) throw error;
        return data as Lead;
    }

    async updateLeadAndReturn(id: string, updates: Partial<Lead>): Promise<Lead> {
        const now = new Date().toISOString();
        const extra: Record<string, string> = { last_activity_at: now };
        const updatesStatus = updates.status;
        if (typeof updatesStatus === 'string' && CLOSED_STATUSES.has(updatesStatus)) {
            extra.closed_at = now;
        }

        // Exclude fields that are read-only or shouldn't be patched directly
        const updatable = Object.fromEntries(
            Object.entries(updates).filter(([key]) => key !== 'id' && key !== 'created_at')
        );

        const sanitized = Object.fromEntries(
            Object.entries(updatable).filter(([, v]) => v !== undefined)
        );

        const { data, error } = await supabase
            .from('leads')
            .update({ ...sanitized, ...extra, updated_at: now })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Lead;
    }

    /** Update a lead's status only — used by drag-and-drop pipeline moves */
    async updateLeadStatus(id: string, status: string): Promise<void> {
        const now = new Date().toISOString();
        const extra: Record<string, string> = { last_activity_at: now };
        if (CLOSED_STATUSES.has(status)) extra.closed_at = now;

        const { error } = await supabase
            .from('leads')
            .update({ status: status as any, ...extra })
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
            .update({ ...sanitized, ...extra } as any)
            .eq('id', id);
        if (error) throw error;
    }

    async deleteLead(id: string): Promise<void> {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
    }

    async bulkUpdateStatus(ids: string[], status: string): Promise<number> {
        const now = new Date().toISOString();
        const extra: Record<string, string> = { last_activity_at: now };
        if (CLOSED_STATUSES.has(status)) {
            extra.closed_at = now;
        }

        const { error, count } = await supabase
            .from('leads')
            .update({ status: status as any, ...extra, updated_at: now })
            .in('id', ids);

        if (error) throw error;
        return count || ids.length;
    }

    async bulkDelete(ids: string[]): Promise<number> {
        const { error, count } = await supabase
            .from('leads')
            .delete()
            .in('id', ids);

        if (error) throw error;
        return count || ids.length;
    }

    async getLeadStats(): Promise<{
        total: number;
        hot: number;
        warm: number;
        cold: number;
        byStatus: Record<string, number>;
        bySource: Record<string, number>;
        avgResponseTime: number;
    }> {
        const { data, error } = await supabase.rpc('get_lead_stats');
        if (error) throw error;
        return data as {
            total: number;
            hot: number;
            warm: number;
            cold: number;
            byStatus: Record<string, number>;
            bySource: Record<string, number>;
            avgResponseTime: number;
        };
    }

    async notifyTelegram(lead: Lead): Promise<void> {
        // Public callers may only reference a lead by id; the edge function
        // re-reads the row server-side and ignores any other payload fields.
        const { error } = await supabase.functions.invoke('notify-telegram', { body: { record: { id: lead.id } } });
        if (error) throw error;
    }
}

export const leadRepo = new SupabaseLeadRepo();

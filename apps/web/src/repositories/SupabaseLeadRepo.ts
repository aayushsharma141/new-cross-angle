import { supabase } from '@/integrations/supabase/client';
import type { LeadRepository, LeadPayload, Lead } from './interfaces/LeadRepository';
import type { PaginationParams, FilterParams, SortParams } from '@/services/types';
import type { Database } from '@/integrations/supabase/types';
import { toCrmStageId } from '@/lib/crm/stages';

type LeadsRow = Database['public']['Tables']['leads']['Row'];

const CLOSED_STATUSES = new Set(['won', 'lost']);

export class SupabaseLeadRepo implements LeadRepository {
    async submitLead(payload: LeadPayload): Promise<void> {
        const { error } = await supabase.from('leads').insert(payload as unknown as Parameters<ReturnType<typeof supabase.from>['insert']>[0]);
        if (error) throw error;
    }

    async getLeads(filters?: FilterParams): Promise<Lead[]> {
        return (await this.fetchAllRows(filters)) as unknown as Lead[];
    }

    /** Full rows (area, estimates, ALCS fields) for the estimator Quote Requests page. */
    async getEstimatorLeads(): Promise<LeadsRow[]> {
        return this.fetchAllRows({ lead_source: 'estimator' });
    }

    private async fetchAllRows(filters?: FilterParams): Promise<LeadsRow[]> {
        // PostgREST caps a single response at 1000 rows, so page until exhausted
        // rather than silently truncating boards and analytics.
        const PAGE = 1000;
        const all: LeadsRow[] = [];

        for (let from = 0; ; from += PAGE) {
            let query = supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .order('id', { ascending: false })
                .range(from, from + PAGE - 1);

            if (filters) {
                for (const [key, value] of Object.entries(filters)) {
                    if (value !== undefined) {
                        query = query.eq(key as keyof LeadsRow, value);
                    }
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            // One stage vocabulary for every CRM screen; legacy values are rewritten on next save.
            all.push(...data.map((l) => ({ ...l, status: toCrmStageId(l.status) })));
            if (data.length < PAGE) return all;
        }
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

        let query = supabase
            .from('leads')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }
        if (status) {
            query = query.eq('status', status as LeadsRow['status']);
        }
        if (category) {
            // @ts-expect-error category is not strictly in the generated DB type but is part of the application payload
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
            .order(column as keyof LeadsRow, { ascending: direction === 'asc' })
            .range(from, to) as typeof query;

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
            .insert(payload as unknown as Parameters<ReturnType<typeof supabase.from>['insert']>[0])
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
            .update({ status: status as LeadsRow['status'], ...extra })
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
            // @ts-expect-error Patch payload contains fields not strictly present in LeadsRow
            .update({ ...sanitized, ...extra })
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
            .update({ status: status as LeadsRow['status'], ...extra, updated_at: now })
            .in('id', ids);

        if (error) throw error;
        return count || ids.length;
    }

    async bulkDelete(ids: string[]): Promise<number> {
        // RLS can filter rows out of a delete without an error, so report what
        // was actually removed rather than assuming every id went.
        const { error, count } = await supabase
            .from('leads')
            .delete({ count: 'exact' })
            .in('id', ids);

        if (error) throw error;
        return count ?? 0;
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
}

export const leadRepo = new SupabaseLeadRepo();

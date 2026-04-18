import { supabase } from '@/integrations/supabase/client';
import type { Lead, LeadPayload } from '@/repositories/interfaces/LeadRepository';
import type { FilterParams, PaginatedResponse, PaginationParams, SortParams, UndoItem } from './types';
import { calculateLeadScore as libCalculateScore, getLeadTemperature } from '@/lib/leadScoring';

const UNDO_TIMEOUT = 5000;
const MAX_UNDO_ITEMS = 10;

export class LeadService {
  private undoStack: UndoItem<Lead>[] = [];

  async getLeadsPaginated(
    params: PaginationParams & FilterParams & SortParams = {}
  ): Promise<PaginatedResponse<Lead>> {
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
      query = query.eq('status', status);
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
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasMore: to < (count || 0) - 1,
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
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    // Fire-and-forget: notify Telegram of the new lead.
    // We do NOT await this so it never blocks or delays the form UX.
    supabase.functions
      .invoke('notify-telegram', { body: { record: data } })
      .catch((err: unknown) => console.warn('[LeadService] Telegram notify failed:', err));

    return data as Lead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Lead;
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    return this.updateLead(id, { status });
  }

  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async softDeleteLead(id: string): Promise<Lead> {
    return this.updateLead(id, { 
      status: 'archived',
      deleted_at: new Date().toISOString() 
    } as Partial<Lead>);
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<number> {
    const { error, count } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
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

  /**
   * Calculates the lead score using the canonical scoring model from lib/leadScoring.
   * Weights: budget(30) + category(20) + timeline(20) + contact(10) + source(15) + recency(5) = 100
   * Buckets : hot ≥ 70 | warm ≥ 40 | cold < 40
   *
   * @deprecated For display/admin use, import calculateLeadScore from '@/lib/leadScoring' directly.
   * This method exists for backward compatibility with getLeadStats().
   */
  calculateLeadScore(lead: Partial<Lead>): number {
    return libCalculateScore(lead);
  }

  /**
   * Returns the temperature label for a given score.
   * Buckets are canonical: hot ≥ 70 | warm ≥ 40 | cold < 40.
   */
  getTemperature(score: number): 'hot' | 'warm' | 'cold' {
    return getLeadTemperature(score).priority;
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

  pushToUndoStack(lead: Lead): void {
    const timeout = setTimeout(() => {
      this.removeFromUndoStack(lead.id);
    }, UNDO_TIMEOUT);

    this.undoStack.unshift({
      id: lead.id,
      data: lead,
      deletedAt: Date.now(),
      timeout,
    });

    if (this.undoStack.length > MAX_UNDO_ITEMS) {
      const removed = this.undoStack.pop();
      if (removed) {
        clearTimeout(removed.timeout);
      }
    }
  }

  getUndoItem(id: string): UndoItem<Lead> | undefined {
    return this.undoStack.find(item => item.id === id);
  }

  removeFromUndoStack(id: string): void {
    const index = this.undoStack.findIndex(item => item.id === id);
    if (index !== -1) {
      clearTimeout(this.undoStack[index].timeout);
      this.undoStack.splice(index, 1);
    }
  }

  getUndoStack(): UndoItem<Lead>[] {
    return this.undoStack;
  }

  /** Clear all undo timeouts — call on component unmount to prevent memory leaks. */
  clearUndoStack(): void {
    this.undoStack.forEach(item => clearTimeout(item.timeout));
    this.undoStack = [];
  }
}

export const leadService = new LeadService();

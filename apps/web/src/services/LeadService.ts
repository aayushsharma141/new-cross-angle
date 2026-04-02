import { supabase } from '@/integrations/supabase/client';
import type { Lead, LeadPayload } from '@/repositories/interfaces/LeadRepository';
import type { FilterParams, PaginatedResponse, PaginationParams, SortParams, UndoItem } from './types';

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

  calculateLeadScore(lead: Partial<Lead>): number {
    let score = 0;

    const engagementScore = this.calculateEngagementScore(lead);
    const budgetScore = this.calculateBudgetScore(lead);
    const timelineScore = this.calculateTimelineScore(lead);
    const sourceScore = this.calculateSourceScore(lead);

    score = (engagementScore * 0.4) + (budgetScore * 0.3) + (timelineScore * 0.2) + (sourceScore * 0.1);

    return Math.round(score);
  }

  private calculateEngagementScore(lead: Partial<Lead>): number {
    let score = 0;
    if (lead.message && lead.message.length > 50) score += 30;
    if (lead.phone) score += 20;
    if (lead.category) score += 25;
    if (lead.city) score += 25;
    return Math.min(100, score);
  }

  private calculateBudgetScore(lead: Partial<Lead>): number {
    if (!lead.budget) return 0;
    
    const budgetMap: Record<string, number> = {
      'under_5l': 20,
      '5l_10l': 40,
      '10l_20l': 60,
      '20l_50l': 80,
      'above_50l': 100,
    };
    
    return budgetMap[lead.budget] || 0;
  }

  private calculateTimelineScore(lead: Partial<Lead>): number {
    if (!lead.created_at) return 50;
    
    const createdDate = new Date(lead.created_at);
    const now = new Date();
    const daysSinceContact = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceContact <= 7) return 100;
    if (daysSinceContact <= 14) return 80;
    if (daysSinceContact <= 30) return 60;
    if (daysSinceContact <= 60) return 40;
    return Math.max(0, 30 - (daysSinceContact - 60));
  }

  private calculateSourceScore(lead: Partial<Lead>): number {
    const sourceMap: Record<string, number> = {
      'linkedin': 80,
      'referral': 70,
      'search': 50,
      'direct': 40,
      'social': 30,
      'other': 20,
    };
    
    return sourceMap[lead.lead_source?.toLowerCase() || 'other'] || 20;
  }

  getTemperature(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
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
    const { data, error } = await supabase.from('leads').select('*');
    if (error) throw error;

    const leads = data as Lead[];
    const stats = {
      total: leads.length,
      hot: 0,
      warm: 0,
      cold: 0,
      byStatus: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      avgResponseTime: 0,
    };

    leads.forEach(lead => {
      const score = lead.score || this.calculateLeadScore(lead);
      const temp = this.getTemperature(score);
      stats[score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold']++;
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
      stats.bySource[lead.lead_source || 'unknown'] = (stats.bySource[lead.lead_source || 'unknown'] || 0) + 1;
    });

    return stats;
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
}

export const leadService = new LeadService();

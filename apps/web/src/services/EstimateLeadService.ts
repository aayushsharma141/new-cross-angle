import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Estimate leads are now a filtered view of the unified `leads` table
type Lead = Database['public']['Tables']['leads']['Row'];
type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type EstimateLeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export class EstimateLeadService {
  private baseQuery() {
    return supabase.from('leads').select('*').eq('lead_source', 'estimator');
  }

  async getEstimateLeads(): Promise<Lead[]> {
    const { data, error } = await this.baseQuery()
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Lead[];
  }

  async getEstimateLeadById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .eq('lead_source', 'estimator')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Lead;
  }

  async updateEstimateLead(id: string, updates: LeadUpdate): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Lead;
  }

  async updateStatus(id: string, status: EstimateLeadStatus): Promise<Lead> {
    return this.updateEstimateLead(id, { status: status as any });
  }

  async deleteEstimateLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const { error, count } = await supabase
      .from('leads')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return count || ids.length;
  }

  async bulkUpdateStatus(ids: string[], status: EstimateLeadStatus): Promise<number> {
    const { error, count } = await supabase
      .from('leads')
      .update({ status: status as any })
      .in('id', ids);

    if (error) throw error;
    return count || ids.length;
  }
}

export const estimateLeadService = new EstimateLeadService();

import { leadRepo } from '@/repositories/SupabaseLeadRepo';
import type { LeadRepository, Lead } from '@/repositories/interfaces/LeadRepository';
import type { Database } from '@/integrations/supabase/types';

type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type EstimateLeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export class EstimateLeadService {
  constructor(private repo: LeadRepository = leadRepo) {}

  async getEstimateLeads(): Promise<Lead[]> {
    return this.repo.getLeads({ lead_source: 'estimator' });
  }

  async getEstimateLeadById(id: string): Promise<Lead | null> {
    const lead = await this.repo.getLeadById(id);
    if (lead && lead.lead_source === 'estimator') {
      return lead;
    }
    return null;
  }

  async updateEstimateLead(id: string, updates: LeadUpdate): Promise<Lead> {
    return this.repo.updateLeadAndReturn(id, updates as Partial<Lead>);
  }

  async updateStatus(id: string, status: EstimateLeadStatus): Promise<Lead> {
    return this.updateEstimateLead(id, { status: status as Database['public']['Enums']['lead_status_enum'] });
  }

  async deleteEstimateLead(id: string): Promise<void> {
    return this.repo.deleteLead(id);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.repo.bulkDelete(ids);
  }

  async bulkUpdateStatus(ids: string[], status: EstimateLeadStatus): Promise<number> {
    return this.repo.bulkUpdateStatus(ids, status);
  }
}

export const estimateLeadService = new EstimateLeadService();

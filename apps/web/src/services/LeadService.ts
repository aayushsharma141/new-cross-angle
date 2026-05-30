import type { Lead, LeadPayload, LeadRepository } from '@/repositories/interfaces/LeadRepository';
import { leadRepo } from '@/repositories/SupabaseLeadRepo';
import type { FilterParams, PaginatedResponse, PaginationParams, SortParams, UndoItem } from './types';
import { calculateLeadScore as libCalculateScore, getLeadTemperature } from '@/lib/scoring/leadScoring';

const UNDO_TIMEOUT = 5000;
const MAX_UNDO_ITEMS = 10;

export class LeadService {
  private undoStack: UndoItem<Lead>[] = [];

  constructor(private repo: LeadRepository = leadRepo) {}

  async getLeadsPaginated(
    params: PaginationParams & FilterParams & SortParams = {}
  ): Promise<PaginatedResponse<Lead>> {
    const {
      page = 1,
      pageSize = 25,
    } = params;

    const { data, total } = await this.repo.getLeadsPaginated(params);

    const from = (page - 1) * pageSize;

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: from + pageSize < total,
    };
  }

  async getLeadById(id: string): Promise<Lead | null> {
    return this.repo.getLeadById(id);
  }

  async createLead(payload: LeadPayload): Promise<Lead> {
    const data = await this.repo.createLead(payload);

    // Fire-and-forget: notify Telegram of the new lead.
    // We do NOT await this so it never blocks or delays the form UX.
    this.repo.notifyTelegram(data)
      .catch((err: unknown) => console.warn('[LeadService] Telegram notify failed:', err));

    return data;
  }

  async submitLead(payload: LeadPayload): Promise<void> {
    await this.repo.submitLead(payload);
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    return this.repo.updateLeadAndReturn(id, updates);
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    return this.updateLead(id, { status });
  }

  async deleteLead(id: string): Promise<void> {
    await this.repo.deleteLead(id);
  }

  async softDeleteLead(id: string): Promise<Lead> {
    return this.updateLead(id, { 
      status: 'archived',
      deleted_at: new Date().toISOString() 
    } as Partial<Lead>);
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<number> {
    return this.repo.bulkUpdateStatus(ids, status);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.repo.bulkDelete(ids);
  }

  /**
   * Calculates the lead score using the canonical scoring model from lib/leadScoring.
   * Weights: budget(30) + category(20) + timeline(20) + contact(10) + source(15) + recency(5) = 100
   * Buckets : hot ≥ 70 | warm ≥ 40 | cold < 40
   *
   * @deprecated For display/admin use, import calculateLeadScore from '@/lib/scoring/leadScoring' directly.
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
    return this.repo.getLeadStats();
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

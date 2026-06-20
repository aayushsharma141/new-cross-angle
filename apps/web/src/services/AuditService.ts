import { supabase } from '@/integrations/supabase/client';
import type { AuditLogEntry, AuditLogFilter, AuditLogStats, AuditAction, AuditEntityType } from '@/types/audit';
import type { PaginatedResponse } from '@/services/types';

export class AuditService {
  /**
   * Write-side helper. Resolves the current auth user automatically so callers
   * only need to supply what changed. Failures are logged to console but never
   * thrown — an audit write must never interrupt the primary operation.
   *
   * @example
   *   await auditService.writeAudit('CREATE', 'blog', newPost.id, { title: newPost.title });
   */
  async writeAudit(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string | null,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('audit_logs').insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        user_id: user?.id ?? null,
        details: details ?? null,
        ip_address: 'client',
      } as any);
      if (error) {
        console.error('[AuditService] writeAudit failed:', error.message, { action, entityType, entityId });
      }
    } catch (err) {
      console.error('[AuditService] writeAudit threw:', err);
    }
  }

  async getLogsPaginated(
    params: {
      page?: number;
      pageSize?: number;
    } & AuditLogFilter = {}
  ): Promise<PaginatedResponse<AuditLogEntry>> {
    const {
      page = 1,
      pageSize = 25,
      search,
      action,
      entityType,
      userId,
      dateFrom,
      dateTo,
    } = params;

    let query = supabase
      .from('audit_logs')
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          email
        )
      `,
        { count: 'exact' }
      );

    if (search) {
      query = query.or(
        `action.ilike.%${search}%,entity_type.ilike.%${search}%,ip_address.ilike.%${search}%`
      );
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (userId) {
      query = query.eq('user_id', userId);
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
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data as AuditLogEntry[]) || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasMore: to < (count || 0) - 1,
    };
  }

  async getLogById(id: string): Promise<AuditLogEntry | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          email,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as unknown as AuditLogEntry;
  }

  async getLogsByEntity(
    entityType: string,
    entityId: string,
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          email
        )
      `
      )
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AuditLogEntry[];
  }

  async getLogsByUser(
    userId: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          email
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AuditLogEntry[];
  }

  async getRecentActivity(
    hours: number = 24,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    const { data, error } = await supabase
      .from('audit_logs')
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          email
        )
      `
      )
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AuditLogEntry[];
  }

  async getStats(hours: number = 24): Promise<AuditLogStats> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('action, entity_type, created_at')
      .gte('created_at', cutoff.toISOString());

    if (error) throw error;

    const logs = data || [];

    const byAction: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    const hourMap: Record<number, number> = {};

    logs.forEach((log: { action: string; entity_type: string; created_at: string }) => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntity[log.entity_type] = (byEntity[log.entity_type] || 0) + 1;

      const hour = new Date(log.created_at).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    const recentActivity = Object.entries(hourMap)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);

    return {
      totalLogs: logs.length,
      byAction: byAction as AuditLogStats['byAction'],
      byEntity: byEntity as AuditLogStats['byEntity'],
      recentActivity,
    };
  }

  async getUniqueUsers(): Promise<{ id: string; name: string; email: string }[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(
        `
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      `
      )
      .not('user_id', 'is', null)
      .limit(500);

    if (error) throw error;

    const userMap = new Map<string, { id: string; name: string; email: string }>();

    data?.forEach((log: any) => {
      if (log.user_id && !userMap.has(log.user_id)) {
        userMap.set(log.user_id, {
          id: log.user_id,
          name: log.profiles?.full_name || 'Unknown',
          email: log.profiles?.email || '',
        });
      }
    });

    return Array.from(userMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async exportLogs(
    filters: AuditLogFilter,
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    const result = await this.getLogsPaginated({
      ...filters,
      pageSize: 10000,
    });

    if (format === 'json') {
      return JSON.stringify(result.data, null, 2);
    }

    const headers = ['Time', 'User', 'Email', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = result.data.map((log: AuditLogEntry) => [
      log.created_at,
      log.profiles?.full_name || 'System',
      log.profiles?.email || '',
      log.action,
      log.entity_type,
      log.entity_id || '',
      log.ip_address || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: (string | null | undefined)[]) =>
        row.map((cell: string | null | undefined) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csvContent;
  }
}

export const auditService = new AuditService();

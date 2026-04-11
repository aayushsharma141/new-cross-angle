import type { Database } from '@/integrations/supabase/types';

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'ROLE_CHANGE'
  | 'STATUS_CHANGE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'APPROVE'
  | 'REJECT'
  | 'ARCHIVE'
  | 'RESTORE';

export type AuditEntityType = 
  | 'user'
  | 'lead'
  | 'project'
  | 'blog'
  | 'service'
  | 'testimonial'
  | 'team_member'
  | 'media'
  | 'settings'
  | 'estimate';

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface AuditLogFilter {
  search?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogStats {
  totalLogs: number;
  byAction: Record<AuditAction, number>;
  byEntity: Record<AuditEntityType, number>;
  recentActivity: {
    hour: number;
    count: number;
  }[];
}

export const ACTION_COLORS: Record<AuditAction, { bg: string; text: string; border: string }> = {
  CREATE: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  UPDATE: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  DELETE: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  VIEW: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
  EXPORT: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  LOGIN: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
  LOGOUT: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
  ROLE_CHANGE: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  STATUS_CHANGE: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
  PUBLISH: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  UNPUBLISH: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  APPROVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  REJECT: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  ARCHIVE: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' },
  RESTORE: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' },
};

export const ENTITY_LABELS: Record<AuditEntityType, string> = {
  user: 'User',
  lead: 'Lead',
  project: 'Project',
  blog: 'Blog Post',
  service: 'Service',
  testimonial: 'Testimonial',
  team_member: 'Team Member',
  media: 'Media',
  settings: 'Settings',
  estimate: 'Estimate',
};

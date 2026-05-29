import type { AppRole } from './rbac';

// ─── Types ──────────────────────────────────────────────────────────────────

type PermissionMap = Record<string, Record<string, readonly AppRole[]>>;

// ─── Permission Matrix ───────────────────────────────────────────────────────
//
// viewer      → all read operations + safe actions (filter, export)
// admin       → read + write most resources; cannot manage roles or settings
// super_admin → full platform access
//
export const PERMISSIONS = {
  dashboard: {
    view:   ['super_admin', 'admin', 'viewer'],
    export: ['super_admin', 'admin', 'viewer'], // safe read op
    automate: ['super_admin', 'admin'],
  },

  leads: {
    view:   ['super_admin', 'admin', 'viewer'],
    create: ['super_admin', 'admin'],
    edit:   ['super_admin', 'admin'],
    delete: ['super_admin'],
    export: ['super_admin', 'admin', 'viewer'],
  },

  estimate_leads: {
    view:   ['super_admin', 'admin', 'viewer'],
    edit:   ['super_admin', 'admin'],
    delete: ['super_admin'],
    export: ['super_admin', 'admin', 'viewer'],
  },

  estimate_rates: {
    view:   ['super_admin', 'admin', 'viewer'],
    edit:   ['super_admin', 'admin'],
    delete: ['super_admin', 'admin'],
  },

  users: {
    view:         ['super_admin', 'admin'],
    edit:         ['super_admin'],
    delete:       ['super_admin'],
    manage_roles: ['super_admin'],
  },

  analytics: {
    view:   ['super_admin', 'admin', 'viewer'],
    export: ['super_admin', 'admin', 'viewer'],
  },

  content: {
    view:   ['super_admin', 'admin', 'viewer'],
    create: ['super_admin', 'admin'],
    edit:   ['super_admin', 'admin'],
    delete: ['super_admin', 'admin'],
  },

  media: {
    view:   ['super_admin', 'admin', 'viewer'],
    upload: ['super_admin', 'admin'],
    delete: ['super_admin', 'admin'],
  },

  gallery: {
    view:   ['super_admin', 'admin', 'viewer'],
    upload: ['super_admin', 'admin'],
    edit:   ['super_admin', 'admin'],
    delete: ['super_admin', 'admin'],
  },

  settings: {
    view: ['super_admin'],
    edit: ['super_admin'],
  },

  audit_logs: {
    view: ['super_admin'],
  },

  crm: {
    view:   ['super_admin', 'admin', 'viewer'],
    edit:   ['super_admin', 'admin'],
    delete: ['super_admin'],
    export: ['super_admin', 'admin', 'viewer'],
  },
} as const satisfies PermissionMap;

export type Resource = keyof typeof PERMISSIONS;

// ─── Permission Check ────────────────────────────────────────────────────────

/**
 * Check if a role has permission to perform an action on a resource.
 *
 * @example
 * can('admin', 'leads', 'edit')   // → true
 * can('viewer', 'users', 'delete') // → false
 * can(null, 'dashboard', 'view')   // → false
 */
export function can(
  role: AppRole | null | undefined,
  resource: Resource,
  action: string,
): boolean {
  if (!role) return false;
  const resourcePerms = PERMISSIONS[resource] as Record<string, readonly string[]> | undefined;
  if (!resourcePerms) return false;
  const allowed = resourcePerms[action];
  if (!allowed) return false;
  return (allowed as readonly string[]).includes(role);
}

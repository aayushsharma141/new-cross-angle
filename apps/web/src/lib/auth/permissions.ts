import type { AppRole } from './rbac';

// ─── Permission Strings ───────────────────────────────────────────────────────
//
// Dot-notation: "<resource>.<action>"
//
// Roles and their permitted actions:
//
// admin (and super_admin) — full control:
//   users.manage, cms.manage, crm.manage, settings.manage, audit.view
//
// editor — CMS only:
//   cms.view, cms.create, cms.update, cms.publish, media.manage
//
// viewer — CRM lead management only:
//   crm.view, leads.view, leads.create, leads.note, leads.update_status
//   leads.assign (if configured)

// ─── Explicit Permission Map ──────────────────────────────────────────────────

type PermissionMap = Record<string, Record<string, readonly AppRole[]>>;

/** Resource × action → roles that may perform it. */
export const PERMISSIONS = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    view:     ['super_admin', 'admin', 'editor', 'viewer'],
    export:   ['super_admin', 'admin', 'viewer'],
    automate: ['super_admin', 'admin'],
  },

  // ── CRM / Leads ───────────────────────────────────────────────────────────
  crm: {
    view:   ['super_admin', 'admin', 'viewer'],
    edit:   ['super_admin', 'admin'],
    delete: ['super_admin'],
    export: ['super_admin', 'admin', 'viewer'],
  },

  leads: {
    view:          ['super_admin', 'admin', 'viewer'],
    create:        ['super_admin', 'admin'],
    edit:          ['super_admin', 'admin'],
    delete:        ['super_admin'],
    export:        ['super_admin', 'admin', 'viewer'],
    note:          ['super_admin', 'admin', 'viewer'],  // add notes
    update_status: ['super_admin', 'admin', 'viewer'],  // change lead status
    assign:        ['super_admin', 'admin', 'viewer'],  // assign follow-ups
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

  // ── CMS ───────────────────────────────────────────────────────────────────
  cms: {
    view:    ['super_admin', 'admin', 'editor', 'viewer'],
    create:  ['super_admin', 'admin', 'editor'],
    update:  ['super_admin', 'admin', 'editor'],
    delete:  ['super_admin', 'admin'],
    publish: ['super_admin', 'admin', 'editor'],
    manage:  ['super_admin', 'admin'],
  },

  content: {
    view:   ['super_admin', 'admin', 'editor', 'viewer'],
    create: ['super_admin', 'admin', 'editor'],
    edit:   ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin'],
  },

  media: {
    view:   ['super_admin', 'admin', 'editor', 'viewer'],
    upload: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin'],
    manage: ['super_admin', 'admin', 'editor'],
  },

  gallery: {
    view:   ['super_admin', 'admin', 'editor', 'viewer'],
    upload: ['super_admin', 'admin', 'editor'],
    edit:   ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin'],
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  analytics: {
    view:   ['super_admin', 'admin', 'viewer'],
    export: ['super_admin', 'admin', 'viewer'],
  },

  // ── Users & Access Control ────────────────────────────────────────────────
  users: {
    view:         ['super_admin', 'admin'],
    edit:         ['super_admin'],
    delete:       ['super_admin'],
    manage_roles: ['super_admin'],
    manage:       ['super_admin'],
  },

  // ── Settings & System ─────────────────────────────────────────────────────
  settings: {
    view:   ['super_admin'],
    edit:   ['super_admin'],
    manage: ['super_admin'],
  },

  audit: {
    view: ['super_admin'],
  },

  audit_logs: {
    view: ['super_admin'],
  },
} as const satisfies PermissionMap;

export type Resource = keyof typeof PERMISSIONS;

// ─── Dot-Notation String Permissions ─────────────────────────────────────────
//
// Convenience type: "resource.action" — mirrors the permissions object above.
// e.g. "cms.publish", "leads.update_status", "users.manage_roles"

type DotPermissions = {
  [R in Resource]: `${R}.${string & keyof (typeof PERMISSIONS)[R]}`;
}[Resource];

/** All valid dot-notation permission strings derived from the PERMISSIONS map. */
export type Permission = DotPermissions;

// ─── Permission Checkers ──────────────────────────────────────────────────────

/**
 * Check if a role has permission to perform an action on a resource.
 *
 * Accepts either:
 *   - resource × action separately:  can('admin', 'leads', 'edit')
 *   - dot-notation string:           can('admin', 'leads.edit')
 *
 * @example
 * can('admin', 'leads', 'edit')       // → true
 * can('viewer', 'users', 'delete')    // → false
 * can('editor', 'cms.publish')        // → true
 * can(null, 'dashboard', 'view')      // → false
 */
export function can(
  role: AppRole | null | undefined,
  resourceOrDot: Resource | string,
  action?: string,
): boolean {
  if (!role) return false;

  let resource: string;
  let act: string;

  if (action !== undefined) {
    resource = resourceOrDot;
    act = action;
  } else {
    // dot-notation: "resource.action"
    const dot = resourceOrDot.indexOf('.');
    if (dot === -1) return false;
    resource = resourceOrDot.slice(0, dot);
    act = resourceOrDot.slice(dot + 1);
  }

  const resourcePerms = PERMISSIONS[resource as Resource] as
    | Record<string, readonly string[]>
    | undefined;
  if (!resourcePerms) return false;

  const allowed = resourcePerms[act];
  if (!allowed) return false;

  return (allowed as readonly string[]).includes(role);
}

/**
 * Returns true if the role has ALL of the given permissions.
 *
 * @example
 * canAll('admin', ['cms.create', 'cms.publish'])  // → true
 * canAll('editor', ['cms.create', 'users.manage']) // → false
 */
export function canAll(
  role: AppRole | null | undefined,
  permissions: readonly string[],
): boolean {
  return permissions.every((p) => can(role, p));
}

/**
 * Returns true if the role has ANY of the given permissions.
 *
 * @example
 * canAny('viewer', ['leads.view', 'cms.view'])  // → true
 */
export function canAny(
  role: AppRole | null | undefined,
  permissions: readonly string[],
): boolean {
  return permissions.some((p) => can(role, p));
}

// Edge Function RBAC lib — keep in sync with apps/web/src/lib/auth/rbac.ts

export const APP_ROLES = ["super_admin", "admin", "editor", "viewer"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const MANAGEABLE_ROLES: Record<AppRole, readonly AppRole[]> = {
  super_admin: ["super_admin", "admin", "editor", "viewer"],
  admin: ["editor", "viewer"],
  editor: [],
  viewer: [],
};

export const ASSIGNABLE_ROLES: Record<AppRole, readonly AppRole[]> = {
  super_admin: ["super_admin", "admin", "editor", "viewer"],
  admin: ["editor", "viewer"],
  editor: [],
  viewer: [],
};

/** The default route for each role after login. */
export const ROLE_DEFAULT_ROUTE: Record<AppRole, string> = {
  super_admin: "/admin",
  admin: "/admin",
  editor: "/admin/cms",
  viewer: "/admin/crm/leads",
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

export function normalizeRole(role: string | null | undefined): AppRole {
  return isAppRole(role) ? role : "viewer";
}

export function canManageRole(
  actorRole: string | null | undefined,
  targetRole: string | null | undefined,
): boolean {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(targetRole);
  return MANAGEABLE_ROLES[actor].includes(target);
}

export function canAssignRole(
  actorRole: string | null | undefined,
  nextRole: string | null | undefined,
): boolean {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(nextRole);
  return ASSIGNABLE_ROLES[actor].includes(target);
}

/** True if role can write CMS content (super_admin + admin + editor). */
export function hasCmsAccess(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === "super_admin" || r === "admin" || r === "editor";
}

/** True if role can read CRM/leads (super_admin + admin + viewer). */
export function hasCrmAccess(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === "super_admin" || r === "admin" || r === "viewer";
}

export function hasWriteAccess(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === "super_admin" || r === "admin";
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return normalizeRole(role) === "super_admin";
}

export function isAdminOrAbove(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === "super_admin" || r === "admin";
}

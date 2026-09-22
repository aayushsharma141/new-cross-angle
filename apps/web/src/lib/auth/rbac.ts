// ─── Role Definitions ─────────────────────────────────────────────────────────
//
// Role hierarchy (highest → lowest):
//   super_admin > admin > editor > viewer
//
// super_admin  — Full platform control: users, CMS, CRM, settings, audit logs
// admin        — Full control (same as super_admin, distinct for granularity)
// editor       — CMS access only: pages, posts, media, categories, publishing
// viewer       — CRM lead-management only: view leads, add notes, update status

export const APP_ROLES = ["super_admin", "admin", "editor", "viewer"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  super_admin: "Full platform access — users, CMS, CRM, settings, audit logs.",
  admin: "Full control over the admin workspace, users, and all content.",
  editor: "CMS access only — create, edit, and publish content and media.",
  viewer: "CRM lead-management only — view and update leads and notes.",
};

/** The dashboard each role is sent to after login. */
export const ROLE_DEFAULT_ROUTE: Record<AppRole, string> = {
  super_admin: "/admin",
  admin: "/admin",
  editor: "/admin/cms",
  viewer: "/admin/crm/leads",
};

/** Which roles a given actor may manage (assign/remove). */
export const MANAGEABLE_ROLES: Record<AppRole, readonly AppRole[]> = {
  super_admin: ["super_admin", "admin", "editor", "viewer"],
  admin: ["editor", "viewer"],
  editor: [],
  viewer: [],
};

/** Which roles a given actor may assign to a user. */
export const ASSIGNABLE_ROLES: Record<AppRole, readonly AppRole[]> = {
  super_admin: ["super_admin", "admin", "editor", "viewer"],
  admin: ["editor", "viewer"],
  editor: [],
  viewer: [],
};

// ─── Type Guards ───────────────────────────────────────────────────────────────

export function isAppRole(value: string | null | undefined): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

/** Maps a stored DB role string → AppRole. Falls back to null. */
export function mapStoredUserRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  if (isAppRole(role)) return role;
  return null;
}

/** Maps a legacy profile role string → AppRole. */
export function mapProfileRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  if (isAppRole(role)) return role;
  if (role === "user") return "viewer";
  return mapStoredUserRole(role);
}

export function normalizeRole(role: string | null | undefined): AppRole {
  return mapStoredUserRole(role) ?? "viewer";
}

// ─── Role Predicates ──────────────────────────────────────────────────────────

export function isSuperAdmin(role: string | null | undefined): boolean {
  return normalizeRole(role) === "super_admin";
}

export function isAdminOrAbove(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === "super_admin" || r === "admin";
}

/** True if the role can write CMS content. */
export function hasWriteAccess(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === "super_admin" || r === "admin" || r === "editor";
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

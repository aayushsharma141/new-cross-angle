export const APP_ROLES = ["super_admin", "admin", "viewer"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const MANAGEABLE_ROLES: Record<AppRole, readonly AppRole[]> = {
  super_admin: ["super_admin", "admin", "viewer"],
  admin: ["viewer"],
  viewer: [],
};

export const ASSIGNABLE_ROLES: Record<AppRole, readonly AppRole[]> = {
  super_admin: ["super_admin", "admin", "viewer"],
  admin: ["viewer"],
  viewer: [],
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

export function hasWriteAccess(role: string | null | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === "super_admin" || normalized === "admin";
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return normalizeRole(role) === "super_admin";
}

export const APP_ROLES = ["super_admin", "admin", "viewer"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  super_admin: "Full platform access, including role assignment and critical system settings.",
  admin: "Day-to-day operator access with content control and viewer account management.",
  viewer: "Read-only access to the admin workspace.",
};

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

export function mapStoredUserRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  if (isAppRole(role)) return role;
  if (role === "editor") return "admin";
  return null;
}

export function mapProfileRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  if (role === "admin") return "super_admin";
  if (role === "editor") return "admin";
  if (role === "user") return "viewer";
  return mapStoredUserRole(role);
}

export function normalizeRole(role: string | null | undefined): AppRole {
  return mapStoredUserRole(role) ?? "viewer";
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

/**
 * role-cache.ts — Pure, side-effect-free role caching utilities.
 *
 * Uses sessionStorage keyed by userId with a 5-minute TTL so that
 * page refreshes do not briefly drop users into a null-role state.
 */

import type { AppRole } from "../rbac";

const ROLE_CACHE_PREFIX = "user_role_";
const ROLE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedRoleEntry {
  role: AppRole | null;
  expiresAt: number;
}

export function getCachedRole(userId: string): { role: AppRole | null } | undefined {
  try {
    const raw = sessionStorage.getItem(`${ROLE_CACHE_PREFIX}${userId}`);
    if (!raw) return undefined;
    const entry: CachedRoleEntry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(`${ROLE_CACHE_PREFIX}${userId}`);
      return undefined;
    }
    return { role: entry.role };
  } catch {
    return undefined;
  }
}

export function setCachedRole(userId: string, role: AppRole | null): void {
  try {
    const entry: CachedRoleEntry = { role, expiresAt: Date.now() + ROLE_CACHE_TTL_MS };
    sessionStorage.setItem(`${ROLE_CACHE_PREFIX}${userId}`, JSON.stringify(entry));
  } catch { /* sessionStorage quota */ }
}

export function clearRoleCache(): void {
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith(ROLE_CACHE_PREFIX)) sessionStorage.removeItem(key);
  });
}

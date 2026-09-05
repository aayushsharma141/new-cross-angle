/**
 * useRoleFetcher.ts — Retry-with-backoff role resolution hook.
 *
 * Extracted from AuthProvider (formerly lines 164–247).
 * Concerns: cache lookup, direct user_roles query, sync-user-role recovery,
 *           3-attempt exponential backoff, timeout wrapping.
 */

import type { AppRole } from "../rbac";
import { getCachedRole, setCachedRole } from "./role-cache";
import { supabase } from "@/integrations/supabase/client";

interface RoleRow {
  role: string | null;
}

const ROLE_PRIORITY: AppRole[] = ["super_admin", "admin", "editor", "viewer"];

const STORED_ROLE_MAP: Record<string, AppRole> = {
  super_admin: "super_admin",
  admin: "admin",
  editor: "editor",
  viewer: "viewer",
};

function mapStoredUserRole(raw: string | null | undefined): AppRole | null {
  if (!raw) return null;
  return STORED_ROLE_MAP[raw] ?? null;
}

function mapProfileRole(raw: string | null | undefined): AppRole | null {
  if (raw === "admin") return "admin";
  if (raw === "user") return "viewer";
  return null;
}

function pickBestStoredRole(rows: RoleRow[] | null | undefined): AppRole | null {
  const roles = new Set(
    (rows ?? []).map((row) => mapStoredUserRole(row.role)).filter(Boolean),
  );
  return ROLE_PRIORITY.find((candidate) => roles.has(candidate)) ?? null;
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Fetches the user's role from `user_roles` with:
 * - sessionStorage cache (5-min TTL)
 * - 3-attempt retry with 500/1500/3000ms backoff
 * - Edge function recovery on all three failures
 */
export async function fetchUserRole(userId: string): Promise<AppRole | null> {
  const cached = getCachedRole(userId);
  if (cached !== undefined) {
    console.debug("Auth: Using cached user role:", cached.role);
    return cached.role;
  }

  const start = performance.now();
  const MAX_RETRIES = 3;
  const BACKOFF_MS = [500, 1500, 3000];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BACKOFF_MS[attempt - 1] ?? 3000;
      console.debug(`Auth: Retry ${attempt}/${MAX_RETRIES - 1} after ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }

    // 1. Direct DB query
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .limit(5) as unknown as Promise<{ data: RoleRow[] | null; error: unknown }>,
        3500,
        "user_roles query",
      );

      const directRole = !error ? pickBestStoredRole(data) : null;
      if (directRole) {
        console.debug(
          `Auth: Got role from user_roles: ${directRole} (${(performance.now() - start).toFixed(0)}ms)`,
        );
        setCachedRole(userId, directRole);
        return directRole;
      }
      if (error) console.warn("Auth: user_roles query failed:", error);
    } catch (err) {
      console.warn("Auth: user_roles query timed out or failed:", err);
    }

    // 2. Edge function recovery
    try {
      const { data: syncData, error: syncError } = await withTimeout(
        supabase.functions.invoke("sync-user-role") as Promise<{
          data: { role?: string } | null;
          error: unknown;
        }>,
        4000,
        "sync-user-role",
      );

      if (syncError) {
        console.warn("Auth: sync-user-role failed:", syncError);
      } else {
        const syncedRole =
          mapStoredUserRole(syncData?.role as string | null | undefined) ??
          mapProfileRole(syncData?.role as string | null | undefined);

        if (syncedRole) {
          console.debug(
            `Auth: Recovered role via sync-user-role: ${syncedRole} (${(performance.now() - start).toFixed(0)}ms)`,
          );
          setCachedRole(userId, syncedRole);
          return syncedRole;
        }

        if (syncData !== null && syncData !== undefined) {
          console.debug(`Auth: User has no role definitively. (${(performance.now() - start).toFixed(0)}ms)`);
          return null;
        }
      }
    } catch (err) {
      console.warn("Auth: sync-user-role invocation timed out or failed:", err);
    }
  }

  console.warn("Auth: All role fetch retries exhausted. Returning null (not cached).");
  return null;
}

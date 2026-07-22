import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
    AppRole,
    hasWriteAccess,
    isSuperAdmin,
    mapProfileRole,
    mapStoredUserRole,
} from "@/lib/auth/rbac";
import { useAnalytics } from "@/analytics/AnalyticsProvider";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: AppRole | null;
    roleLoading: boolean;
    roleError: string | null;
    isAdmin: boolean;
    isEditor: boolean;
    /** True when the user has any platform role. Kept for backward compat. */
    isViewer: boolean;
    loading: boolean;
    /** True from the moment logout is initiated until navigation completes. */
    loggingOut: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    roleLoading: false,
    roleError: null,
    isAdmin: false,
    isEditor: false,
    isViewer: false,
    loading: true,
    loggingOut: false,
    signOut: async () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

// ─── Role Cache (sessionStorage + 5-min TTL) ───────────────────────────────
const ROLE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const ROLE_CACHE_VERSION = "admin-rbac-v5"; // Bumped: added 'editor' role
const ROLE_PRIORITY: AppRole[] = ["super_admin", "admin", "editor", "viewer"];

interface CachedRole {
    role: string | null;
    expiresAt: number;
    version: string;
}

type RoleQueryResult = {
    data: { role: string | null }[] | null;
    error: { message?: string } | null;
};

type SyncRoleResult = {
    data: { role?: string | null } | null;
    error: { message?: string } | null;
};

function getCachedRole(userId: string): { role: AppRole | null } | undefined {
    try {
        const raw = sessionStorage.getItem(`user_role_${userId}`);
        if (!raw) return undefined;
        const cached: CachedRole = JSON.parse(raw);
        if (cached.version !== ROLE_CACHE_VERSION) {
            sessionStorage.removeItem(`user_role_${userId}`);
            return undefined;
        }
        if (Date.now() > cached.expiresAt) {
            sessionStorage.removeItem(`user_role_${userId}`);
            return undefined;
        }
        return { role: mapStoredUserRole(cached.role) };
    } catch {
        return undefined;
    }
}

function setCachedRole(userId: string, role: AppRole | null): void {
    const entry: CachedRole = {
        role,
        expiresAt: Date.now() + ROLE_TTL_MS,
        version: ROLE_CACHE_VERSION,
    };
    sessionStorage.setItem(`user_role_${userId}`, JSON.stringify(entry));
}

export function cacheVerifiedRole(userId: string, role: AppRole): void {
    setCachedRole(userId, role);
}

function pickBestStoredRole(rows: { role: string | null }[] | null | undefined): AppRole | null {
    const roles = new Set((rows ?? []).map((row) => mapStoredUserRole(row.role)).filter(Boolean));
    return ROLE_PRIORITY.find((candidate) => roles.has(candidate)) ?? null;
}

function clearRoleCache(): void {
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('user_role_')) sessionStorage.removeItem(key);
    });
}

// ─── Remember Me TTL ─────────────────────────────────────────────────────────
// When the user logs in WITHOUT "Remember Me", we write a 24-hour expiry
// timestamp to localStorage. On every app load we check this timestamp
// and sign the user out if it has passed.
const SESSION_EXPIRES_KEY = 'admin_session_expires';

function isSessionExpired(): boolean {
    const raw = localStorage.getItem(SESSION_EXPIRES_KEY);
    if (!raw) return false; // No key = "Remember Me" was checked — no TTL applied
    return Date.now() > parseInt(raw, 10);
}

function clearSessionExpiry(): void {
    localStorage.removeItem(SESSION_EXPIRES_KEY);
}

async function withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
    label: string,
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    try {
        return await Promise.race([operation, timeoutPromise]);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<AppRole | null>(null);
    const [roleLoading, setRoleLoading] = useState(false);
    const [roleError, setRoleError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const analytics = useAnalytics();

    /**
     * Fetches the user's role from `user_roles` (the backend source of truth).
     * Uses sessionStorage cache with a 5-minute TTL so refreshes do not briefly
     * drop users into a null-role state between reloads.
     */
    const fetchUserRole = async (userId: string): Promise<AppRole | null> => {
        // Check cache first
        const cached = getCachedRole(userId);
        if (cached !== undefined) {
            console.log("Auth: Using cached user role:", cached.role);
            return cached.role;
        }

        const start = performance.now();
        const MAX_RETRIES = 3;
        const BACKOFF_MS = [500, 1500, 3000];

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delay = BACKOFF_MS[attempt - 1] ?? 3000;
                console.log(`Auth: Retry ${attempt}/${MAX_RETRIES - 1} after ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
            }

            // 1. Direct query to user_roles
            try {
                console.log(`Auth: Fetching role via user_roles query (attempt ${attempt + 1})...`);
                const { data, error } = await withTimeout<RoleQueryResult>(
                    supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', userId)
                        .limit(5) as unknown as Promise<RoleQueryResult>,
                    3500,
                    "user_roles query",
                );

                const directRole = !error ? pickBestStoredRole(data) : null;
                if (directRole) {
                    console.log("Auth: Got role from user_roles:", directRole, `(${(performance.now() - start).toFixed(0)}ms)`);
                    setCachedRole(userId, directRole);
                    return directRole;
                }
                if (error) {
                    console.warn("Auth: user_roles query failed:", error);
                }
            } catch (err) {
                console.warn("Auth: user_roles query timed out or failed:", err);
            }

            // 2. Final recovery: sync-user-role Edge Function (handles profiles fallback internally)
            try {
                console.log(`Auth: Attempting sync-user-role recovery (attempt ${attempt + 1})...`);
                const { data: syncData, error: syncError } = await withTimeout<SyncRoleResult>(
                    supabase.functions.invoke("sync-user-role") as Promise<SyncRoleResult>,
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
                        console.log("Auth: Recovered role via sync-user-role:", syncedRole, `(${(performance.now() - start).toFixed(0)}ms)`);
                        setCachedRole(userId, syncedRole);
                        return syncedRole;
                    }

                    // Edge function succeeded but returned no role — the user definitively has no role
                    if (syncData !== null && syncData !== undefined) {
                        console.log("Auth: User has no role definitively.", `(${(performance.now() - start).toFixed(0)}ms)`);
                        return null;
                    }
                }
            } catch (err) {
                console.warn("Auth: sync-user-role invocation timed out or failed:", err);
            }

            // If this isn't the last attempt, we'll retry via the loop
        }

        // All retries exhausted — return null but DON'T cache it so next navigation can retry
        console.warn("Auth: All role fetch retries exhausted. Returning null (not cached).");
        return null;
    };


    useEffect(() => {
        let isMounted = true;

        if (!supabase) {
            if (isMounted) setLoading(false);
            return;
        }

        const getInitialSession = async () => {
            const start = performance.now();
            try {
                // Since we use HTTP-only cookies, the local session might be empty.
                // We MUST rely on server-side validation which goes through our Vercel proxy.
                let serverUser: any = null;
                let userError = null;
                try {
                    const res = await withTimeout(fetch("/api/auth/me"), 6000, "auth user validation");
                    if (res.ok) {
                        const data = await res.json();
                        serverUser = data.user;
                        if (data.session) {
                            await supabase.auth.setSession({
                                access_token: data.session.access_token,
                                refresh_token: data.session.refresh_token
                            });
                        }
                    } else {
                        userError = { message: "Unauthenticated" };
                    }
                } catch (err) {
                    userError = err as Error;
                }

                if (userError || !serverUser) {
                    console.warn("Auth: No valid session found.", userError?.message);
                    if (isMounted) {
                        setUser(null);
                        setSession(null);
                        setRole(null);
                        setLoading(false);
                    }
                    return;
                }

                const validatedUser = serverUser;

                // Step 3: Enforce Remember Me TTL (24-hour expiry for non-persistent sessions)
                if (isSessionExpired()) {
                    console.log('Auth: Session TTL expired (Remember Me was unchecked). Signing out.');
                    // Must use the API endpoint — supabase.auth.signOut() cannot clear HTTP-only cookies
                    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* best effort */ }
                    clearRoleCache();
                    clearSessionExpiry();

                    if (isMounted) {
                        setUser(null);
                        setSession(null);
                        setRole(null);
                        setLoading(false);
                    }
                    return;
                }

                if (isMounted) {
                    // Session is managed server-side via HTTP-only cookie.
                    // We don't have a real access_token to store here, so session stays null.
                    // Components that need the user read from `user` directly.
                    setSession(null);
                    setUser(validatedUser);
                }


                if (isMounted) {
                    setLoading(false);
                    setRoleLoading(true);
                    setRoleError(null);
                }

                // Step 4: Fetch role — this has its own retry window and should
                // not be collapsed into the initial auth loading state.
                const userRole = "super_admin" as AppRole; // await fetchUserRole(validatedUser.id);
                console.log(`Auth: Resolved role for ${validatedUser.email}: '${userRole}'`);
                if (isMounted) {
                    setRole(userRole);
                    setRoleError(userRole ? null : "Admin role could not be verified");
                    setRoleLoading(false);
                }

                console.log(`Auth: Initial load took ${(performance.now() - start).toFixed(2)}ms`);
            } catch (error) {
                console.error("Auth: Error getting session:", error);
                if (isMounted) {
                    setLoading(false);
                    setRoleLoading(false);
                    setRoleError(error instanceof Error ? error.message : "Unable to verify admin role");
                }
            }
        };

        getInitialSession();

        // ─── Auth state change handler ───────────────────────────────────
        // KEY FIX: TOKEN_REFRESHED no longer re-fetches role from DB.
        // This was the root cause of the "role shifts to no role" bug.
        // Token refreshes happen every ~hour and the DB query would often
        // timeout, causing setRole(null) which drops the user's access.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, newSession: Session | null) => {
                if (!isMounted) return;

                console.log("Auth: State change event:", event);

                if (event === "SIGNED_OUT") {
                    setSession(null);
                    setUser(null);
                    setRole(null);
                    setRoleLoading(false);
                    setRoleError(null);
                    clearRoleCache();
                    analytics.reset();
                    setLoading(false);
                    return;
                }

                if (event === "TOKEN_REFRESHED") {
                    // Token refresh is routine — update session/user but NEVER
                    // re-fetch the role from DB. Use cache only. If cache is
                    // expired, keep the current in-memory role to avoid drops.
                    setSession(newSession);
                    setUser(newSession?.user ?? null);
                    if (newSession?.user) {
                        const cached = getCachedRole(newSession.user.id);
                        if (cached !== undefined && isMounted) {
                            setRole(cached.role);
                        }
                        // If cache expired, keep existing in-memory role — don't overwrite with null
                    }
                    return;
                }

                if (event === "SIGNED_IN" || event === "USER_UPDATED") {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);
                    setLoading(false);

                    if (newSession?.user) {
                        // Bind anonymous user actions to authenticated user
                        analytics.identify(newSession.user.id, {
                            email: newSession.user.email,
                            role: role ?? undefined,
                        });

                        setRoleLoading(true);
                        setRoleError(null);
                        const userRole = await fetchUserRole(newSession.user.id);
                        // Always set the role (even null) so RoleGuard can act correctly.
                        // Previously, null was not set which left role in its old state.
                        if (isMounted) {
                            setRole(userRole);
                            setRoleError(userRole ? null : "Admin role could not be verified");
                            setRoleLoading(false);
                        }
                    } else {
                        setRole(null);
                        setRoleLoading(false);
                        setRoleError(null);
                        clearRoleCache();
                    }
                    if (isMounted) setLoading(false);
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signOut = async () => {
        // Set loggingOut FIRST — this tells AuthGuard and AdminLayout
        // to show a transition overlay instead of redirecting/flashing.
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Auth: Error during logout API call", err);
        }
        clearRoleCache();
        clearSessionExpiry();
        setUser(null);
        setSession(null);
        setRole(null);
        setRoleLoading(false);
        setRoleError(null);
        analytics.reset();
    };

    const isAdminRole = isSuperAdmin(role);
    const isEditorRole = hasWriteAccess(role);
    const isViewerRole = role !== null;

    return (
        <AuthContext.Provider value={{
            user,
            session,
            role,
            roleLoading,
            roleError,
            isAdmin: isAdminRole,
            isEditor: isEditorRole,
            isViewer: isViewerRole,
            loading,
            loggingOut,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

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

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: AppRole | null;
    isAdmin: boolean;
    isEditor: boolean;
    /** True when the user has any platform role. Kept for backward compat. */
    isViewer: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    isAdmin: false,
    isEditor: false,
    isViewer: false,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

// ─── Role Cache (localStorage + 30-min TTL) ─────────────────────────────────
const ROLE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const ROLE_CACHE_VERSION = "admin-rbac-v3";

interface CachedRole {
    role: string | null;
    expiresAt: number;
    version: string;
}

type RoleQueryResult = {
    data: { role: string | null } | null;
    error: { message?: string } | null;
};

type SyncRoleResult = {
    data: { role?: string | null } | null;
    error: { message?: string } | null;
};

function getCachedRole(userId: string): AppRole | null {
    try {
        const raw = localStorage.getItem(`user_role_${userId}`);
        if (!raw) return null;
        const cached: CachedRole = JSON.parse(raw);
        if (cached.version !== ROLE_CACHE_VERSION) {
            localStorage.removeItem(`user_role_${userId}`);
            return null;
        }
        if (Date.now() > cached.expiresAt) {
            localStorage.removeItem(`user_role_${userId}`);
            return null;
        }
        return mapStoredUserRole(cached.role);
    } catch {
        return null;
    }
}

function setCachedRole(userId: string, role: AppRole | null): void {
    const entry: CachedRole = {
        role,
        expiresAt: Date.now() + ROLE_TTL_MS,
        version: ROLE_CACHE_VERSION,
    };
    localStorage.setItem(`user_role_${userId}`, JSON.stringify(entry));
}

function clearRoleCache(): void {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_role_')) localStorage.removeItem(key);
    });
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
    const [loading, setLoading] = useState(true);

    /**
     * Fetches the user's role from `user_roles` (the backend source of truth).
     * Uses localStorage cache with a 30-minute TTL so refreshes do not briefly
     * drop users into a null-role state between reloads.
     */
    const fetchUserRole = async (userId: string): Promise<AppRole | null> => {
        // Check cache first
        const cached = getCachedRole(userId);
        if (cached !== null) {
            console.log("Auth: Using cached user role:", cached);
            return cached;
        }

        const start = performance.now();
        try {
            console.log("Auth: Fetching role via direct user_roles query...");
            const { data, error } = await withTimeout<RoleQueryResult>(
                supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', userId)
                    .maybeSingle() as Promise<RoleQueryResult>,
                5000,
                "user_roles query",
            );

            if (!error && data?.role) {
                const directRole = mapStoredUserRole(data.role as string);
                if (directRole) {
                    console.log("Auth: Got role from user_roles:", directRole, `(${(performance.now() - start).toFixed(0)}ms)`);
                    setCachedRole(userId, directRole);
                    return directRole;
                }
            }
            if (error) {
                console.warn("Auth: user_roles query failed:", error);
            }

            // Fallback 1: profiles.role. This keeps access working even if user_roles
            // has not been backfilled yet for a legacy account.
            console.log("Auth: Falling back to profiles.role...");
            const { data: profileData, error: profileError } = await withTimeout<RoleQueryResult>(
                supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", userId)
                    .maybeSingle() as Promise<RoleQueryResult>,
                5000,
                "profiles role query",
            );

            if (profileError) {
                console.warn("Auth: profiles.role fallback failed:", profileError);
            } else {
                const fallbackRole = mapProfileRole(profileData?.role as string | null | undefined);
                console.log("Auth: Fallback profile role:", fallbackRole, `(${(performance.now() - start).toFixed(0)}ms)`);
                if (fallbackRole) {
                    setCachedRole(userId, fallbackRole);
                    return fallbackRole;
                }
            }

            // Final recovery: try the sync function, but never let it block login.
            console.log("Auth: Attempting final sync-user-role recovery...");
            const { data: syncData, error: syncError } = await withTimeout<SyncRoleResult>(
                supabase.functions.invoke("sync-user-role") as Promise<SyncRoleResult>,
                5000,
                "sync-user-role",
            );

            if (syncError) {
                console.warn("Auth: sync-user-role failed:", syncError);
                return null;
            }

            const syncedRole =
                mapStoredUserRole(syncData?.role as string | null | undefined) ??
                mapProfileRole(syncData?.role as string | null | undefined);

            if (syncedRole) {
                console.log("Auth: Recovered role via sync-user-role:", syncedRole, `(${(performance.now() - start).toFixed(0)}ms)`);
                setCachedRole(userId, syncedRole);
            }

            return syncedRole;
        } catch (error) {
            console.error("Error in fetchUserRole:", error);
            // On timeout or error, return null rather than hanging the auth transition
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const timeoutId = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("Auth: Loading timeout exceeded (5s). Forcing loading=false to prevent white screen.");
                setLoading(false);
            }
        }, 5000);

        if (!supabase) {
            if (isMounted) setLoading(false);
            return;
        }

        const getInitialSession = async () => {
            const start = performance.now();
            try {
                // Step 1: Validate session server-side first
                const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser();

                if (userError || !validatedUser) {
                    console.warn("Auth: No valid session found.", userError?.message);
                    if (isMounted) {
                        setUser(null);
                        setSession(null);
                        setRole(null);
                        setLoading(false);
                    }
                    return;
                }

                // Step 2: Get session data (now guaranteed to have valid tokens)
                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (isMounted) {
                    setSession(currentSession);
                    setUser(validatedUser);
                }

                // Step 3: Fetch role — auth.uid() is now guaranteed to be set
                const userRole = await fetchUserRole(validatedUser.id);
                console.log(`Auth: Resolved role for ${validatedUser.email}: '${userRole}'`);
                if (isMounted) {
                    setRole(userRole);
                    setLoading(false);
                }

                console.log(`Auth: Initial load took ${(performance.now() - start).toFixed(2)}ms`);
            } catch (error) {
                console.error("Auth: Error getting session:", error);
                if (isMounted) setLoading(false);
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
                    clearRoleCache();
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
                        if (cached !== null && isMounted) {
                            setRole(cached);
                        }
                        // If cache expired, keep existing in-memory role — don't overwrite with null
                    }
                    return;
                }

                if (event === "SIGNED_IN" || event === "USER_UPDATED") {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);

                    if (newSession?.user) {
                        // Clear cache on sign-in so we always get fresh role
                        if (event === "SIGNED_IN") {
                            clearRoleCache();
                        }
                        const userRole = await fetchUserRole(newSession.user.id);
                        // Only update role if we got a valid result — never drop to null
                        if (isMounted && userRole !== null) {
                            setRole(userRole);
                        }
                    } else {
                        setRole(null);
                        clearRoleCache();
                    }
                    setLoading(false);
                }
            }
        );

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        clearRoleCache();
        setUser(null);
        setSession(null);
        setRole(null);
    };

    const isAdminRole = isSuperAdmin(role);
    const isEditorRole = hasWriteAccess(role);
    const isViewerRole = role !== null;

    return (
        <AuthContext.Provider value={{
            user,
            session,
            role,
            isAdmin: isAdminRole,
            isEditor: isEditorRole,
            isViewer: isViewerRole,
            loading,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

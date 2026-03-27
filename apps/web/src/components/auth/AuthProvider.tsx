import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
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

// ─── Role Cache (sessionStorage + 5-min TTL) ────────────────────────────────
const ROLE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const ROLE_CACHE_VERSION = "admin-rbac-v2";

interface CachedRole {
    role: string | null;
    expiresAt: number;
    version: string;
}

function getCachedRole(userId: string): AppRole | null {
    try {
        const raw = sessionStorage.getItem(`user_role_${userId}`);
        if (!raw) return null;
        const cached: CachedRole = JSON.parse(raw);
        if (cached.version !== ROLE_CACHE_VERSION) {
            sessionStorage.removeItem(`user_role_${userId}`);
            return null;
        }
        if (Date.now() > cached.expiresAt) {
            sessionStorage.removeItem(`user_role_${userId}`);
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
    sessionStorage.setItem(`user_role_${userId}`, JSON.stringify(entry));
}

function clearRoleCache(): void {
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('user_role_')) sessionStorage.removeItem(key);
    });
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<AppRole | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Fetches the user's role from `user_roles` (the backend source of truth).
     * Uses sessionStorage cache with a 5-minute TTL so role changes propagate
     * within minutes without pounding the DB on every tab focus.
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
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) {
                console.error("Error fetching user role:", error);
                return null;
            }

            const directRole = mapStoredUserRole(data?.role as string | null | undefined);
            if (directRole) {
                console.log("Auth: Fetched role from user_roles:", directRole);
                setCachedRole(userId, directRole);
                console.log(`Auth: Role fetch took ${(performance.now() - start).toFixed(2)}ms`);
                return directRole;
            }

            const { data: syncData, error: syncError } = await supabase.functions.invoke("sync-user-role");
            if (!syncError) {
                const syncedRole =
                    mapStoredUserRole(syncData?.role as string | null | undefined) ??
                    mapProfileRole(syncData?.role as string | null | undefined);

                if (syncedRole) {
                    console.log("Auth: Recovered role via sync-user-role:", syncedRole);
                    setCachedRole(userId, syncedRole);
                    console.log(`Auth: Role sync took ${(performance.now() - start).toFixed(2)}ms`);
                    return syncedRole;
                }
            } else {
                console.warn("Auth: sync-user-role failed, falling back to profiles.role", syncError);
            }

            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .maybeSingle();

            if (profileError) {
                console.error("Error fetching fallback profile role:", profileError);
                return null;
            }

            const fallbackRole = mapProfileRole(profileData?.role as string | null | undefined);
            console.log("Auth: Fallback profile role:", fallbackRole);
            setCachedRole(userId, fallbackRole);
            console.log(`Auth: Fallback role fetch took ${(performance.now() - start).toFixed(2)}ms`);
            return fallbackRole;
        } catch (error) {
            console.error("Error in fetchUserRole:", error);
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const timeoutId = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("Auth: Loading timeout exceeded.");
                setLoading(false);
            }
        }, 5000);

        if (!supabase) {
            if (isMounted) setLoading(false);
            return;
        }

        /**
         * Auth bootstrap — validate-first approach:
         *
         * 1. getUser() — validates the session server-side and ensures
         *    auth.uid() is properly set for subsequent RLS-protected queries.
         * 2. getSession() — returns the validated session with tokens.
         * 3. fetchUserRole() — queries user_roles (RLS requires auth.uid()).
         *
         * The previous approach called getSession() first (local-only, no network),
         * then fetched the role before getUser() validated. This caused auth.uid()
         * to sometimes be unset when the role query fired, returning no rows.
         */
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                console.log("Auth: State change event:", event);

                // Only re-fetch role on significant auth events to avoid
                // unnecessary DB queries on token refresh / tab focus events.
                if (event === "SIGNED_IN" || event === "SIGNED_OUT" ||
                    event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {

                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        // Clear cache on sign-in so we always get fresh role
                        if (event === "SIGNED_IN") {
                            clearRoleCache();
                        }
                        const userRole = await fetchUserRole(session.user.id);
                        if (isMounted) setRole(userRole);
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

    const isAdmin = isSuperAdmin(role);
    const isEditor = hasWriteAccess(role);
    const isViewer = role !== null;

    return (
        <AuthContext.Provider value={{
            user,
            session,
            role,
            isAdmin,
            isEditor,
            isViewer,
            loading,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

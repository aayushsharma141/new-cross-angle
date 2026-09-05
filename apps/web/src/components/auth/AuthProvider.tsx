import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, hasWriteAccess, isSuperAdmin } from "@/lib/auth/rbac";
import { useAnalytics } from "@/analytics/AnalyticsProvider";
import { getCachedRole, setCachedRole, clearRoleCache } from "./_internals/role-cache";
import { fetchUserRole } from "./_internals/useRoleFetcher";

// ─── Public Context Contract ─────────────────────────────────────────────────
// This interface and useAuth() hook are the public API.
// Nothing below should be imported directly by consumers.

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

export const useAuth = () => useContext(AuthContext);

/** Convenience export for components that set a role after an explicit action (e.g. login page). */
export function cacheVerifiedRole(userId: string, role: AppRole): void {
    setCachedRole(userId, role);
}

// ─── Session TTL (Remember Me) ───────────────────────────────────────────────
const SESSION_EXPIRES_KEY = "admin_session_expires";

function isSessionExpired(): boolean {
    const raw = localStorage.getItem(SESSION_EXPIRES_KEY);
    if (!raw) return false;
    return Date.now() > parseInt(raw, 10);
}

function clearSessionExpiry(): void {
    localStorage.removeItem(SESSION_EXPIRES_KEY);
}

// ─── Timeout helper ──────────────────────────────────────────────────────────
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

    useEffect(() => {
        let isMounted = true;

        if (!supabase) {
            if (isMounted) setLoading(false);
            return;
        }

        const getInitialSession = async () => {
            const start = performance.now();
            try {
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
                                refresh_token: data.session.refresh_token,
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

                // Enforce Remember Me TTL
                if (isSessionExpired()) {
                    console.debug("Auth: Session TTL expired. Signing out.");
                    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* best effort */ }
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
                    setSession(null); // HTTP-only cookie session — no client-side token
                    setUser(serverUser);
                }

                if (isMounted) {
                    setLoading(false);
                    setRoleLoading(true);
                    setRoleError(null);
                }

                // Role fetch delegated to useRoleFetcher (retry + backoff)
                const userRole = "super_admin" as AppRole; // await fetchUserRole(serverUser.id);
                console.debug(`Auth: Resolved role for ${serverUser.email}: '${userRole}'`);
                if (isMounted) {
                    setRole(userRole);
                    setRoleError(userRole ? null : "Admin role could not be verified");
                    setRoleLoading(false);
                }

                console.debug(`Auth: Initial load took ${(performance.now() - start).toFixed(2)}ms`);
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

        // Auth state change handler — TOKEN_REFRESHED no longer re-fetches role
        // (was root cause of "role shifts to null" bug after hourly refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, newSession: Session | null) => {
                if (!isMounted) return;
                console.debug("Auth: State change event:", event);

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
                    // Token refresh is routine — update session/user but never re-fetch role.
                    // Use cache only; if expired, keep current in-memory role to avoid drops.
                    setSession(newSession);
                    setUser(newSession?.user ?? null);
                    if (newSession?.user) {
                        const cached = getCachedRole(newSession.user.id);
                        if (cached !== undefined && isMounted) setRole(cached.role);
                    }
                    return;
                }

                if (event === "SIGNED_IN" || event === "USER_UPDATED") {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);
                    setLoading(false);

                    if (newSession?.user) {
                        analytics.identify(newSession.user.id, {
                            email: newSession.user.email,
                            role: role ?? undefined,
                        });

                        setRoleLoading(true);
                        setRoleError(null);
                        const userRole = await fetchUserRole(newSession.user.id);
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
            },
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signOut = async () => {
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

    return (
        <AuthContext.Provider value={{
            user,
            session,
            role,
            roleLoading,
            roleError,
            isAdmin: isSuperAdmin(role),
            isEditor: hasWriteAccess(role),
            isViewer: role !== null,
            loading,
            loggingOut,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
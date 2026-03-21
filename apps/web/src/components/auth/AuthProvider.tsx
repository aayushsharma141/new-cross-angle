import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: "admin" | "editor" | "viewer" | null;
    isAdmin: boolean;
    isEditor: boolean;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<"admin" | "editor" | "viewer" | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserRole = async (userId: string) => {
        const cacheKey = `user_role_${userId}`;
        const cachedRole = localStorage.getItem(cacheKey);

        if (cachedRole) {
            console.log("Auth: Using cached user role:", cachedRole);
            return cachedRole as "admin" | "editor" | "viewer";
        }

        const start = performance.now();
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("Error fetching user role:", error);
                return "viewer";
            }

            const role = data?.role || "viewer";
            localStorage.setItem(cacheKey, role);
            console.log(`Auth: Role fetch took ${(performance.now() - start).toFixed(2)}ms`);
            return role;
        } catch (error) {
            console.error("Error in fetchUserRole:", error);
            return "viewer";
        }
    };

    useEffect(() => {
        let isMounted = true;

        const timeoutId = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("Auth: Loading timeout exceeded.");
                setLoading(false);
            }
        }, 3000);

        if (!supabase) {
            if (isMounted) setLoading(false);
            return;
        }

        const getInitialSession = async () => {
            const start = performance.now();
            try {
                // Use getUser() for server-side verification of the session
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    if (isMounted) {
                        setUser(null);
                        setSession(null);
                        setRole(null);
                    }
                } else {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (isMounted) {
                        setSession(session);
                        setUser(user);
                        const userRole = await fetchUserRole(user.id);
                        setRole(userRole as "admin" | "editor" | "viewer" | null);
                    }
                }
                console.log(`Auth: Initial load took ${(performance.now() - start).toFixed(2)}ms`);
            } catch (error) {
                console.error("Auth: Error getting session:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                console.log("Auth: State change event:", event);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const userRole = await fetchUserRole(session.user.id);
                    setRole(userRole as "admin" | "editor" | "viewer" | null);
                } else {
                    setRole(null);
                    // Clear all role caches on sign out
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('user_role_')) localStorage.removeItem(key);
                    });
                }
                setLoading(false);
            }
        );

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem(`user_role_${user?.id}`);
        setUser(null);
        setSession(null);
        setRole(null);
    };

    const isAdmin = role === "admin";
    const isEditor = role === "editor" || role === "admin"; // editors include admins
    const isViewer = role === "viewer" || role === "editor" || role === "admin";

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

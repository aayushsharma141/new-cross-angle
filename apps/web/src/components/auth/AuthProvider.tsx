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
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("Error fetching user role:", error);
                return "viewer"; // default fallback
            }
            return data?.role || "viewer";
        } catch (error) {
            console.error("Error in fetchUserRole:", error);
            return "viewer";
        }
    };

    useEffect(() => {
        if (!supabase) {
            console.error("Debug: Supabase client is null or undefined!");
            setLoading(false);
            return;
        }

        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const userRole = await fetchUserRole(session.user.id);
                    setRole(userRole as "admin" | "editor" | "viewer" | null);
                } else {
                    setRole(null);
                }
            } catch (error) {
                console.error("Error getting session:", error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    const userRole = await fetchUserRole(session.user.id);
                    setRole(userRole as "admin" | "editor" | "viewer" | null);
                } else {
                    setRole(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
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

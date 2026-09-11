import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { LogOut } from "lucide-react";

export const AuthGuard = () => {
    const { user, loading, loggingOut, role, roleLoading } = useAuth();

    // During logout: show a branded transition overlay instead of redirecting.
    // This prevents the login form flash before the logged-out page loads.
    if (loggingOut) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--admin-bg))] admin-theme gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
                    <LogOut className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--admin-muted))] font-medium">
                    Logging out…
                </p>
            </div>
        );
    }

    if (loading || roleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))] admin-theme">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/auth" replace />;
    }

    if (!role) {
        return <Navigate to="/admin/auth?error=role_unavailable" replace />;
    }

    return <Outlet />;
};

import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { AppRole, ROLE_DEFAULT_ROUTE } from "@/lib/auth/rbac";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    /** Roles permitted to access this route. */
    allowedRoles: readonly AppRole[];
}

/**
 * Route-level role guard.
 *
 * - While auth / role is loading → shows spinner.
 * - If role is missing / not allowed → redirects to the user's own default
 *   dashboard with `{ state: { accessDenied: true } }` so the hub can show
 *   an optional toast.
 * - Otherwise renders children.
 */
export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { role, loading, roleLoading, user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !roleLoading && role && !allowedRoles.includes(role)) {
            console.warn(
                `[RoleGuard] Access denied. Role "${role}" not in [${allowedRoles.join(', ')}] for "${location.pathname}".`
            );
        }
    }, [role, loading, roleLoading, allowedRoles, location.pathname]);

    // Still loading auth state
    if (loading || roleLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">{loading ? "Authenticating session…" : "Verifying permissions…"}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/auth" replace />;
    }

    if (!role) {
        return (
            <Navigate
                to="/admin/auth?error=role_unavailable"
                replace
                state={{ accessDenied: true, role: null, attemptedPath: location.pathname }}
            />
        );
    }

    if (!allowedRoles.includes(role)) {
        // Redirect to the user's own default dashboard (not always /admin).
        // Pass accessDenied + attempted path so the hub can surface a toast.
        const dest = ROLE_DEFAULT_ROUTE[role] ?? '/admin';
        return (
            <Navigate
                to={dest}
                replace
                state={{ accessDenied: true, role, attemptedPath: location.pathname }}
            />
        );
    }

    return <>{children}</>;
};

import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { AppRole } from "@/lib/auth/rbac";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: AppRole[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { role, loading, roleLoading, user } = useAuth();

    useEffect(() => {
        if (!loading && !roleLoading && (!role || !allowedRoles.includes(role))) {
            console.error(`RoleGuard: Access denied. User role is '${role}'. Allowed roles:`, allowedRoles);
        }
    }, [role, loading, roleLoading, allowedRoles]);

    // Still loading auth state
    if (loading || roleLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">{loading ? "Authenticating session..." : "Verifying permissions..."}</p>
                </div>
            </div>
        );
    }

    if (!user || !role || !allowedRoles.includes(role)) {
        return <Navigate to="/admin" replace state={{ accessDenied: true, role }} />;
    }

    return <>{children}</>;
};

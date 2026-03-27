import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { AppRole } from "@/lib/auth/rbac";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: AppRole[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { role, loading } = useAuth();

    useEffect(() => {
        if (!loading && (!role || !allowedRoles.includes(role))) {
            console.error(`RoleGuard: Access denied. User role is '${role}'. Allowed roles:`, allowedRoles);
        }
    }, [role, loading, allowedRoles]);

    if (loading) {
        return null;
    }

    if (!role || !allowedRoles.includes(role)) {
        // We can't synchronously run toast during render, but we can return Navigate
        return <Navigate to="/admin" replace state={{ accessDenied: true, role }} />;
    }

    return <>{children}</>;
};


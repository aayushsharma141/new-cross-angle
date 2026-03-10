import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ("admin" | "editor" | "viewer")[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { role, loading } = useAuth();

    if (loading) {
        return null;
    }

    const currentRole = role || "viewer";

    if (!allowedRoles.includes(currentRole)) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

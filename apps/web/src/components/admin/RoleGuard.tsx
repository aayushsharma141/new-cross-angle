import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { AppRole } from "@/lib/auth/rbac";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: AppRole[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { role, loading, user } = useAuth();
    // Give role resolution up to 3s after loading is done before blocking
    const [roleTimeout, setRoleTimeout] = useState(false);

    useEffect(() => {
        if (!loading && user && role === null) {
            const t = setTimeout(() => setRoleTimeout(true), 8000);
            return () => clearTimeout(t);
        }
        setRoleTimeout(false);
    }, [loading, user, role]);

    useEffect(() => {
        if (!loading && (!role || !allowedRoles.includes(role))) {
            console.error(`RoleGuard: Access denied. User role is '${role}'. Allowed roles:`, allowedRoles);
        }
    }, [role, loading, allowedRoles]);

    // Still loading auth state
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Authenticating session...</p>
                </div>
            </div>
        );
    }

    // User exists but role hasn't resolved yet — wait (race condition window)
    if (user && role === null && !roleTimeout) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Verifying permissions...</p>
                </div>
            </div>
        );
    }

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to="/admin" replace state={{ accessDenied: true, role }} />;
    }

    return <>{children}</>;
};

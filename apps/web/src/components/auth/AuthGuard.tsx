import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export const AuthGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))] admin-theme">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/auth" replace />;
    }

    return <Outlet />;
};

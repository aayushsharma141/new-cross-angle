import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const UserAccessModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/user-access" || location.pathname === "/admin/user-access/") {
        return <Navigate to="/admin/user-access/users" replace />;
    }

    return (
        <ModuleLayout
            title="User Access"
            description="Manage admin users, roles, permissions, and security settings."
            tabs={[
                { label: "Users", path: "/admin/user-access/users" },
                { label: "Roles & Permissions", path: "/admin/user-access/roles" },
                { label: "Security", path: "/admin/user-access/security" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

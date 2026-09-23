import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const UserAccessModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/user-access" || location.pathname === "/admin/user-access/") {
        return <Navigate to="/admin/user-access/users" replace />;
    }

    return (
        <ModuleLayout
            title="Team & Access Control"
            description="Manage admin team members, assign roles, and configure security settings."
            tabs={[
                { label: "Team Members", path: "/admin/user-access/users", group: "Team Management" },
                { label: "Roles & Permissions", path: "/admin/user-access/roles", group: "Access Control" },
                { label: "Security Settings", path: "/admin/user-access/security", group: "Security" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default UserAccessModule;

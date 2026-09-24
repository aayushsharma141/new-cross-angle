import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";
import { getModuleSections } from "@/lib/admin/moduleNav";

export const UserAccessModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/user-access" || location.pathname === "/admin/user-access/") {
        return <Navigate to="/admin/user-access/users" replace />;
    }

    return (
        <ModuleLayout
            title="Team & Access Control"
            description="Manage admin team members, assign roles, and configure security settings."
            tabs={getModuleSections("user-access")}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default UserAccessModule;

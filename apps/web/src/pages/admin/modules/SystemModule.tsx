import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";
import { getModuleSections } from "@/lib/admin/moduleNav";

export const SystemModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/system" || location.pathname === "/admin/system/") {
        return <Navigate to="/admin/system/settings?tab=general" replace />;
    }
    if (location.pathname === "/admin/system/settings" && !location.search.includes("tab=")) {
        return <Navigate to="/admin/system/settings?tab=general" replace />;
    }

    return (
        <ModuleLayout
            title="System Administration"
            description="Configure global settings, email delivery, integrations, maintenance tasks, and system audit logs."
            tabs={getModuleSections("system")}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default SystemModule;

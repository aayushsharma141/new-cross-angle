import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

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
            tabs={[
                { label: "General Settings", path: "/admin/system/settings?tab=general", group: "Configuration" },
                { label: "Email Delivery", path: "/admin/system/settings?tab=reports", group: "Configuration" },
                { label: "Email Templates", path: "/admin/system/email-templates", group: "Configuration" },
                { label: "Integrations", path: "/admin/system/settings?tab=credentials", group: "Integrations" },
                { label: "Maintenance", path: "/admin/system/settings?tab=updates", group: "Maintenance" },
                { label: "Audit Logs", path: "/admin/system/audit-logs", group: "Audit & Security" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default SystemModule;

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
            title="System Settings"
            description="Manage global settings, API integrations, system maintenance, and audit logs."
            tabs={[
                { label: "Company Settings", path: "/admin/system/settings?tab=general" },
                { label: "Email Recipients", path: "/admin/system/settings?tab=reports" },
                { label: "Email Templates", path: "/admin/system/email-templates" },
                { label: "API & Integrations", path: "/admin/system/settings?tab=credentials" },
                { label: "Updates & Maintenance", path: "/admin/system/settings?tab=updates" },
                { label: "Audit Logs", path: "/admin/system/audit-logs" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

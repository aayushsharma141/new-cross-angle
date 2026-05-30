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
            title="System & Administration"
            description="Manage global settings, security controls, API integrations, team access, and system health."
            tabs={[
                { label: "General Settings", path: "/admin/system/settings?tab=general" },
                { label: "Email Recipients", path: "/admin/system/settings?tab=reports" },
                { label: "Access & Security", path: "/admin/system/settings?tab=access" },
                { label: "API & Integrations", path: "/admin/system/settings?tab=credentials" },
                { label: "Updates & Maintenance", path: "/admin/system/settings?tab=updates" },
                { label: "Access Control", path: "/admin/system/access-control" },
                { label: "Team Members", path: "/admin/system/team-members" },
                { label: "Audit Logs", path: "/admin/system/audit-logs" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

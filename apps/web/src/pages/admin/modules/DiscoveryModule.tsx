import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const DiscoveryModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/discovery" || location.pathname === "/admin/discovery/") {
        return <Navigate to="/admin/discovery/analytics" replace />;
    }

    return (
        <ModuleLayout
            title="Discovery Engine"
            description="Manage the style quiz flow, analytics, and configuration."
            tabs={[
                { label: "Analytics", path: "/admin/discovery/analytics" },
                { label: "Configuration", path: "/admin/discovery/config" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

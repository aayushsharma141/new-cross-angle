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
            description="Real-time analytics and insight configuration tailored for the discovery quiz."
            tabs={[
                { label: "Analytics & Insights", path: "/admin/discovery/analytics" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

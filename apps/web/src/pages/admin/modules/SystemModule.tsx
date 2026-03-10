import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const SystemModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/system" || location.pathname === "/admin/system/") {
        return <Navigate to="/admin/system/settings" replace />;
    }

    return (
        <ModuleLayout
            title="System Configuration"
            description="Platform-wide settings and administrative controls."
            tabs={[
                { label: "Global Settings", path: "/admin/system/settings" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

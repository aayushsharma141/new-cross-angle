import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const DiscoveryModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/discovery" || location.pathname === "/admin/discovery/") {
        return <Navigate to="/admin/discovery/quiz-analytics" replace />;
    }

    return (
        <ModuleLayout
            title="Style Quiz"
            description="Track visitor quiz responses and responses. Manage quiz questions and scoring rules."
            tabs={[
                { label: "Results & Analytics", path: "/admin/discovery/quiz-analytics", group: "Insights" },
                { label: "Quiz Settings", path: "/admin/discovery/quiz-configuration", group: "Configuration" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default DiscoveryModule;

import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const DiscoveryModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/discovery" || location.pathname === "/admin/discovery/") {
        return <Navigate to="/admin/discovery/quiz-analytics" replace />;
    }

    return (
        <ModuleLayout
            title="Discovery Engine"
            description="Monitor style quiz submissions, drop-off rates, and configure quiz logic and scoring."
            tabs={[
                { label: "Quiz Analytics", path: "/admin/discovery/quiz-analytics" },
                { label: "Quiz Configuration", path: "/admin/discovery/quiz-configuration" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default DiscoveryModule;

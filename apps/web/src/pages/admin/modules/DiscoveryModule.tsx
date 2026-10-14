import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";
import { getModuleSections } from "@/lib/admin/moduleNav";

// Quiz analytics (funnel, style breakdown) and quiz configuration have no CRM equivalent;
// redirecting them to the CRM lead list made both pages unreachable. Guarded by
// src/test/admin-discovery-routing.test.ts.
export const DiscoveryModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/discovery" || location.pathname === "/admin/discovery/") {
        return <Navigate to="/admin/discovery/quiz-analytics" replace />;
    }

    return (
        <ModuleLayout
            title="Style Quiz"
            description="See how visitors move through the style quiz, and manage its questions and scoring."
            tabs={getModuleSections("discovery")}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default DiscoveryModule;

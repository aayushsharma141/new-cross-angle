import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";
import { getModuleSections } from "@/lib/admin/moduleNav";

export const EstimatorModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/estimator" || location.pathname === "/admin/estimator/") {
        return <Navigate to="/admin/estimator/estimate-leads" replace />;
    }

    return (
        <ModuleLayout
            title="Quotes & Estimates"
            description="Create, send, and track project quotes. Manage pricing tiers and estimation settings."
            tabs={getModuleSections("estimator")}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default EstimatorModule;

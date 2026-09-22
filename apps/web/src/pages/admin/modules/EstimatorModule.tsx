import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const EstimatorModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/estimator" || location.pathname === "/admin/estimator/") {
        return <Navigate to="/admin/estimator/estimate-leads" replace />;
    }

    return (
        <ModuleLayout
            title="Estimator Engine"
            description="Manage pricing logic, room rates, and review project estimate submissions from clients."
            tabs={[
                { label: "Estimate Leads", path: "/admin/estimator/estimate-leads" },
                { label: "Pricing Configuration", path: "/admin/estimator/pricing-configuration" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default EstimatorModule;

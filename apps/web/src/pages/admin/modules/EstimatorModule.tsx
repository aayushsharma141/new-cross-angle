import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const EstimatorModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/estimator" || location.pathname === "/admin/estimator/") {
        return <Navigate to="/admin/estimator/estimate-leads" replace />;
    }

    return (
        <ModuleLayout
            title="Quotes & Estimates"
            description="Create, send, and track project quotes. Manage pricing tiers and estimation settings."
            tabs={[
                { label: "Quote Requests", path: "/admin/estimator/estimate-leads", group: "Quotes" },
                { label: "Pricing & Settings", path: "/admin/estimator/config", group: "Configuration" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default EstimatorModule;

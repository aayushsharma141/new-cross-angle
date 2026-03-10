import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const EstimatorModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/estimator" || location.pathname === "/admin/estimator/") {
        return <Navigate to="/admin/estimator/leads" replace />;
    }

    return (
        <ModuleLayout
            title="Estimator Engine"
            description="Manage pricing configurations and incoming project estimates."
            tabs={[
                { label: "Lead Management", path: "/admin/estimator/leads" },
                { label: "Rate Management", path: "/admin/estimator/rates" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

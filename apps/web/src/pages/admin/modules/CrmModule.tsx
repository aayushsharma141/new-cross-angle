import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const CrmModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/crm" || location.pathname === "/admin/crm/") {
        return <Navigate to="/admin/crm/leads" replace />;
    }

    return (
        <ModuleLayout
            title="CRM & Leads"
            description="Manage your sales pipeline and incoming inquiries."
            tabs={[
                { label: "Leads Pipeline", path: "/admin/crm/leads" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

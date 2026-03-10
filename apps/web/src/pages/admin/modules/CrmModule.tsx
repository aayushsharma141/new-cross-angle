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
            description="Manage your sales pipeline, incoming inquiries, and user database."
            tabs={[
                { label: "Leads Pipeline", path: "/admin/crm/leads" },
                { label: "User Management", path: "/admin/crm/users" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

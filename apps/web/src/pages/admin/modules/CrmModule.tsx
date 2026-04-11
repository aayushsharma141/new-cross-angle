import { lazy, Suspense } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

const CrmAnalytics = lazy(() => import("@/pages/admin/CrmAnalytics"));

export const CrmModule = () => {
  const location = useLocation();

  // Redirect bare /admin/crm to /admin/crm/leads
  if (location.pathname === "/admin/crm" || location.pathname === "/admin/crm/") {
    return <Navigate to="/admin/crm/leads" replace />;
  }

  return (
    <ModuleLayout
      title="CRM & Lead Pipeline"
      description="Track leads, manage your sales pipeline, and monitor deal health."
      tabs={[
        { label: "Pipeline", path: "/admin/crm/leads" },
        { label: "Analytics", path: "/admin/crm/analytics" },
      ]}
    >
      {location.pathname.startsWith("/admin/crm/analytics") ? (
        <Suspense fallback={<PageSkeleton />}>
          <CrmAnalytics />
        </Suspense>
      ) : (
        <Outlet />
      )}
    </ModuleLayout>
  );
};

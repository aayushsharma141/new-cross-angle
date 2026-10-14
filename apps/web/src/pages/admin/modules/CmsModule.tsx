import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";
import { getModuleSections } from "@/lib/admin/moduleNav";

export const CmsModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/cms" || location.pathname === "/admin/cms/") {
        return <Navigate to="/admin/cms/portfolio" replace />;
    }
    // NOTE: there was a redirect here sending /admin/cms/media-library to the
    // visual-media hub, guarded by `!location.search`. Nothing in the app ever
    // links to media-library with a query string — not the "Media Uploader"
    // entry in moduleNav, not the Visual Media Hub's own card, not useHubStats,
    // not DiscoveryMediaSlot — so the guard never passed and AdminMedia was
    // unreachable from everywhere in the UI. adminRoutes.tsx already forwards
    // the genuine legacy paths (/admin/media, /admin/media-library) here, and
    // this bounced them straight back out again.
    // Guarded by src/test/admin-cms-routing.test.ts.

    return (
        <ModuleLayout
            title="Content Management System"
            description="Manage all website content: projects, blog posts, images, videos, and team profiles."
            tabs={getModuleSections("cms")}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default CmsModule;

import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const CmsModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/cms" || location.pathname === "/admin/cms/") {
        return <Navigate to="/admin/cms/portfolio" replace />;
    }

    return (
        <ModuleLayout
            title="Content Management"
            description="Manage all dynamic content and pages across your website."
            tabs={[
                { label: "Portfolio", path: "/admin/cms/portfolio" },
                { label: "Blogs", path: "/admin/cms/blogs" },
                { label: "Services", path: "/admin/cms/services" },
                { label: "Testimonials", path: "/admin/cms/testimonials" },
                { label: "Team Members", path: "/admin/cms/team" },
                { label: "Media", path: "/admin/cms/media" },
                { label: "Hero Media", path: "/admin/cms/hero" },
                { label: "Gallery", path: "/admin/cms/gallery" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

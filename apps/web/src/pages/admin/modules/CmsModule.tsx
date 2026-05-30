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
            description="Create, edit, and publish all website content — from portfolio showcases to testimonials and team profiles."
            tabs={[
                { label: "Portfolio", path: "/admin/cms/portfolio" },
                { label: "Blog Posts", path: "/admin/cms/blog-posts" },
                { label: "Services", path: "/admin/cms/services" },
                { label: "Testimonials", path: "/admin/cms/testimonials" },
                { label: "Before & After", path: "/admin/cms/before-and-after" },
                { label: "Team Members", path: "/admin/cms/team-members" },
                { label: "Media Library", path: "/admin/cms/media-library" },
                { label: "Hero Carousel", path: "/admin/cms/hero-carousel" },
                { label: "Gallery", path: "/admin/cms/gallery" },
                { label: "Studio Statistics", path: "/admin/cms/studio-statistics" },
                { label: "Milestones", path: "/admin/cms/milestones" },
                { label: "Process Steps", path: "/admin/cms/process-steps" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

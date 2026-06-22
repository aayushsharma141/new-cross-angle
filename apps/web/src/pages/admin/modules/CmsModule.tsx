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
                { label: "Portfolio", path: "/admin/cms/portfolio", group: "Content" },
                { label: "Blog Posts", path: "/admin/cms/blog-posts", group: "Content" },
                { label: "Services", path: "/admin/cms/services", group: "Content" },
                { label: "Testimonials", path: "/admin/cms/testimonials", group: "Content" },
                { label: "Gallery", path: "/admin/cms/gallery", group: "Content" },

                { label: "Media Library", path: "/admin/cms/media-library", group: "Media" },
                { label: "Site Assets", path: "/admin/cms/site-assets", group: "Media" },
                { label: "Before & After", path: "/admin/cms/before-and-after", group: "Media" },

                { label: "Hero Carousel", path: "/admin/cms/hero-carousel", group: "Engagement" },
                { label: "Process Steps", path: "/admin/cms/process-steps", group: "Engagement" },
                { label: "Milestones", path: "/admin/cms/milestones", group: "Engagement" },

                { label: "Team Members", path: "/admin/cms/team-members", group: "Team" }
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default CmsModule;

import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const CmsModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/cms" || location.pathname === "/admin/cms/") {
        return <Navigate to="/admin/cms/portfolio" replace />;
    }

    return (
        <ModuleLayout
            title="Content Management System"
            description="Manage all website content: projects, blog posts, images, videos, and team profiles."
            tabs={[
                { label: "Projects", path: "/admin/cms/portfolio", group: "Main Content" },
                { label: "Blog Posts", path: "/admin/cms/blog-posts", group: "Main Content" },
                { label: "Services", path: "/admin/cms/services", group: "Main Content" },
                { label: "Testimonials", path: "/admin/cms/testimonials", group: "Main Content" },
                { label: "Team Members", path: "/admin/cms/team-members", group: "Main Content" },

                { label: "Images & Videos", path: "/admin/cms/media-library", group: "Visual Media" },
                { label: "Project Gallery", path: "/admin/cms/gallery", group: "Visual Media" },
                { label: "Before & After", path: "/admin/cms/before-and-after", group: "Visual Media" },
                { label: "Hero Section", path: "/admin/cms/hero-carousel", group: "Visual Media" },

                { label: "Process Steps", path: "/admin/cms/process-steps", group: "Page Sections" },
                { label: "Milestones", path: "/admin/cms/milestones", group: "Page Sections" },

                { label: "Static Resources", path: "/admin/cms/site-assets", group: "Resources" }
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default CmsModule;

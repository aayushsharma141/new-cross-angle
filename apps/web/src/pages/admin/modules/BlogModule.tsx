import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const BlogModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/blog" || location.pathname === "/admin/blog/") {
        return <Navigate to="/admin/blog/overview" replace />;
    }

    return (
        <ModuleLayout
            title="Blog & SEO Analytics"
            description="Track blog article performance, reader engagement, and search engine rankings."
            tabs={[
                { label: "Overview", path: "/admin/blog/overview", group: "Analytics" },
                { label: "Article Performance", path: "/admin/blog/article-performance", group: "Analytics" },
                { label: "Reader Engagement", path: "/admin/blog/reader-engagement", group: "Analytics" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default BlogModule;

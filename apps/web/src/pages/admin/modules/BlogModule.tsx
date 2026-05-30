import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";

export const BlogModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/blog" || location.pathname === "/admin/blog/") {
        return <Navigate to="/admin/blog/overview" replace />;
    }

    return (
        <ModuleLayout
            title="Blog Analytics"
            description="Track content performance, reader engagement, and article-level analytics across your blog."
            tabs={[
                { label: "Overview", path: "/admin/blog/overview" },
                { label: "Article Performance", path: "/admin/blog/article-performance" },
                { label: "Reader Engagement", path: "/admin/blog/reader-engagement" },
            ]}
        >
            <Outlet />
        </ModuleLayout>
    );
};

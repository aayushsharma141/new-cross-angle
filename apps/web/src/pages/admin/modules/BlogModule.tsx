import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";
import { getModuleSections } from "@/lib/admin/moduleNav";

export const BlogModule = () => {
    const location = useLocation();
    if (location.pathname === "/admin/blog" || location.pathname === "/admin/blog/") {
        return <Navigate to="/admin/blog/overview" replace />;
    }

    return (
        <ModuleLayout
            title="Blog & SEO Analytics"
            description="Track blog article performance, reader engagement, and search engine rankings."
            tabs={getModuleSections("blog")}
        >
            <Outlet />
        </ModuleLayout>
    );
};

export default BlogModule;

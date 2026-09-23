import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface ModuleTab {
    label: string;
    path: string;
    group?: string;
}

interface ModuleBreadcrumbProps {
    moduleTitle: string;
    tabs?: ModuleTab[];
}

export const ModuleBreadcrumb = ({ moduleTitle, tabs }: ModuleBreadcrumbProps) => {
    const location = useLocation();

    // Find the current active tab
    const activeTab = tabs?.find(tab => {
        const currentFullPath = location.pathname + location.search;
        return tab.path.includes('?')
            ? currentFullPath === tab.path
            : (location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`));
    });

    if (!activeTab) return null;

    return (
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--admin-muted))] mb-4">
            <Link
                to="/admin"
                className="hover:text-[hsl(var(--admin-text))] transition-colors"
                title="Back to Admin Hub"
            >
                Admin
            </Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-[hsl(var(--admin-text))] font-medium">
                {moduleTitle}
            </span>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-[hsl(var(--admin-text))]">
                {activeTab.label}
            </span>
        </div>
    );
};

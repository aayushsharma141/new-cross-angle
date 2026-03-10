import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

interface ModuleTab {
    label: string;
    path: string;
}

interface ModuleLayoutProps {
    title: string;
    description: string;
    tabs?: ModuleTab[];
    children: React.ReactNode;
}

export const ModuleLayout = ({ title, description, tabs, children }: ModuleLayoutProps) => {
    const location = useLocation();

    // Find the currently active tab to display in the breadcrumb
    const activeTab = tabs?.find(tab => location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`));

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Module Header */}
            <div className="flex flex-col space-y-4">
                <AdminBreadcrumb
                    items={[
                        { label: "Admin Hub", href: "/admin" },
                        { label: title, href: tabs && tabs.length > 0 ? tabs[0].path : undefined },
                        ...(activeTab ? [{ label: activeTab.label }] : [])
                    ]}
                />
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">{title}</h2>
                    <p className="text-slate-400 mt-1">{description}</p>
                </div>
            </div>

            {/* Tabs Layout */}
            {tabs && tabs.length > 0 && (
                <div className="border-b border-white/10">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => {
                            // Determine active state: exact match or perfect sub-route match
                            const isActive = location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);

                            return (
                                <Link
                                    key={tab.path}
                                    to={tab.path}
                                    className={cn(
                                        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                        isActive
                                            ? "border-emerald-500 text-emerald-400"
                                            : "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/20"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 mt-6">
                {children}
            </div>
        </div>
    );
};

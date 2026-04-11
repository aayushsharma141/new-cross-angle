import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Module Header */}
            <div className="flex flex-col space-y-4">
                <div>
                    <h2 className="text-3xl font-serif text-white tracking-tight">{title}</h2>
                    <p className="text-zinc-500 mt-1">{description}</p>
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
                                        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all",
                                        isActive
                                            ? "border-admin-accent text-admin-accent"
                                            : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-white/20"
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

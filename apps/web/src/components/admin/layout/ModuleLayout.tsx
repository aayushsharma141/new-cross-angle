import React, { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { breadcrumbsForPath } from "@/lib/admin-routes";

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

/* ─── Action slot portal ─────────────────────────────────────────────────
 * The module header renders a hidden div as the action target. Child pages
 * render `<ModuleActions>{...}</ModuleActions>` and their content is portaled
 * into the header's right-aligned slot. Using a portal (not state) sidesteps
 * the reference-equality infinite-re-render problem that would come from
 * passing JSX through React Context.
 * ────────────────────────────────────────────────────────────────────── */
const ModuleActionsSlotContext = createContext<HTMLDivElement | null>(null);

export function ModuleActions({ children }: { children: React.ReactNode }) {
    const target = useContext(ModuleActionsSlotContext);
    if (!target) return null;
    return createPortal(children, target);
}

export const ModuleLayout = ({ title, description, tabs, children }: ModuleLayoutProps) => {
    const location = useLocation();
    const [slotEl, setSlotEl] = useState<HTMLDivElement | null>(null);
    const breadcrumbs = breadcrumbsForPath(location.pathname);

    return (
        <ModuleActionsSlotContext.Provider value={slotEl}>
            <div className="flex flex-col h-full space-y-8">
                {/* Module title + description + right-aligned actions slot */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-6 border-b border-[hsl(var(--admin-border))]/50">
                    <div className="min-w-0">
                        <h1 className="admin-title text-2xl">{title}</h1>
                        <p className="admin-subtitle mt-2 text-sm">{description}</p>
                    </div>
                    <div
                        ref={setSlotEl}
                        className="flex items-center gap-2 shrink-0 empty:hidden"
                    />
                </div>

                {/* Tabs */}
                {tabs && tabs.length > 0 && (
                    <div className="border-b border-admin-border">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const isActive =
                                    location.pathname === tab.path ||
                                    location.pathname.startsWith(`${tab.path}/`);

                                return (
                                    <Link
                                        key={tab.path}
                                        to={tab.path}
                                        className={cn(
                                            "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all",
                                            isActive
                                                ? "border-admin-primary text-admin-primary"
                                                : "border-transparent text-admin-muted hover:text-admin-text hover:border-admin-border",
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
                <div className="flex-1">{children}</div>
            </div>
        </ModuleActionsSlotContext.Provider>
    );
};

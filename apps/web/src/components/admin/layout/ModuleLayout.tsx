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
    description?: string;
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
            <div className="flex-1 flex h-full min-h-0 bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-text))]">
                {/* Desktop Sidebar */}
                {tabs && tabs.length > 0 && (
                    <aside className="w-[220px] shrink-0 border-r border-[hsl(var(--admin-border))]/50 py-3 px-2 hidden lg:flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                        <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.16em] text-admin-text-subtle font-semibold mt-2">
                            Navigation
                        </div>
                        <nav className="flex flex-col gap-1" aria-label="Module section navigation">
                            {tabs.map((tab) => {
                                const isActive =
                                    location.pathname === tab.path ||
                                    location.pathname.startsWith(`${tab.path}/`);

                                return (
                                    <Link
                                        key={tab.path}
                                        to={tab.path}
                                        className={cn(
                                            "flex items-center justify-between px-3 h-9 rounded-md text-[13px] transition-all duration-200 border relative overflow-hidden",
                                            isActive
                                                ? "bg-[hsl(var(--admin-primary)/0.1)] border-[hsl(var(--admin-primary)/0.25)] text-admin-primary font-bold shadow-[0_0_12px_hsl(var(--admin-primary)/0.05)] before:absolute before:left-0 before:top-[15%] before:bottom-[15%] before:w-[3px] before:rounded-r-md before:bg-admin-primary"
                                                : "border-transparent text-admin-text-muted hover:bg-[hsl(var(--admin-surface))] hover:text-admin-text"
                                        )}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                )}

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Header with Title and Description */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between px-6 py-5 border-b border-[hsl(var(--admin-border))]/50 bg-[hsl(var(--admin-background))]/50 shrink-0">
                        <div className="min-w-0">
                            <h1 className="admin-title text-2xl">{title}</h1>
                            {description && <p className="admin-subtitle mt-2 text-sm">{description}</p>}
                        </div>
                        <div
                            ref={setSlotEl}
                            className="flex items-center gap-2 shrink-0 empty:hidden mt-4 md:mt-0"
                        />
                    </div>
                    {/* Content Area */}
                    <div className="flex-1 overflow-auto">
                        <div className="px-4 sm:px-6 md:px-8 py-6">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </ModuleActionsSlotContext.Provider>
    );
};

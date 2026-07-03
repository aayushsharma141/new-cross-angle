import React, { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
interface ModuleTab {
    label: string;
    path: string;
    group?: string;
}

interface ModuleLayoutProps {
    title: string;
    description?: string;
    tabs?: ModuleTab[];
    sidebar?: React.ReactNode;
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

export const ModuleLayout = ({ title, description, tabs, sidebar, children }: ModuleLayoutProps) => {
    const location = useLocation();
    const [slotEl, setSlotEl] = useState<HTMLDivElement | null>(null);

    return (
        <ModuleActionsSlotContext.Provider value={slotEl}>
            <div className="flex-1 bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-text))] h-full min-h-0 flex flex-col lg:grid lg:grid-cols-[260px_1fr] lg:grid-rows-1">
                

                {/* --- Grid Layout for Desktop, Flex for Mobile --- */}
                
                {/* 3. Sidebar Nav (Bottom Left on Desktop, Hidden on Mobile) */}
                <aside className="hidden lg:flex flex-col justify-between border-r border-[hsl(var(--admin-border))]/50 py-6 px-5 overflow-y-auto custom-scrollbar">
                    {sidebar ? (
                        sidebar
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Navigation */}
                            {tabs && tabs.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.16em] text-admin-text-subtle font-semibold">
                                        Sections
                                    </div>
                                    <nav className="flex flex-col gap-3" aria-label="Module section navigation">
                                        {(() => {
                                            const groupedTabs = tabs.reduce((acc, tab) => {
                                                const group = tab.group || "default";
                                                if (!acc[group]) acc[group] = [];
                                                acc[group].push(tab);
                                                return acc;
                                            }, {} as Record<string, ModuleTab[]>);

                                            return Object.entries(groupedTabs).map(([group, groupTabs]) => (
                                                <div key={group} className="flex flex-col gap-1">
                                                    {group !== "default" && (
                                                        <div className="px-2 pb-1 pt-2 text-[10px] uppercase tracking-[0.16em] text-admin-text-subtle/70 font-bold">
                                                            {group}
                                                        </div>
                                                    )}
                                                    {groupTabs.map(tab => {
                                                        const currentFullPath = location.pathname + location.search;
                                                        const isActive = tab.path.includes('?')
                                                            ? currentFullPath === tab.path
                                                            : (location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`));

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
                                                </div>
                                            ));
                                        })()}
                                    </nav>
                                </div>
                            )}
                        </div>
                    )}


                </aside>

                {/* Right side area: Top header + Main content */}
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    {/* Desktop Top Header (Merged Logo + Title) */}
                    <div className="hidden lg:flex items-center justify-between border-b border-[hsl(var(--admin-border))]/50 bg-[hsl(var(--admin-background))]/50 px-7 py-5 flex-none">
                        <div className="flex items-center gap-6 min-w-0">
                            {/* Title and Description */}
                            <div className="flex items-baseline gap-3 min-w-0">
                                <h1 className="admin-title text-2xl md:text-3xl tracking-tight shrink-0">{title}</h1>
                                {description && (
                                    <p className="admin-subtitle text-sm md:text-base opacity-80 italic truncate">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions Slot */}
                        <div
                            ref={setSlotEl}
                            className="flex items-center gap-2 shrink-0 empty:hidden"
                        />
                    </div>

                    {/* 4. Main Content Area (Bottom Right on Desktop, Bottom on Mobile) */}
                    <main className="flex-1 min-w-0 overflow-auto relative custom-scrollbar">
                        <div className="px-4 lg:px-8 py-4 lg:py-6 w-full min-h-full flex flex-col mx-auto">
                            {children}
                        </div>
                    </main>
                </div>

            </div>
        </ModuleActionsSlotContext.Provider>
    );
};

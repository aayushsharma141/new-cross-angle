import React, { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { breadcrumbsForPath } from "@/lib/admin-routes";
import { User, LogOut, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/primitives/avatar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useAdminDisplayName } from "@/hooks/useAdminDisplayName";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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
    const { settings } = useSiteSettings();
    const logoUrl = settings?.company_logo_url || settings?.logo_light_url || '/logo-icon.png';
    const navigate = useNavigate();
    const [slotEl, setSlotEl] = useState<HTMLDivElement | null>(null);
    const breadcrumbs = breadcrumbsForPath(location.pathname);

    const { user, logout, role, isLoading } = useAdminAuth();
    const { can } = usePermissions();
    const { displayName, initials } = useAdminDisplayName();
    const roleLabel = isLoading ? "Loading Role" : role ? ROLE_LABELS[role] : "No Role";
    const avatarSeed = encodeURIComponent(displayName || user?.email || "admin");

    return (
        <ModuleActionsSlotContext.Provider value={slotEl}>
            <div className="flex-1 bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-text))] h-full min-h-0 flex flex-col lg:grid lg:grid-cols-[260px_1fr] lg:grid-rows-[auto_1fr]">
                
                {/* Mobile Top Header (Hidden on Desktop) */}
                <header className="lg:hidden flex-none px-6 h-14 border-b border-[hsl(var(--admin-border))]/40 bg-admin-surface/40 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to={ADMIN_ROUTES.hub.path}
                            className="flex items-center gap-2 text-admin-text-muted hover:text-admin-text text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md hover:bg-admin-surface/50 border border-admin-border/30 transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Hub</span>
                        </Link>
                        <div className="h-4 w-px bg-admin-border/40" />
                        <Link to={ADMIN_ROUTES.hub.path} className="flex items-center gap-3 group">
                            <img src={logoUrl} alt="CrossAngle Logo" className="w-12 h-12 object-contain" />
                            <div className="flex flex-col justify-center">
                                <span className="text-lg text-admin-text uppercase tracking-[0.08em] font-extrabold leading-none">CrossAngle</span>
                                <span className="text-[11px] text-admin-primary uppercase tracking-[0.16em] font-medium block mt-1">Intelligence</span>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* --- Grid Layout for Desktop, Flex for Mobile --- */}
                
                {/* Desktop Top Header (Merged Logo + Title) */}
                <div className="hidden lg:flex col-span-2 items-center justify-between border-b border-[hsl(var(--admin-border))]/50 bg-[hsl(var(--admin-background))]/50 px-7 py-5">
                    <div className="flex items-center gap-6 min-w-0">
                        {/* Logo */}
                        <Link to={ADMIN_ROUTES.hub.path} className="flex items-center gap-3 group shrink-0">
                            <img src={logoUrl} alt="CrossAngle Logo" className="w-12 h-12 object-contain" />
                            <div className="flex flex-col justify-center">
                                <span className="text-lg text-admin-text uppercase tracking-[0.08em] font-extrabold leading-none">CrossAngle</span>
                                <span className="text-[11px] text-admin-primary uppercase tracking-[0.16em] font-medium block mt-1">Intelligence</span>
                            </div>
                        </Link>

                        {/* Divider */}
                        <div className="h-8 w-px bg-admin-border/40 shrink-0" />

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

                {/* 3. Sidebar Nav (Bottom Left) */}
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

                    {/* Back to Hub (Bottom) */}
                    <div className="mt-6">
                        <Link
                            to={ADMIN_ROUTES.hub.path}
                            className="flex items-center justify-center gap-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface/50 border border-admin-border/30 rounded-md px-3 py-2.5 transition-all w-full group"
                            title="Back to Hub"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-semibold tracking-wide uppercase">Back to Hub</span>
                        </Link>
                    </div>
                </aside>

                {/* 4. Main Content Area (Bottom Right on Desktop, Bottom on Mobile) */}
                <main className="flex-1 min-w-0 overflow-auto relative custom-scrollbar">
                    <div className="px-4 lg:px-8 py-4 lg:py-6 w-full min-h-full flex flex-col mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </ModuleActionsSlotContext.Provider>
    );
};

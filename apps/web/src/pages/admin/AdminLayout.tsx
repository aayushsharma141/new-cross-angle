import { useCallback, useEffect, useState, type JSX } from "react";
import { Outlet, Navigate, useLocation, Link } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { TopBar } from "@/components/admin/TopBar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import {
    KeyboardShortcutsOverlay,
    useKeyboardShortcutsHelp,
} from "@/components/admin/KeyboardShortcutsOverlay";
import { AdminRouteErrorBoundary } from "@/components/admin/AdminRouteErrorBoundary";
import { Database, Loader2, Bell, Activity, Shield, RefreshCw, type LucideIcon } from "lucide-react";
import { useHubStats, formatStorage } from "@/hooks/useHubStats";
import { useSystem } from "@/context/SystemContext";
import { cn } from "@/lib/utils";
import { SkipNav } from "@/components/ui/enhanced/SkipNav";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { captureException } from "@/lib/sentry";
import { useToast } from "@/hooks/useToast";

const KpiChip = ({ icon: Icon, label, value, href, variant = "default" }: { icon: LucideIcon, label: string, value: string, href: string, variant?: "default" | "warning" | "success" | "muted" }) => {
    const hasAction = variant === "warning";
    const iconClass = cn(
        "relative flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-300",
        variant === "warning" && "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
        variant === "success" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        variant === "default" && "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary))]/20",
        variant === "muted" && "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-muted))] border-[hsl(var(--admin-border))]"
    );
    return (
        <Link
            to={href}
            className={cn(
                "group flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-200 hover:bg-[hsl(var(--admin-primary))]/5",
                hasAction && "ring-1 ring-amber-500/20 hover:ring-amber-500/40"
            )}
            title={`Go to ${label}`}
        >
            <div className={iconClass}>
                <Icon className={cn("w-3.5 h-3.5", hasAction && "animate-pulse")} />
                {hasAction && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 border border-[hsl(var(--admin-surface))]" />
                )}
            </div>
            <div className="flex flex-col gap-0 items-start leading-none">
                <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--admin-muted))] font-bold">{label}</span>
                <span className={cn(
                    "text-[11px] font-bold transition-colors",
                    hasAction ? "text-amber-400 group-hover:text-amber-300" : "text-[hsl(var(--admin-text))] group-hover:text-[hsl(var(--admin-primary))]"
                )}>
                    {value}
                </span>
            </div>
        </Link>
    );
};


const AdminLayout = (): JSX.Element | null => {
    const { isAuthenticated, isLoading, role, logout } = useAdminAuth();
    const { can } = usePermissions();
    const location = useLocation();

    const [paletteOpen, setPaletteOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const [roleTimeout, setRoleTimeout] = useState(false);
    const { settings, refetch: refetchSettings } = useSiteSettings();
    const maintenanceMode = settings?.maintenance_mode_active || false;
    const { toast } = useToast();

    const { health, refreshHealth } = useSystem();
    const { stats, isRefreshing, refresh } = useHubStats();

    const toggleShortcuts = useCallback(() => {
        setShortcutsOpen((prev) => !prev);
    }, []);

    const handleRefresh = () => {
        refreshHealth();
        void refresh();
    };
    useKeyboardShortcutsHelp(toggleShortcuts);

    const handleDeactivateMaintenance = async () => {
        if (!settings?.id) return;
        try {
            const { error } = await supabase
                .from("site_settings")
                .update({ maintenance_mode_active: false })
                .eq("id", settings.id);
            if (error) throw error;
            await refetchSettings();
            toast({ title: "Maintenance Mode Disabled", description: "The site is now live." });
        } catch (err) {
            console.error(err);
            captureException(err, { tags: { area: "admin-layout", action: "deactivate-maintenance" } });
            toast({ title: "Error", description: "Failed to disable maintenance mode.", variant: "destructive" });
        }
    };

    // Grace period: wait up to 10s for role to resolve after auth loads.
    // Extended from 6s to accommodate retry logic in AuthProvider.
    useEffect(() => {
        if (!isLoading && isAuthenticated && !role) {
            const t = setTimeout(() => setRoleTimeout(true), 10000);
            return () => clearTimeout(t);
        }
        if (role) setRoleTimeout(false);
    }, [isLoading, isAuthenticated, role]);

    // Manual retry: clear role cache and reload the page
    const handleRetryRole = useCallback(() => {
        // Clear all cached roles from sessionStorage
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('user_role_')) sessionStorage.removeItem(key);
        });
        setRoleTimeout(false);
        window.location.reload();
    }, []);

    // 1. Auth still loading — show branded loader to prevent blank flash
    if (isLoading || (!role && !roleTimeout)) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[hsl(var(--admin-background))] admin-theme gap-4">
                <Loader2 className="w-7 h-7 text-[hsl(var(--admin-primary))] animate-spin" />
                <p className="text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--admin-muted))] font-medium">
                    Verifying access…
                </p>
            </div>
        );
    }

    // 2. No session — redirect to login
    if (!isAuthenticated) return <Navigate to="/admin/auth" replace />;

    // 3. Authenticated but role failed to resolve — show retry screen instead of redirect loop
    if (role !== "super_admin" && role !== "admin" && role !== "viewer") {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[hsl(var(--admin-background))] admin-theme gap-6 px-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-serif text-[hsl(var(--admin-text))]">Role Verification Failed</h2>
                    <p className="text-sm text-[hsl(var(--admin-muted))] max-w-md">
                        Your admin role could not be verified. This can happen with slow connections or cold server starts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRetryRole}
                        className="px-6 py-2.5 bg-[hsl(var(--admin-primary))] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm"
                    >
                        Retry Verification
                    </button>
                    <button
                        onClick={logout}
                        className="px-6 py-2.5 border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-muted))] rounded-xl hover:text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-text))]/30 transition-colors text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    const isAdminHub = location.pathname === "/admin" || location.pathname === "/admin/";
    const isFullWidth = isAdminHub || location.pathname.startsWith("/admin/crm") || location.pathname.startsWith("/admin/cms") || location.pathname.startsWith("/admin/blog") || location.pathname.startsWith("/admin/estimate") || location.pathname.startsWith("/admin/estimator") || location.pathname.startsWith("/admin/discovery") || location.pathname.startsWith("/admin/dashboard") || location.pathname.startsWith("/admin/system") || location.pathname.startsWith("/admin/user-access");
    return (
        <div className="h-screen max-h-screen flex flex-col bg-admin-bg admin-theme overflow-hidden">
            <SkipNav targetId="admin-main" />
            {/* Premium Top Navigation */}
            {isAdminHub && <TopBar />}

            {/* Global Maintenance Mode Banner — persists on every admin page */}
            {maintenanceMode && (
                <div className="flex-none bg-red-950/50 border-b border-red-500/25 text-red-400 text-xs px-6 py-2.5 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <strong className="font-semibold">⚠️ GLOBAL MAINTENANCE MODE ACTIVE:</strong>
                        <span className="hidden sm:inline">Public visitors are redirected to the Offline System Notice page. Admins bypass this restriction.</span>
                    </div>
                    <button
                        onClick={handleDeactivateMaintenance}
                        className="text-red-400 hover:text-white hover:bg-red-500/20 text-xs font-semibold px-3 py-1 rounded-md transition-colors ml-4 shrink-0"
                    >
                        Deactivate
                    </button>
                </div>
            )}

            <main id="admin-main" className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[hsl(var(--admin-background))]">
                <div className="flex-1 flex flex-col overflow-hidden min-h-0 animate-in fade-in zoom-in-95 duration-500">
                    {isFullWidth ? (
                        <AdminRouteErrorBoundary>
                            <Outlet />
                        </AdminRouteErrorBoundary>
                    ) : (
                        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 md:px-8 py-4">
                            <AdminRouteErrorBoundary>
                                <Outlet />
                            </AdminRouteErrorBoundary>
                        </div>
                    )}
                </div>
            </main>

            {/* ── Footer Status Bar ── */}
            <div className="flex-none w-full flex items-center justify-between gap-4 px-6 py-2.5 bg-admin-surface/90 backdrop-blur-md border-t border-admin-border/60 text-[11px] text-[hsl(var(--admin-muted))] shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-medium text-[hsl(var(--admin-text))]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Connected</span>
                    </div>
                    {/* Technical telemetry only for admins — trainees don't need it */}
                    {(role === 'super_admin' || role === 'admin') && (
                        <>
                            <span className="text-[hsl(var(--admin-border))] hidden sm:block">|</span>
                            <span className="flex items-center gap-1.5 hidden sm:flex">
                                <Database className="w-3 h-3 text-[hsl(var(--admin-primary))]" />
                                {formatStorage(stats.storageUsedGB)} of {stats.storageTotalGB}GB used
                            </span>
                        </>
                    )}
                </div>
                
                {/* ── KPI Action Strip (Moved from Hub) ── */}
                <div className="flex items-center gap-3 px-2 py-0.5 rounded-lg bg-[hsl(var(--admin-background))]/50 border border-[hsl(var(--admin-border))]/30 shadow-inner">
                    <KpiChip
                        icon={Bell}
                        label="Attention"
                        href="/admin/crm/leads?filter=new"
                        value={isRefreshing ? "…" : stats.newLeads > 0 ? `${stats.newLeads} Priority` : "All Clear"}
                        variant={stats.newLeads > 0 ? "warning" : "muted"}
                    />

                    <div className="h-4 w-px bg-[hsl(var(--admin-border))]/50" />

                    <KpiChip
                        icon={Activity}
                        label="Pulse"
                        href="/admin/dashboard"
                        value={isRefreshing ? "…" : `${stats.actionsToday} Activity`}
                        variant="default"
                    />

                    {can('settings', 'view') && (
                        <>
                            <div className="h-4 w-px bg-[hsl(var(--admin-border))]/50 hidden sm:block" />
                            <div className="hidden sm:block">
                                <KpiChip
                                    icon={Shield}
                                    label="Security"
                                    href="/admin/system/settings"
                                    value={health.status === "healthy" ? "Optimal" : "Check"}
                                    variant={health.status === "healthy" ? "success" : "warning"}
                                />
                            </div>
                        </>
                    )}

                    <div className="h-4 w-px bg-[hsl(var(--admin-border))]/50" />

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh dashboard metrics"
                        className="flex items-center justify-center h-6 w-6 rounded-md text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/10 transition-all disabled:opacity-50 border border-transparent hover:border-[hsl(var(--admin-primary))]/20"
                    >
                        <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
                    </button>
                </div>

                <div className="flex items-center gap-4 uppercase tracking-wider font-semibold">
                    {can('settings', 'view') && (
                        <Link to="/admin/system/settings" className="hover:text-[hsl(var(--admin-primary))] transition-colors">
                            Settings
                        </Link>
                    )}
                </div>
            </div>

            {/* Global command palette — registers Ctrl+K / Cmd+K keybind internally */}
            <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

            {/* Keyboard shortcuts discoverability overlay — bound to the ? key */}
            <KeyboardShortcutsOverlay open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
        </div>
    );
};

export default AdminLayout;

import { useCallback, useEffect, useState } from "react";
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
import { Database, Loader2 } from "lucide-react";
import { useHubStats, getModules, formatStorage } from "@/pages/admin/AdminHub";
import { useSystem } from "@/context/SystemContext";
import { useNavigate } from "react-router-dom";
import { SkipNav } from "@/components/ui/enhanced/SkipNav";

const AdminLayout = (): JSX.Element | null => {
    const { isAuthenticated, isLoading, role, logout } = useAdminAuth();
    const { can } = usePermissions();
    const location = useLocation();
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const [roleTimeout, setRoleTimeout] = useState(false);
    const { maintenanceMode, setMaintenanceMode } = useSystem();
    const navigate = useNavigate();

    const { stats } = useHubStats();
    const allModules = getModules(stats);
    const filteredModules = allModules.filter(
        (m) => !m.allowedRoles || (role && m.allowedRoles.includes(role))
    );

    const toggleShortcuts = useCallback(() => {
        setShortcutsOpen((prev) => !prev);
    }, []);
    useKeyboardShortcutsHelp(toggleShortcuts);

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

    const isFullWidth = location.pathname === "/admin" || location.pathname === "/admin/" || location.pathname.startsWith("/admin/crm");

    return (
        <div className="h-screen max-h-screen flex flex-col bg-admin-bg admin-theme overflow-hidden">
            <SkipNav targetId="admin-main" />
            {/* Premium Top Navigation */}
            <TopBar />

            {/* Global Maintenance Mode Banner — persists on every admin page */}
            {maintenanceMode && (
                <div className="flex-none bg-red-950/50 border-b border-red-500/25 text-red-400 text-xs px-6 py-2.5 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <strong className="font-semibold">⚠️ GLOBAL MAINTENANCE MODE ACTIVE:</strong>
                        <span className="hidden sm:inline">Public visitors are redirected to the Offline System Notice page. Admins bypass this restriction.</span>
                    </div>
                    <button
                        onClick={() => {
                            setMaintenanceMode(false);
                        }}
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
                            <span className="text-[hsl(var(--admin-border))] hidden sm:block">|</span>
                            <span className="hidden sm:block">{filteredModules.length} sections active</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4 uppercase tracking-wider font-semibold">
                    <span className="text-[hsl(var(--admin-text))]">CrossAngle</span>
                    {can('settings', 'view') && (
                        <>
                            <span className="text-[hsl(var(--admin-border))]">●</span>
                            <Link to="/admin/system/settings" className="hover:text-[hsl(var(--admin-primary))] transition-colors">
                                Settings
                            </Link>
                        </>
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

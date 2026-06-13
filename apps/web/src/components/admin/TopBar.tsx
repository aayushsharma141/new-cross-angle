import { User, LogOut, Settings } from "lucide-react";
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
import { useNavigate, Link } from "react-router-dom";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Admin top navigation. The breadcrumb trail lives on each page via
 * `<AdminPageHeader />`, which auto-derives it from `ADMIN_ROUTES`. TopBar
 * keeps only the brand mark, account menu, and logout — no route-aware
 * string matching, so it never drifts when routes change.
 */
export function TopBar() {
    const { user, logout, role, isLoading } = useAdminAuth();
    const { can } = usePermissions();
    const { displayName, initials } = useAdminDisplayName();
    const { settings } = useSiteSettings();
    const navigate = useNavigate();
    const logoUrl = settings?.company_logo_url || settings?.logo_light_url || '/logo-icon.png';
    const roleLabel = isLoading ? "Loading Role" : role ? ROLE_LABELS[role] : "No Role";
    const avatarSeed = encodeURIComponent(displayName || user?.email || "admin");

    return (
        <header className="sticky top-0 z-40 w-full border-b border-admin-border/50 bg-admin-surface/80 backdrop-blur-xl px-6 h-16 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-6">
                <Link to={ADMIN_ROUTES.hub.path} className="flex items-center gap-4 group">
                    <img src={logoUrl} alt="Company Logo" className="w-16 h-16 object-contain" />
                    <div className="flex flex-col justify-center">
                        <span className="text-xl text-admin-text uppercase tracking-[0.1em] font-extrabold leading-none pt-1">{settings?.studio_name || "CrossAngle"}</span>
                        <span className="text-[11px] text-admin-primary uppercase tracking-[0.2em] font-medium block mt-1 drop-shadow-[0_0_8px_hsl(var(--admin-primary)/0.35)]">Intelligence</span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 bg-admin-card/50 border border-admin-border rounded-full pl-1.5 pr-1.5 py-1.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 pl-1 pr-3 py-1 hover:bg-admin-surface rounded-full transition-all group border-0 focus-visible:ring-0">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-7 w-7 border border-admin-border shadow-xl group-hover:border-admin-primary/30 transition-all">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`} />
                                        <AvatarFallback className="bg-admin-surface text-admin-primary font-bold text-[11px]">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-[11px] font-bold text-admin-text leading-none tracking-tight">
                                            {displayName}
                                        </p>
                                        <p className="text-[11px] text-admin-muted uppercase tracking-widest mt-1 font-bold">
                                            {roleLabel}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 mt-3 bg-admin-card border-admin-border text-admin-text shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
                            align="end"
                        >
                            <DropdownMenuLabel className="text-[11px] uppercase tracking-widest text-admin-subtle px-3 py-2">
                                Admin Menu
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-admin-border" />
                            {can('settings', 'view') && (
                                <DropdownMenuItem
                                    className="cursor-pointer text-xs py-2 px-3 hover:bg-admin-surface focus:bg-admin-surface"
                                    onClick={() => navigate(ADMIN_ROUTES.systemSettings.path)}
                                >
                                    <Settings className="mr-3 h-3.5 w-3.5 text-admin-muted" /> Application settings
                                </DropdownMenuItem>
                            )}
                            {can('users', 'view') && (
                                <DropdownMenuItem
                                    className="cursor-pointer text-xs py-2 px-3 hover:bg-admin-surface focus:bg-admin-surface"
                                    onClick={() => navigate(ADMIN_ROUTES.userAccess.path)}
                                >
                                    <User className="mr-3 h-3.5 w-3.5 text-admin-muted" /> Account management
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-5 w-px bg-admin-border" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface-hover))] h-10 px-3 rounded-full transition-colors flex items-center gap-2 mr-1"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}

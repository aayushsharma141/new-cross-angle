import { User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import logoIcon from "@/assets/logo-icon.png";

const getDynamicBreadcrumbs = (pathname: string) => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] !== "admin" || parts.length === 1) return [{ label: "Admin Hub" }];

    const items: { label: string; href?: string }[] = [{ label: "Admin Hub", href: "/admin" }];

    if (parts[1] === "discovery") {
        items.push({ label: "Discovery Engine", href: undefined });
        if (parts[2] === "analytics") {
            items.push({ label: "Analytics & Insights", href: undefined });
        }
    } else if (parts[1] === "system" || parts[1] === "settings") {
        items.push({ label: "System Settings", href: "/admin/system/settings" });
        if (parts[2] === "audit") {
            items.push({ label: "Logs & Audit", href: undefined });
        }
    } else if (parts[1] === "access") {
        items.push({ label: "User Access", href: undefined });
    } else if (parts[1] === "crm") {
        items.push({ label: "Client CRM", href: undefined });
    } else if (parts[1] === "blog") {
        items.push({ label: "Blog Engine", href: undefined });
    } else {
        items.push({ label: parts[1].charAt(0).toUpperCase() + parts[1].slice(1), href: undefined });
    }

    return items;
};

export function TopBar() {
    const { user, logout, role, isLoading } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const roleLabel = isLoading ? "Loading Role" : role ? ROLE_LABELS[role] : "No Role";
    const breadcrumbItems = getDynamicBreadcrumbs(location.pathname);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl px-6 h-16 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-6">
                <Link to="/admin" className="flex items-center gap-3 group">
                    <img src={logoIcon} alt="CrossAngle Logo" className="w-8 h-8 object-contain" />
                    <div className="flex flex-col justify-center">
                        <span className="text-xl text-zinc-100 uppercase tracking-[0.1em] font-extrabold leading-none pt-1">CrossAngle</span>
                        <span className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 uppercase tracking-[0.2em] font-medium block mt-0.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">Intelligence</span>
                    </div>
                </Link>

                <div className="h-4 w-px bg-zinc-800 mx-2" />

                {/* Integration Breadcrumb */}
                <div className="hidden lg:block">
                    <AdminBreadcrumb items={breadcrumbItems} />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-full pl-1.5 pr-1.5 py-1.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 pl-1 pr-3 py-1 hover:bg-zinc-800 rounded-full transition-all group border-0 focus-visible:ring-0">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-7 w-7 border border-zinc-800 shadow-xl group-hover:-admin-primary/20 transition-all">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'admin'}`} />
                                        <AvatarFallback className="bg-zinc-800 -admin-primary font-bold text-[9px]">
                                            {user?.email?.charAt(0).toUpperCase() || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-[10px] font-bold text-zinc-200 leading-none tracking-tight">
                                            {user?.email?.split("@")[0] || "admin"}
                                        </p>
                                        <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-1 font-bold">
                                            {roleLabel}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mt-3 bg-zinc-900 border-zinc-800 text-zinc-200 shadow-[0_10px_50px_rgba(0,0,0,0.8)]" align="end">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 px-3 py-2">Admin Menu</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            {role === 'super_admin' && (
                                <DropdownMenuItem className="cursor-pointer text-xs py-2 px-3 hover:bg-zinc-800 focus:bg-zinc-800" onClick={() => navigate("/admin/system/settings")}>
                                    <Settings className="mr-3 h-3.5 w-3.5 text-zinc-500" /> Application settings
                                </DropdownMenuItem>
                            )}
                            {(role === 'super_admin' || role === 'admin') && (
                                <DropdownMenuItem className="cursor-pointer text-xs py-2 px-3 hover:bg-zinc-800 focus:bg-zinc-800" onClick={() => navigate("/admin/access")}>
                                    <User className="mr-3 h-3.5 w-3.5 text-zinc-500" /> Account management
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-5 w-px bg-zinc-800" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-3 rounded-full transition-colors flex items-center gap-2 mr-1"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}

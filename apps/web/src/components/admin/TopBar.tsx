import { Bell, User, LogOut, Settings, Moon, RefreshCw, Command } from "lucide-react";
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
import { icons } from "@/design-system/tokens/icons";
import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";

export function TopBar() {
    const { user, logout } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl px-6 h-16 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-6">
                <Link to="/admin" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 flex items-center justify-center p-2 rounded-xl -admin-primary/10 border -admin-primary/20 group-hover:-admin-primary/40 transition-all duration-300">
                        <img src={logoIcon} alt="CrossAngle Intelligence" className="w-full h-full object-contain brightness-0 invert opacity-80" />
                    </div>
                    <div className="hidden md:block">
                        <span className="text-[10px] text-zinc-300 uppercase tracking-[0.2em] font-bold block leading-none">CrossAngle</span>
                        <span className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 uppercase tracking-[0.2em] font-bold block mt-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">Intelligence</span>
                    </div>
                </Link>

                <div className="h-4 w-px bg-zinc-800 mx-2" />

                {/* Integration Breadcrumb */}
                <div className="hidden lg:block">
                    <AdminBreadcrumb />
                </div>
            </div>

            <div className="flex items-center gap-4">

                <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:-admin-primary hover:-admin-primary/5 h-9 w-9 rounded-xl transition-all">
                        <Moon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:-admin-primary hover:-admin-primary/5 h-9 w-9 rounded-xl transition-all">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:-admin-primary hover:-admin-primary/5 h-9 w-9 rounded-xl transition-all">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse" />
                    </Button>
                </div>

                <div className="h-6 w-px bg-zinc-800 mx-1" />

                {/* Operator Launcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 pl-1.5 pr-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full hover:-admin-primary/30 transition-all group">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-7 w-7 border border-zinc-800 shadow-xl group-hover:-admin-primary/20 transition-all">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'admin'}`} />
                                    <AvatarFallback className="bg-zinc-800 -admin-primary font-bold text-[9px]">
                                        {user?.email?.charAt(0).toUpperCase() || "A"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden sm:block">
                                    <p className="text-[10px] font-bold text-zinc-200 leading-none tracking-tight">
                                        {user?.email?.split("@")[0] || "operator.alpha"}
                                    </p>
                                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-1 font-bold">Admin</p>
                                </div>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mt-3 bg-zinc-900 border-zinc-800 text-zinc-200 shadow-[0_10px_50px_rgba(0,0,0,0.8)]" align="end">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 px-3 py-2">Operator Control</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="cursor-pointer text-xs py-2 px-3 hover:bg-zinc-800 focus:bg-zinc-800" onClick={() => navigate("/admin/system/settings")}>
                            <Settings className="mr-3 h-3.5 w-3.5 text-zinc-500" /> Application settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-xs py-2 px-3 hover:bg-zinc-800 focus:bg-zinc-800" onClick={() => navigate("/admin/system/team-members")}>
                            <User className="mr-3 h-3.5 w-3.5 text-zinc-500" /> Account management
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer text-xs py-2 px-3 transition-colors" onClick={logout}>
                            <LogOut className="mr-3 h-3.5 w-3.5" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

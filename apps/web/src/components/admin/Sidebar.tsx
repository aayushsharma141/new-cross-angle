
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FolderOpen,
    MessageSquare,
    Image as ImageIcon,
    Settings,
    PenTool,
    Star,
    ChevronRight,
    LogOut,
    Briefcase,
    FileText,
    Image,
    Users,
    Calculator,
    Percent,
    Shield
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Projects", href: "/admin/portfolio", icon: FolderOpen },
    { name: "Services", href: "/admin/services", icon: Briefcase },
    { name: "Blogs", href: "/admin/blogs", icon: FileText },
    { name: "Leads", href: "/admin/leads", icon: Users }, // Changed icon for Leads? Or keep Users for Team? Let's use Users for Team and maybe UserPlus or similar for Leads if needed, but existing is fine.
    // Actually, wait. Sidebar might have used Users for Leads if I didn't check. 
    // Let's check the view_file for Sidebar again to be sure what icon was used for Leads.
    // Ah, I can just append it and see.
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Media", href: "/admin/media", icon: Image },
    { name: "Team Management", href: "/admin/team", icon: Users },
    { name: "System Users", href: "/admin/users", icon: Shield },
    { name: "Cost Estimates", href: "/admin/estimate-leads", icon: Calculator },
    { name: "Rate Config", href: "/admin/estimate-rates", icon: Percent },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
    const location = useLocation();
    const { signOut } = useAuth();

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-sidebar))] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
                !open && "-translate-x-full"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Mobile Header (Close button usually here if needed) */}
                <div className="h-16 flex items-center px-6 lg:hidden">
                    <span className="font-display text-xl font-bold text-[hsl(var(--brand-primary))]">Cross Angle</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--admin-muted))]">
                        Main Menu
                    </div>

                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))]"
                                        : "text-[hsl(var(--admin-foreground))] hover:bg-[hsl(var(--admin-border))]"
                                )}
                                onClick={() => setOpen(false)}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0",
                                        isActive ? "text-[hsl(var(--brand-primary))]" : "text-[hsl(var(--admin-muted))] group-hover:text-[hsl(var(--admin-foreground))]"
                                    )}
                                />
                                <span className="flex-1">{item.name}</span>
                                {isActive && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info / Logout */}
                <div className="border-t border-[hsl(var(--admin-border))] p-4">
                    <button
                        onClick={() => signOut()}
                        className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--status-error))] hover:bg-red-50"
                    >
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}

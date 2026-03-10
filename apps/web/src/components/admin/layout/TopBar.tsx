import { Link } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/design-system/components/Button";
import { LogOut, Bell, Menu } from "lucide-react";
import { CommandMenu } from "./CommandMenu";
import { cn } from "@/lib/utils";

interface TopBarProps {
    onMenuToggle?: () => void;
}

export const TopBar = ({ onMenuToggle }: TopBarProps) => {
    const { logout, user } = useAdminAuth();

    const userEmail = user?.email ?? "Admin";
    const userInitial = (user?.user_metadata?.full_name as string | undefined)
        ? (user?.user_metadata?.full_name as string).charAt(0).toUpperCase()
        : userEmail.charAt(0).toUpperCase();
    const displayName =
        (user?.user_metadata?.full_name as string | undefined) ||
        userEmail.split("@")[0];

    return (
        <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Mobile hamburger */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-9 w-9 text-text-muted hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={onMenuToggle}
                    aria-label="Open navigation menu"
                >
                    <Menu className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex items-center gap-3">
                <CommandMenu />
                <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary h-9 w-9 relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-error rounded-full" />
                </Button>
                <div className="h-6 w-px bg-border mx-1" />

                {/* User Profile Pill */}
                <div className={cn(
                    "hidden md:flex items-center gap-2.5 pl-2 pr-4 py-1.5",
                    "bg-surface border border-border rounded-full",
                    "hover:border-primary/30 transition-colors group cursor-default"
                )}>
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
                        {userInitial}
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-text-primary leading-none text-xs">
                            {displayName}
                        </p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                            Administrator
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-error hover:text-error hover:bg-error-light h-9 w-9 ml-1"
                    onClick={logout}
                    title="Sign Out"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
};

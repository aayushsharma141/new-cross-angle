import { Bell, Search, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export function TopBar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/admin/auth");
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] px-6 shadow-sm">
            <div className="flex w-full items-center justify-between">
                {/* Left: Brand & Search */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="font-display text-xl font-bold text-[hsl(var(--brand-primary))]">
                            Cross Angle
                        </span>
                    </div>

                    <div className="relative hidden md:block w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(var(--admin-muted))]" />
                        <Input
                            type="search"
                            placeholder="Search projects, leads..."
                            className="w-full bg-[hsl(var(--admin-bg))] pl-9 focus-visible:ring-1 focus-visible:ring-[hsl(var(--brand-primary))]"
                        />
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-foreground))]">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[hsl(var(--status-error))]" />
                    </Button>

                    <div className="h-8 w-px bg-[hsl(var(--admin-border))]" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9 border border-[hsl(var(--admin-border))]">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} alt={user?.email || "Admin"} />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

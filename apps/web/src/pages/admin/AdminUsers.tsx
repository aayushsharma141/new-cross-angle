import { useState, useMemo, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Shield, UserPlus, Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@/components/admin/EmptyState";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { InviteUserDialog } from "@/components/admin/users/InviteUserDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, Ban, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    email: string | null;
    role: string | null;
    status: string | null;
    created_at: string | null;
    last_sign_in_at: string | null;
}

type UserAction = "suspend" | "unsuspend" | "delete";

interface ActionTarget {
    id: string;
    name: string;
    action: UserAction;
}

export default function AdminUsers(): JSX.Element {
    const [search, setSearch] = useState("");
    const [inviteOpen, setInviteOpen] = useState(false);
    const [actionUser, setActionUser] = useState<ActionTarget | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();

    const {
        data: users = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async (): Promise<AdminUser[]> => {
            const { data, error } = await supabase.rpc("get_admin_users");
            if (error) throw error;
            return (data as unknown as AdminUser[]) || [];
        },
    });

    const filteredUsers = useMemo(() => {
        const searchTerm = search.toLowerCase();
        return users.filter(
            (user) =>
                user.email?.toLowerCase().includes(searchTerm) ||
                user.full_name?.toLowerCase().includes(searchTerm)
        );
    }, [users, search]);

    const handleAction = async (): Promise<void> => {
        if (!actionUser) return;
        setActionLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("manage-user", {
                body: { action: actionUser.action, userId: actionUser.id },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            toast({
                title: "Success",
                description: `User ${actionUser.action}ed successfully.`,
            });
            refetch();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to perform action";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setActionLoading(false);
            setActionUser(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
            <AdminBreadcrumb items={[{ label: 'Users' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif text-white tracking-tight">Access Control</h1>
                    <p className="text-sm text-zinc-500 font-sans max-w-sm">Manage unit permissions and team authentication protocols.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setInviteOpen(true)} variant="primary" className="rounded-xl shadow-lg shadow-primary/20">
                        <UserPlus className={`${icons.sm} mr-2`} /> Invite User
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md p-4 rounded-2xl">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10 bg-black/40 border-zinc-700/50 focus:border-primary/50 transition-all rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No users found"
                    description={
                        search
                            ? "Try adjusting your search criteria"
                            : "Invite team members to collaborate on your projects"
                    }
                    primaryAction={{
                        label: "Invite User",
                        onClick: () => setInviteOpen(true),
                        icon: UserPlus,
                    }}
                />
            ) : (
                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar_url ?? undefined} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {(user.full_name || user.email || "U")
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {user.full_name || "Unknown"}
                                                </span>
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Mail className="mr-1 h-3 w-3" />
                                                    {user.email || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-primary" />
                                            <span className="capitalize text-zinc-400 font-medium">{user.role || "Viewer"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.status === "suspended" ? "destructive" : "secondary"
                                            }
                                            className={
                                                user.status === "active"
                                                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                    : ""
                                            }
                                        >
                                            {user.status === "suspended" ? "Suspended" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.created_at
                                            ? format(new Date(user.created_at), "MMM d, yyyy")
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => navigator.clipboard.writeText(user.id)}
                                                >
                                                    Copy ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {user.status === "suspended" ? (
                                                    <DropdownMenuItem
                                                        className="text-green-600"
                                                        onClick={() =>
                                                            setActionUser({
                                                                id: user.id,
                                                                name: user.full_name || user.email || "Unknown",
                                                                action: "unsuspend",
                                                            })
                                                        }
                                                    >
                                                        <Check className="mr-2 h-4 w-4" /> Unsuspend
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="text-orange-600"
                                                        onClick={() =>
                                                            setActionUser({
                                                                id: user.id,
                                                                name: user.full_name || user.email || "Unknown",
                                                                action: "suspend",
                                                            })
                                                        }
                                                    >
                                                        <Ban className="mr-2 h-4 w-4" /> Suspend
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() =>
                                                        setActionUser({
                                                            id: user.id,
                                                            name: user.full_name || user.email || "Unknown",
                                                            action: "delete",
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <InviteUserDialog
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                onSuccess={() => refetch()}
            />

            <AlertDialog
                open={!!actionUser}
                onOpenChange={(open) => !open && setActionUser(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will {actionUser?.action} <b>{actionUser?.name}</b>.
                            {actionUser?.action === "delete" &&
                                " This action cannot be undone."}
                            {actionUser?.action === "suspend" &&
                                " They will be unable to log in until unsuspended."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleAction();
                            }}
                            disabled={actionLoading}
                            className={
                                actionUser?.action === "delete" || actionUser?.action === "suspend"
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : ""
                            }
                        >
                            {actionLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Confirm {actionUser?.action}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

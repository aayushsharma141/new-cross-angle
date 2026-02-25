import { useState } from "react";
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
import { MoreHorizontal, Trash2, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
    const [search, setSearch] = useState("");
    const [inviteOpen, setInviteOpen] = useState(false);
    const [actionUser, setActionUser] = useState<{ id: string, name: string, action: 'suspend' | 'unsuspend' | 'delete' } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();

    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const { data, error } = await supabase.rpc("get_admin_users");
            if (error) throw error;
            return data;
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredUsers = users.filter((user: any) =>
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAction = async () => {
        if (!actionUser) return;
        setActionLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('manage-user', {
                body: { action: actionUser.action, userId: actionUser.id }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            toast({
                title: "Success",
                description: `User ${actionUser.action}ed successfully.`
            });
            refetch();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to perform action",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
            setActionUser(null);
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Users</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">Users</h2>
                    <p className="text-[hsl(var(--admin-muted))]">Manage team access and permissions.</p>
                </div>
                <Button onClick={() => setInviteOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Invite User
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9"
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
                    description={search ? "Try adjusting your search criteria" : "Invite team members to collaborate on your projects"}
                    primaryAction={{
                        label: "Invite User",
                        onClick: () => setInviteOpen(true),
                        icon: UserPlus
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
                            {filteredUsers.map((user: { id: string; avatar_url?: string; full_name?: string; email?: string; role?: string; status?: string; created_at?: string; last_sign_in_at?: string }) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {(user.full_name || user.email || "U").substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.full_name || "Unknown"}</span>
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
                                            <span className="capitalize">{user.role || "Viewer"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.status === 'suspended' ? 'destructive' : 'secondary'}
                                            className={user.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                                        >
                                            {user.status === 'suspended' ? 'Suspended' : 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "N/A"}
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
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                    Copy ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {user.status === 'suspended' ? (
                                                    <DropdownMenuItem
                                                        className="text-green-600"
                                                        onClick={() => setActionUser({ id: user.id, name: user.full_name || user.email, action: 'unsuspend' })}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Unsuspend
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="text-orange-600"
                                                        onClick={() => setActionUser({ id: user.id, name: user.full_name || user.email, action: 'suspend' })}
                                                    >
                                                        <Ban className="mr-2 h-4 w-4" /> Suspend
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setActionUser({ id: user.id, name: user.full_name || user.email, action: 'delete' })}
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

            <AlertDialog open={!!actionUser} onOpenChange={(open) => !open && setActionUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will {actionUser?.action} <b>{actionUser?.name}</b>.
                            {actionUser?.action === 'delete' && " This action cannot be undone."}
                            {actionUser?.action === 'suspend' && " They will be unable to log in until unsuspended."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleAction(); }}
                            disabled={actionLoading}
                            className={actionUser?.action === 'delete' || actionUser?.action === 'suspend' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                        >
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm {actionUser?.action}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

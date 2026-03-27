import { JSX, useMemo, useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
    CheckCircle2,
    Loader2,
    Mail,
    MoreHorizontal,
    Search,
    Shield,
    Trash2,
    UserCog,
    UserPlus,
    Users,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
    canManageRole,
    normalizeRole,
    ROLE_DESCRIPTIONS,
    ROLE_LABELS,
} from "@/lib/auth/rbac";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { EmptyState } from "@/components/admin/EmptyState";
import { UserFormSheet, type AdminUserRecord } from "@/components/admin/users/UserFormSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { icons } from "@/design-system/tokens/icons";

type UserAction = "activate" | "deactivate" | "delete";
type FilterRole = "all" | "super_admin" | "admin" | "viewer";
type FilterStatus = "all" | "active" | "inactive" | "deleted";

interface ActionTarget {
    id: string;
    name: string;
    action: UserAction;
}

const ROLE_CAPABILITIES: Record<"super_admin" | "admin" | "viewer", string[]> = {
    super_admin: [
        "Manage all users and assign every role",
        "Access system settings, audit controls, and protected modules",
        "Prevent lockout with last-super-admin safeguards",
    ],
    admin: [
        "Manage content and day-to-day admin work",
        "Create and manage viewer accounts only",
        "Cannot edit or demote super admins",
    ],
    viewer: [
        "Read-only access to the admin workspace",
        "No user creation, editing, or destructive actions",
        "Useful for leadership visibility and approvals",
    ],
};

function formatStatus(status: string | null): "active" | "inactive" | "deleted" {
    if (status === "deleted") return "deleted";
    if (status === "inactive") return "inactive";
    return "active";
}

function getStatusBadge(status: string | null) {
    const normalized = formatStatus(status);

    if (normalized === "deleted") {
        return (
            <Badge variant="destructive" className="bg-red-500/15 text-red-300 hover:bg-red-500/15">
                Deleted
            </Badge>
        );
    }

    if (normalized === "inactive") {
        return (
            <Badge variant="secondary" className="bg-amber-500/15 text-amber-200 hover:bg-amber-500/15">
                Inactive
            </Badge>
        );
    }

    return (
        <Badge variant="secondary" className="bg-green-500/15 text-green-200 hover:bg-green-500/15">
            Active
        </Badge>
    );
}

export default function AdminUsers(): JSX.Element {
    const [activeTab, setActiveTab] = useState("users");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<FilterRole>("all");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
    const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");
    const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [actionUser, setActionUser] = useState<ActionTarget | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();
    const { role: actorRole } = useAdminAuth();

    const actionPastTense: Record<UserAction, string> = {
        activate: "activated",
        deactivate: "deactivated",
        delete: "deleted",
    };

    const {
        data: users = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async (): Promise<AdminUserRecord[]> => {
            const { data, error } = await supabase.rpc("get_admin_users");
            if (error) throw error;
            return (data as AdminUserRecord[]) || [];
        },
    });

    const filteredUsers = useMemo(() => {
        const searchTerm = search.toLowerCase();

        return users.filter((user) => {
            const normalizedRole = normalizeRole(user.role);
            const normalizedStatus = formatStatus(user.status);

            const matchesSearch =
                user.email?.toLowerCase().includes(searchTerm) ||
                user.full_name?.toLowerCase().includes(searchTerm);
            const matchesRole = roleFilter === "all" || normalizedRole === roleFilter;
            const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [roleFilter, search, statusFilter, users]);

    const openAddUser = () => {
        setSheetMode("add");
        setSelectedUser(null);
        setSheetOpen(true);
    };

    const openEditUser = (user: AdminUserRecord) => {
        setSheetMode("edit");
        setSelectedUser(user);
        setSheetOpen(true);
    };

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
                title: "User updated",
                description: `${actionUser.name} has been ${actionPastTense[actionUser.action]} successfully.`,
            });
            await refetch();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to perform action";
            toast({
                title: "Action failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setActionLoading(false);
            setActionUser(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8 py-4 animate-in fade-in duration-700">
            <AdminBreadcrumb items={[{ label: "Users" }]} />

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif tracking-tight text-white">User Access</h1>
                    <p className="max-w-xl text-sm font-sans text-zinc-500">
                        Manage team accounts, keep role assignment tight, and control who can access the admin workspace.
                    </p>
                </div>
                <Button onClick={openAddUser} className="rounded-xl shadow-lg shadow-primary/20">
                    <UserPlus className={`${icons.sm} mr-2`} />
                    Add User
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-fit gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-1">
                    <TabsTrigger
                        value="users"
                        className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                        Users
                    </TabsTrigger>
                    <TabsTrigger
                        value="roles"
                        className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                        Roles &amp; Access
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-4 backdrop-blur-md lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                                placeholder="Search by name or email..."
                                className="rounded-xl border-zinc-800 bg-black/30 pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as FilterRole)}>
                            <SelectTrigger className="w-full rounded-xl border-zinc-800 bg-black/30 lg:w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All roles</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                            <SelectTrigger className="w-full rounded-xl border-zinc-800 bg-black/30 lg:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="deleted">Deleted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No users found"
                            description={search || roleFilter !== "all" || statusFilter !== "all"
                                ? "Try adjusting your search or filters."
                                : "Add your first teammate to start managing access."}
                            primaryAction={{
                                label: "Add User",
                                onClick: openAddUser,
                                icon: UserPlus,
                            }}
                        />
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-800 hover:bg-transparent">
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => {
                                        const normalizedRole = normalizeRole(user.role);
                                        const manageable = canManageRole(actorRole, normalizedRole);
                                        const status = formatStatus(user.status);

                                        return (
                                            <TableRow key={user.id} className="border-zinc-800/70">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={user.avatar_url ?? undefined} />
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {(user.full_name || user.email || "U").substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-zinc-100">
                                                                {user.full_name || "Unnamed user"}
                                                            </span>
                                                            <div className="flex items-center text-xs text-zinc-400">
                                                                <Mail className="mr-1 h-3 w-3" />
                                                                {user.email || "No email"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-primary" />
                                                        <span className="font-medium text-zinc-300">
                                                            {ROLE_LABELS[normalizedRole]}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>{getStatusBadge(status)}</TableCell>

                                                <TableCell className="text-zinc-400">
                                                    {user.last_sign_in_at
                                                        ? format(new Date(user.last_sign_in_at), "MMM d, yyyy")
                                                        : "Never"}
                                                </TableCell>

                                                <TableCell className="text-zinc-400">
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
                                                        <DropdownMenuContent align="end" className="w-52">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => navigator.clipboard.writeText(user.id)}
                                                            >
                                                                Copy user ID
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />

                                                            {manageable && status !== "deleted" ? (
                                                                <DropdownMenuItem onClick={() => openEditUser(user)}>
                                                                    <UserCog className="mr-2 h-4 w-4" />
                                                                    Edit user
                                                                </DropdownMenuItem>
                                                            ) : null}

                                                            {manageable && status === "inactive" ? (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        setActionUser({
                                                                            id: user.id,
                                                                            name: user.full_name || user.email || "This user",
                                                                            action: "activate",
                                                                        })
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                                    Activate
                                                                </DropdownMenuItem>
                                                            ) : null}

                                                            {manageable && status === "active" ? (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        setActionUser({
                                                                            id: user.id,
                                                                            name: user.full_name || user.email || "This user",
                                                                            action: "deactivate",
                                                                        })
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4 rotate-45 text-amber-500" />
                                                                    Deactivate
                                                                </DropdownMenuItem>
                                                            ) : null}

                                                            {manageable && status !== "deleted" ? (
                                                                <DropdownMenuItem
                                                                    className="text-red-400 focus:text-red-300"
                                                                    onClick={() =>
                                                                        setActionUser({
                                                                            id: user.id,
                                                                            name: user.full_name || user.email || "This user",
                                                                            action: "delete",
                                                                        })
                                                                    }
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-3">
                        {(["super_admin", "admin", "viewer"] as const).map((role) => (
                            <Card key={role} className="border-zinc-800/60 bg-zinc-900/50 text-zinc-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                                        <Shield className="h-5 w-5 text-primary" />
                                        {ROLE_LABELS[role]}
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">
                                        {ROLE_DESCRIPTIONS[role]}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-zinc-300">
                                    {ROLE_CAPABILITIES[role].map((capability) => (
                                        <div key={capability} className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            <span>{capability}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="border-zinc-800/60 bg-zinc-900/50 text-zinc-100">
                        <CardHeader>
                            <CardTitle className="font-serif text-2xl">Assignment Guardrails</CardTitle>
                            <CardDescription className="text-zinc-400">
                                These rules are enforced in the UI and in the edge functions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
                            <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                                Super admins can create and manage every role, but they still cannot remove the last remaining super admin.
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                                Admins can only create and manage viewer accounts. They cannot edit admins or super admins.
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                                Deleted users stay in the audit trail and are hidden only when you filter them out.
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                                Inactive users remain on record but lose access until a super admin or allowed admin reactivates them.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <UserFormSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onSuccess={() => void refetch()}
                mode={sheetMode}
                actorRole={normalizeRole(actorRole)}
                user={selectedUser}
            />

            <AlertDialog open={!!actionUser} onOpenChange={(open) => !open && setActionUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm action</AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionUser?.action === "activate"
                                ? <>This will restore access for <b>{actionUser?.name}</b>.</>
                                : null}
                            {actionUser?.action === "deactivate"
                                ? <>This will deactivate <b>{actionUser?.name}</b> and block admin access.</>
                                : null}
                            {actionUser?.action === "delete"
                                ? <>This will soft delete <b>{actionUser?.name}</b> while preserving audit history.</>
                                : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void handleAction();
                            }}
                            disabled={actionLoading}
                            className={actionUser?.action === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                        >
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

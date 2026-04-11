import { JSX, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Lock,
    Mail,
    MoreHorizontal,
    Search,
    Shield,
    Trash2,
    User,
    UserCog,
    UserPlus,
    Users,
    X,
} from "lucide-react";

import { supabase, invokeEdge } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
    canManageRole,
    normalizeRole,
    ROLE_DESCRIPTIONS,
    ROLE_LABELS,
} from "@/lib/auth/rbac";
import { EmptyState } from "@/components/admin/EmptyState";
import { UserFormSheet, type AdminUserRecord } from "@/components/admin/users/UserFormSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { changePasswordSchema } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

type UserAction = "activate" | "deactivate" | "delete" | "reset-password";
type FilterRole = "all" | "super_admin" | "admin" | "viewer";
type FilterStatus = "all" | "active" | "inactive" | "deleted";

interface ActionTarget {
    id: string;
    name: string;
    action: UserAction;
}

function getDisplayName(user: AdminUserRecord): string {
    const trimmedName = user.full_name?.trim();
    if (trimmedName) return trimmedName;

    const emailHandle = user.email?.split("@")[0]?.trim();
    if (emailHandle) return emailHandle;

    return "Unnamed user";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get("tab") === "security"
        ? "security"
        : searchParams.get("tab") === "roles"
            ? "roles"
            : "users";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<FilterRole>("all");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
    const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");
    const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [actionUser, setActionUser] = useState<ActionTarget | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();
    const { role: actorRole, user: currentUser } = useAdminAuth();

    // Security tab state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmNewPassword?: string }>({});
    const [userEmail, setUserEmail] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleTabChange = (nextTab: string) => {
        setActiveTab(nextTab);
        const nextParams = new URLSearchParams(searchParams);
        if (nextTab === "users") {
            nextParams.delete("tab");
        } else {
            nextParams.set("tab", nextTab);
        }
        setSearchParams(nextParams, { replace: true });
    };

    // Fetch current user info for security tab
    useEffect(() => {
        const fetchUserInfo = async (): Promise<void> => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || "");
                const { data: roleData } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();
                if (roleData) {
                    setUserRole(roleData.role);
                }
            }
        };
        void fetchUserInfo();
    }, []);

    useEffect(() => {
        calculatePasswordStrength(newPassword);
    }, [newPassword]);

    const calculatePasswordStrength = (password: string): void => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^A-Za-z0-9]/)) strength += 25;
        setPasswordStrength(strength);
    };

    const getStrengthColor = (score: number): string => {
        if (score <= 25) return "bg-red-500";
        if (score <= 50) return "bg-orange-500";
        if (score <= 75) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthLabel = (score: number): string => {
        if (score === 0) return "";
        if (score <= 25) return "Weak";
        if (score <= 50) return "Fair";
        if (score <= 75) return "Good";
        return "Strong";
    };

    const handleChangePassword = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setPasswordErrors({});

        const validation = changePasswordSchema.safeParse({
            currentPassword,
            newPassword,
            confirmNewPassword
        });

        if (!validation.success) {
            const fieldErrors: typeof passwordErrors = {};
            validation.error.errors.forEach((err) => {
                const field = err.path[0] as keyof typeof passwordErrors;
                fieldErrors[field] = err.message;
            });
            setPasswordErrors(fieldErrors);
            return;
        }

        setIsPasswordLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) throw new Error("User not found");

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });

            if (signInError) {
                setPasswordErrors({ currentPassword: "Current password is incorrect" });
                setIsPasswordLoading(false);
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            toast({
                title: "Password updated",
                description: "Your password has been successfully changed.",
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setPasswordStrength(0);
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update password. Please try again.",
                variant: "destructive",
                duration: 3000,
            });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const actionPastTense: Record<UserAction, string> = {
        activate: "activated",
        deactivate: "deactivated",
        delete: "deleted",
        "reset-password": "password reset email sent",
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
            const { data, error } = await invokeEdge("manage-user", {
                action: actionUser.action,
                userId: actionUser.id,
            });

            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(String(data.error));

            toast({
                title: actionUser.action === "reset-password" ? "Reset email sent" : "User updated",
                description: actionUser.action === "reset-password"
                    ? `A password reset email has been sent to ${actionUser.name}.`
                    : `${actionUser.name} has been ${actionPastTense[actionUser.action]} successfully.`,
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
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif tracking-tight text-white">User Access</h1>
                    <p className="max-w-xl text-sm font-sans text-zinc-500">
                        Manage team accounts, security credentials, and control who can access the admin workspace.
                    </p>
                </div>
                <Button onClick={openAddUser} className="rounded-xl shadow-lg shadow-primary/20">
                    <UserPlus className={`${icons.sm} mr-2`} />
                    Add User
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                    <TabsTrigger
                        value="security"
                        className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                        Security
                    </TabsTrigger>
                </TabsList>

                {/* ─── Users Tab ─── */}
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

                        <Button
                            onClick={openAddUser}
                            className="rounded-xl shadow-lg shadow-primary/20 shrink-0"
                        >
                            <UserPlus className={`${icons.sm} mr-2`} />
                            Add User
                        </Button>
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
                                        const isSelf = currentUser?.id === user.id;
                                        const manageable = !isSelf && canManageRole(actorRole, normalizedRole);
                                        const status = formatStatus(user.status);
                                        const displayName = getDisplayName(user);

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
                                                                {displayName}
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
                                                        <DropdownMenuContent align="end" className="w-56">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                            {user.email ? (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(user.email ?? "");
                                                                    }}
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Copy Email
                                                                </DropdownMenuItem>
                                                            ) : null}

                                                            {isSelf ? (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            if (currentUser) {
                                                                                const selfRecord: AdminUserRecord = {
                                                                                    id: currentUser.id,
                                                                                    email: currentUser.email ?? null,
                                                                                    full_name: currentUser.user_metadata?.full_name ?? null,
                                                                                    avatar_url: currentUser.user_metadata?.avatar_url ?? null,
                                                                                    role: actorRole,
                                                                                    status: "active",
                                                                                    created_at: currentUser.created_at,
                                                                                    last_sign_in_at: currentUser.last_sign_in_at ?? null,
                                                                                };
                                                                                openEditUser(selfRecord);
                                                                            }
                                                                        }}
                                                                        className="text-primary focus:text-primary"
                                                                    >
                                                                        <UserCog className="mr-2 h-4 w-4" />
                                                                        Edit Your Profile
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuSeparator />

                                                                    {status !== "deleted" && (
                                                                        <DropdownMenuItem onClick={() => openEditUser(user)}>
                                                                            <UserCog className="mr-2 h-4 w-4" />
                                                                            Edit User
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {!isSelf && manageable && status !== "deleted" && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                setActionUser({
                                                                                    id: user.id,
                                                                                    name: displayName,
                                                                                    action: "reset-password",
                                                                                })
                                                                            }
                                                                        >
                                                                            <KeyRound className="mr-2 h-4 w-4" />
                                                                            Reset Password
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {manageable && status === "inactive" ? (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                setActionUser({
                                                                                    id: user.id,
                                                                                    name: displayName,
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
                                                                                    name: displayName,
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
                                                                                    name: displayName,
                                                                                    action: "delete",
                                                                                })
                                                                            }
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    ) : null}
                                                                </>
                                                            )}
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

                {/* ─── Roles & Access Tab ─── */}
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

                {/* ─── Security Tab (moved from System Settings) ─── */}
                <TabsContent value="security" className="space-y-6">
                    {/* Account Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/[0.05] pb-4 px-6 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                        <User className="text-primary h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-serif">Account Information</CardTitle>
                                        <CardDescription className="text-zinc-500">Your personal executive profile details.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                                        <div className="flex items-center gap-2 font-medium text-lg">
                                            {userEmail}
                                            {userEmail && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                                <Shield size={12} />
                                                {userRole || "User"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Change Password */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/[0.05] pb-4 px-6 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                        <Shield className="text-primary h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-serif">Security Protocol</CardTitle>
                                        <CardDescription className="text-zinc-500">Update your access credentials to maintain unit integrity.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className={cn(passwordErrors.currentPassword ? "border-destructive focus-visible:ring-destructive" : "")}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </Button>
                                        </div>
                                        {passwordErrors.currentPassword && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <X className="h-3 w-3" /> {passwordErrors.currentPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className={cn(passwordErrors.newPassword ? "border-destructive focus-visible:ring-destructive" : "")}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Password Strength Meter */}
                                        {newPassword && (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-muted-foreground">Strength</span>
                                                    <span className={cn(
                                                        "font-medium",
                                                        passwordStrength <= 25 ? "text-red-500" :
                                                            passwordStrength <= 50 ? "text-orange-500" :
                                                                passwordStrength <= 75 ? "text-yellow-500" : "text-green-500"
                                                    )}>
                                                        {getStrengthLabel(passwordStrength)}
                                                    </span>
                                                </div>
                                                <Progress value={passwordStrength} className="h-1.5" indicatorClassName={getStrengthColor(passwordStrength)} />
                                                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 pt-1">
                                                    <li className={cn(newPassword.length >= 8 ? "text-green-600 font-medium" : "")}>At least 8 characters</li>
                                                    <li className={cn(/[A-Z]/.test(newPassword) ? "text-green-600 font-medium" : "")}>One uppercase letter</li>
                                                    <li className={cn(/[0-9]/.test(newPassword) ? "text-green-600 font-medium" : "")}>One number</li>
                                                </ul>
                                            </div>
                                        )}
                                        {passwordErrors.newPassword && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <X className="h-3 w-3" /> {passwordErrors.newPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmNewPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                className={cn(passwordErrors.confirmNewPassword ? "border-destructive focus-visible:ring-destructive" : "")}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </Button>
                                        </div>
                                        {passwordErrors.confirmNewPassword && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <X className="h-3 w-3" /> {passwordErrors.confirmNewPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Button type="submit" disabled={isPasswordLoading} className="rounded-xl shadow-lg shadow-primary/20">
                                            {isPasswordLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Processing...
                                                </>
                                            ) : (
                                                "Update Protocol"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>

            <UserFormSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onSuccess={() => void refetch()}
                mode={sheetMode}
                actorRole={normalizeRole(actorRole)}
                user={selectedUser}
                isSelf={currentUser?.id === selectedUser?.id}
            />

            <AlertDialog open={!!actionUser} onOpenChange={(open) => !open && setActionUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionUser?.action === "activate" ? "Activate user" : null}
                            {actionUser?.action === "deactivate" ? "Deactivate user" : null}
                            {actionUser?.action === "delete" ? "Delete user" : null}
                            {actionUser?.action === "reset-password" ? "Reset password" : null}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionUser?.action === "activate"
                                ? <>This will restore admin access for <b>{actionUser?.name}</b>.</>
                                : null}
                            {actionUser?.action === "deactivate"
                                ? <>This will deactivate <b>{actionUser?.name}</b> and block their admin access.</>
                                : null}
                            {actionUser?.action === "delete"
                                ? <>This will soft delete <b>{actionUser?.name}</b> while preserving audit history.</>
                                : null}
                            {actionUser?.action === "reset-password"
                                ? <>A password reset email will be sent to <b>{actionUser?.name}</b>. The admin performing this action will not see the password.</>
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
                            {actionUser?.action === "reset-password" ? "Send Reset Email" : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

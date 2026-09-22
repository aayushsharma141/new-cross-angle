import { format } from "date-fns";
import {
  CheckCircle2, Copy, KeyRound, Loader2, Mail, MoreHorizontal,
  Search, Shield, Trash2, UserCog, UserPlus, Users,
} from "lucide-react";
import { canManageRole, normalizeRole, ROLE_LABELS } from "@/lib/auth/rbac";
import { EmptyState } from "@/components/admin/EmptyState";
import type { AdminUserRecord } from "@/components/admin/users/UserFormSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/primitives/avatar";
import { Badge } from "@/components/primitives/interactive";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/primitives/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/primitives/dropdown-menu";
import { icons } from "@/design-system/tokens/icons";

type FilterRole = "all" | "super_admin" | "admin" | "viewer";
type FilterStatus = "all" | "active" | "inactive" | "deleted";
type UserAction = "activate" | "deactivate" | "delete" | "reset-password";

interface UsersTableProps {
  users: AdminUserRecord[];
  isLoading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: FilterRole;
  onRoleFilterChange: (v: FilterRole) => void;
  statusFilter: FilterStatus;
  onStatusFilterChange: (v: FilterStatus) => void;
  currentUserId: string | undefined;
  actorRole: string;
  onAddUser: () => void;
  onEditUser: (user: AdminUserRecord) => void;
  onEditSelf: () => void;
  onAction: (id: string, name: string, action: UserAction) => void;
  onCopyEmail: (email: string) => void;
}

function formatStatus(status: string | null): "active" | "inactive" | "deleted" {
  if (status === "deleted") return "deleted";
  if (status === "inactive") return "inactive";
  return "active";
}

function getStatusBadge(status: string | null) {
  const normalized = formatStatus(status);
  if (normalized === "deleted") return <Badge variant="destructive" className="bg-red-500/15 text-red-300 hover:bg-red-500/15">Deleted</Badge>;
  if (normalized === "inactive") return <Badge variant="secondary" className="bg-amber-500/15 text-amber-200 hover:bg-amber-500/15">Inactive</Badge>;
  return <Badge variant="secondary" className="bg-green-500/15 text-green-200 hover:bg-green-500/15">Active</Badge>;
}

function getDisplayName(user: AdminUserRecord): string {
  const trimmedName = user.full_name?.trim();
  if (trimmedName) return trimmedName;
  const emailHandle = user.email?.split("@")[0]?.trim();
  if (emailHandle) return emailHandle;
  return "Unnamed user";
}

export const UsersTable = ({
  users, isLoading, search, onSearchChange, roleFilter, onRoleFilterChange,
  statusFilter, onStatusFilterChange, currentUserId, actorRole,
  onAddUser, onEditUser, onEditSelf, onAction, onCopyEmail,
}: UsersTableProps) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-4 backdrop-blur-md lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input placeholder="Search by name or email�" className="rounded-xl border-zinc-800 bg-black/30 pl-10" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      <Select value={roleFilter} onValueChange={(v) => onRoleFilterChange(v as FilterRole)}>
        <SelectTrigger className="w-full rounded-xl border-zinc-800 bg-black/30 lg:w-[180px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as FilterStatus)}>
        <SelectTrigger className="w-full rounded-xl border-zinc-800 bg-black/30 lg:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="deleted">Deleted</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onAddUser} className="rounded-xl shadow-lg shadow-primary/20 shrink-0"><UserPlus className={`${icons.sm} mr-2`} />Add User</Button>
    </div>

    {isLoading ? (
      <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    ) : users.length === 0 ? (
      <EmptyState icon={Users} title="No users found" description={search || roleFilter !== "all" || statusFilter !== "all" ? "Try adjusting your search or filters." : "Add your first teammate to start managing access."} primaryAction={{ label: "Add User", onClick: onAddUser, icon: UserPlus }} />
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
            {users.map((user) => {
              const normalizedRole = normalizeRole(user.role);
              const isSelf = currentUserId === user.id;
              const manageable = !isSelf && canManageRole(actorRole, normalizedRole);
              const status = formatStatus(user.status);
              const displayName = getDisplayName(user);
              return (
                <TableRow key={user.id} className="border-zinc-800/70">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarImage src={user.avatar_url ?? undefined} /><AvatarFallback className="bg-primary/10 text-primary">{(user.full_name || user.email || "U").substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-100">{displayName}</span>
                        <div className="flex items-center text-xs text-zinc-400"><Mail className="mr-1 h-3 w-3" />{user.email || "No email"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><span className="font-medium text-zinc-300">{ROLE_LABELS[normalizedRole]}</span></div></TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell className="text-zinc-400">{user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "MMM d, yyyy") : "Never"}</TableCell>
                  <TableCell className="text-zinc-400">{user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {user.email && <DropdownMenuItem onClick={() => onCopyEmail(user.email!)}><Copy className="mr-2 h-4 w-4" />Copy Email</DropdownMenuItem>}
                        {isSelf ? (
                          <><DropdownMenuSeparator /><DropdownMenuItem onClick={onEditSelf} className="text-primary focus:text-primary"><UserCog className="mr-2 h-4 w-4" />Edit Your Profile</DropdownMenuItem></>
                        ) : (
                          <>
                            <DropdownMenuSeparator />
                            {status !== "deleted" && <DropdownMenuItem onClick={() => onEditUser(user)}><UserCog className="mr-2 h-4 w-4" />Edit User</DropdownMenuItem>}
                            {manageable && status !== "deleted" && <DropdownMenuItem onClick={() => onAction(user.id, displayName, "reset-password")}><KeyRound className="mr-2 h-4 w-4" />Reset Password</DropdownMenuItem>}
                            {manageable && status === "inactive" && <DropdownMenuItem onClick={() => onAction(user.id, displayName, "activate")}><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />Activate</DropdownMenuItem>}
                            {manageable && status === "active" && <DropdownMenuItem onClick={() => onAction(user.id, displayName, "deactivate")}><CheckCircle2 className="mr-2 h-4 w-4 rotate-45 text-amber-500" />Deactivate</DropdownMenuItem>}
                            {manageable && status !== "deleted" && <DropdownMenuItem className="text-red-400 focus:text-red-300" onClick={() => onAction(user.id, displayName, "delete")}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
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
  </div>
);

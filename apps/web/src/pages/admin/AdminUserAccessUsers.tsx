import { JSX, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { supabase, invokeEdge } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { useAdminDisplayName } from "@/hooks/useAdminDisplayName";
import { normalizeRole } from "@/lib/auth/rbac";
import { UserFormSheet, type AdminUserRecord } from "@/components/admin/users/UserFormSheet";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { Button } from "@/components/ui/primitives/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/primitives/alert-dialog";
import { icons } from "@/design-system/tokens/icons";
import { UsersTable } from "@/components/admin/users/UsersTable";


type UserAction = "activate" | "deactivate" | "delete" | "reset-password";
type FilterRole = "all" | "super_admin" | "admin" | "viewer";
type FilterStatus = "all" | "active" | "inactive" | "deleted";

interface ActionTarget {
  id: string;
  name: string;
  action: UserAction;
}

function formatStatus(status: string | null): "active" | "inactive" | "deleted" {
  if (status === "deleted") return "deleted";
  if (status === "inactive") return "inactive";
  return "active";
}

export default function AdminUserAccessUsers(): JSX.Element {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterRole>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [actionUser, setActionUser] = useState<ActionTarget | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { role: actorRole } = usePermissions();
  const { avatarUrl: currentAvatarUrl, fullName: currentFullName } = useAdminDisplayName();

  const { data: users = [], isLoading, refetch } = useQuery({
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
      const matchesSearch = user.email?.toLowerCase().includes(searchTerm) || user.full_name?.toLowerCase().includes(searchTerm);
      const matchesRole = roleFilter === "all" || normalizedRole === roleFilter;
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, users]);

  const openAddUser = () => { setSheetMode("add"); setSelectedUser(null); setSheetOpen(true); };
  const openEditUser = (user: AdminUserRecord) => { setSheetMode("edit"); setSelectedUser(user); setSheetOpen(true); };

  const handleEditSelf = () => {
    if (currentUser) {
      openEditUser({
        id: currentUser.id, email: currentUser.email ?? null, full_name: currentFullName,
        avatar_url: currentAvatarUrl, role: actorRole, status: "active",
        created_at: currentUser.created_at, last_sign_in_at: currentUser.last_sign_in_at ?? null,
      });
    }
  };

  const handleAction = async (): Promise<void> => {
    if (!actionUser) return;
    setActionLoading(true);
    try {
      const { data, error } = await invokeEdge("manage-user", { action: actionUser.action, userId: actionUser.id });
      if (error) throw new Error(error.message);
      if (data && typeof data === "object" && "error" in data) { const result = data as { error?: unknown }; if (result.error) throw new Error(String(result.error)); }
      toast({
        title: actionUser.action === "reset-password" ? "Reset email sent" : "User updated",
        description: actionUser.action === "reset-password" ? `A password reset email has been sent to ${actionUser.name}.` : `${actionUser.name} has been ${actionUser.action === "activate" ? "activated" : actionUser.action === "deactivate" ? "deactivated" : "deleted"} successfully.`,
      });
      await refetch();
    } catch (error) {
      toast({ title: "Action failed", description: error instanceof Error ? error.message : "Failed to perform action", variant: "destructive" });
    } finally { setActionLoading(false); setActionUser(null); }
  };

  return (
      <div className="flex flex-col space-y-4 animate-in fade-in duration-700">
      
      <ModuleActions>
        <Button onClick={openAddUser} variant="default" className="rounded-xl shadow-lg shadow-primary/20">
          <UserPlus className={`${icons.sm} mr-2`} />Add User
        </Button>
      </ModuleActions>

      <UsersTable
        users={filteredUsers} isLoading={isLoading} search={search} onSearchChange={setSearch}
        roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
        currentUserId={currentUser?.id} actorRole={actorRole ?? ""} onAddUser={openAddUser} onEditUser={openEditUser} onEditSelf={handleEditSelf}
        onAction={(id, name, action) => setActionUser({ id, name, action })}
        onCopyEmail={(email) => navigator.clipboard.writeText(email)}
      />

      <UserFormSheet open={sheetOpen} onOpenChange={setSheetOpen} onSuccess={() => void refetch()} mode={sheetMode} actorRole={normalizeRole(actorRole ?? "")} user={selectedUser} isSelf={currentUser?.id === selectedUser?.id} />

      <AlertDialog open={!!actionUser} onOpenChange={(open) => !open && setActionUser(null)}>
        <AlertDialogContent className="bg-admin-card border-admin-border text-admin-text">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionUser?.action === "activate" && "Activate user"}
              {actionUser?.action === "deactivate" && "Deactivate user"}
              {actionUser?.action === "delete" && "Delete user"}
              {actionUser?.action === "reset-password" && "Reset password"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionUser?.action === "activate" && <>This will restore admin access for <b>{actionUser?.name}</b>.</>}
              {actionUser?.action === "deactivate" && <>This will deactivate <b>{actionUser?.name}</b> and block their admin access.</>}
              {actionUser?.action === "delete" && <>This will soft delete <b>{actionUser?.name}</b> while preserving audit history.</>}
              {actionUser?.action === "reset-password" && <>A password reset email will be sent to <b>{actionUser?.name}</b>.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void handleAction(); }} disabled={actionLoading} className={actionUser?.action === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {actionUser?.action === "reset-password" ? "Send Reset Email" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

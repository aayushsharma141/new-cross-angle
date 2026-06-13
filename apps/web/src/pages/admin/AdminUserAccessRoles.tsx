import { JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Shield, Lock, Eye, Edit3, Trash2, Upload, Settings, BarChart3, Users, FileText, Image as ImageIcon, Mail, Database, DollarSign, Loader2 } from "lucide-react";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/auth/rbac";
import { PERMISSIONS, type Resource } from "@/lib/auth/permissions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/primitives/card";
import { supabase } from "@/integrations/supabase/client";


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

const RESOURCE_ICONS: Record<string, typeof Shield> = {
  dashboard: BarChart3,
  leads: Users,
  estimate_leads: DollarSign,
  estimate_rates: DollarSign,
  users: Users,
  analytics: BarChart3,
  content: FileText,
  media: ImageIcon,
  gallery: ImageIcon,
  settings: Settings,
  audit_logs: Database,
  crm: Mail,
};

const RESOURCE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  estimate_leads: "Estimate Leads",
  estimate_rates: "Estimate Rates",
  users: "Users",
  analytics: "Analytics",
  content: "Content",
  media: "Media",
  gallery: "Gallery",
  settings: "Settings",
  audit_logs: "Audit Logs",
  crm: "CRM",
};

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  upload: "Upload",
  export: "Export",
  automate: "Automate",
  manage_roles: "Manage Roles",
};

const ROLE_ORDER = ["super_admin", "admin", "viewer"] as const;

export default function AdminUserAccessRoles(): JSX.Element {
  const resources = Object.keys(PERMISSIONS) as Resource[];

  // Live user counts per role from admin_users table
  const { data: roleCounts, isLoading: countsLoading } = useQuery({
    queryKey: ["role-counts"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("admin_users")
        .select("role")
        .eq("is_active", true);
      if (error) throw error;
      const counts: Record<string, number> = { super_admin: 0, admin: 0, viewer: 0 };
      (data ?? []).forEach((u: { role: string }) => {
        if (u.role && counts[u.role] !== undefined) counts[u.role]++;
      });
      return counts;
    },
    staleTime: 30_000,
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      
      {/* Role Overview Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {ROLE_ORDER.map((role) => (
          <Card key={role} className="border-zinc-800/60 bg-zinc-900/50 text-zinc-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Shield className="h-5 w-5 text-primary" />
                {ROLE_LABELS[role]}
                <span className="ml-auto text-sm font-normal text-zinc-400 flex items-center gap-1">
                  {countsLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Users className="w-3.5 h-3.5" />
                      {roleCounts?.[role] ?? 0} user{(roleCounts?.[role] ?? 0) !== 1 ? "s" : ""}
                    </>
                  )}
                </span>
              </CardTitle>
              <CardDescription className="text-zinc-400">{ROLE_DESCRIPTIONS[role]}</CardDescription>
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

      {/* Permission Matrix */}
      <Card className="border-zinc-800/60 bg-zinc-900/50 text-zinc-100">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Permission Matrix
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Granular access controls defined per resource and role. This matrix is enforced across the entire admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Resource</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Action</th>
                {ROLE_ORDER.map((role) => (
                  <th key={role} className="text-center py-3 px-4 text-zinc-400 font-medium">
                    <div className="flex items-center justify-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      {ROLE_LABELS[role]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource, ri) => {
                const Icon = RESOURCE_ICONS[resource] || Shield;
                const actions = PERMISSIONS[resource] as Record<string, readonly string[]>;
                const actionKeys = Object.keys(actions);
                return actionKeys.map((action, ai) => (
                  <tr
                    key={`${resource}-${action}`}
                    className={`border-b border-zinc-800/50 ${ai === 0 ? "" : ""} ${ri % 2 === 0 ? "bg-black/10" : ""}`}
                  >
                    {ai === 0 && (
                      <td className="py-3 px-4 font-medium text-zinc-200" rowSpan={actionKeys.length}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{RESOURCE_LABELS[resource] || resource}</span>
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4 text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        {action === "view" && <Eye className="w-3.5 h-3.5" />}
                        {action === "create" && <Edit3 className="w-3.5 h-3.5" />}
                        {action === "edit" && <Edit3 className="w-3.5 h-3.5" />}
                        {action === "delete" && <Trash2 className="w-3.5 h-3.5" />}
                        {action === "upload" && <Upload className="w-3.5 h-3.5" />}
                        {ACTION_LABELS[action] || action}
                      </div>
                    </td>
                    {ROLE_ORDER.map((role) => {
                      const hasPermission = (actions[action] as readonly string[]).includes(role);
                      return (
                        <td key={role} className="text-center py-3 px-4">
                          {hasPermission ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800/50 text-zinc-600">
                              <span className="text-xs">—</span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Assignment Guardrails */}
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
    </div>
  );
}

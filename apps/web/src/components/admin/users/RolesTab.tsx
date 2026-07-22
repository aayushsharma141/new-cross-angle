import { CheckCircle2, Shield } from "lucide-react";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/auth/rbac";
import { Surface, Stack, Text } from "@/components/primitives/foundation";

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

export const RolesTab = () => (
  <div className="space-y-6">
    <div className="grid gap-4 lg:grid-cols-3">
      {(["super_admin", "admin", "viewer"] as const).map((role) => (
        <Surface variant="primary" radius="lg" border shadow="sm" key={role} className="border-zinc-800/60 bg-zinc-900/50 text-zinc-100">
          <Stack gap="sm" className="p-6">
            <Text as="h3" variant="h3" className="leading-none" className="flex items-center gap-2 font-serif text-2xl"><Shield className="h-5 w-5 text-primary" />{ROLE_LABELS[role]}</Text>
            <Text as="p" variant="caption" color="muted" className="text-zinc-400">{ROLE_DESCRIPTIONS[role]}</Text>
          </Stack>
          <div className="p-6 pt-0" className="space-y-3 text-sm text-zinc-300">
            {ROLE_CAPABILITIES[role].map((capability) => (
              <div key={capability} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{capability}</span></div>
            ))}
          </div>
        </Surface>
      ))}
    </div>
    <Surface variant="primary" radius="lg" border shadow="sm" className="border-zinc-800/60 bg-zinc-900/50 text-zinc-100">
      <Stack gap="sm" className="p-6">
        <Text as="h3" variant="h3" className="leading-none" className="font-serif text-2xl">Assignment Guardrails</Text>
        <Text as="p" variant="caption" color="muted" className="text-zinc-400">These rules are enforced in the UI and in the edge functions.</Text>
      </Stack>
      <div className="p-6 pt-0" className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">Super admins can create and manage every role, but they still cannot remove the last remaining super admin.</div>
        <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">Admins can only create and manage viewer accounts. They cannot edit admins or super admins.</div>
        <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">Deleted users stay in the audit trail and are hidden only when you filter them out.</div>
        <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">Inactive users remain on record but lose access until a super admin or allowed admin reactivates them.</div>
      </div>
    </Surface>
  </div>
);

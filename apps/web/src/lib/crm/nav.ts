/**
 * CRM sidebar navigation manifest.
 *
 * Drives the left-hand nav in `CrmModule`. Each entry can be either:
 *   - kind: "link"      → static React Router link (Leads, Analytics, Settings)
 *   - kind: "view"      → toggles a saved view (Today, Inbox/Hot, Tasks)
 *
 * Counters are derived in the component from the leads query + view
 * predicates, so this manifest stays pure (no React, no fetch).
 */

import { Sun, Inbox, Users, CheckSquare, BarChart3, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CrmSavedViewId } from "./views";

export type CrmNavItemKind = "link" | "view";

interface BaseNavItem {
  /** Stable identifier — used as React key and for analytics. */
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface CrmNavLinkItem extends BaseNavItem {
  kind: "link";
  /** React Router path. */
  to: string;
  /** Predicate to decide if this item is the active route. */
  isActive: (pathname: string) => boolean;
}

export interface CrmNavViewItem extends BaseNavItem {
  kind: "view";
  /** Saved-view id this nav button toggles. */
  view: CrmSavedViewId;
  /** Optional badge tone for the count pill. */
  badgeTone?: "muted" | "danger";
}

export type CrmNavItem = CrmNavLinkItem | CrmNavViewItem;

/** Primary "workspace" nav rendered above the stage list in the CRM sidebar. */
export const CRM_WORKSPACE_NAV: readonly CrmNavItem[] = [
  {
    id: "today",
    kind: "view",
    label: "Today",
    icon: Sun,
    view: "today",
    badgeTone: "muted",
  },
  {
    id: "inbox",
    kind: "view",
    label: "Priority",
    icon: Inbox,
    view: "hot",
    badgeTone: "danger",
  },
  {
    id: "leads",
    kind: "link",
    label: "Leads",
    icon: Users,
    to: "/admin/crm/leads",
    isActive: (p) => p.startsWith("/admin/crm/leads"),
  },
  {
    id: "tasks",
    kind: "view",
    label: "Tasks",
    icon: CheckSquare,
    view: "needs_action",
    badgeTone: "muted",
  },
  {
    id: "analytics",
    kind: "link",
    label: "Analytics",
    icon: BarChart3,
    to: "/admin/crm/analytics",
    isActive: (p) => p.startsWith("/admin/crm/analytics"),
  },
  {
    id: "settings",
    kind: "link",
    label: "Settings",
    icon: Settings,
    to: "/admin/crm/settings",
    isActive: (p) => p.startsWith("/admin/crm/settings"),
  },
] as const;

export function isCrmNavLink(item: CrmNavItem): item is CrmNavLinkItem {
  return item.kind === "link";
}
export function isCrmNavView(item: CrmNavItem): item is CrmNavViewItem {
  return item.kind === "view";
}

/**
 * Saved view manifest.
 *
 * "Saved views" are the pre-defined chips and sidebar shortcuts that filter
 * the leads list (Today, Hot, Needs next action, Gone quiet, Won this month, …).
 *
 * Each view bundles:
 *  - id           Stable URL/query value
 *  - label        Sentence-case label shown in chips and dropdowns
 *  - shortLabel   Compact label used in the CRM sidebar (e.g., "Today")
 *  - dotClass     Optional accent dot (used on chips like "Hot")
 *  - description  One-line "what does this view show?" helper
 *  - predicate    Pure function (lead → boolean) used to filter
 *  - count        Optional precomputed counter for sidebar badges
 *  - showInSidebar / showInChips control where it surfaces
 *
 * The predicate is pure and depends only on the lead and a `now` reference
 * passed in, so it can be shared between AdminLeads (filter) and CrmModule
 * (sidebar counts) without drift.
 */

import type { Lead } from "@/lib/scoring/leadScoring";
import { HOT_LEAD_THRESHOLD } from "./temperature";

export type CrmSavedViewId =
  | "all"
  | "today"
  | "mine"
  | "hot"
  | "needs_action"
  | "quiet"
  | "won_month";

export interface CrmSavedView {
  id: CrmSavedViewId;
  label: string;
  shortLabel: string;
  description: string;
  /** Optional Tailwind class for an accent dot rendered before the label. */
  dotClass?: string;
  /** Whether the view appears in the global CRM sidebar shortcuts. */
  showInSidebar: boolean;
  /** Whether the view appears in the chip row above the leads list. */
  showInChips: boolean;
  /** Pure filter predicate. `now` defaults to the current time. */
  predicate: (lead: Lead, now?: Date) => boolean;
}

const startOfDay = (d: Date): Date => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const daysSince = (iso: string | null | undefined, now: Date): number => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.floor((now.getTime() - t) / 86_400_000);
};

const isOpenStage = (lead: Lead): boolean =>
  lead.status !== "won" && lead.status !== "lost";

export const CRM_SAVED_VIEWS: readonly CrmSavedView[] = [
  {
    id: "all",
    label: "All",
    shortLabel: "All leads",
    description: "Every lead in the pipeline.",
    showInSidebar: false,
    showInChips: true,
    predicate: () => true,
  },
  {
    id: "today",
    label: "Today",
    shortLabel: "Today",
    description: "Leads created since midnight.",
    showInSidebar: true,
    showInChips: true,
    predicate: (lead, now = new Date()) => {
      if (!lead.created_at) return false;
      return new Date(lead.created_at) >= startOfDay(now);
    },
  },
  {
    id: "mine",
    label: "Assigned",
    shortLabel: "Assigned to me",
    description: "Leads currently assigned to a team member.",
    showInSidebar: false,
    showInChips: true,
    predicate: (lead) => !!lead.assigned_to,
  },
  {
    id: "hot",
    label: "Hot",
    shortLabel: "Inbox",
    description: `Lead score is ${HOT_LEAD_THRESHOLD} or above — these need attention now.`,
    dotClass: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
    showInSidebar: true,
    showInChips: true,
    predicate: (lead) => (lead.score ?? 0) >= HOT_LEAD_THRESHOLD,
  },
  {
    id: "needs_action",
    label: "Needs next action",
    shortLabel: "Tasks",
    description: "Open leads without a planned next step.",
    showInSidebar: true,
    showInChips: true,
    predicate: (lead) => (!lead.next_step && isOpenStage(lead)) || lead._has_overdue_tasks === true,
  },
  {
    id: "quiet",
    label: "Gone quiet 14d+",
    shortLabel: "Quiet",
    description: "Open leads with no activity in 14 days or more.",
    showInSidebar: false,
    showInChips: true,
    predicate: (lead, now = new Date()) => {
      const ref = lead.last_activity_at ?? lead.created_at;
      return daysSince(ref, now) >= 14 && isOpenStage(lead);
    },
  },
  {
    id: "won_month",
    label: "Won this month",
    shortLabel: "Wins",
    description: "Leads closed-won within the current calendar month.",
    showInSidebar: false,
    showInChips: true,
    predicate: (lead, now = new Date()) => {
      if (lead.status !== "won" || !lead.created_at) return false;
      const created = new Date(lead.created_at);
      return (
        created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
      );
    },
  },
] as const;

export const CRM_SAVED_VIEW_IDS: readonly CrmSavedViewId[] = CRM_SAVED_VIEWS.map(
  (v) => v.id,
);

/** Type guard for query param parsing. */
export function isCrmSavedViewId(value: string): value is CrmSavedViewId {
  return (CRM_SAVED_VIEW_IDS as readonly string[]).includes(value);
}

/** Lookup a saved view by id, returning undefined for unknown ids. */
export function getCrmSavedView(id: string): CrmSavedView | undefined {
  return CRM_SAVED_VIEWS.find((v) => v.id === id);
}

/** Apply a view's predicate to a list of leads. */
export function applyCrmSavedView(
  id: CrmSavedViewId,
  leads: Lead[],
  now: Date = new Date(),
): Lead[] {
  const view = getCrmSavedView(id);
  if (!view) return leads;
  return leads.filter((lead) => view.predicate(lead, now));
}

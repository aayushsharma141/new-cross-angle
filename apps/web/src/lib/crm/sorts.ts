/**
 * Sort mode manifest for the leads list.
 *
 * Each entry pairs a query-param id with a human label and a pure
 * `comparator` so AdminLeads can switch ordering without a giant `switch`.
 */

import type { Lead } from "@/lib/scoring/leadScoring";
import { CRM_STAGE_IDS } from "./stages";

export type CrmSortMode =
  | "score_desc"
  | "newest"
  | "oldest"
  | "name_asc"
  | "stage";

export interface CrmSortOption {
  id: CrmSortMode;
  label: string;
  description: string;
  comparator: (a: Lead, b: Lead) => number;
}

const ts = (iso: string | null | undefined): number =>
  iso ? new Date(iso).getTime() : 0;

const stageIndex = (status: string): number => {
  const i = (CRM_STAGE_IDS as readonly string[]).indexOf(status);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};

export const CRM_SORTS: readonly CrmSortOption[] = [
  {
    id: "score_desc",
    label: "Best score",
    description: "Highest lead score first (default).",
    comparator: (a, b) => (b.score ?? 0) - (a.score ?? 0),
  },
  {
    id: "newest",
    label: "Newest",
    description: "Most recently created first.",
    comparator: (a, b) => ts(b.created_at) - ts(a.created_at),
  },
  {
    id: "oldest",
    label: "Oldest",
    description: "Oldest first — useful for clearing backlog.",
    comparator: (a, b) => ts(a.created_at) - ts(b.created_at),
  },
  {
    id: "name_asc",
    label: "Name A–Z",
    description: "Alphabetical by lead name.",
    comparator: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
  },
  {
    id: "stage",
    label: "Pipeline stage",
    description: "Group by where the lead sits in the funnel.",
    comparator: (a, b) => stageIndex(a.status) - stageIndex(b.status),
  },
] as const;

export const CRM_SORT_IDS: readonly CrmSortMode[] = CRM_SORTS.map((s) => s.id);

/** Type guard for query param parsing. */
export function isCrmSortMode(value: string): value is CrmSortMode {
  return (CRM_SORT_IDS as readonly string[]).includes(value);
}

/** Lookup a sort option by id, with a sensible default. */
export function getCrmSort(id: string): CrmSortOption {
  return CRM_SORTS.find((s) => s.id === id) ?? CRM_SORTS[0];
}

/** Map of id → label for menu rendering. */
export const CRM_SORT_LABELS: Record<CrmSortMode, string> = CRM_SORTS.reduce(
  (acc, s) => {
    acc[s.id] = s.label;
    return acc;
  },
  {} as Record<CrmSortMode, string>,
);

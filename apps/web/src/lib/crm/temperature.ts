/**
 * Lead temperature manifest.
 *
 * Centralizes the meaning of "Hot / Warm / Cold" — thresholds, labels,
 * dot styling, badge styling — so every component agrees on what a
 * "hot lead" looks like.
 *
 * Scoring rules themselves live in `@/lib/scoring/leadScoring`. This module
 * deals only with the *visual* + *threshold* contract.
 */

import { getLeadTemperature as scoreToTemperature } from "@/lib/scoring/leadScoring";

export type CrmTemperaturePriority = "hot" | "warm" | "cold";

export interface CrmTemperature {
  id: CrmTemperaturePriority;
  /** Display name used everywhere in the admin UI. */
  label: string;
  /** Inclusive lower bound on lead score (0–100). */
  minScore: number;
  /** Tailwind classes for the badge (bg + text + border). */
  badgeClass: string;
  /** Tailwind classes for the small dot indicator (with glow). */
  dotClass: string;
  emoji: string;
}

export const CRM_TEMPERATURES: readonly CrmTemperature[] = [
  {
    id: "hot",
    label: "Hot",
    minScore: 70,
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
    dotClass: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
    emoji: "🔥",
  },
  {
    id: "warm",
    label: "Warm",
    minScore: 40,
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    dotClass: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    emoji: "🌡️",
  },
  {
    id: "cold",
    label: "Cold",
    minScore: 0,
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    dotClass: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    emoji: "❄️",
  },
] as const;

/** Threshold above which a lead is "hot" (used by KPIs, filters, alerts). */
export const HOT_LEAD_THRESHOLD: number =
  CRM_TEMPERATURES.find((t) => t.id === "hot")!.minScore;

/** Resolve a numeric score to its temperature manifest entry. */
export function getCrmTemperature(score: number | null | undefined): CrmTemperature {
  const s = score ?? 0;
  // Iterate ordered hottest → coldest; first matching minScore wins.
  for (const t of CRM_TEMPERATURES) {
    if (s >= t.minScore) return t;
  }
  return CRM_TEMPERATURES[CRM_TEMPERATURES.length - 1];
}

/**
 * Bridge to the existing scoring helper so callers that already have it can
 * stay consistent. Prefer `getCrmTemperature(score)` for new code.
 */
export function getCrmTemperatureFromScoring(
  score: number,
): { label: string; priority: CrmTemperaturePriority } {
  const { label, priority } = scoreToTemperature(score);
  return { label, priority };
}

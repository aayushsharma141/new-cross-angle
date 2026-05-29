/**
 * KPI manifest for the leads list header.
 *
 * Each KPI is a self-contained spec: label, helper copy, icon class,
 * compute function. AdminLeads simply maps over `CRM_KPIS` and renders a
 * card for each one, instead of holding inline logic for each metric.
 */

import { Users, Flame, User as UserIcon, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Lead } from "@/lib/scoring/leadScoring";
import { applyCrmSavedView } from "./views";
import { HOT_LEAD_THRESHOLD } from "./temperature";

export interface CrmKpiContext {
  /** Reference time used for "today"/"this month" calculations. */
  now: Date;
}

export interface CrmKpiResult {
  /** Primary number (or short string like "1.8h") shown large. */
  value: string | number;
  /** Optional secondary value rendered after the main number. */
  suffix?: string;
  /** Subtitle line under the metric. */
  hint: string;
  /** Tone of the hint, drives the color. */
  hintTone: "neutral" | "good" | "warn";
}

export interface CrmKpiSpec {
  id: string;
  /** Card title (uppercase, ≤16 chars). */
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon's circular tile. */
  iconTileClass: string;
  /** Compute the displayed value from the lead set + context. */
  compute: (leads: Lead[], ctx: CrmKpiContext) => CrmKpiResult;
}

export const CRM_KPIS: readonly CrmKpiSpec[] = [
  {
    id: "new_today",
    label: "New Today",
    icon: Users,
    iconTileClass: "bg-[#1F232C] text-[#A0A6B2]",
    compute: (leads, { now }) => {
      const count = applyCrmSavedView("today", leads, now).length;
      return {
        value: count,
        hint: count > 0 ? "New inquiries" : "No new leads yet",
        hintTone: count > 0 ? "good" : "neutral",
      };
    },
  },
  {
    id: "hot_leads",
    label: "Hot Leads",
    icon: Flame,
    iconTileClass: "bg-rose-500/10 text-rose-400",
    compute: (leads) => {
      const hot = leads.filter((l) => (l.score ?? 0) >= HOT_LEAD_THRESHOLD).length;
      return {
        value: hot,
        suffix: `of ${leads.length} active`,
        hint: `Score ≥ ${HOT_LEAD_THRESHOLD}`,
        hintTone: "neutral",
      };
    },
  },
  {
    id: "unassigned",
    label: "Unassigned",
    icon: UserIcon,
    iconTileClass: "bg-amber-500/10 text-amber-400",
    compute: (leads) => {
      const unassigned = leads.filter(
        (l) => !l.assigned_to && l.status !== "won" && l.status !== "lost",
      ).length;
      return {
        value: unassigned,
        hint: unassigned > 0 ? "Assign now" : "All assigned",
        hintTone: unassigned > 0 ? "warn" : "good",
      };
    },
  },
  {
    id: "avg_reply",
    // NOTE: This is currently a static placeholder until reply-time data lands.
    label: "Avg. Reply Time",
    icon: Clock,
    iconTileClass: "bg-emerald-500/10 text-emerald-400",
    compute: () => ({
      value: "--",
      suffix: "",
      hint: "Coming soon",
      hintTone: "neutral",
    }),
  },
] as const;

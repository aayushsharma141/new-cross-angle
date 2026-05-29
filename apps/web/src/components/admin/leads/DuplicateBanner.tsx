/**
 * DuplicateBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows a non-blocking warning when a candidate lead's email or phone matches
 * an existing lead in the CRM. Uses `detectDuplicate` from `lib/leadScoring`.
 *
 * Props:
 *   candidate  – stripped-down partial Lead (name, email, phone)
 *   allLeads   – the current list of leads to check against
 *   currentId  – the ID of the lead being edited (excluded from duplicate check)
 *   onViewLead – optional callback to open the matched lead's detail sheet
 */

import { useMemo } from "react";
import { AlertTriangle, User, ArrowRight, ShieldCheck } from "lucide-react";
import { detectDuplicate } from "@/lib/scoring/leadScoring";
import type { Lead } from "@/lib/scoring/leadScoring";
import { cn } from "@/lib/utils";

interface DuplicateBannerProps {
  candidate: Partial<Lead>;
  allLeads: Lead[];
  /** ID of the lead currently open — excluded so editing an existing lead
   *  doesn't incorrectly flag itself as a duplicate. */
  currentId?: string;
  onViewLead?: (lead: Lead) => void;
  className?: string;
}

export function DuplicateBanner({
  candidate,
  allLeads,
  currentId,
  onViewLead,
  className,
}: DuplicateBannerProps) {
  const result = useMemo(() => {
    // Exclude the lead being edited from the pool
    const pool = allLeads.filter((l) => l.id !== currentId);

    // Only run detection when there's a meaningful input
    if (!candidate.email && !candidate.phone) return null;
    return detectDuplicate(candidate, pool);
  }, [candidate, allLeads, currentId]);

  if (!result?.isDuplicate) return null;

  const matched = result.matchedLead!;
  const isExact = result.confidence === "exact";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-all",
        isExact
          ? "bg-red-500/10 border-red-500/30 text-red-400"
          : "bg-amber-500/10 border-amber-500/30 text-amber-400",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="font-medium leading-snug">
          {isExact ? "Exact duplicate detected" : "Possible duplicate detected"}
        </p>
        <p className="text-xs mt-0.5 opacity-80">
          {isExact
            ? `Email matches an existing lead: "${matched.name || "Unknown"}"`
            : `Phone number matches an existing lead: "${matched.name || "Unknown"}"`}
        </p>

        {/* Matched lead summary */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs opacity-70">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[160px]">{matched.name}</span>
          </div>
          {matched.email && (
            <span className="text-xs opacity-60 truncate max-w-[160px]">{matched.email}</span>
          )}
          {matched.status && (
            <span className="text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded bg-current/10">
              {matched.status.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      {onViewLead && (
        <button
          type="button"
          onClick={() => onViewLead(matched)}
          className={cn(
            "shrink-0 flex items-center gap-1 text-xs font-medium underline underline-offset-2 hover:opacity-80 transition-opacity",
            isExact ? "text-red-300" : "text-amber-300"
          )}
          aria-label={`View existing lead: ${matched.name}`}
        >
          View
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/** Small "clean" chip shown when a new lead passes duplicate check */
export function DuplicateCleanBadge({ email, phone }: { email?: string; phone?: string }) {
  if (!email && !phone) return null;
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
      <ShieldCheck className="h-3 w-3" />
      No duplicates found
    </div>
  );
}

/**
 * EstimatorIntelligencePanel
 * 
 * Renders in StepResults alongside the cost breakdown.
 * Shows: property fit score, budget conflict, negotiation options.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EstimatorResponse, NegotiationOption } from "./data/discovery-handoff";
import { Squares } from "@/components/ReactBits";

interface EstimatorIntelligencePanelProps {
  response: EstimatorResponse;
  onSelectOption?: (option: NegotiationOption & { isApplied: boolean }) => void;
}

// ─── Suitability Score Ring ───────────────────────────────────────────────────

function SuitabilityRing({ score, tier }: { score: number; tier: string }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (score / 100) * circumference;

  const tierColors: Record<string, string> = {
    excellent: "#233526",
    good: "#c9a96e",
    constrained: "#e07b3a",
    poor: "#c0392b",
  };
  const color = tierColors[tier] || "#c9a96e";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f0ede6" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-2xl font-semibold text-kiro-ink font-serif leading-none"
          >
            {score}
          </motion.span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#8c8c8c] mt-0.5">/ 100</span>
        </div>
      </div>
      <div
        className="px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {tier.replace(/-/g, ' ')}
      </div>
    </div>
  );
}

// ─── Budget Conflict Bar ──────────────────────────────────────────────────────

function BudgetConflictBar({ conflict }: { conflict: EstimatorResponse["budgetConflict"] }) {
  const levelMeta: Record<string, { label: string; color: string; bg: string }> = {
    none:     { label: "Within Budget",    color: "#233526", bg: "#23352615" },
    minor:    { label: "Minor Gap",        color: "#c9a96e", bg: "#c9a96e15" },
    moderate: { label: "Moderate Gap",     color: "#e07b3a", bg: "#e07b3a15" },
    critical: { label: "Significant Gap",  color: "#c0392b", bg: "#c0392b15" },
  };

  const meta = levelMeta[conflict.level] || levelMeta.none;
  const overBudget = conflict.gapAmount < 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.2em] text-[#8c8c8c] font-bold">Budget Alignment</p>
        <span
          className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.15em] font-bold"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <div className="h-1.5 bg-[#f0ede6] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: meta.color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.abs(conflict.gapPercent) + 50)}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        />
      </div>
      <p className="text-[11px] text-kiro-inkSoft">
        {overBudget
          ? `Estimated cost exceeds your budget by ₹${Math.abs(conflict.gapAmount / 100000).toFixed(1)}L (${Math.abs(conflict.gapPercent)}%)`
          : `Your budget has approx. ₹${(conflict.gapAmount / 100000).toFixed(1)}L headroom`
        }
      </p>
    </div>
  );
}

// ─── Negotiation Option Card ──────────────────────────────────────────────────

function NegotiationCard({
  option,
  isExpanded,
  isApplied,
  onToggleExpand,
  onToggleApply,
}: {
  option: NegotiationOption;
  isExpanded: boolean;
  isApplied: boolean;
  onToggleExpand: () => void;
  onToggleApply: (e: React.MouseEvent) => void;
}) {
  const impactDots = Array.from({ length: 5 }).map((_, i) => (
    <span
      key={i}
      className={`w-1.5 h-1.5 rounded-full ${i < option.satisfactionImpact ? "bg-[#c9a96e]" : "bg-kiro-line"}`}
    />
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
        isApplied
          ? "border-kiro-accent bg-kiro-accent/5 shadow-[0_0_15px_rgba(139,111,71,0.1)]"
          : isExpanded
          ? "border-[#233526] bg-[#233526]/4"
          : "border-kiro-line bg-white hover:border-[#c9a96e]/40"
      }`}
      onClick={onToggleExpand}
    >
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-kiro-ink">{option.label}</p>
            <span className="px-2 py-0.5 bg-[#233526]/8 text-[#233526] rounded-full text-[9px] uppercase tracking-widest font-bold">
              Save ₹{(option.savingsAmount / 100000).toFixed(1)}L
            </span>
          </div>
          <p className="text-[11px] text-kiro-inkSoft leading-relaxed">{option.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#8c8c8c]">Sacrifice</p>
          <div className="flex gap-0.5">{impactDots}</div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-kiro-line bg-kiro-bg px-4 py-3 overflow-hidden flex justify-between items-center gap-4"
          >
            <p className="text-[11px] text-kiro-inkSoft italic flex-1">
              <span className="text-[#8c8c8c] uppercase tracking-[0.15em] text-[9px] font-bold not-italic block mb-0.5">Tradeoff</span>
              {option.tradeoff}
            </p>
            <button
                type="button"
                onClick={onToggleApply}
                className={`shrink-0 px-4 py-2 rounded-[6px] text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isApplied 
                    ? "bg-kiro-accent text-white hover:bg-[#705939]" 
                    : "bg-white border border-kiro-accent text-kiro-accent hover:bg-kiro-accent/5"
                }`}
            >
                {isApplied ? "Applied" : "Apply"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function EstimatorIntelligencePanel({ response, onSelectOption }: EstimatorIntelligencePanelProps) {
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [appliedOptionIds, setAppliedOptionIds] = useState<Set<string>>(new Set());

  const hasConflict = response.budgetConflict.level !== "none";
  const hasNegotiationOptions = response.negotiationOptions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-6 relative"
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden rounded-2xl" style={{ mixBlendMode: 'multiply' }}>
        <Squares speed={0.2} squareSize={40} strokeColor="26, 26, 26" opacity={0.1} />
      </div>

      {/* Property Suitability */}
      <div className="bg-white/90 backdrop-blur-sm border border-kiro-line rounded-2xl p-6 relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-px bg-[#c9a96e]" />
          <p className="text-[9px] uppercase tracking-[0.25em] text-kiro-inkSoft font-bold">Property Intelligence</p>
        </div>

        <div className="flex items-start gap-6">
          <SuitabilityRing score={response.fitScore} tier={response.fitTier} />
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold text-kiro-ink">Property Fit Score</p>
            <p className="text-[12px] text-kiro-inkSoft leading-relaxed">{response.fitNarrative}</p>
          </div>
        </div>
      </div>

      {/* Budget Conflict */}
      <div className="bg-white/90 backdrop-blur-sm border border-kiro-line rounded-2xl p-6 relative z-10">
        <BudgetConflictBar conflict={response.budgetConflict} />
      </div>

      {/* Strategy Recommendation */}
      <div
        className={`border rounded-2xl p-5 relative z-10 backdrop-blur-sm ${
          hasConflict ? "border-[#c9a96e]/30 bg-[#fdf9f2]/90" : "border-[#233526]/15 bg-[#233526]/5"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#c9a96e] font-bold">
            Recommended Strategy
          </p>
        </div>
        <p className="text-sm font-semibold text-kiro-ink mb-1.5 capitalize">
          {response.strategy.replace(/_/g, ' ')}
        </p>
        <p className="text-[12px] text-kiro-inkSoft leading-relaxed">{response.strategyRationale}</p>
      </div>

      {/* Negotiation Options */}
      {hasNegotiationOptions && (
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-[#c9a96e]" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-kiro-inkSoft font-bold">
              Adjustment Options
            </p>
          </div>
          <p className="text-[11px] text-[#8c8c8c]">Tap any option to explore the tradeoff details.</p>
          <div className="space-y-3">
            {response.negotiationOptions.map((opt: NegotiationOption) => (
              <NegotiationCard
                key={opt.id}
                option={opt}
                isExpanded={expandedOptionId === opt.id}
                isApplied={appliedOptionIds.has(opt.id)}
                onToggleExpand={() => {
                  setExpandedOptionId(expandedOptionId === opt.id ? null : opt.id);
                }}
                onToggleApply={(e) => {
                  e.stopPropagation();
                  const isApplying = !appliedOptionIds.has(opt.id);
                  setAppliedOptionIds(prev => {
                    const next = new Set(prev);
                    if (isApplying) next.add(opt.id);
                    else next.delete(opt.id);
                    return next;
                  });
                  if (onSelectOption) onSelectOption({ ...opt, isApplied: isApplying });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phasing Plan */}
      {response.phases && response.phases.length > 0 && (
        <div className="space-y-3 relative z-10 bg-white/60 p-4 rounded-2xl border border-white/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-[#c9a96e]" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-kiro-inkSoft font-bold">Phasing Roadmap</p>
          </div>
          <div className="space-y-3">
            {response.phases.map((phase: NonNullable<EstimatorResponse["phases"]>[0]) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * phase.phase }}
                className="flex gap-4 items-start"
              >
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-6 h-6 rounded-full bg-[#233526] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {phase.phase}
                  </div>
                  {phase.phase < (response.phases?.length ?? 0) && (
                    <div className="w-px h-8 bg-kiro-line" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-semibold text-kiro-ink mb-0.5">{phase.label}</p>
                  <p className="text-[10px] text-[#c9a96e] uppercase tracking-[0.15em] mb-2">{phase.timeline} · ₹{(phase.estimatedCost / 100000).toFixed(0)}L</p>
                  <ul className="space-y-1">
                    {phase.scopeItems.slice(0, 4).map((item: string, i: number) => (
                      <li key={i} className="text-[11px] text-kiro-inkSoft flex gap-2">
                        <span className="text-[#c9a96e] mt-0.5">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

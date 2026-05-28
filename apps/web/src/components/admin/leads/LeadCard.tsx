import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/primitives/card";
import { Badge } from "@/components/ui/primitives/badge";
import {
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronsUpDown,
  MessageCircle,
  StickyNote,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives/popover";
import {
  calculateLeadScore,
  getLeadTemperature,
  getLeadHealth,
  formatINR,
  type Lead,
} from "@/lib/scoring/leadScoring";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Stage labels ──────────────────────────────────────────────────────────────
// Psychologically meaningful labels that help trainees understand reality
const STAGE_LABELS: Record<string, string> = {
  new: "New Inquiry",
  initial_contact: "Contact Attempted",
  contacted: "Contact Attempted",
  qualified: "Interested",
  consultation_scheduled: "Req. Gathering",
  proposal: "Proposal Sent",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  final_review: "Final Review",
  won: "Won",
  lost: "Lost",
};

// ─── Source labels & colors ─────────────────────────────────────────────────────
const SOURCE_CHIP: Record<string, { label: string; bg: string; text: string }> = {
  website_contact:            { label: "Website",    bg: "bg-blue-500/15",     text: "text-blue-400" },
  estimator:                  { label: "Estimator",  bg: "bg-teal-500/15",     text: "text-teal-400" },
  style_quiz:                 { label: "Quiz",       bg: "bg-purple-500/15",   text: "text-purple-400" },
  aesthetic_discovery_engine: { label: "Discovery",  bg: "bg-purple-500/15",   text: "text-purple-400" },
  welcome_popup:              { label: "Popup",      bg: "bg-sky-500/15",      text: "text-sky-400" },
  discovery_engine:           { label: "Discovery",  bg: "bg-purple-500/15",   text: "text-purple-400" },
  whatsapp:                   { label: "WhatsApp",   bg: "bg-emerald-500/15",  text: "text-emerald-400" },
  instagram:                  { label: "Instagram",  bg: "bg-pink-500/15",     text: "text-pink-400" },
  referral:                   { label: "Referral",   bg: "bg-amber-500/15",    text: "text-amber-400" },
  other:                      { label: "Other",      bg: "bg-zinc-500/15",     text: "text-zinc-400" },
};

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onStageChange?: (leadId: string, newStatus: string) => void;
}

export function LeadCard({ lead, onClick, onStageChange }: LeadCardProps) {
  const [quickMoveOpen, setQuickMoveOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { ...lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const score = lead.score ?? calculateLeadScore(lead);
  const { label: tempLabel, color: tempColor, emoji } = getLeadTemperature(score);
  const health = getLeadHealth(lead);
  const budget = lead.budget_value_inr ? formatINR(lead.budget_value_inr) : lead.budget ?? null;

  // Temperature-based left border
  const borderColorMap: Record<string, string> = {
    Hot: "border-l-red-500",
    Warm: "border-l-amber-500",
    Cold: "border-l-blue-400/60",
  };

  // Source chip styling
  const leadSource = lead.source || lead.lead_source || "other";
  const sourceChip = SOURCE_CHIP[leadSource] ?? SOURCE_CHIP.other;

  const activityDate = lead.last_activity_at ?? lead.created_at;
  const timeAgo = activityDate
    ? formatDistanceToNow(new Date(activityDate), { addSuffix: true })
    : null;

  // Requirement one-liner from message, notes, or category
  const requirement = lead.message?.slice(0, 60) || lead.category || lead.lead_type || "General Inquiry";

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group">
      <Card
        className={cn(
          "cursor-pointer transition-all border-l-[3px] hover:shadow-lg hover:shadow-black/20",
          "bg-[hsl(220_18%_10%)] hover:bg-[hsl(220_18%_13%)]",
          "border border-[hsl(var(--admin-border))]/50",
          "rounded-xl",
          borderColorMap[tempLabel] ?? "border-l-zinc-600",
          isDragging && "rotate-1 shadow-2xl scale-102 border-l-[hsl(var(--admin-primary))]"
        )}
        onClick={() => onClick(lead)}
      >
        <CardContent className="p-0">
          {/* ──── TOP: Name + Score + Source ──── */}
          <div className="px-3.5 pt-3 pb-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <Avatar className={cn(
                  "h-8 w-8 shrink-0 border transition-transform duration-200 group-hover:scale-105",
                  tempLabel === "Hot" ? "border-red-500/40" : "border-[hsl(var(--admin-border))]"
                )}>
                  <AvatarFallback className="bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-primary))] text-[11px] font-bold">
                    {lead.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h4 className="font-semibold text-[13px] leading-tight text-[hsl(var(--admin-text))] tracking-tight group-hover:text-[hsl(var(--admin-primary))] transition-colors truncate">
                    {lead.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {/* Source chip */}
                    <span className={cn(
                      "text-[9px] font-semibold px-1.5 py-px rounded-full",
                      sourceChip.bg, sourceChip.text
                    )}>
                      {sourceChip.label}
                    </span>
                  </div>
                </div>
              </div>
              {/* Score badge */}
              <Badge
                variant="outline"
                className={cn("text-[10px] px-2 py-0.5 h-5 font-bold tracking-wide uppercase shrink-0 border", tempColor)}
              >
                {emoji} {score}
              </Badge>
            </div>
          </div>

          {/* ──── MIDDLE: Budget + City + Requirement ──── */}
          <div className="px-3.5 pb-2 space-y-1.5">
            {/* Requirement one-liner */}
            <p className="text-[11px] text-[hsl(var(--admin-text-muted))] leading-snug line-clamp-1">
              {requirement}
            </p>
            {/* Budget + City chips */}
            {(lead.city || budget) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {budget && (
                  <span className="inline-flex items-center text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md px-2 py-0.5">
                    ₹ {budget}
                  </span>
                )}
                {lead.city && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))]/40 rounded-md px-2 py-0.5 text-[hsl(var(--admin-text-muted))]">
                    <MapPin className="h-2.5 w-2.5" /> {lead.city}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ──── BOTTOM: Last Activity + Next Step + Assigned ──── */}
          <div className="px-3.5 pb-2 pt-1.5 border-t border-[hsl(var(--admin-border))]/30">
            <div className="flex justify-between items-center text-[10px]">
              <div className="flex items-center gap-1 text-[hsl(var(--admin-text-muted))]">
                <Clock className="h-3 w-3" />
                <span>{timeAgo ?? "—"}</span>
              </div>
              <span className={cn(
                "text-[9px] font-semibold px-1.5 py-0.5 rounded",
                lead.assigned_to
                  ? "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-primary))]/20"
                  : "bg-red-500/8 text-red-400/80 border border-red-500/15"
              )}>
                {lead.assigned_to || "Unassigned"}
              </span>
            </div>

            {/* Next action bar */}
            <div className={cn(
              "mt-2 rounded-lg px-2.5 py-1.5 text-[10px] font-medium flex items-center justify-between border",
              lead.next_step
                ? "bg-[hsl(var(--admin-primary))]/5 text-[hsl(var(--admin-primary))] border-[hsl(var(--admin-primary))]/15"
                : "bg-red-500/5 text-red-400/80 border-red-500/10"
            )}>
              <div className="flex items-center gap-1.5 truncate mr-2">
                <span className="font-bold uppercase text-[8px] tracking-wider shrink-0 opacity-70">Next:</span>
                <span className="truncate">{lead.next_step || "No follow-up scheduled"}</span>
              </div>
              <ArrowRight className="h-3 w-3 shrink-0 opacity-50" />
            </div>
          </div>

          {/* ──── STALE WARNING ──── */}
          {health.isStale && (
            <div className="mx-3.5 mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-amber-500 bg-amber-500/8 border border-amber-500/15 rounded-lg px-2.5 py-1.5">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>Stale — {health.freshnessDays}d no activity</span>
            </div>
          )}

          {/* ──── QUICK ACTIONS (visible on hover) ──── */}
          <div
            className="hidden group-hover:flex items-center border-t border-[hsl(var(--admin-border))]/30 divide-x divide-[hsl(var(--admin-border))]/30"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] py-2 text-[hsl(var(--admin-text-muted))] hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                title="Call"
              >
                <Phone className="h-3 w-3" /> Call
              </a>
            )}
            {lead.phone && (
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] py-2 text-[hsl(var(--admin-text-muted))] hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] py-2 text-[hsl(var(--admin-text-muted))] hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                title="Email"
              >
                <Mail className="h-3 w-3" /> Email
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClick(lead); }}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] py-2 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-primary))]/10 hover:text-[hsl(var(--admin-primary))] transition-colors"
            >
              <Eye className="h-3 w-3" /> View
            </button>
            {onStageChange && (
              <Popover open={quickMoveOpen} onOpenChange={setQuickMoveOpen}>
                <PopoverTrigger asChild>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1 text-[10px] py-2 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-primary))]/10 hover:text-[hsl(var(--admin-primary))] transition-colors"
                    title="Quick Move"
                  >
                    <ChevronsUpDown className="h-3 w-3" /> Move
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  className="w-52 p-1.5 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
                  onPointerDownOutside={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider px-2 py-1.5">
                    Move to Stage
                  </div>
                  <div className="space-y-0.5">
                    {Object.entries(STAGE_LABELS).map(([key, stageLabel]) => (
                      <button
                        key={key}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          if (key !== lead.status) {
                            onStageChange(lead.id, key);
                          }
                          setQuickMoveOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors",
                          key === lead.status
                            ? "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))] font-semibold cursor-default"
                            : "hover:bg-[hsl(var(--admin-surface-hover))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
                        )}
                        disabled={key === lead.status}
                      >
                        {stageLabel}
                        {key === lead.status && " ✓"}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

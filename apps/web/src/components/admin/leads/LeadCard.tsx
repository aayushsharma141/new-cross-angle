import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/primitives/card";
import { Badge } from "@/components/ui/primitives/badge";
import { Calendar, Phone, Mail, MapPin, AlertTriangle, CheckCircle, Clock, ArrowRight, ChevronsUpDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import { Button } from "@/design-system/components/Button";
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

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  initial_contact: "Initial Contact",
  contacted: "Contacted",
  qualified: "Qualified",
  consultation_scheduled: "Consultation",
  proposal: "Proposal",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  final_review: "Final Review",
  won: "Won",
  lost: "Lost",
};

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onStageChange?: (leadId: string, newStatus: string) => void;
}

/** Compact health indicator dot */
function HealthDot({ riskLevel }: { riskLevel: "low" | "medium" | "high" }) {
  return (
    <span
      title={`Risk: ${riskLevel}`}
      className={cn(
        "inline-block w-2 h-2 rounded-full shrink-0",
        riskLevel === "low" && "bg-emerald-500",
        riskLevel === "medium" && "bg-amber-400",
        riskLevel === "high" && "bg-red-500 animate-pulse"
      )}
    />
  );
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
  const { label, color, emoji } = getLeadTemperature(score);
  const health = getLeadHealth(lead);
  const budget = lead.budget_value_inr ? formatINR(lead.budget_value_inr) : lead.budget ?? null;

  const borderColorMap: Record<string, string> = {
    Hot: "border-l-red-500",
    Warm: "border-l-amber-500",
    Cold: "border-l-blue-500",
  };

  const activityDate = lead.last_activity_at ?? lead.created_at;
  const timeAgo = activityDate
    ? formatDistanceToNow(new Date(activityDate), { addSuffix: true })
    : null;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group">
      <Card
        className={cn(
          "cursor-pointer transition-all border-l-4 bg-card/80 hover:bg-card hover:shadow-lg hover:shadow-black/20",
          borderColorMap[label] ?? "border-l-zinc-600",
          isDragging && "rotate-1 shadow-2xl"
        )}
        onClick={() => onClick(lead)}
      >
        <CardContent className="p-3 space-y-2.5">
          {/* Row 1: Avatar + Name + Score badge */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <Avatar className="h-7 w-7 shrink-0 border border-muted">
                <AvatarFallback className="bg-[hsl(var(--admin-background))] text-[hsl(var(--brand-primary))] text-[9px] font-bold">
                  {lead.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm leading-tight truncate">{lead.name}</h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  {lead.category || lead.lead_type || "General Inquiry"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <HealthDot riskLevel={health.riskLevel} />
              <Badge
                variant="outline"
                className={cn("text-[9px] px-1.5 py-0 h-5 font-bold tracking-wide", color)}
              >
                {emoji} {score}
              </Badge>
            </div>
          </div>

          {/* Row 2: Contact info */}
          <div className="space-y-0.5 opacity-75">
            {lead.email && (
              <div className="flex items-center text-[10px] text-muted-foreground">
                <Mail className="mr-1.5 h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center text-[10px] text-muted-foreground">
                <Phone className="mr-1.5 h-2.5 w-2.5 shrink-0" />
                <span>{lead.phone}</span>
              </div>
            )}
          </div>

          {/* Row 3: Location + Budget chips */}
          {(lead.city || budget) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {lead.city && (
                <span className="inline-flex items-center gap-0.5 text-[9px] bg-muted/50 rounded px-1.5 py-0.5 text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" /> {lead.city}
                </span>
              )}
              {budget && (
                <span className="inline-flex items-center text-[9px] bg-emerald-500/10 text-emerald-500 rounded px-1.5 py-0.5 font-medium">
                  {budget}
                </span>
              )}
            </div>
          )}

          {/* Row 4: Stale warning */}
          {health.isStale && (
            <div className="flex items-center gap-1 text-[9px] text-amber-500 bg-amber-500/10 rounded px-2 py-1">
              <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
              <span>Stale — {health.freshnessDays}d no activity</span>
            </div>
          )}

          {/* Row 5: Time + next_step */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              <span>{timeAgo ?? "—"}</span>
            </div>
            {lead.next_step && (
              <span className="flex items-center gap-0.5 text-primary truncate max-w-[120px]">
                <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                {lead.next_step}
              </span>
            )}
          </div>

          {/* Quick action row — visible on hover, not draggable */}
          <div
            className="hidden group-hover:flex items-center gap-1 pt-1 -mx-1"
            onPointerDown={(e) => e.stopPropagation()} // prevent drag trigger
          >
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-0.5 text-[9px] py-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Call"
              >
                <Phone className="h-2.5 w-2.5" /> Call
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-0.5 text-[9px] py-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Email"
              >
                <Mail className="h-2.5 w-2.5" /> Email
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClick(lead); }}
              className="flex-1 flex items-center justify-center gap-0.5 text-[9px] py-1 rounded text-primary hover:bg-primary/10 transition-colors"
            >
              <CheckCircle className="h-2.5 w-2.5" /> View
            </button>
            {onStageChange && (
              <Popover open={quickMoveOpen} onOpenChange={setQuickMoveOpen}>
                <PopoverTrigger asChild>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-0.5 text-[9px] py-1 rounded text-muted-foreground hover:bg-[hsl(var(--brand-primary))]/10 hover:text-[hsl(var(--brand-primary))] transition-colors"
                    title="Quick Move"
                  >
                    <ChevronsUpDown className="h-2.5 w-2.5" /> Move
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  className="w-48 p-1"
                  onPointerDownOutside={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                    Move to Stage
                  </div>
                  <div className="space-y-0.5">
                    {Object.entries(STAGE_LABELS).map(([key, label]) => (
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
                            ? "bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))] font-semibold cursor-default"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                        disabled={key === lead.status}
                      >
                        {label}
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

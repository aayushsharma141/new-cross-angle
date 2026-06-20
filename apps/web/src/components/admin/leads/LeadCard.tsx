import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Phone,
  MapPin,
  Clock,
  AlarmClock,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";
import {
  calculateLeadScore,
  formatINR,
  STALENESS_THRESHOLDS,
  type Lead,
} from "@/lib/scoring/leadScoring";
import { getCrmSource, getCrmTemperature } from "@/lib/crm";
import { cn } from "@/lib/utils";

interface LeadCardProps {
  lead: Lead;
  onClick?: (lead: Lead) => void;
  isPreview?: boolean;
}

export function LeadCard({ lead, onClick, isPreview = false }: LeadCardProps) {
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
  };

  const score = lead.score ?? calculateLeadScore(lead);
  const temperature = getCrmTemperature(score);
  const tempLabel = temperature.label;
  const tempDotCls = temperature.dotClass;

  const sourceChip = getCrmSource(lead.source ?? lead.lead_source);

  const activityDate = lead.last_activity_at ?? lead.created_at;
  const daysSinceActivity = activityDate
    ? differenceInDays(new Date(), new Date(activityDate))
    : 0;
  const timeAgo = activityDate
    ? daysSinceActivity > 7
      ? format(new Date(activityDate), "MMM d, yyyy")
      : formatDistanceToNow(new Date(activityDate), { addSuffix: true })
    : null;

  // SLA indicator — compare freshness against stage threshold
  const isOpenStage = lead.status !== "won" && lead.status !== "lost";
  const slaThreshold = STALENESS_THRESHOLDS[lead.status] ?? 14;
  const slaRatio = slaThreshold > 0 ? daysSinceActivity / slaThreshold : 0;
  const slaDot = !isOpenStage ? null
    : slaRatio > 1   ? { cls: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]", tip: `Overdue — ${daysSinceActivity}d since last activity (SLA: ${slaThreshold}d)` }
    : slaRatio >= 0.5 ? { cls: "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]", tip: `Due soon — ${daysSinceActivity}d of ${slaThreshold}d SLA` }
    : { cls: "bg-emerald-400", tip: `On track — ${daysSinceActivity}d of ${slaThreshold}d SLA` };

  const requirement = lead.message?.slice(0, 60) || lead.category || lead.lead_type || "General Inquiry";
  const formattedName = lead.name 
    ? lead.name.replace(/\b\w/g, l => l.toUpperCase()) 
    : "Unknown Lead";
    
  // Next step logic
  const hasNextStep = !!lead.next_step;
  const formattedNextStep = lead.next_step 
    ? lead.next_step.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) 
    : "No follow-up set";
  // Determine if urgent (mock logic based on temp)
  const isUrgent = hasNextStep && tempLabel === "Hot";

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={isPreview ? undefined : () => onClick?.(lead)}
      onKeyDown={isPreview ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(lead); } }}
      className={cn(
        "bg-admin-card border border-admin-border rounded-md p-3 cursor-pointer transition-all duration-150 ease-in outline-none",
        "hover:border-admin-border-subtle hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        "focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-primary))] focus-visible:ring-offset-2",
        isDragging && "opacity-40"
      )}
    >
      {/* Line 1: Source + Name + Temp */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded", sourceChip.chipClass)}>
            {sourceChip.shortCode}
          </span>
          <span className="text-[13px] font-semibold text-admin-text truncate">
            {formattedName}
          </span>
        </div>
        <span className="shrink-0 relative group">
          <span className={cn("inline-block w-1.5 h-1.5 rounded-full", tempDotCls)}></span>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-admin-bg text-admin-text text-[11px] px-2.5 py-1.5 rounded-md border border-admin-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tempLabel} (Score: {score})
          </span>
        </span>
      </div>

      {/* Line 2: Phone + City */}
      <div className="text-[11px] text-admin-text-muted flex items-center gap-3 mb-2 truncate">
        {lead.phone ? (
          <span className="flex items-center gap-1 truncate">
            <Phone className="w-3 h-3 shrink-0" />{lead.phone}
          </span>
        ) : null}
        {lead.city ? (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />{lead.city}
          </span>
        ) : null}
      </div>

      {/* Line 3: Intent */}
      <div className="text-[11px] text-admin-text-subtle mb-2 truncate">
        {requirement}
        {lead.budget_value_inr ? (
          <> · <span className="text-emerald-400">{formatINR(lead.budget_value_inr)}</span></>
        ) : null}
      </div>

      {/* Line 4: Next Action Pill */}
      {hasNextStep ? (
        <button
          type="button"
          disabled={isPreview}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(lead);
          }}
          className={cn(
          "w-full h-7 rounded-md border text-[11px] font-medium flex items-center justify-between px-2.5",
          isUrgent 
            ? "bg-amber-500/12 hover:bg-amber-500/20 border-amber-500/30 text-amber-200" 
            : "bg-admin-card hover:bg-admin-surface-hover border-admin-border text-admin-text-muted"
        )}
        >
          <span className="flex items-center gap-1.5 truncate">
            {isUrgent ? <AlarmClock className="w-3 h-3 shrink-0" /> : <Clock className="w-3 h-3 shrink-0" />}
            <span className="truncate">{formattedNextStep}</span>
          </span>
          <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
        </button>
      ) : (
        <button
          type="button"
          disabled={isPreview}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(lead);
          }}
          className="w-full h-7 rounded-md bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 text-[11px] font-medium flex items-center justify-center gap-1.5"
        >
          <AlertCircle className="w-3 h-3" /> No follow-up set
        </button>
      )}

      {/* Footer: Assignee + SLA + Age */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-admin-text-subtle">
        <span className="flex items-center gap-1.5">
          {lead.assigned_to ? (
            <>
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-[9px] font-semibold text-white grid place-items-center">
                {lead.assigned_to.substring(0,2).toUpperCase()}
              </span>
              <span>{lead.assigned_to}</span>
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full border border-dashed border-admin-border-subtle text-[9px] grid place-items-center">?</span>
              <span>Unassigned</span>
            </>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          {slaDot && (
            <span className="relative group">
              <span className={cn("inline-block w-1.5 h-1.5 rounded-full", slaDot.cls)} />
              <span className="absolute bottom-full right-0 mb-2 bg-admin-bg text-admin-text text-[10px] px-2 py-1.5 rounded-md border border-admin-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {slaDot.tip}
              </span>
            </span>
          )}
          <Clock className="w-3 h-3 shrink-0" /> {timeAgo ?? "—"}
        </span>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LeadCard } from "./LeadCard";
import { leadStatusOptions } from "@/lib/validations";
import { formatINR, getLeadHealth } from "@/lib/leadScoring";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/leadScoring";
import { AlertTriangle } from "lucide-react";

interface LeadPipelineProps {
  leads: Lead[];
  onLeadMove: (leadId: string, newStatus: string) => void;
  onLeadClick: (lead: Lead) => void;
}

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  new:                    { label: "New",                   color: "text-blue-400",   dot: "bg-blue-400" },
  contacted:              { label: "Contacted",             color: "text-zinc-400",   dot: "bg-zinc-400" },
  qualified:              { label: "Qualified",             color: "text-cyan-400",   dot: "bg-cyan-400" },
  consultation_scheduled: { label: "Consultation",          color: "text-violet-400", dot: "bg-violet-400" },
  proposal_sent:          { label: "Proposal Sent",         color: "text-amber-400",  dot: "bg-amber-400" },
  final_review:           { label: "Final Review",          color: "text-orange-400", dot: "bg-orange-400" },
  negotiation:            { label: "Negotiation",           color: "text-yellow-400", dot: "bg-yellow-400" },
  won:                    { label: "Won ✓",                 color: "text-emerald-400",dot: "bg-emerald-400" },
  lost:                   { label: "Lost",                  color: "text-red-400",    dot: "bg-red-400" },
};

interface ColumnProps {
  id: string;
  leads: Lead[];
  onLeadClick: (l: Lead) => void;
  onLeadMove: (leadId: string, newStatus: string) => void;
}

const Column = ({ id, leads, onLeadClick, onLeadMove }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const meta = STATUS_META[id] ?? { label: id, color: "text-zinc-400", dot: "bg-zinc-400" };

  // Column-level stats
  const staleCount = leads.filter((l) => getLeadHealth(l).isStale).length;
  const columnValue = leads.reduce((acc, l) => acc + (l.budget_value_inr ?? 0), 0);

  return (
    <div
      className={cn(
        "flex flex-col min-w-[270px] max-w-[300px] w-full rounded-xl border border-[hsl(var(--admin-border))] transition-colors",
        "bg-[hsl(var(--admin-surface))/40] backdrop-blur-sm",
        isOver && "border-[hsl(var(--brand-primary))]/40 bg-[hsl(var(--brand-primary))]/5"
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-[hsl(var(--admin-border))] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full shrink-0", meta.dot)} />
            <h3 className={cn("font-semibold text-xs uppercase tracking-wider", meta.color)}>
              {meta.label}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {staleCount > 0 && (
              <span
                title={`${staleCount} stale lead${staleCount > 1 ? "s" : ""}`}
                className="flex items-center gap-0.5 text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded"
              >
                <AlertTriangle className="h-2.5 w-2.5" /> {staleCount}
              </span>
            )}
            <span className="text-[10px] font-semibold bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded">
              {leads.length}
            </span>
          </div>
        </div>
        {/* Column pipeline value */}
        {columnValue > 0 && (
          <p className="text-[10px] text-muted-foreground/70 mt-1 pl-3.5">
            {formatINR(columnValue)}
          </p>
        )}
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto p-2 space-y-2 min-h-[160px] max-h-[calc(100vh-300px)]",
          "scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent"
        )}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} onStageChange={onLeadMove} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div
            className={cn(
              "h-24 flex items-center justify-center text-[10px] text-muted-foreground/50",
              "border-2 border-dashed border-muted/30 rounded-lg transition-colors",
              isOver && "border-[hsl(var(--brand-primary))]/30 bg-[hsl(var(--brand-primary))]/5 text-primary/50"
            )}
          >
            {isOver ? "Drop here" : "No leads"}
          </div>
        )}
      </div>
    </div>
  );
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

export function LeadPipeline({ leads, onLeadMove, onLeadClick }: LeadPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = leadStatusOptions;
  const isLeadStatus = (v: string): v is (typeof leadStatusOptions)[number] =>
    (columns as readonly string[]).includes(v);

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }

    const activeLead = leads.find((l) => l.id === active.id);
    if (!activeLead) { setActiveId(null); return; }

    let newStatus = over.id as string;
    if (!isLeadStatus(newStatus)) {
      const overLead = leads.find((l) => l.id === over.id);
      if (overLead) newStatus = overLead.status;
    }

    if (activeLead.status !== newStatus && isLeadStatus(newStatus)) {
      onLeadMove(activeLead.id, newStatus);
    }
    setActiveId(null);
  };

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 h-[calc(100vh-240px)] items-start px-0.5">
        {columns.map((status) => (
            <Column
            key={status}
            id={status}
            leads={leads.filter((l) => l.status === status)}
            onLeadClick={onLeadClick}
            onLeadMove={onLeadMove}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeLead ? (
          <div className="rotate-2 scale-105 shadow-2xl rounded-xl">
            <LeadCard lead={activeLead} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

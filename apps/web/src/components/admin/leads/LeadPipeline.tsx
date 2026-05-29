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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { LeadCard } from "./LeadCard";
import { leadStatusOptions } from "@/lib/validation/validations";
import { formatINR } from "@/lib/scoring/leadScoring";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/scoring/leadScoring";
import { Filter, Plus, CheckCircle2, Inbox, Info } from "lucide-react";
import { CRM_STAGES, getCrmStageMeta, STAGE_PLAYBOOK, type CrmStageId } from "@/lib/crm/stages";

interface LeadPipelineProps {
  leads: Lead[];
  onLeadMove: (leadId: string, newStatus: string) => void;
  onLeadClick: (lead: Lead) => void;
  onAddLead?: (status: string) => void;
  onStageFilter?: (status: string) => void;
  statusFilter?: string;
}

interface ColumnProps {
  id: string;
  leads: Lead[];
  onLeadClick: (l: Lead) => void;
  onLeadMove: (leadId: string, newStatus: string) => void;
  onAddLead?: (status: string) => void;
  onStageFilter?: (status: string) => void;
  isSingleColumn?: boolean;
}

const Column = ({ id, leads, onLeadClick, onLeadMove, onAddLead, onStageFilter, isSingleColumn }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  const meta = getCrmStageMeta(id) ?? {
    label: id,
    shortLabel: id,
    dotClass: "bg-zinc-400",
    borderTopClass: "border-t-zinc-600",
  };

  const columnValue = leads.reduce((acc, l) => acc + (l.budget_value_inr ?? 0), 0);
  
  // Special Won column style
  if (id === "won" && !isSingleColumn) {
    return (
      <section
        ref={setNodeRef}
        className={cn(
          "w-[260px] shrink-0 bg-admin-surface border border-admin-border border-t-2 rounded-lg flex flex-col max-h-[calc(100vh-250px)] opacity-80 hover:opacity-100 transition duration-200",
          meta.borderTopClass,
          isOver && "border-admin-primary/50 bg-admin-surface-hover shadow-lg shadow-amber-500/5"
        )}
      >
        <header className="px-4 py-3 flex items-center justify-between border-b border-admin-border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-[12px] font-semibold text-admin-text tracking-wide">{meta.label}</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
              {leads.length}
            </span>
          </div>
        </header>
        <div className="p-3 text-[12px] text-admin-text-subtle flex flex-col items-center justify-center gap-2 mt-4">
          <span className="text-emerald-400 text-[20px] font-semibold">
            {formatINR(columnValue)}
          </span>
          <span>Total value won</span>
          <button
            type="button"
            onClick={() => onStageFilter?.("won")}
            className="mt-2 text-[12px] text-admin-text-muted hover:text-admin-text underline-offset-2 hover:underline"
          >
            Filter to won leads
          </button>
        </div>
        
        {/* Invisible drop zone for drag & drop to Won */}
        <div className="flex-1 min-h-[100px]" />
      </section>
    );
  }

  // Normal Column
  return (
    <section
      className={cn(
        "bg-admin-surface border border-admin-border border-t-2 rounded-lg flex flex-col max-h-[calc(100vh-250px)] transition-all",
        meta.borderTopClass,
        isOver && "border-admin-primary/50 bg-admin-surface-hover shadow-lg shadow-amber-500/5",
        isSingleColumn ? "w-full" : "w-[300px] shrink-0"
      )}
    >
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-admin-border shrink-0">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", meta.dotClass)}></span>
          <h3 className="text-[12px] font-semibold text-admin-text tracking-wide">{meta.label}</h3>
          <span className="text-[10px] bg-admin-surface-hover text-admin-text-muted px-1.5 py-0.5 rounded">
            {leads.length}
          </span>
          {/* Stage Guide tooltip */}
          {STAGE_PLAYBOOK[id as CrmStageId] && (
            <span className="relative group cursor-help">
              <Info className="w-3 h-3 text-admin-text-subtle group-hover:text-admin-text transition-colors" />
              <span className="absolute left-0 top-full mt-2 w-56 p-2.5 rounded-lg bg-admin-bg border border-admin-border-subtle text-[10px] text-admin-text opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                <span className="block text-admin-text-subtle uppercase tracking-wider font-semibold mb-1">Goal</span>
                <span className="block mb-2">{STAGE_PLAYBOOK[id as CrmStageId].goal}</span>
                <span className="block text-admin-text-subtle uppercase tracking-wider font-semibold mb-1">Exit criteria</span>
                <span className="block">{STAGE_PLAYBOOK[id as CrmStageId].exitCriteria}</span>
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
           {columnValue > 0 && (
             <span className="text-[10px] text-admin-text-subtle">{formatINR(columnValue)}</span>
           )}
           <button
             type="button"
             onClick={() => onStageFilter?.(id)}
             className="w-6 h-6 rounded hover:bg-admin-surface-hover grid place-items-center"
             aria-label={`Filter leads to ${meta.label}`}
             title={`Filter to ${meta.label}`}
           >
             <Filter className="w-3.5 h-3.5 text-admin-text-subtle" />
           </button>
        </div>
      </header>

      {/* Body */}
      <div
        ref={setNodeRef}
        className={cn(
          "p-4 overflow-y-auto flex-1 min-h-[150px] custom-scrollbar",
          isSingleColumn ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max items-start" : "flex flex-col gap-2"
        )}
      >
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
            <div className="w-10 h-10 rounded-full bg-admin-bg grid place-items-center mb-2">
              <Inbox className="w-4 h-4 text-admin-text-subtle" />
            </div>
            <div className="text-[11px] text-admin-text-subtle leading-snug">
              {id === "new" 
                ? "New leads from your website, estimator, and WhatsApp appear here automatically."
                : "Drag leads here, or they'll arrive when you move them forward."}
            </div>
          </div>
        ) : (
          <SortableContext items={leads.map((l) => l.id)} strategy={isSingleColumn ? rectSortingStrategy : verticalListSortingStrategy}>
            {leads.map((lead) => (
              <div key={lead.id} className={isSingleColumn ? "h-fit" : ""}>
                <LeadCard lead={lead} onClick={onLeadClick} onStageChange={onLeadMove} />
              </div>
            ))}
          </SortableContext>
        )}
      </div>

      {/* Footer */}
      <footer className="px-3 py-2 border-t border-admin-border shrink-0">
        <button
          type="button"
          onClick={() => onAddLead?.(id)}
          className="w-full h-8 rounded-md text-[12px] text-admin-text-subtle hover:text-admin-text hover:bg-admin-surface-hover flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add lead here
        </button>
      </footer>
    </section>
  );
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

export function LeadPipeline({ leads, onLeadMove, onLeadClick, onAddLead, onStageFilter, statusFilter }: LeadPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  let columns = CRM_STAGES.map((stage) => stage.id);
  if (statusFilter && statusFilter !== "all") {
    columns = columns.filter(id => id === statusFilter);
  } else {
    columns = columns.filter(id => id !== "lost");
  }
  
  const isLeadStatus = (v: string): v is (typeof leadStatusOptions)[number] =>
    (CRM_STAGES.map(s => s.id) as readonly string[]).includes(v);

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
      <div className="px-1 pb-8 overflow-x-auto h-full flex-1 min-h-0 custom-scrollbar">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map((status) => (
            <Column
              key={status}
              id={status}
              leads={leads.filter((l) => l.status === status)}
              onLeadClick={onLeadClick}
              onLeadMove={onLeadMove}
              onAddLead={onAddLead}
              onStageFilter={onStageFilter}
              isSingleColumn={columns.length === 1}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeLead ? (
          <div className="rotate-2 scale-105 shadow-2xl rounded-xl w-[280px]">
            <LeadCard lead={activeLead} isPreview />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

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
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    DropAnimation,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LeadCard } from "./LeadCard";
import { leadStatusOptions } from "@/lib/validations";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    service?: string;
    status: string;
    notes?: string;
    created_at?: string;
    score?: number;
}

interface LeadPipelineProps {
    leads: Lead[];
    onLeadMove: (leadId: string, newStatus: string) => void;
    onLeadClick: (lead: Lead) => void;
}

const statusColors: Record<string, string> = {
    "new": "bg-blue-100 text-blue-700 border-blue-200",
    "contacted": "bg-purple-100 text-purple-700 border-purple-200",
    "qualified": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "proposal": "bg-orange-100 text-orange-700 border-orange-200",
    "negotiation": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "closed": "bg-green-100 text-green-700 border-green-200",
    "lost": "bg-red-100 text-red-700 border-red-200",
};

const Column = ({ id, leads, onLeadClick }: { id: string; leads: Lead[]; onLeadClick: (l: Lead) => void }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    const colorClass = statusColors[id as keyof typeof statusColors] || "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <div className={cn(
            "bg-muted/30 p-4 rounded-xl min-w-[300px] w-full max-w-xs flex flex-col h-full border border-[hsl(var(--admin-border))] transition-colors",
            isOver && "bg-muted/60 border-[hsl(var(--brand-primary))]/30"
        )}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold capitalize text-sm flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", colorClass.split(" ")[1].replace("text-", "bg-").replace("700", "500"))} />
                    {id}
                </h3>
                <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full border", colorClass)}>
                    {leads.length}
                </span>
            </div>

            <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[150px] scrollbar-thin scrollbar-thumb-muted-foreground/20">
                <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {leads.map((lead) => (
                            <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
                        ))}
                    </div>
                </SortableContext>
                {leads.length === 0 && (
                    <div className={cn(
                        "h-32 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-muted rounded-lg mt-2 transition-colors",
                        isOver && "border-[hsl(var(--brand-primary))]/40 bg-[hsl(var(--brand-primary))]/5"
                    )}>
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
};

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function LeadPipeline({ leads, onLeadMove, onLeadClick }: LeadPipelineProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columns = leadStatusOptions;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeLead = leads.find((l) => l.id === active.id);
        if (!activeLead) {
            setActiveId(null);
            return;
        }

        // Determine target status
        let newStatus = over.id as string;

        // If dropped on another lead, find that lead's status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!columns.includes(newStatus as any)) {
            const overLead = leads.find((l) => l.id === over.id);
            if (overLead) {
                newStatus = overLead.status;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (activeLead.status !== newStatus && columns.includes(newStatus as any)) {
            onLeadMove(activeLead.id, newStatus);
        }

        setActiveId(null);
    };

    const getLeadsByStatus = (status: string) => {
        return leads.filter((l) => l.status === status);
    };

    const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-220px)] w-full px-1">
                {columns.map((status) => (
                    <Column
                        key={status}
                        id={status}
                        leads={getLeadsByStatus(status)}
                        onLeadClick={onLeadClick}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeLead ? (
                    <div className="rotate-2 cursor-grabbing scale-105 shadow-xl rounded-xl">
                        <LeadCard lead={activeLead} onClick={() => { }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

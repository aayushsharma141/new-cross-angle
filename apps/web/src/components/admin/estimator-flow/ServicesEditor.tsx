import { useState, useEffect } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { Save, Loader2, Plus, X, GripVertical } from "lucide-react";
import { DEFAULT_PRICING_CONFIG } from "@/addons/calculators/components/data/pricing-config";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ServiceItem {
  id: string;
  label: string;
  rateLabel: string;
  rate: number | null;
  gst: boolean;
  desc: string;
  includes: string[];
  excludes?: string[];
}

interface ExecTier {
  min: number;
  max: number;
  label: string;
  desc: string;
}

function SortableServiceItem({
  svc,
  expandedSvc,
  setExpandedSvc,
  updateSvc,
  addInclude,
  updateInclude,
  removeInclude,
}: {
  svc: ServiceItem;
  expandedSvc: string | null;
  setExpandedSvc: (id: string | null) => void;
  updateSvc: (id: string, field: keyof ServiceItem, value: ServiceItem[keyof ServiceItem]) => void;
  addInclude: (id: string) => void;
  updateInclude: (id: string, idx: number, val: string) => void;
  removeInclude: (id: string, idx: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: svc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 50, opacity: 0.5 } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-[hsl(var(--admin-border))]/50 bg-[hsl(var(--admin-surface))]/50 ${
        isDragging ? "shadow-lg ring-1 ring-[hsl(var(--admin-primary))]" : ""
      }`}
    >
      {/* Header row */}
      <div className="w-full flex items-center gap-3 px-3 py-2.5">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <button
          onClick={() => setExpandedSvc(expandedSvc === svc.id ? null : svc.id)}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <span className="text-[10px] font-bold text-[hsl(var(--admin-primary))] w-6">
            {svc.id}
          </span>
          <span className="text-sm font-medium text-[hsl(var(--admin-text))] flex-1">
            {svc.label}
          </span>
          <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">
            {svc.rateLabel}
          </span>
        </button>
      </div>
      {/* Expanded editor */}
      {expandedSvc === svc.id && (
        <div className="px-3 pb-3 space-y-3 border-t border-[hsl(var(--admin-border))]/30 pt-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label htmlFor={`svc-label-${svc.id}`} className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                Label
              </label>
              <Input
                id={`svc-label-${svc.id}`}
                value={svc.label}
                onChange={(e) => updateSvc(svc.id, "label", e.target.value)}
                className="h-7 text-xs bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
              />
            </div>
            <div>
              <label htmlFor={`svc-rateLabel-${svc.id}`} className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                Rate Label
              </label>
              <Input
                id={`svc-rateLabel-${svc.id}`}
                value={svc.rateLabel}
                onChange={(e) => updateSvc(svc.id, "rateLabel", e.target.value)}
                className="h-7 text-xs bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
              />
            </div>
            <div>
              <label htmlFor={`svc-rate-${svc.id}`} className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                Rate (₹/sqft)
              </label>
              <Input
                id={`svc-rate-${svc.id}`}
                type="number"
                value={svc.rate ?? ""}
                onChange={(e) =>
                  updateSvc(svc.id, "rate", e.target.value ? +e.target.value : null)
                }
                className="h-7 text-xs bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="text-[10px] text-[hsl(var(--admin-text-muted))] flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={svc.gst}
                  onChange={(e) => updateSvc(svc.id, "gst", e.target.checked)}
                  className="rounded"
                />
                GST
              </label>
            </div>
          </div>
          <div>
            <label htmlFor={`svc-desc-${svc.id}`} className="text-[10px] text-[hsl(var(--admin-text-muted))]">
              Description
            </label>
            <Input
              id={`svc-desc-${svc.id}`}
              value={svc.desc}
              onChange={(e) => updateSvc(svc.id, "desc", e.target.value)}
              className="h-7 text-xs bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                Includes
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addInclude(svc.id)}
                className="h-5 text-[10px] gap-0.5 px-1"
              >
                <Plus className="w-2.5 h-2.5" />
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {svc.includes.map((inc, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Input
                    value={inc}
                    onChange={(e) => updateInclude(svc.id, i, e.target.value)}
                    className="h-6 text-[11px] flex-1 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
                  />
                  <button
                    onClick={() => removeInclude(svc.id, i)}
                    className="text-red-400 hover:text-red-300"
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ServicesEditor() {
  const { data: svcData, isLoading: svcLoading, save: saveSvc, isSaving: svcSaving } = useFlowConfig<ServiceItem[]>("services");
  const { data: execData, isLoading: execLoading, save: saveExec, isSaving: execSaving } = useFlowConfig<Record<string, ExecTier>>("execution_tiers");

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [svcDirty, setSvcDirty] = useState(false);
  const [execTiers, setExecTiers] = useState<Record<string, ExecTier>>({});
  const [execDirty, setExecDirty] = useState(false);
  const [expandedSvc, setExpandedSvc] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => { if (svcData && !svcDirty) setServices(svcData as ServiceItem[]); }, [svcData, svcDirty]);
  useEffect(() => {
    if (!execDirty) {
      if (execData && typeof execData === "object" && Object.keys(execData).length > 0) {
        setExecTiers(execData as Record<string, ExecTier>);
      } else {
        // Fallback: build from DEFAULT_PRICING_CONFIG.execution + SERVICES C5 tiers
        const fallback: Record<string, ExecTier> = {};
        Object.entries(DEFAULT_PRICING_CONFIG.execution).forEach(([k, v]) => {
          fallback[k] = { min: v.min, max: v.max, label: k, desc: "" };
        });
        setExecTiers(fallback);
      }
    }
  }, [execData, execDirty]);

  const updateSvc = (id: string, field: keyof ServiceItem, value: ServiceItem[keyof ServiceItem]) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    setSvcDirty(true);
  };

  const addInclude = (id: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, includes: [...s.includes, "New item"] } : s)));
    setSvcDirty(true);
  };

  const removeInclude = (id: string, idx: number) => {
    setServices(services.map((s) => (s.id === id ? { ...s, includes: s.includes.filter((_, i) => i !== idx) } : s)));
    setSvcDirty(true);
  };

  const updateInclude = (id: string, idx: number, val: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, includes: s.includes.map((v, i) => (i === idx ? val : v)) } : s)));
    setSvcDirty(true);
  };

  const updateExecTier = (key: string, field: keyof ExecTier, val: string | number) => {
    setExecTiers({ ...execTiers, [key]: { ...execTiers[key], [field]: val } });
    setExecDirty(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setServices((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setSvcDirty(true);
    }
  };

  if (svcLoading || execLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" /></div>;

  return (
    <div className="space-y-6">
      {/* Service Tiers C1-C5 */}
      <section className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text))] uppercase tracking-widest">Service Tiers (C1–C5)</h3>
          <Button size="sm" onClick={() => saveSvc(services, { onSuccess: () => setSvcDirty(false) })} disabled={!svcDirty || svcSaving} className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black">
            {svcSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
          </Button>
        </div>
        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={services.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {services.map((svc) => (
                <SortableServiceItem
                  key={svc.id}
                  svc={svc}
                  expandedSvc={expandedSvc}
                  setExpandedSvc={setExpandedSvc}
                  updateSvc={updateSvc}
                  addInclude={addInclude}
                  updateInclude={updateInclude}
                  removeInclude={removeInclude}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </section>

      {/* Execution Tiers */}
      <section className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text))] uppercase tracking-widest">Execution Tiers (C5)</h3>
          <Button size="sm" onClick={() => saveExec(execTiers, { onSuccess: () => setExecDirty(false) })} disabled={!execDirty || execSaving} className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black">
            {execSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
          </Button>
        </div>
        <div className="space-y-2">
          {Object.entries(execTiers).map(([key, tier]) => (
            <div key={key} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[hsl(var(--admin-surface))]/50 border border-[hsl(var(--admin-border))]/30">
              <span className="text-xs font-medium text-[hsl(var(--admin-text))] capitalize w-16 shrink-0">{key}</span>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">Min₹</span>
                <Input type="number" value={tier.min} onChange={(e) => updateExecTier(key, "min", +e.target.value)} className="h-7 w-20 text-xs bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]" />
                <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">Max₹</span>
                <Input type="number" value={tier.max} onChange={(e) => updateExecTier(key, "max", +e.target.value)} className="h-7 w-20 text-xs bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]" />
                <Input value={tier.label} onChange={(e) => updateExecTier(key, "label", e.target.value)} placeholder="Label" className="h-7 text-xs flex-1 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

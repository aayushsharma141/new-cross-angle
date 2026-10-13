import { useState, useEffect } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { ConfigLoadError } from "./ConfigLoadError";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { Save, Plus, Trash2, Pencil, X, Check, GripVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { usePricingConfig } from "@/addons/calculators/components/hooks/usePricingConfig";
import { ADDONS as BUILT_IN_ADDONS, ADDON_PRICE_KEYS } from "@/addons/calculators/components/data/pricing-config";

const UNIT_LABEL: Record<string, string> = { flat: "flat", per_sqft: "per sq ft", per_room: "per room" };

interface AddonItem {
  id: string;
  label: string;
  icon: string;
  cost: number;
  unit: "flat" | "per_sqft" | "per_room";
  desc: string;
}

// Sortable Add-on Item Component
function SortableAddonItem({
  item,
  editId,
  draft,
  setDraft,
  startEdit,
  cancelEdit,
  confirmEdit,
  removeItem,
  price,
}: {
  price: number;
  item: AddonItem;
  editId: string | null;
  draft: AddonItem;
  setDraft: (d: AddonItem) => void;
  startEdit: (i: AddonItem) => void;
  cancelEdit: () => void;
  confirmEdit: () => void;
  removeItem: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const isEditing = editId === item.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "px-4 py-3 bg-[hsl(var(--admin-card))] border-b border-[hsl(var(--admin-border))]/30 last:border-b-0",
        isDragging && "shadow-lg border border-[hsl(var(--admin-primary))]"
      )}
    >
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} aria-label="Icon" className="h-7 w-12 text-center text-sm bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
            <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} aria-label="Label" className="h-7 text-xs flex-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" placeholder="Label" />
          </div>
          <div className="flex items-center gap-2">
            <Input value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} aria-label="Description" className="h-7 text-xs flex-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" placeholder="Description" />
            <span className="text-[11px] text-[hsl(var(--admin-text-muted))] whitespace-nowrap" title="Set on the Pricing tab">
              ₹{price.toLocaleString("en-IN")} {UNIT_LABEL[draft.unit] ?? draft.unit}
            </span>
            <Button variant="ghost" size="icon" onClick={confirmEdit} aria-label="Apply changes" className="h-7 w-7 text-[hsl(var(--admin-success))]"><Check className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={cancelEdit} aria-label="Cancel editing" className="h-7 w-7"><X className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 group">
          <div {...attributes} {...listeners} className="cursor-grab hover:text-[hsl(var(--admin-primary))] touch-none">
            <GripVertical className="w-3.5 h-3.5 text-[hsl(var(--admin-text-muted))] opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg w-7">{item.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{item.label}</p>
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))] truncate">{item.desc}</p>
          </div>
          <div className="text-right shrink-0 mr-2">
            <p className="text-xs font-bold text-[hsl(var(--admin-text))]">₹{price.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">{UNIT_LABEL[item.unit] ?? item.unit}</p>
          </div>
          <div className="flex gap-1 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => startEdit(item)} aria-label={`Edit ${item.label}`} className="h-6 w-6"><Pencil className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`Hide ${item.label} from the estimator`} className="h-6 w-6 text-red-400"><Trash2 className="w-3 h-3" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AddonsEditor() {
  const { data, isLoading, loadFailed, retry, save, isSaving } = useFlowConfig<AddonItem[]>("addons");
  const [items, setItems] = useState<AddonItem[]>([]);
  const [dirty, setDirty] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AddonItem>({ id: "", label: "", icon: "", cost: 0, unit: "flat", desc: "" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => { if (data && !dirty) setItems(data as AddonItem[]); }, [data, dirty]);

  const startEdit = (item: AddonItem) => { setEditId(item.id); setDraft({ ...item }); };
  const cancelEdit = () => setEditId(null);
  const confirmEdit = () => { setItems(items.map((i) => (i.id === editId ? { ...draft } : i))); setEditId(null); setDirty(true); };

  const { config: pricing } = usePricingConfig();
  const priceOf = (item: AddonItem) => {
    const key = ADDON_PRICE_KEYS[item.id];
    return key ? pricing.addons[key] : item.cost;
  };
  // The calculator can only price the built-in add-ons, so instead of creating
  // new ones (which it could never charge for) offer back any that were hidden.
  const hidden = BUILT_IN_ADDONS.filter((b) => !items.some((i) => i.id === b.id));
  const restore = (id: string) => {
    const b = BUILT_IN_ADDONS.find((x) => x.id === id);
    if (!b) return;
    setItems([...items, { ...b } as AddonItem]);
    setDirty(true);
  };

  const removeItem = (id: string) => { setItems(items.filter((i) => i.id !== id)); setDirty(true); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setDirty(true);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" /></div>;
  if (loadFailed) return <ConfigLoadError what="add-ons" onRetry={retry} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))]">Bespoke Add-ons</h3>
          <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Step 6 options — modular kitchen, wardrobes, automation, etc.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => save(items, { onSuccess: () => setDirty(false) })} disabled={!dirty || isSaving} className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableAddonItem
                key={item.id}
                item={item}
                editId={editId}
                draft={draft}
                setDraft={setDraft}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
                confirmEdit={confirmEdit}
                removeItem={removeItem}
                price={priceOf(item)}
              />
            ))}
          </SortableContext>
        </DndContext>
        {items.length === 0 && <p className="text-center py-8 text-xs text-[hsl(var(--admin-text-muted))]">No add-ons configured</p>}
      </div>

      <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">Prices are set on the Pricing tab; the estimate and the saved quote both use them.</p>

      {hidden.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[hsl(var(--admin-text-muted))]">Hidden from the estimator:</span>
          {hidden.map((b) => (
            <Button key={b.id} variant="outline" size="sm" onClick={() => restore(b.id)} className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" /> {b.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

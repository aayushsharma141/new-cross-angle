import { useState, useEffect } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Save, Plus, Trash2, Pencil, X, Check, Loader2, GripVertical, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import { AssetUsageService } from "@/services/AssetUsageService";
import { toEntityId } from "@/lib/discovery-utils";
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

export interface ExecutionTierItem {
  id: string;
  label: string;
  desc: string;
  multiplier: number;
  imageId?: string | null;
}

const DEFAULT_TIERS: ExecutionTierItem[] = [
  { id: "economy", label: "Essential", desc: "Refined basics for secondary homes.", multiplier: 1, imageId: null },
  { id: "standard", label: "Premium", desc: "High-spec finishes and branded fittings.", multiplier: 1.5, imageId: null },
  { id: "premium", label: "Luxury", desc: "Imported marble, veneer, and automation.", multiplier: 2.5, imageId: null },
  { id: "luxury", label: "Legacy", desc: "Museum-grade finishes, rare materials.", multiplier: 4, imageId: null },
];

function SortableItem({ 
  item, 
  editId, 
  draft, 
  setDraft, 
  startEdit, 
  cancelEdit, 
  confirmEdit, 
  removeItem 
}: { 
  item: ExecutionTierItem;
  editId: string | null;
  draft: ExecutionTierItem;
  setDraft: (d: ExecutionTierItem) => void;
  startEdit: (i: ExecutionTierItem) => void;
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
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2">
            <Input 
              value={draft.label} 
              onChange={(e) => setDraft({ ...draft, label: e.target.value })} 
              className="h-7 text-xs flex-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" 
              placeholder="Package Name" 
            />
            <Input 
              value={draft.desc} 
              onChange={(e) => setDraft({ ...draft, desc: e.target.value })} 
              className="h-7 text-xs flex-[2] bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" 
              placeholder="Description" 
            />
            <Input 
              type="number"
              step="0.1"
              value={draft.multiplier} 
              onChange={(e) => setDraft({ ...draft, multiplier: parseFloat(e.target.value) || 1 })} 
              className="h-7 w-20 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" 
              placeholder="Multiplier" 
            />
            <Button variant="ghost" size="icon" onClick={confirmEdit} className="h-7 w-7 text-[hsl(var(--admin-success))]"><Check className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-7 w-7"><X className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="flex items-start gap-4 p-3 bg-[hsl(var(--admin-surface))]/50 rounded-md border border-[hsl(var(--admin-border))]/50">
            <div className="w-32 shrink-0">
              <MediaPickerField
                id={`media-${item.id}`}
                value={draft.imageId || ""}
                onChange={(url) => setDraft({ ...draft, imageId: url })}
                onAssetSelect={(asset) => {
                  void AssetUsageService.replaceUsage({
                    assetId: asset.id,
                    entityType: "execution_tier",
                    entityId: toEntityId(draft.label || item.id),
                    role: "thumbnail",
                  });
                }}
                domain="estimator"
                entityType="execution_tiers"
                damRole="thumbnail"
                placeholder="Thumbnail…"
              />
            </div>
            <div className="text-xs text-[hsl(var(--admin-text-muted))] pt-1">
              <p className="font-semibold text-[hsl(var(--admin-text))] flex items-center gap-1.5 mb-1"><ImageIcon className="w-3 h-3" /> Package Visual</p>
              <p>Select an image to represent this design package.</p>
              <p className="mt-1">This will be displayed in the estimator flow.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 group">
          <div {...attributes} {...listeners} className="cursor-grab hover:text-[hsl(var(--admin-primary))] touch-none">
            <GripVertical className="w-3.5 h-3.5 text-[hsl(var(--admin-text-muted))] opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          {item.imageId ? (
            <img src={item.imageId} alt={item.label} className="w-8 h-8 rounded object-cover border border-[hsl(var(--admin-border))]" />
          ) : (
            <div className="w-8 h-8 rounded bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-[hsl(var(--admin-text-muted))]" />
            </div>
          )}
          <div className="flex-1 min-w-0 ml-1">
            <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{item.label}</p>
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))] truncate">{item.desc}</p>
          </div>
          <span className="text-[10px] text-[hsl(var(--admin-text-muted))] font-mono">x{item.multiplier}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-6 w-6"><Pencil className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-6 w-6 text-red-400"><Trash2 className="w-3 h-3" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExecutionTiersEditor() {
  const { data, isLoading, save, isSaving } = useFlowConfig<ExecutionTierItem[] | null>("execution_tiers");
  const [items, setItems] = useState<ExecutionTierItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExecutionTierItem>({ id: "", label: "", desc: "", multiplier: 1, imageId: null });
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!dirty && items.length === 0) {
      if (data && Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else if (!isLoading) {
        setItems(DEFAULT_TIERS);
        setDirty(true);
      }
    }
  }, [data, dirty, items.length, isLoading]);

  const startEdit = (item: ExecutionTierItem) => { setEditId(item.id); setDraft({ ...item }); };
  const cancelEdit = () => setEditId(null);
  const confirmEdit = () => {
    setItems(items.map((i) => (i.id === editId ? { ...draft } : i)));
    setEditId(null);
    setDirty(true);
  };

  const addItem = () => {
    const newItem: ExecutionTierItem = { id: `tier_${Date.now()}`, label: "New Package", desc: "Description", multiplier: 1, imageId: null };
    setItems([...items, newItem]);
    startEdit(newItem);
    setDirty(true);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    setDirty(true);
  };

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

  const handleSave = () => save(items, { onSuccess: () => setDirty(false) });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))]">Execution Tiers (Packages)</h3>
          <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Design packages to choose from in the estimator</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addItem} className="h-7 text-xs gap-1"><Plus className="w-3 h-3" />Add</Button>
          <Button size="sm" onClick={handleSave} disabled={!dirty || isSaving} className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                editId={editId}
                draft={draft}
                setDraft={setDraft}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
                confirmEdit={confirmEdit}
                removeItem={removeItem}
              />
            ))}
          </SortableContext>
        </DndContext>
        {items.length === 0 && <p className="text-center py-8 text-xs text-[hsl(var(--admin-text-muted))]">No tiers configured</p>}
      </div>
    </div>
  );
}

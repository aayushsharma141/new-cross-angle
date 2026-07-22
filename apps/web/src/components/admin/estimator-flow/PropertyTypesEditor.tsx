import { useState } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { Save, Plus, Trash2, Pencil, X, Check, GripVertical, Loader2, ImageIcon } from "lucide-react";
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

interface PropertyTypeItem {
  id: string;
  label: string;
  icon: string;
  desc: string;
  imageId?: string | null;
}

// Sortable item component
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
  item: PropertyTypeItem;
  editId: string | null;
  draft: PropertyTypeItem;
  setDraft: (d: PropertyTypeItem) => void;
  startEdit: (i: PropertyTypeItem) => void;
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
            <Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className="h-7 w-12 text-center text-sm bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" placeholder="Icon" />
            <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className="h-7 text-xs flex-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" placeholder="Label" />
            <Input value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} className="h-7 text-xs flex-[2] bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" placeholder="Description" />
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
                    entityType: "property_type",
                    entityId: toEntityId(draft.label || item.id),
                    role: "thumbnail",
                  });
                }}
                domain="estimator"
                entityType="property_types"
                damRole="thumbnail"
                placeholder="Thumbnail�"
              />
            </div>
            <div className="text-xs text-[hsl(var(--admin-text-muted))] pt-1">
              <p className="font-semibold text-[hsl(var(--admin-text))] flex items-center gap-1.5 mb-1"><ImageIcon className="w-3 h-3" /> Property Visual</p>
              <p>Select a representative image for this property type.</p>
              <p className="mt-1">This replaces the text icon in modern views.</p>
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
            <span className="text-lg w-7 text-center">{item.icon}</span>
          )}
          <div className="flex-1 min-w-0 ml-1">
            <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{item.label}</p>
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))] truncate">{item.desc}</p>
          </div>
          <span className="text-[10px] text-[hsl(var(--admin-text-muted))] font-mono">{item.id}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-6 w-6"><Pencil className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-6 w-6 text-red-400"><Trash2 className="w-3 h-3" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PropertyTypesEditor() {
  const { data, isLoading, save, isSaving } = useFlowConfig<PropertyTypeItem[]>("property_types");
  const [items, setItems] = useState<PropertyTypeItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PropertyTypeItem>({ id: "", label: "", icon: "", desc: "", imageId: null });
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync from server on first load
  if (!dirty && data && items.length === 0 && data.length > 0) {
    setItems(data);
  }

  const startEdit = (item: PropertyTypeItem) => { setEditId(item.id); setDraft({ ...item }); };
  const cancelEdit = () => setEditId(null);
  const confirmEdit = () => {
    setItems(items.map((i) => (i.id === editId ? { ...draft } : i)));
    setEditId(null);
    setDirty(true);
  };

  const addItem = () => {
    const newItem: PropertyTypeItem = { id: `type_${Date.now()}`, label: "New Type", icon: "🏠", desc: "Description" };
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
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))]">Property Types</h3>
          <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Options shown in Step 1 of the estimator</p>
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
        {items.length === 0 && <p className="text-center py-8 text-xs text-[hsl(var(--admin-text-muted))]">No property types configured</p>}
      </div>
    </div>
  );
}

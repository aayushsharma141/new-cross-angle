import { useState, useEffect } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
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

interface MaterialItem {
  name: string;
  description: string;
  color: string;
  scores: Record<string, number>;
}

type MaterialItemWithId = MaterialItem & { _id: string };

function MaterialRow({
  item,
  editId,
  draft,
  setDraft,
  startEdit,
  cancelEdit,
  confirmEdit,
  removeItem,
}: {
  item: MaterialItemWithId;
  editId: string | null;
  draft: MaterialItemWithId;
  setDraft: (d: MaterialItemWithId) => void;
  startEdit: (i: MaterialItemWithId) => void;
  cancelEdit: () => void;
  confirmEdit: () => void;
  removeItem: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.85 : 1,
  };

  const isEditing = editId === item._id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "px-4 py-3 bg-[hsl(var(--admin-card))] border-b border-[hsl(var(--admin-border))]/30 last:border-b-0",
        isDragging && "shadow-xl border border-[hsl(var(--admin-primary))]/60 rounded-xl"
      )}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {/* Color picker + preview */}
            <div className="relative shrink-0">
              <div
                className="w-9 h-9 rounded-lg border-2 border-[hsl(var(--admin-border))] cursor-pointer overflow-hidden"
                style={{ background: draft.color }}
              >
                <input
                  type="color"
                  aria-label="Material colour picker"
                  value={draft.color.startsWith("#") ? draft.color : "#aaaaaa"}
                  onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>
            <Input
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
              className="h-7 w-36 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] font-mono"
              placeholder="hsl(0 0% 70%)"
            />
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="h-7 text-xs flex-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              placeholder="Name"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={confirmEdit} className="h-7 w-7 text-emerald-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-7 w-7 shrink-0">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className="h-7 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
            placeholder="Short description shown in quiz…"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 group">
          <div {...attributes} {...listeners} className="cursor-grab touch-none shrink-0">
            <GripVertical className="w-3.5 h-3.5 text-[hsl(var(--admin-text-muted))] opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <div
            className="w-8 h-8 rounded-lg border border-[hsl(var(--admin-border))]/60 shrink-0"
            style={{ background: item.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{item.name}</p>
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))] truncate">
              {item.description || <span className="italic">No description</span>}
            </p>
          </div>
          <span className="text-[10px] text-[hsl(var(--admin-text-muted))] font-mono shrink-0 hidden sm:block">
            {item.color}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-6 w-6">
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item._id)}
              className="h-6 w-6 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MaterialsEditor() {
  const { data, isLoading, save, isSaving } = useFlowConfig<MaterialItem[]>("discovery_materials");
  const [items, setItems] = useState<MaterialItemWithId[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MaterialItemWithId>({ _id: "", name: "", description: "", color: "", scores: {} });
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (data && !dirty && items.length === 0) {
      setItems((data as MaterialItem[]).map((m, i) => ({ ...m, _id: `mat_${i}_${m.name}` })));
    }
  }, [data, dirty, items.length]);

  const strip = (arr: MaterialItemWithId[]): MaterialItem[] =>
    arr.map(({ _id: _, ...rest }) => rest);

  const startEdit = (item: MaterialItemWithId) => {
    setEditId(item._id);
    setDraft({ ...item });
  };
  const cancelEdit = () => setEditId(null);
  const confirmEdit = () => {
    setItems(items.map((i) => (i._id === editId ? { ...draft } : i)));
    setEditId(null);
    setDirty(true);
  };

  const addItem = () => {
    const id = `mat_${Date.now()}`;
    const newItem: MaterialItemWithId = {
      _id: id,
      name: "New Material",
      description: "",
      color: "hsl(0 0% 70%)",
      scores: {},
    };
    setItems([...items, newItem]);
    startEdit(newItem);
    setDirty(true);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i._id !== id));
    setDirty(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i._id === active.id);
        const newIndex = prev.findIndex((i) => i._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setDirty(true);
    }
  };

  const handleSave = () => save(strip(items), { onSuccess: () => setDirty(false) });

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))]">
            Material Options
            <span className="ml-2 text-[10px] font-normal text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-2 py-0.5">
              {items.length}
            </span>
          </h3>
          <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mt-0.5">
            Tactile texture choices in Step 5 — drag to reorder
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addItem} className="h-7 text-xs gap-1">
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || isSaving}
            className="h-7 text-xs gap-1.5 bg-[hsl(var(--admin-primary))] text-black hover:bg-[hsl(var(--admin-primary))]/90"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <MaterialRow
                key={item._id}
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
        {items.length === 0 && (
          <p className="text-center py-10 text-xs text-[hsl(var(--admin-text-muted))]">
            No materials configured — click Add to create one
          </p>
        )}
      </div>
    </div>
  );
}

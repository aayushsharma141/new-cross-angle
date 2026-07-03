import { useState, useEffect } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Save, Plus, Trash2, X, Loader2, GripVertical } from "lucide-react";
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

type BhkPreset = { bedrooms: number; bathrooms: number; livingRooms: number; kitchen: number; balconies: number; toilets: number; suggestedArea: number };
type StageItem = { id: string; label: string; desc: string };

function SortableStageItem({
  stage,
  onChange,
  onRemove
}: {
  stage: StageItem;
  onChange: (field: keyof StageItem, value: string) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 50, opacity: 0.5 } : {}),
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 ${isDragging ? 'shadow-lg ring-1 ring-[hsl(var(--admin-primary))] rounded-md' : ''}`}>
      <div {...attributes} {...listeners} className="cursor-grab text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] touch-none">
        <GripVertical className="w-4 h-4" />
      </div>
      <Input value={stage.label} onChange={(e) => onChange("label", e.target.value)} className="h-7 text-xs flex-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
      <Input value={stage.desc} onChange={(e) => onChange("desc", e.target.value)} className="h-7 text-xs flex-[2] bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" placeholder="Description" />
      <Button variant="ghost" size="icon" onClick={onRemove} className="h-6 w-6 text-red-400"><Trash2 className="w-3 h-3" /></Button>
    </div>
  );
}

export function DetailsEditor() {
  // BHK Presets
  const { data: bhkData, isLoading: bhkLoading, save: saveBhk, isSaving: bhkSaving } = useFlowConfig<Record<string, BhkPreset>>("bhk_presets");
  const [bhk, setBhk] = useState<Record<string, BhkPreset>>({});
  const [bhkDirty, setBhkDirty] = useState(false);

  // Renovation Rooms
  const { data: roomsData, isLoading: roomsLoading, save: saveRooms, isSaving: roomsSaving } = useFlowConfig<string[]>("renovation_rooms");
  const [rooms, setRooms] = useState<string[]>([]);
  const [roomsDirty, setRoomsDirty] = useState(false);
  const [newRoom, setNewRoom] = useState("");

  // Renovation Stages
  const { data: stagesData, isLoading: stagesLoading, save: saveStages, isSaving: stagesSaving } = useFlowConfig<StageItem[]>("renovation_stages");
  const [stages, setStages] = useState<StageItem[]>([]);
  const [stagesDirty, setStagesDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => { if (bhkData && !bhkDirty) setBhk(bhkData); }, [bhkData, bhkDirty]);
  useEffect(() => { if (roomsData && !roomsDirty) setRooms(roomsData); }, [roomsData, roomsDirty]);
  useEffect(() => { if (stagesData && !stagesDirty) setStages(stagesData); }, [stagesData, stagesDirty]);

  const updateBhkField = (key: string, field: keyof BhkPreset, val: number) => {
    setBhk({ ...bhk, [key]: { ...bhk[key], [field]: val } });
    setBhkDirty(true);
  };

  const addBhkPreset = () => {
    const label = `${Object.keys(bhk).length + 1} BHK`;
    setBhk({ ...bhk, [label]: { bedrooms: 1, bathrooms: 1, livingRooms: 1, kitchen: 1, balconies: 1, toilets: 0, suggestedArea: 600 } });
    setBhkDirty(true);
  };

  const removeBhkPreset = (key: string) => {
    const next = { ...bhk }; delete next[key]; setBhk(next); setBhkDirty(true);
  };

  const addRoom = () => {
    if (!newRoom.trim()) return;
    setRooms([...rooms, newRoom.trim()]); setNewRoom(""); setRoomsDirty(true);
  };

  const addStage = () => {
    setStages([...stages, { id: `stage_${Date.now()}`, label: "New Stage", desc: "" }]);
    setStagesDirty(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setStages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setStagesDirty(true);
    }
  };

  if (bhkLoading || roomsLoading || stagesLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" /></div>;

  return (
    <div className="space-y-6">
      {/* BHK Presets */}
      <section className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text))] uppercase tracking-widest">BHK Presets (Apartment)</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addBhkPreset} className="h-7 text-xs gap-1"><Plus className="w-3 h-3" />Add</Button>
            <Button size="sm" onClick={() => saveBhk(bhk, { onSuccess: () => setBhkDirty(false) })} disabled={!bhkDirty || bhkSaving} className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black">
              {bhkSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--admin-border))]/50 text-[hsl(var(--admin-text-muted))]">
                <th className="text-left py-2 pr-2 font-bold uppercase text-[10px]">Label</th>
                <th className="py-2 px-1 font-bold uppercase text-[10px]">Bed</th>
                <th className="py-2 px-1 font-bold uppercase text-[10px]">Bath</th>
                <th className="py-2 px-1 font-bold uppercase text-[10px]">Living</th>
                <th className="py-2 px-1 font-bold uppercase text-[10px]">Kitchen</th>
                <th className="py-2 px-1 font-bold uppercase text-[10px]">Balcony</th>
                <th className="py-2 px-1 font-bold uppercase text-[10px]">Area</th>
                <th className="py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bhk).map(([key, preset]) => (
                <tr key={key} className="border-b border-[hsl(var(--admin-border))]/20">
                  <td className="py-1.5 pr-2 font-medium text-[hsl(var(--admin-text))]">{key}</td>
                  <td className="py-1.5 px-1"><Input type="number" value={preset.bedrooms} onChange={(e) => updateBhkField(key, "bedrooms", +e.target.value)} className="h-6 w-12 text-xs text-center bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={preset.bathrooms} onChange={(e) => updateBhkField(key, "bathrooms", +e.target.value)} className="h-6 w-12 text-xs text-center bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={preset.livingRooms} onChange={(e) => updateBhkField(key, "livingRooms", +e.target.value)} className="h-6 w-12 text-xs text-center bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={preset.kitchen} onChange={(e) => updateBhkField(key, "kitchen", +e.target.value)} className="h-6 w-12 text-xs text-center bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={preset.balconies} onChange={(e) => updateBhkField(key, "balconies", +e.target.value)} className="h-6 w-12 text-xs text-center bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={preset.suggestedArea} onChange={(e) => updateBhkField(key, "suggestedArea", +e.target.value)} className="h-6 w-16 text-xs text-center bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" /></td>
                  <td className="py-1.5"><Button variant="ghost" size="icon" onClick={() => removeBhkPreset(key)} className="h-6 w-6 text-red-400"><Trash2 className="w-3 h-3" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Renovation Stages */}
      <section className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text))] uppercase tracking-widest">Renovation Stages</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addStage} className="h-7 text-xs gap-1"><Plus className="w-3 h-3" />Add</Button>
            <Button size="sm" onClick={() => saveStages(stages, { onSuccess: () => setStagesDirty(false) })} disabled={!stagesDirty || stagesSaving} className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black">
              {stagesSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stages.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {stages.map((s, i) => (
                <SortableStageItem
                  key={s.id}
                  stage={s}
                  onChange={(field, value) => {
                    const n = [...stages];
                    n[i] = { ...s, [field]: value };
                    setStages(n);
                    setStagesDirty(true);
                  }}
                  onRemove={() => {
                    setStages(stages.filter((_, j) => j !== i));
                    setStagesDirty(true);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </section>

      {/* Renovation Rooms */}
      <section className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[hsl(var(--admin-text))] uppercase tracking-widest">Renovation Rooms</h3>
          <Button size="sm" onClick={() => saveRooms(rooms, { onSuccess: () => setRoomsDirty(false) })} disabled={!roomsDirty || roomsSaving} className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black">
            {roomsSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {rooms.map((room, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-xs text-[hsl(var(--admin-text))]">
              {room}
              <button onClick={() => { setRooms(rooms.filter((_, j) => j !== i)); setRoomsDirty(true); }} className="text-[hsl(var(--admin-text-muted))] hover:text-red-400"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addRoom()} placeholder="Add room name…" className="h-7 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]" />
          <Button variant="outline" size="sm" onClick={addRoom} className="h-7 text-xs"><Plus className="w-3 h-3" /></Button>
        </div>
      </section>
    </div>
  );
}

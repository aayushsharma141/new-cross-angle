import { useState, useEffect, useRef } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import {
  Save, Plus, Trash2, Pencil, ChevronDown, ChevronRight,
  Loader2, Users, X, Check
} from "lucide-react";
import { AdminFormCard } from "@/components/admin/shared";

interface ArchetypeItem {
  name: string;
  tagline: string;
  traits: string[];
  materialBias: string;
  strategy: string;
}

type ArchetypeItemWithId = ArchetypeItem & { _id: string };

const SCORE_DIMENSIONS = ["minimalism", "warmth", "social", "structure", "novelty"] as const;

function TraitTag({ trait, onRemove }: { trait: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
      {trait}
      <button onClick={onRemove} aria-label={`Remove ${trait}`} className="text-[hsl(var(--admin-text-muted))] hover:text-red-400 transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

function ArchetypeCard({
  item,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  item: ArchetypeItemWithId;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (field: keyof ArchetypeItem, value: unknown) => void;
  onRemove: () => void;
}) {
  const [newTrait, setNewTrait] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(item.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
    }
  }, [editingName]);

  const addTrait = () => {
    const t = newTrait.trim();
    if (!t || item.traits.includes(t)) return;
    onUpdate("traits", [...(item.traits || []), t]);
    setNewTrait("");
  };

  const removeTrait = (i: number) => {
    onUpdate("traits", item.traits.filter((_, j) => j !== i));
  };

  return (
    <div className="border-b border-[hsl(var(--admin-border))]/30 last:border-b-0">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 group">
        <button
          onClick={onToggle}
          aria-label={isExpanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
          className="shrink-0 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        <div className="w-6 h-6 rounded-full bg-[hsl(var(--admin-primary))]/15 border border-[hsl(var(--admin-primary))]/30 flex items-center justify-center shrink-0">
          <Users className="w-3 h-3 text-[hsl(var(--admin-primary))]" />
        </div>

        {/* Inline name edit */}
        {editingName ? (
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { onUpdate("name", nameDraft); setEditingName(false); }
                if (e.key === "Escape") { setNameDraft(item.name); setEditingName(false); }
              }}
              className="h-6 text-xs flex-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              ref={nameInputRef}
            />
            <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-400"
              onClick={() => { onUpdate("name", nameDraft); setEditingName(false); }}>
              <Check className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6"
              onClick={() => { setNameDraft(item.name); setEditingName(false); }}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => { onToggle(); }}
            className="flex-1 text-left"
          >
            <span className="text-sm font-semibold text-[hsl(var(--admin-text))]">{item.name}</span>
            {item.materialBias && (
              <span className="ml-2 text-[10px] text-[hsl(var(--admin-text-muted))]">· {item.materialBias}</span>
            )}
            {item.traits?.length > 0 && (
              <span className="ml-2 text-[10px] text-[hsl(var(--admin-text-muted))]">
                {item.traits.slice(0, 3).join(" · ")}
              </span>
            )}
          </button>
        )}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); setEditingName(true); setNameDraft(item.name); }}>
            <Pencil className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Expanded form */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 bg-[hsl(var(--admin-surface))]/40">
          {/* Tagline */}
          <div className="space-y-1">
            <label htmlFor={`tagline-${item._id}`} className="text-[10px] uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">Tagline</label>
            <Input
              id={`tagline-${item._id}`}
              value={item.tagline}
              onChange={(e) => onUpdate("tagline", e.target.value)}
              className="h-7 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              placeholder="One-line identity statement…"
            />
          </div>

          {/* Material Bias */}
          <div className="space-y-1">
            <label htmlFor={`material-${item._id}`} className="text-[10px] uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">Material Bias</label>
            <Input
              id={`material-${item._id}`}
              value={item.materialBias}
              onChange={(e) => onUpdate("materialBias", e.target.value)}
              className="h-7 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              placeholder="e.g. Warm Timber, Polished Stone…"
            />
          </div>

          {/* Strategy */}
          <div className="space-y-1">
            <label htmlFor={`strategy-${item._id}`} className="text-[10px] uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">Design Strategy</label>
            <textarea
              id={`strategy-${item._id}`}
              value={item.strategy}
              onChange={(e) => onUpdate("strategy", e.target.value)}
              rows={3}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))] resize-none focus:outline-none focus:border-[hsl(var(--admin-primary))]/50 transition-colors"
              placeholder="Describe the design approach for this archetype…"
            />
          </div>

          {/* Traits */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
              Traits
              <span className="ml-1.5 text-[hsl(var(--admin-text-muted))] normal-case tracking-normal">
                ({item.traits?.length ?? 0})
              </span>
            </label>
            {(item.traits?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.traits.map((t, i) => (
                  <TraitTag key={i} trait={t} onRemove={() => removeTrait(i)} />
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTrait())}
                className="h-7 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
                placeholder="Add trait…"
              />
              <Button variant="outline" size="sm" onClick={addTrait} disabled={!newTrait.trim()} className="h-7 text-xs gap-1 shrink-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Score dimensions — read-only display hint */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
              Aesthetic Dimensions
              <span className="ml-1.5 font-normal normal-case tracking-normal text-[hsl(var(--admin-text-muted))]">
                — used by the scoring engine
              </span>
            </span>
            <div className="grid grid-cols-5 gap-2">
              {SCORE_DIMENSIONS.map((dim) => (
                <div key={dim} className="text-center">
                  <p className="text-[9px] uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-1 capitalize">{dim}</p>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--admin-border))]">
                    <div
                      className="h-1.5 rounded-full bg-[hsl(var(--admin-primary))]/60 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, 33))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-[hsl(var(--admin-text-muted))] italic">
              Score logic is defined in code via the match() function in constants/discovery.ts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ArchetypesEditor() {
  const { data, isLoading, save, isSaving } = useFlowConfig<ArchetypeItem[]>("discovery_archetypes");
  const [items, setItems] = useState<ArchetypeItemWithId[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data && !dirty && items.length === 0 && (data as ArchetypeItem[]).length > 0) {
      setItems((data as ArchetypeItem[]).map((a, i) => ({ ...a, _id: `arch_${i}_${a.name}` })));
    }
  }, [data, dirty, items.length]);

  const strip = (arr: ArchetypeItemWithId[]): ArchetypeItem[] =>
    arr.map(({ name, tagline, traits, materialBias, strategy }) => ({
      name, tagline, traits, materialBias, strategy,
    }));

  const updateItem = (id: string, field: keyof ArchetypeItem, value: unknown) => {
    setItems(items.map((a) => (a._id === id ? { ...a, [field]: value } : a)));
    setDirty(true);
  };

  const addItem = () => {
    const id = `arch_${Date.now()}`;
    const newItem: ArchetypeItemWithId = {
      _id: id,
      name: "New Archetype",
      tagline: "",
      traits: [],
      materialBias: "",
      strategy: "",
    };
    setItems([...items, newItem]);
    setExpanded(id);
    setDirty(true);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((a) => a._id !== id));
    if (expanded === id) setExpanded(null);
    setDirty(true);
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
      <AdminFormCard
        title={
          <>
            Personality Archetypes
            <span className="ml-2 text-[10px] font-normal text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-2 py-0.5">
              {items.length}
            </span>
          </>
        }
        description="Result identities assigned at quiz end — click any row to expand and edit"
        contentClassName="p-0"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addItem} className="h-7 text-xs gap-1 border-[hsl(var(--admin-border))] bg-transparent hover:bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text))]">
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
        }
      >
        {items.map((item) => (
          <ArchetypeCard
            key={item._id}
            item={item}
            isExpanded={expanded === item._id}
            onToggle={() => setExpanded(expanded === item._id ? null : item._id)}
            onUpdate={(field, value) => updateItem(item._id, field, value)}
            onRemove={() => removeItem(item._id)}
          />
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <Users className="w-8 h-8 text-[hsl(var(--admin-text-muted))]/40 mx-auto" />
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">
              No archetypes configured yet — click Add to create personality results
            </p>
          </div>
        )}
      </AdminFormCard>
    </div>
  );
}

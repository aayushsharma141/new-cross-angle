import { useState, useEffect, useRef } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Save, Plus, X, Loader2, Tag } from "lucide-react";
import { AdminFormCard } from "@/components/admin/shared";

export function AdjectivesEditor() {
  const { data, isLoading, save, isSaving } = useFlowConfig<string[]>("discovery_adjectives");
  const [items, setItems] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [newItem, setNewItem] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data && !dirty) setItems(data as string[]);
  }, [data, dirty]);

  const add = () => {
    const trimmed = newItem.trim();
    if (!trimmed || items.includes(trimmed)) return;
    setItems([...items, trimmed]);
    setNewItem("");
    setDirty(true);
    inputRef.current?.focus();
  };

  const remove = (i: number) => {
    setItems(items.filter((_, j) => j !== i));
    setDirty(true);
  };

  const handleSave = () => save(items, { onSuccess: () => setDirty(false) });

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
            Adjective Options
            <span className="ml-2 text-[10px] font-normal text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-full px-2 py-0.5">
              {items.length}
            </span>
          </>
        }
        description="Style words shown in Step 4 of the Discovery quiz — users select up to 3"
        action={
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || isSaving}
            className="h-7 text-xs gap-1.5 bg-[hsl(var(--admin-primary))] text-black hover:bg-[hsl(var(--admin-primary))]/90"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </Button>
        }
        contentClassName="space-y-5"
      >
        {/* Chip cloud */}
        <div className="min-h-[80px]">
          {items.length === 0 ? (
            <p className="text-[11px] text-[hsl(var(--admin-text-muted))] italic">No adjectives yet — add some below.</p>
          ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((word, i) => (
              <span
                key={i}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-xs text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-primary))]/50 transition-colors"
              >
                <Tag className="w-2.5 h-2.5 text-[hsl(var(--admin-text-muted))]" />
                {word}
                <button
                  onClick={() => remove(i)}
                  className="text-[hsl(var(--admin-text-muted))] hover:text-red-400 transition-colors ml-0.5"
                  aria-label={`Remove ${word}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        </div>

        {/* Add input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="Type an adjective and press Enter…"
            className="h-8 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] focus:border-[hsl(var(--admin-primary))]/50"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={add}
            disabled={!newItem.trim()}
            className="h-8 text-xs gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </AdminFormCard>
    </div>
  );
}

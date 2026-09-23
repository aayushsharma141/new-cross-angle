import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/primitives/button";
import { Textarea } from "@/components/primitives/interactive";
import { ShieldAlert, Plus, CheckCircle2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import type { Tables } from "@/integrations/supabase/types";

type Objection = Tables<"lead_objections">;

export function ObjectionTracker({ leadId, isReadOnly }: { leadId: string; isReadOnly?: boolean }) {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("pricing");
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { toast } = useToast();

  const categories = [
    { id: "pricing", label: "Pricing / Budget" },
    { id: "timeline", label: "Timeline / Deadline" },
    { id: "trust", label: "Trust / Portfolio" },
    { id: "scope", label: "Scope / Features" },
    { id: "competitor", label: "Comparing Competitors" },
    { id: "other", label: "Other" },
  ];

  useEffect(() => {
    const abortController = new AbortController();

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const { data, error } = await supabase
          .from("lead_objections")
          .select("*")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: false })
          .abortSignal(abortController.signal);
        if (abortController.signal.aborted) return;
        if (error) {
          setLoadError(error.message);
          return;
        }
        setObjections(data ?? []);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => abortController.abort();
  }, [leadId, reloadKey]);

  const handleAdd = async () => {
    if (!newText.trim() || isReadOnly || isSaving) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("lead_objections")
        .insert({ lead_id: leadId, detail: newText.trim(), category: newCategory, resolved: false })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setObjections((prev) => [data, ...prev]);
        setNewText("");
        setShowAdd(false);
        toast({
          title: "Objection saved",
          description: "Objection has been logged successfully.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to save objection",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (isReadOnly) return;
    try {
      const { data, error } = await supabase
        .from("lead_objections")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setObjections((prev) => prev.map((o) => (o.id === id ? data : o)));
        toast({
          title: "Objection resolved",
          description: "Objection has been marked as resolved.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to resolve objection",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  if (loading) return <div role="status" className="p-4 text-xs text-[hsl(var(--admin-text-muted))]">Loading objections…</div>;

  if (loadError) {
    return (
      <div role="alert" className="p-3 rounded-md border border-[hsl(var(--admin-danger))]/30 bg-[hsl(var(--admin-danger))]/5 text-xs text-[hsl(var(--admin-text))] flex items-center justify-between gap-3">
        <span>Couldn't load objections: {loadError}</span>
        <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)} className="h-7 text-xs shrink-0">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-medium text-[hsl(var(--admin-text))]">Objection Tracker</h3>
        </div>
        {!isReadOnly && !showAdd && (
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="h-7 text-xs border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]">
            <Plus className="w-3 h-3 mr-1" /> Log Objection
          </Button>
        )}
      </div>

      {showAdd && !isReadOnly && (
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-md p-3 flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={newCategory === c.id}
                onClick={() => setNewCategory(c.id)}
                data-active={newCategory === c.id}
                className={cn(
                  "px-2 py-1 rounded text-[10px] uppercase font-medium tracking-wide transition-colors",
                  newCategory === c.id
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))] border border-transparent hover:text-[hsl(var(--admin-text))]"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <Textarea
            aria-label="Objection details"
            placeholder="What is the client's concern?"
            className="text-sm bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] min-h-[60px]"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} disabled={isSaving} className="h-7 text-xs">
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleAdd} disabled={isSaving} className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50">
              {isSaving ? "Saving..." : "Save Objection"}
            </Button>
          </div>
        </div>
      )}

      {objections.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-[hsl(var(--admin-border))] rounded-md text-xs text-[hsl(var(--admin-text-muted))]">
          No objections logged yet. Good job!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {objections.map((obj) => {
            const isResolved = obj.resolved === true;
            return (
            <div
              key={obj.id}
              className={cn(
                "p-3 rounded-md border flex gap-3",
                isResolved ? "bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] opacity-60" : "bg-orange-500/5 border-orange-500/20"
              )}
            >
              <button
                type="button"
                onClick={() => handleResolve(obj.id)}
                disabled={isReadOnly || isResolved}
                aria-label={isResolved ? "Resolved" : "Mark as resolved"}
                title={isResolved ? "Resolved" : "Mark as resolved"}
                className="mt-0.5 shrink-0"
              >
                {isResolved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <CircleDot className="w-4 h-4 text-orange-400 hover:text-orange-300" />
                )}
              </button>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide font-medium text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                    {categories.find((c) => c.id === obj.category)?.label || obj.category}
                  </span>
                  {obj.created_at && (
                    <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">{new Date(obj.created_at).toLocaleDateString()}</span>
                  )}
                </div>
                <p className={cn("text-sm", isResolved ? "text-[hsl(var(--admin-text-muted))] line-through" : "text-[hsl(var(--admin-text))]")}>
                  {obj.detail}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

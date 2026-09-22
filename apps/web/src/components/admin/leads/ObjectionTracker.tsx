import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/primitives/button";
import { Textarea } from "@/components/primitives/interactive";
import { ShieldAlert, Plus, CheckCircle2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Objection {
  id: string;
  lead_id: string;
  category: string;
  objection_text: string;
  response_text: string | null;
  status: "open" | "resolved";
  created_at: string;
}

// Supabase client typed against the generated schema — `lead_objections` is a
// custom table that may not yet be reflected in the local types file.
// We cast through `unknown` to silence the type mismatch without losing safety.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as { from: (table: string) => any };

export function ObjectionTracker({ leadId, isReadOnly }: { leadId: string; isReadOnly?: boolean }) {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("pricing");

  const categories = [
    { id: "pricing", label: "Pricing / Budget" },
    { id: "timeline", label: "Timeline / Deadline" },
    { id: "trust", label: "Trust / Portfolio" },
    { id: "scope", label: "Scope / Features" },
    { id: "competitor", label: "Comparing Competitors" },
    { id: "other", label: "Other" },
  ];

  useEffect(() => {
    async function load() {
      const { data } = await db
        .from("lead_objections")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (data) setObjections(data as Objection[]);
      setLoading(false);
    }
    load();
  }, [leadId]);

  const handleAdd = async () => {
    if (!newText.trim() || isReadOnly) return;
    const { data } = await db
      .from("lead_objections")
      .insert({ lead_id: leadId, objection_text: newText, category: newCategory, status: "open" })
      .select()
      .single();
    if (data) {
      setObjections([data as Objection, ...objections]);
      setNewText("");
      setShowAdd(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (isReadOnly) return;
    const { data } = await db
      .from("lead_objections")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (data) {
      setObjections(objections.map((o) => (o.id === id ? (data as Objection) : o)));
    }
  };

  if (loading) return <div className="p-4 text-xs text-[hsl(var(--admin-text-muted))]">Loading objections�</div>;

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
            placeholder="What is the client's concern?"
            className="text-sm bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] min-h-[60px]"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="h-7 text-xs">
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleAdd} className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white">
              Save Objection
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
          {objections.map((obj) => (
            <div
              key={obj.id}
              className={cn(
                "p-3 rounded-md border flex gap-3",
                obj.status === "resolved" ? "bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] opacity-60" : "bg-orange-500/5 border-orange-500/20"
              )}
            >
              <button
                onClick={() => handleResolve(obj.id)}
                disabled={isReadOnly || obj.status === "resolved"}
                aria-label={obj.status === "resolved" ? "Resolved" : "Mark as resolved"}
                title={obj.status === "resolved" ? "Resolved" : "Mark as resolved"}
                className="mt-0.5 shrink-0"
              >
                {obj.status === "resolved" ? (
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
                  <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">{new Date(obj.created_at).toLocaleDateString()}</span>
                </div>
                <p className={cn("text-sm", obj.status === "resolved" ? "text-[hsl(var(--admin-text-muted))] line-through" : "text-[hsl(var(--admin-text))]")}>
                  {obj.objection_text}
                </p>
                {obj.response_text && (
                  <div className="mt-2 text-xs bg-[hsl(var(--admin-surface))] p-2 rounded text-[hsl(var(--admin-text-muted))] border border-[hsl(var(--admin-border))]">
                    <span className="font-medium text-[hsl(var(--admin-text))] mb-1 block">Response:</span>
                    {obj.response_text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

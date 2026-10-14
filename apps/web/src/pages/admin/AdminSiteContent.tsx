import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, History, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input, Textarea } from "@/components/primitives/interactive";
import { Label } from "@/components/ui/primitives/label";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import {
  CONTENT_BLOCKS,
  emptyItem,
  isTextField,
  normalizeBlock,
  validateBlock,
  type ContentBlockDef,
  type FieldDef,
} from "@/content/registry";
import { useAdminContent, useContentVersions } from "@/content/useSiteContent";

type Json = Record<string, unknown>;

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";

/* ─── Field editors ──────────────────────────────────────────────────────── */

function Counter({ value, max }: { value: string; max?: number }) {
  if (!max) return null;
  const over = value.length > max;
  return (
    <span className={`text-[12px] tabular-nums ${over ? "text-[hsl(var(--admin-danger))]" : "text-admin-muted"}`}>
      {value.length}/{max}
    </span>
  );
}

function FieldEditor({ field, value, onChange, idPrefix }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; idPrefix: string }) {
  const id = `${idPrefix}-${field.name}`;

  if (isTextField(field)) {
    const str = typeof value === "string" ? value : "";
    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={id}>
            {field.label}
            {field.required && <span aria-hidden="true" className="ml-1 text-[hsl(var(--admin-danger))]">*</span>}
          </Label>
          <Counter value={str} max={field.maxLength} />
        </div>
        {field.type === "markdown" ? (
          <Textarea id={id} rows={12} className="font-mono text-[13px]" value={str} onChange={(e) => onChange(e.target.value)} />
        ) : field.type === "textarea" ? (
          <Textarea id={id} rows={3} value={str} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input id={id} type={field.type === "url" ? "text" : "text"} inputMode={field.type === "url" ? "url" : undefined} value={str} onChange={(e) => onChange(e.target.value)} />
        )}
        {field.help && <p className="text-[12px] text-admin-muted">{field.help}</p>}
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="space-y-1">
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
          <input id={id} type="checkbox" className="h-4 w-4 accent-[hsl(var(--admin-gold))]" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
          {field.label}
        </label>
        {field.help && <p className="text-[12px] text-admin-muted">{field.help}</p>}
      </div>
    );
  }

  if (field.type === "list") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{field.label}</legend>
        {field.help && <p className="text-[12px] text-admin-muted">{field.help}</p>}
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              aria-label={`${field.itemLabel} ${i + 1}`}
              value={item}
              onChange={(e) => onChange(list.map((v, j) => (j === i ? e.target.value : v)))}
            />
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${field.itemLabel} ${i + 1}`} onClick={() => onChange(list.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {(!field.maxItems || list.length < field.maxItems) && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, ""])}>
            <Plus className="mr-1.5 h-4 w-4" /> Add {field.itemLabel.toLowerCase()}
          </Button>
        )}
      </fieldset>
    );
  }

  const items = Array.isArray(value) ? (value as Json[]) : [];
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{field.label}</legend>
      {field.help && <p className="text-[12px] text-admin-muted">{field.help}</p>}
      {items.map((item, i) => (
        <div key={i} className="space-y-4 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{field.itemLabel} {i + 1}</p>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" aria-label={`Move ${field.itemLabel} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={`Move ${field.itemLabel} ${i + 1} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${field.itemLabel} ${i + 1}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {field.fields.map((sub) => (
            <FieldEditor
              key={sub.name}
              field={sub}
              idPrefix={`${id}-${i}`}
              value={item[sub.name]}
              onChange={(v) => onChange(items.map((it, j) => (j === i ? { ...it, [sub.name]: v } : it)))}
            />
          ))}
        </div>
      ))}
      {(!field.maxItems || items.length < field.maxItems) && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, emptyItem(field.fields)])}>
          <Plus className="mr-1.5 h-4 w-4" /> Add {field.itemLabel.toLowerCase()}
        </Button>
      )}
    </fieldset>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

type Status = "built-in" | "edited" | "draft";

export default function AdminSiteContent() {
  const { toast } = useToast();
  const { published, drafts, saveDraft, discardDraft, publish, revert, resetToDefault } = useAdminContent();

  const [selectedKey, setSelectedKey] = useState<string>(CONTENT_BLOCKS[0].key);
  const def = useMemo(() => CONTENT_BLOCKS.find((b) => b.key === selectedKey) as ContentBlockDef, [selectedKey]);

  const publishedRow = published.data?.[selectedKey];
  const draftRow = drafts.data?.[selectedKey];

  // The version shown in the form: unsaved edits → saved draft → live value → built-in text.
  const baseline = useMemo<Json>(
    () => normalizeBlock(def, draftRow?.value ?? publishedRow?.value) as unknown as Json,
    [def, draftRow, publishedRow],
  );
  const signature = useMemo(() => JSON.stringify(baseline), [baseline]);
  const [form, setForm] = useState<Json>(baseline);
  const [dirty, setDirty] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<null | "discard" | "reset" | "publish">(null);
  const [showHistory, setShowHistory] = useState(false);
  const versions = useContentVersions(showHistory ? selectedKey : null);

  // Reload the form when switching blocks or when the saved data changes underneath it.
  useEffect(() => {
    setForm(JSON.parse(signature) as Json);
    setDirty(false);
    setProblems([]);
  }, [signature, selectedKey]);

  const statusOf = (key: string): Status => (drafts.data?.[key] ? "draft" : published.data?.[key] ? "edited" : "built-in");
  const status = statusOf(selectedKey);
  const busy = saveDraft.isPending || publish.isPending || discardDraft.isPending || revert.isPending || resetToDefault.isPending;

  const choose = (key: string) => {
    if (key === selectedKey) return;
    if (dirty && !window.confirm("You have unsaved changes in this section. Leave without saving?")) return;
    setShowHistory(false);
    setSelectedKey(key);
  };

  const fail = (title: string, err: unknown) =>
    toast({ title, description: err instanceof Error ? err.message : "Something went wrong. Try again.", variant: "destructive" });

  const onSaveDraft = async () => {
    try {
      await saveDraft.mutateAsync({ key: selectedKey, value: form });
      setDirty(false);
      toast({ title: "Draft saved", description: "Visitors still see the published text until you publish." });
    } catch (e) {
      fail("Couldn't save the draft", e);
    }
  };

  const onPublish = async () => {
    const found = validateBlock(def, form);
    setProblems(found);
    if (found.length > 0) {
      setConfirm(null);
      return;
    }
    try {
      await saveDraft.mutateAsync({ key: selectedKey, value: form });
      await publish.mutateAsync(selectedKey);
      setDirty(false);
      toast({ title: "Published", description: "The change is live. Cached pages may take up to 5 minutes to update." });
    } catch (e) {
      fail("Couldn't publish", e);
    } finally {
      setConfirm(null);
    }
  };

  const onDiscard = async () => {
    try {
      await discardDraft.mutateAsync(selectedKey);
      toast({ title: "Draft discarded" });
    } catch (e) {
      fail("Couldn't discard the draft", e);
    } finally {
      setConfirm(null);
    }
  };

  const onReset = async () => {
    try {
      await resetToDefault.mutateAsync(selectedKey);
      toast({ title: "Back to built-in text", description: "The previous published text is kept in History." });
    } catch (e) {
      fail("Couldn't reset", e);
    } finally {
      setConfirm(null);
    }
  };

  const onRestore = async (versionId: string) => {
    try {
      await revert.mutateAsync({ key: selectedKey, versionId });
      setShowHistory(false);
      toast({ title: "Version restored and published" });
    } catch (e) {
      fail("Couldn't restore that version", e);
    }
  };

  const groups = Array.from(new Set(CONTENT_BLOCKS.map((b) => b.group)));
  const loadError = published.error || drafts.error;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Block list */}
      <nav aria-label="Editable sections" className="space-y-5">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-admin-muted">{group}</p>
            <ul className="m-0 list-none space-y-1 p-0">
              {CONTENT_BLOCKS.filter((b) => b.group === group).map((b) => {
                const st = statusOf(b.key);
                return (
                  <li key={b.key}>
                    <button
                      type="button"
                      onClick={() => choose(b.key)}
                      aria-current={b.key === selectedKey ? "true" : undefined}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-gold))] ${
                        b.key === selectedKey ? "bg-[hsl(var(--admin-surface))] font-semibold" : "hover:bg-[hsl(var(--admin-surface))]"
                      }`}
                    >
                      <span>{b.label}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] ${
                          st === "draft" ? "bg-amber-500/15 text-amber-500" : st === "edited" ? "bg-emerald-500/15 text-emerald-500" : "text-admin-muted"
                        }`}
                      >
                        {st === "draft" ? "Draft" : st === "edited" ? "Edited" : "Built-in"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Editor */}
      <section aria-label={def.label} className="min-w-0 space-y-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">{def.label}</h2>
          <p className="text-sm text-admin-muted">{def.description}</p>
          <p className="text-[13px] text-admin-muted">
            {status === "draft" && draftRow
              ? `Unpublished draft saved ${fmtDate(draftRow.updated_at)}. Visitors see the ${publishedRow ? "published" : "built-in"} text.`
              : status === "edited" && publishedRow
                ? `Live — published ${fmtDate(publishedRow.published_at)}.`
                : "Live — showing the text that shipped with the site. Nothing has been edited yet."}
          </p>
        </header>

        {loadError && (
          <div role="alert" className="rounded-lg border border-[hsl(var(--admin-danger))]/40 bg-[hsl(var(--admin-danger-muted))] p-4 text-sm">
            Couldn't load saved content ({loadError instanceof Error ? loadError.message : "unknown error"}). If this is a new
            setup, the <code>site_content</code> database migration may not be applied yet.
          </div>
        )}

        {problems.length > 0 && (
          <div role="alert" className="rounded-lg border border-[hsl(var(--admin-danger))]/40 bg-[hsl(var(--admin-danger-muted))] p-4 text-sm">
            <p className="mb-1 font-semibold">Fix these before publishing:</p>
            <ul className="m-0 list-disc pl-5">
              {problems.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {def.fields.map((field) => (
            <FieldEditor
              key={field.name}
              field={field}
              idPrefix={`f-${def.key}`}
              value={form[field.name]}
              onChange={(v) => {
                setForm((prev) => ({ ...prev, [field.name]: v }));
                setDirty(true);
              }}
            />
          ))}
        </form>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-3 border-t border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-1 py-4">
          <Button type="button" variant="outline" disabled={!dirty || busy} onClick={onSaveDraft}>
            {saveDraft.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save draft
          </Button>
          <Button type="button" disabled={busy || (!dirty && status !== "draft")} onClick={() => setConfirm("publish")}>
            {publish.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish
          </Button>
          {status === "draft" && (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => setConfirm("discard")}>
              Discard draft
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory}>
              <History className="mr-1.5 h-4 w-4" /> History
            </Button>
            {status !== "built-in" && (
              <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setConfirm("reset")}>
                <RotateCcw className="mr-1.5 h-4 w-4" /> Use built-in text
              </Button>
            )}
            <a
              href={def.previewPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-admin-muted hover:text-[hsl(var(--admin-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-gold))]"
            >
              View live page <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {showHistory && (
          <div className="rounded-xl border border-[hsl(var(--admin-border))] p-4">
            <h3 className="mb-3 text-sm font-semibold">Earlier published versions</h3>
            {versions.isLoading ? (
              <p className="text-sm text-admin-muted">Loading…</p>
            ) : (versions.data ?? []).length === 0 ? (
              <p className="text-sm text-admin-muted">Nothing here yet. Each time you publish, the text it replaces is kept here.</p>
            ) : (
              <ul className="m-0 list-none divide-y divide-[hsl(var(--admin-border))] p-0">
                {(versions.data ?? []).map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span>
                      Live {fmtDate(v.published_at)} <span className="text-admin-muted">→ replaced {fmtDate(v.replaced_at)}</span>
                    </span>
                    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onRestore(v.id)}>
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirm === "publish"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Publish “${def.label}”?`}
        description="The new text goes live on the website straight away. The current text is kept in History, so you can restore it."
        confirmText="Publish"
        onConfirm={onPublish}
      />
      <ConfirmDialog
        open={confirm === "discard"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Discard this draft?"
        description="Your unpublished changes will be deleted. The live text isn't affected."
        confirmText="Discard draft"
        variant="destructive"
        onConfirm={onDiscard}
      />
      <ConfirmDialog
        open={confirm === "reset"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Go back to the built-in text?"
        description="The website will show the text that shipped with it. Your edited version is kept in History."
        confirmText="Use built-in text"
        variant="destructive"
        onConfirm={onReset}
      />
    </div>
  );
}

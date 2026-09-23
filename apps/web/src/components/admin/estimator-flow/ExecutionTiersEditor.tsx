import { useState, useEffect } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { ConfigLoadError } from "./ConfigLoadError";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { Save, Pencil, X, Check, Loader2, ImageIcon, Info } from "lucide-react";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import { AssetUsageService } from "@/services/AssetUsageService";
import { toEntityId } from "@/lib/discovery-utils";
import { usePricingConfig } from "@/addons/calculators/components/hooks/usePricingConfig";
import type { ExecutionTierId } from "@/addons/calculators/components/data/types";

export interface ExecutionTierItem {
  id: string;
  label: string;
  desc: string;
  /** Legacy field from the old editor; nothing reads it. */
  multiplier?: number;
  imageId?: string | null;
}

// The calculator offers exactly these packages, in this order, priced from
// pricing.execution[id]. Only their presentation is editable here.
const PACKAGE_IDS: ExecutionTierId[] = ["economy", "standard", "premium", "luxury"];

const DEFAULT_TIERS: Record<ExecutionTierId, ExecutionTierItem> = {
  economy: { id: "economy", label: "Essential", desc: "Refined basics for secondary homes.", imageId: null },
  standard: { id: "standard", label: "Premium", desc: "High-spec finishes and branded fittings.", imageId: null },
  premium: { id: "premium", label: "Luxury", desc: "Imported marble, veneer, and automation.", imageId: null },
  luxury: { id: "luxury", label: "Legacy", desc: "Museum-grade finishes, rare materials.", imageId: null },
};

const withDefaults = (saved: ExecutionTierItem[] | null | undefined): ExecutionTierItem[] =>
  PACKAGE_IDS.map((id) => ({ ...DEFAULT_TIERS[id], ...(saved?.find((s) => s.id === id) ?? {}) }));

const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;

function PackageRow({
  item,
  rate,
  isEditing,
  draft,
  setDraft,
  onEdit,
  onCancel,
  onConfirm,
}: {
  item: ExecutionTierItem;
  rate: { min: number; max: number } | undefined;
  isEditing: boolean;
  draft: ExecutionTierItem;
  setDraft: (d: ExecutionTierItem) => void;
  onEdit: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="px-4 py-3 bg-[hsl(var(--admin-card))] border-b border-[hsl(var(--admin-border))]/30 last:border-b-0">
      {isEditing ? (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2">
            <Input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              aria-label="Package name"
              className="h-7 text-xs flex-1 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              placeholder="Package name"
            />
            <Input
              value={draft.desc}
              onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              aria-label="Package description"
              className="h-7 text-xs flex-[2] bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
              placeholder="Description"
            />
            <Button variant="ghost" size="icon" onClick={onConfirm} aria-label="Apply changes" className="h-7 w-7 text-[hsl(var(--admin-success))]"><Check className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancel editing" className="h-7 w-7"><X className="w-3.5 h-3.5" /></Button>
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
              <p className="font-semibold text-[hsl(var(--admin-text))] flex items-center gap-1.5 mb-1"><ImageIcon className="w-3 h-3" /> Package visual</p>
              <p>Shown on this package's card in the estimator.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 group">
          {item.imageId ? (
            <img src={item.imageId} alt="" className="w-8 h-8 rounded object-cover border border-[hsl(var(--admin-border))]" />
          ) : (
            <div className="w-8 h-8 rounded bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-[hsl(var(--admin-text-muted))]" />
            </div>
          )}
          <div className="flex-1 min-w-0 ml-1">
            <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{item.label}</p>
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))] truncate">{item.desc}</p>
          </div>
          {rate && (
            <span className="text-[10px] text-[hsl(var(--admin-text-muted))] font-mono whitespace-nowrap">
              {inr(rate.min)}–{inr(rate.max)}/sq ft
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit ${item.label}`} className="h-6 w-6 opacity-60 group-hover:opacity-100 focus-visible:opacity-100">
            <Pencil className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ExecutionTiersEditor() {
  const { data, isLoading, loadFailed, retry, save, isSaving } = useFlowConfig<ExecutionTierItem[] | null>("execution_tiers");
  const { config: pricing } = usePricingConfig();
  const [items, setItems] = useState<ExecutionTierItem[]>(() => withDefaults(null));
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExecutionTierItem>(DEFAULT_TIERS.economy);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty && !isLoading && !loadFailed) setItems(withDefaults(Array.isArray(data) ? data : null));
  }, [data, dirty, isLoading, loadFailed]);

  const startEdit = (item: ExecutionTierItem) => { setEditId(item.id); setDraft({ ...item }); };
  const confirmEdit = () => {
    setItems(items.map((i) => (i.id === editId ? { ...draft } : i)));
    setEditId(null);
    setDirty(true);
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" /></div>;
  if (loadFailed) return <ConfigLoadError what="packages" onRetry={retry} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))]">Execution Packages</h3>
          <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Names, descriptions and images for the four full-scope packages</p>
        </div>
        <Button size="sm" onClick={() => save(items, { onSuccess: () => setDirty(false) })} disabled={!dirty || isSaving} className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black">
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
        </Button>
      </div>

      <p className="flex items-start gap-2 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]/50 px-3 py-2 text-[11px] text-[hsl(var(--admin-text-muted))]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Rates per sq ft are set on the Pricing tab; the estimate and the saved quote both use them.
      </p>

      <div className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] overflow-hidden">
        {items.map((item) => (
          <PackageRow
            key={item.id}
            item={item}
            rate={pricing.execution[item.id as ExecutionTierId]}
            isEditing={editId === item.id}
            draft={draft}
            setDraft={setDraft}
            onEdit={() => startEdit(item)}
            onCancel={() => setEditId(null)}
            onConfirm={confirmEdit}
          />
        ))}
      </div>
    </div>
  );
}

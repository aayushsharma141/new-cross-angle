import { useState, useEffect } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Save, Loader2, Award, Sliders } from "lucide-react";
import { AdminFormCard } from "@/components/admin/shared";
import { DiscoveryMediaSlot } from "./DiscoveryMediaSlot";
import { toEntityId } from "@/lib/discovery-utils";
import { AestheticScores } from "@/types/discovery";

interface VisualPromptConfig {
  id: number;
  url: string;
  assetKey?: string;
  tags: Partial<AestheticScores>;
}

const DIMENSIONS: (keyof AestheticScores)[] = ["minimalism", "warmth", "social", "structure", "novelty"];

export function VisualPromptsEditor() {
  const { data, isLoading, save, isSaving } = useFlowConfig<VisualPromptConfig[]>("discovery_visual_prompts");
  const [prompts, setPrompts] = useState<VisualPromptConfig[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data && !dirty) {
      setPrompts(data as VisualPromptConfig[]);
    }
  }, [data, dirty]);

  const handleWeightChange = (promptId: number, dimension: keyof AestheticScores, value: number) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === promptId) {
          const updatedTags = { ...p.tags, [dimension]: value };
          return { ...p, tags: updatedTags };
        }
        return p;
      })
    );
    setDirty(true);
  };

  const handleSave = () => {
    save(prompts, { onSuccess: () => setDirty(false) });
  };

  if (isLoading || prompts.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminFormCard
        title={
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
            <span>Visual Instinct Weights</span>
          </div>
        }
        description="Assign aesthetic dimension weights to each of the 18 visual prompts used in Step 7."
        action={
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || isSaving}
            className="h-7 text-xs gap-1.5 bg-[hsl(var(--admin-primary))] text-black hover:bg-[hsl(var(--admin-primary))]/90"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save Weights
          </Button>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {prompts.map((prompt) => {
            const visualKey = `visual-${prompt.id}`;
            const entityId = toEntityId(visualKey);

            return (
              <div
                key={prompt.id}
                className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-[hsl(var(--admin-border))]/40 bg-[hsl(var(--admin-surface))]/20"
              >
                {/* Media slot on the left */}
                <div className="w-full md:w-[220px] shrink-0">
                  <DiscoveryMediaSlot
                    label={`Prompt #${prompt.id}`}
                    entityType="discovery_visual"
                    entityId={entityId}
                    damRole="visual"
                    description="Upload via DAM picker"
                  />
                </div>

                {/* Score weights edit on the right */}
                <div className="flex-1 space-y-3">
                  <h4 className="text-xs font-semibold text-[hsl(var(--admin-text))] flex items-center gap-1.5 border-b border-[hsl(var(--admin-border))]/50 pb-1.5">
                    <Award className="w-3.5 h-3.5 text-[hsl(var(--admin-primary))]" />
                    <span>Dimension Scoring Weights</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {DIMENSIONS.map((dim) => {
                      const currentVal = prompt.tags[dim] ?? 0;
                      return (
                        <div key={dim} className="space-y-1">
                          <label
                            htmlFor={`weight-${prompt.id}-${dim}`}
                            className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-text-muted))] capitalize"
                          >
                            {dim}
                          </label>
                          <Input
                            id={`weight-${prompt.id}-${dim}`}
                            type="number"
                            step="0.5"
                            value={currentVal}
                            onChange={(e) => handleWeightChange(prompt.id, dim, Number(e.target.value))}
                            className="h-7 text-xs bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AdminFormCard>
    </div>
  );
}

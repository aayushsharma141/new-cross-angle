import { useState, useEffect } from "react";
import { Button } from "@/components/ui/primitives/button";
import { AdminSafeAction } from "@/components/admin/shared";
import { Save, RotateCcw, Loader2, FileText, MessageSquare } from "lucide-react";
import { icons } from "@/design-system/tokens/icons";
import { AdminFormCard } from "@/components/admin/shared";
import { Textarea } from "@/components/primitives/interactive";
import { Input } from "@/components/primitives/interactive";
import type { useEstimatorRegistry } from "@/lib/registry/EstimatorRegistry";

interface Props {
  registry: ReturnType<typeof useEstimatorRegistry>;
}

export default function ResultIntelligenceWorkspace({ registry }: Props) {
    const { data: alcsRulesData, save: saveAlcs, isSaving: savingAlcs } = registry.alcsRules;
    const { data: templatesData, save: saveTemplates, isSaving: savingTemplates } = registry.resultTemplates;

    const [rules, setRules] = useState<any>(alcsRulesData || { defaultRecommendation: "Based on the budget constraints and property specifics, a comprehensive design and execution package is recommended to ensure quality." });
    const [templates, setTemplates] = useState<any>(templatesData || { ctaPrimary: "Book Consultation", confidenceMessage: "High Confidence" });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (alcsRulesData) setRules(alcsRulesData);
        if (templatesData) setTemplates(templatesData);
        setHasChanges(false);
    }, [alcsRulesData, templatesData]);

    const handleReset = async () => {
        setRules(alcsRulesData || { defaultRecommendation: "Based on the budget constraints and property specifics, a comprehensive design and execution package is recommended to ensure quality." });
        setTemplates(templatesData || { ctaPrimary: "Book Consultation", confidenceMessage: "High Confidence" });
        setHasChanges(false);
    };

    const handleSave = async () => {
        await Promise.all([
            saveAlcs(rules),
            saveTemplates(templates)
        ]);
        setHasChanges(false);
    };

    return (
        <div className="flex flex-col space-y-6 pb-20">
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up-1 { animation: fadeUp 0.3s ease-out both; }
                .fade-up-2 { animation: fadeUp 0.3s 0.1s ease-out both; }
            `}</style>

            <div className="fade-up-1 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[hsl(var(--admin-text))]">Result Experience</h2>
                  <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">Configure recommendation templates, messaging, and CTAs.</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <AdminSafeAction
                            icon={RotateCcw}
                            label="Discard"
                            confirmLabel="Discard unsaved?"
                            onConfirm={handleReset}
                            danger={true}
                        />
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || savingAlcs || savingTemplates}
                        className="bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-surface))] hover:bg-[hsl(var(--admin-primary))]/90 h-9"
                    >
                        {(savingAlcs || savingTemplates) ? (
                            <Loader2 className={`${icons.sm} mr-2 animate-spin`} />
                        ) : (
                            <Save className={`${icons.sm} mr-2`} />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="space-y-4 fade-up-2">
                <AdminFormCard title="ALCS Rules & Explanations" icon={MessageSquare} iconClassName="text-blue-400">
                    <div className="space-y-3">
                        <label htmlFor="defaultRecommendation" className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))]">Default Recommendation Text</label>
                        <Textarea 
                            id="defaultRecommendation"
                            value={rules?.defaultRecommendation || ""}
                            onChange={(e) => {
                                setRules({ ...rules, defaultRecommendation: e.target.value });
                                setHasChanges(true);
                            }}
                            className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] min-h-[100px] text-xs"
                        />
                    </div>
                </AdminFormCard>

                <AdminFormCard title="Result Templates & CTAs" icon={FileText} iconClassName="text-emerald-400">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label htmlFor="ctaPrimary" className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))]">Primary CTA Label</label>
                            <Input 
                                id="ctaPrimary"
                                value={templates?.ctaPrimary || ""}
                                onChange={(e) => {
                                    setTemplates({ ...templates, ctaPrimary: e.target.value });
                                    setHasChanges(true);
                                }}
                                className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-xs"
                            />
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="confidenceMessage" className="text-[11px] font-medium text-[hsl(var(--admin-text-muted))]">Confidence Messaging</label>
                            <Input 
                                id="confidenceMessage"
                                value={templates?.confidenceMessage || ""}
                                onChange={(e) => {
                                    setTemplates({ ...templates, confidenceMessage: e.target.value });
                                    setHasChanges(true);
                                }}
                                className="bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))] text-xs"
                            />
                        </div>
                    </div>
                </AdminFormCard>
            </div>
        </div>
    );
}

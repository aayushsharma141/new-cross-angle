import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminTabSlider } from "@/components/admin/ui/AdminTabSlider";
import { Layers, Database, Save, Loader2, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { useToast } from "@/hooks/useToast";
import { CRM_STAGES } from "@/lib/crm";

export default function CrmSettings() {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Temporary local state for stages just to show functionality
  const [stages, setStages] = useState(CRM_STAGES.map(s => ({ ...s })));

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your CRM configuration has been successfully updated.",
      });
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-background))]">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-700 relative h-full flex flex-col">
        <AdminTabSlider
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id)}
        header={
          <AdminPageHeader
            title="CRM Settings"
            description="Manage your pipeline stages, lead sources, scoring rules, and data imports."
            breadcrumbs={[]}
            actions={
              <Button
                type="button"
                size="lg"
                className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))/90] text-black font-semibold shadow-lg"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </Button>
            }
          />
        }
        tabs={[
          {
            id: "pipeline",
            label: "Pipeline & Stages",
            icon: Layers,
            content: (
              <div className="w-full space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-serif text-[hsl(var(--admin-text))]">Pipeline Configuration</h2>
                  <p className="text-[hsl(var(--admin-muted))] text-sm mt-1">
                    Customize your lead journey by adding, renaming, or reordering pipeline stages.
                  </p>
                </div>
                
                <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[hsl(var(--admin-border))] flex items-center justify-between bg-black/20">
                    <h3 className="font-semibold text-[13px] text-zinc-300">Active Stages</h3>
                    <Button variant="outline" size="sm" className="h-8 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Stage
                    </Button>
                  </div>
                  <div className="p-2 space-y-1">
                    {stages.map((stage, index) => (
                      <div 
                        key={stage.id} 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-white/5 group transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-zinc-600 cursor-grab opacity-50 group-hover:opacity-100" />
                        <div className={`w-2 h-2 rounded-full shrink-0 ${stage.dotClass}`} />
                        <div className="flex-1 flex items-center gap-4">
                          <Input 
                            value={stage.label} 
                            onChange={(e) => {
                              const newStages = [...stages];
                              newStages[index].label = e.target.value;
                              setStages(newStages);
                            }}
                            className="h-8 bg-black/40 border-zinc-800 text-sm max-w-[200px]"
                          />
                          <span className="text-xs text-zinc-500 font-mono">ID: {stage.id}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "data",
            label: "Data Management",
            icon: Database,
            content: (
              <div className="w-full space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-serif text-[hsl(var(--admin-text))]">Data Import & Export</h2>
                  <p className="text-[hsl(var(--admin-muted))] text-sm mt-1">
                    Manage your CRM data bulk operations.
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Export Leads</h3>
                      <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">Download a complete CSV backup of all leads and their history.</p>
                    </div>
                    <Button variant="outline" size="sm" className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9">
                      Export CSV
                    </Button>
                  </div>

                  <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Import Leads</h3>
                      <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">Upload a CSV file to bulk import legacy or external leads.</p>
                    </div>
                    <Button variant="outline" size="sm" className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9">
                      Import Data
                    </Button>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
      </div>
    </div>
  );
}

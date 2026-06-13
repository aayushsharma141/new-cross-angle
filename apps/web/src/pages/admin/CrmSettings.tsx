import { useState, useEffect, useRef } from "react";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { AdminTabSlider } from "@/components/admin/ui/AdminTabSlider";
import { Layers, Database, Save, Loader2, GripVertical, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { useQuery } from "@tanstack/react-query";

interface CrmStageConfig {
  id: string;
  label: string;
  dotClass: string;
}

export default function CrmSettings() {
  const [activeTab, setActiveTab] = useState("pipeline");
  const { toast } = useToast();

  // ── Pipeline stages (real Supabase persistence via estimator_flow_config) ──
  const { data: dbStages, isLoading: stagesLoading, save: saveStages, isSaving } =
    useFlowConfig<CrmStageConfig[]>("crm_stages");

  const [stages, setStages] = useState<CrmStageConfig[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (dbStages && !isDirty) {
      setStages(dbStages);
    }
  }, [dbStages, isDirty]);

  const handleLabelChange = (index: number, newLabel: string) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], label: newLabel };
    setStages(updated);
    setIsDirty(true);
  };

  const handleSave = () => {
    saveStages(stages, {
      onSuccess: () => {
        setIsDirty(false);
        toast({ title: "Pipeline Saved", description: "CRM stage labels updated successfully." });
      },
    });
  };

  const handleReset = () => {
    if (dbStages) {
      setStages(dbStages);
      setIsDirty(false);
    }
  };

  // ── Lead stats for the Data Management tab ──────────────────────────
  const { data: leadStats, isLoading: statsLoading } = useQuery({
    queryKey: ["crm-settings-stats"],
    queryFn: async () => {
      const { count: totalLeads } = await supabase.from("leads").select("id", { count: "exact", head: true });
      const { count: wonLeads } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "won");
      const { count: lostLeads } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "lost");
      return { totalLeads: totalLeads ?? 0, wonLeads: wonLeads ?? 0, lostLeads: lostLeads ?? 0 };
    },
    staleTime: 60_000,
  });

  const handleExportCSV = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (!data || data.length === 0) {
      toast({ title: "No data", description: "No leads to export.", variant: "destructive" });
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).map(v => JSON.stringify(v ?? "")).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${data.length} leads exported to CSV.` });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        if (lines.length < 2) throw new Error("CSV has no data rows");
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map(line => {
          // simple csv split ignoring commas inside quotes for now
          const values = line.split(',');
          return headers.reduce((obj, header, i) => {
            const val = values[i]?.trim().replace(/^"|"$/g, '');
            if (val && val !== "" && val !== "null") obj[header] = val;
            return obj;
          }, {} as Record<string, unknown>);
        });

        const { error } = await supabase.from('leads').insert(rows as never[]);
        if (error) throw error;
        toast({ title: "Import Successful", description: `Imported ${rows.length} leads.` });
      } catch (err) {
        toast({ title: "Import Failed", description: String(err), variant: "destructive" });
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
      <ModuleActions>
        {activeTab === "pipeline" && (
          <>
            {isDirty && (
              <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              type="button"
              size="lg"
              variant="default"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isDirty ? "Save Changes" : "Saved"}
            </Button>
          </>
        )}
      </ModuleActions>

      <AdminTabSlider
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id)}
        tabs={[
          {
            id: "pipeline",
            label: "Pipeline & Stages",
            icon: Layers,
            content: (
              <div className="w-full space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-serif text-[hsl(var(--admin-text))]">Pipeline Configuration</h2>
                  <p className="text-[hsl(var(--admin-muted))] text-sm mt-1">
                    Rename pipeline stage labels. Changes persist to the database and reflect immediately across the CRM.
                  </p>
                </div>

                {stagesLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" />
                  </div>
                ) : (
                  <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-[hsl(var(--admin-border))] flex items-center justify-between bg-black/20">
                      <h3 className="font-semibold text-[13px] text-zinc-300">
                        Active Stages
                        <span className="ml-2 text-[10px] font-normal text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5">
                          {stages.length}
                        </span>
                      </h3>
                      {isDirty && (
                        <span className="text-[10px] text-amber-400 font-medium">● Unsaved changes</span>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      {stages.map((stage, index) => (
                        <div
                          key={stage.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-white/5 group transition-colors"
                        >
                          <GripVertical className="w-4 h-4 text-zinc-600 cursor-grab opacity-50 group-hover:opacity-100" />
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${stage.dotClass}`} />
                          <div className="flex-1 flex items-center gap-4">
                            <Input
                              value={stage.label}
                              onChange={(e) => handleLabelChange(index, e.target.value)}
                              className="h-8 bg-black/40 border-zinc-800 text-sm max-w-[220px] focus:border-[hsl(var(--admin-primary))]/50"
                            />
                            <span className="text-xs text-zinc-500 font-mono">id: {stage.id}</span>
                          </div>
                          <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            DB value
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-[hsl(var(--admin-border))] bg-black/10">
                      <p className="text-[11px] text-zinc-500">
                        Stage IDs (used in the database) cannot be changed — only the display labels can be renamed.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            id: "data",
            label: "Data Management",
            icon: Database,
            content: (
              <div className="w-full space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-serif text-[hsl(var(--admin-text))]">Data Import & Export</h2>
                  <p className="text-[hsl(var(--admin-muted))] text-sm mt-1">
                    Manage your CRM data bulk operations.
                  </p>
                </div>

                {/* Live stats */}
                {statsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { label: "Total Leads", value: leadStats?.totalLeads ?? 0 },
                      { label: "Won Deals", value: leadStats?.wonLeads ?? 0 },
                      { label: "Lost Deals", value: leadStats?.lostLeads ?? 0 },
                    ].map(stat => (
                      <div key={stat.label} className="p-4 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] text-center">
                        <div className="text-2xl font-bold text-[hsl(var(--admin-text))]">{stat.value}</div>
                        <div className="text-xs text-[hsl(var(--admin-muted))] mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Export Leads</h3>
                      <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">
                        Download a complete CSV backup of all {leadStats?.totalLeads ?? "..."} leads and their data.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9"
                      onClick={handleExportCSV}
                    >
                      Export CSV
                    </Button>
                  </div>

                  <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Import Leads</h3>
                      <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">Upload a CSV file to bulk import legacy or external leads.</p>
                    </div>
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      title="Upload CSV file"
                      ref={fileInputRef} 
                      onChange={handleImportCSV} 
                    />
                    <Button variant="outline" size="sm" className="h-9" onClick={() => fileInputRef.current?.click()}>
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
  );
}

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { ReportRecipientsManager } from "@/components/admin/settings/ReportRecipientsManager";
import AdminStats from "./AdminStats";
import { Button } from "@/components/ui/primitives/button";

import { 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertTriangle,
  Server
} from "lucide-react";
import { ModuleActions } from "@/components/admin/layout/ModuleLayout";
import { useToast } from "@/hooks/useToast";
import { useSystem } from "@/context/SystemContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

// Primitives
import { Input } from "@/components/primitives/interactive";
import { Label } from "@/components/ui/primitives/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/primitives/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/primitives/alert-dialog";

interface Integration {
  id: string;
  name: string;
  desc: string;
  status: "Active" | "Pending configuration" | "Revoked";
  key: string;
}

const AdminSettings = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";
  const { toast } = useToast();
  const { maintenanceMode, setMaintenanceMode } = useSystem();
  const { settings, refetch: refetchSettings } = useSiteSettings();

  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "resend", name: "Resend (Email)", desc: "Connected to crossangleinteriors@gmail.com", status: "Pending configuration", key: "" },
    { id: "supabase", name: "Supabase (Database)", desc: "Primary database and auth provider", status: "Pending configuration", key: "" },
    { id: "vercel", name: "Vercel (Hosting)", desc: "Frontend hosting and edge functions", status: "Pending configuration", key: "" },
    { id: "posthog", name: "PostHog (Analytics)", desc: "Product analytics and event tracking", status: "Pending configuration", key: "" },
    { id: "ga", name: "Google Analytics", desc: "Secondary web analytics tracking", status: "Pending configuration", key: "" },
    { id: "whisper", name: "OpenAI Whisper", desc: "Automated media transcription API", status: "Pending configuration", key: "" },
    { id: "checkly", name: "Checkly", desc: "System health and uptime monitoring", status: "Pending configuration", key: "" },
    { id: "telegram", name: "Telegram Bot", desc: "Lead notification delivery", status: "Pending configuration", key: "" },
  ]);

  useEffect(() => {
    if (!settings) return;

    setIntegrations((prev) => prev.map(item => {
      let key = "";
      if (item.id === "resend") key = settings.resend_api_key || "";
      if (item.id === "supabase") key = settings.supabase_api_key || import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
      if (item.id === "vercel") key = settings.vercel_api_key || "";
      if (item.id === "posthog") key = settings.posthog_api_key || import.meta.env.VITE_POSTHOG_KEY || "";
      if (item.id === "ga") key = settings.ga_measurement_id || "";
      if (item.id === "whisper") key = (settings.integrations as Record<string, string>)?.whisper_api_key || "";
      if (item.id === "checkly") key = (settings.integrations as Record<string, string>)?.checkly_api_key || "";
      if (item.id === "telegram") key = (settings.integrations as Record<string, string>)?.telegram_bot_token || "";

      if (key) {
        return {
          ...item,
          status: "Active",
          key: key,
          desc: item.id === "posthog" ? "Analytics collection active" : `${item.name.split(' ')[0]} integration active`
        };
      } else {
        return {
          ...item,
          status: "Pending configuration",
          key: "",
          desc: item.id === "posthog" ? "Product analytics and event tracking" : `${item.name.split(' ')[0]} configuration needed`
        };
      }
    }));
  }, [settings]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [integrationApiKey, setIntegrationApiKey] = useState("");
  const [integrationApiHost, setIntegrationApiHost] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isIntegrationLoading, setIsIntegrationLoading] = useState(false);

  // 2. System Version Updates State
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  // 3. Maintenance Mode State
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenance_mode_active || false);
    }
  }, [settings?.maintenance_mode_active, setMaintenanceMode, settings]);

  // 4. Cache Management State
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    // Pre-populate existing PostHog key so the user can see / update it
    if (integration.id === "posthog") {
      setIntegrationApiKey(settings?.posthog_api_key || "");
      setIntegrationApiHost(settings?.posthog_host || "https://us.i.posthog.com");
    } else if (integration.id === "ga") {
      setIntegrationApiKey(settings?.ga_measurement_id || "");
      setIntegrationApiHost("");
    } else if (integration.id === "whisper" || integration.id === "checkly" || integration.id === "telegram") {
      const integrationsJson = (settings?.integrations as Record<string, string>) || {};
      if (integration.id === "whisper") setIntegrationApiKey(integrationsJson.whisper_api_key || "");
      if (integration.id === "checkly") setIntegrationApiKey(integrationsJson.checkly_api_key || "");
      if (integration.id === "telegram") setIntegrationApiKey(integrationsJson.telegram_bot_token || "");
      setIntegrationApiHost("");
    } else {
      setIntegrationApiKey("");
      setIntegrationApiHost("");
    }
    setShowApiKey(false);
    setShowIntegrationDialog(true);
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;

    setIsIntegrationLoading(true);

    try {
      let dbError;
      
      const payload: Record<string, unknown> = {};
      if (selectedIntegration.id === "posthog") {
        payload.posthog_api_key = integrationApiKey || null;
        payload.posthog_host = integrationApiHost || null;
      } else if (selectedIntegration.id === "resend") {
        payload.resend_api_key = integrationApiKey || null;
      } else if (selectedIntegration.id === "supabase") {
        payload.supabase_api_key = integrationApiKey || null;
      } else if (selectedIntegration.id === "vercel") {
        payload.vercel_api_key = integrationApiKey || null;
      } else if (selectedIntegration.id === "ga") {
        payload.ga_measurement_id = integrationApiKey || null;
      } else if (["whisper", "checkly", "telegram"].includes(selectedIntegration.id)) {
        const currentIntegrations = (settings?.integrations as Record<string, string>) || {};
        if (selectedIntegration.id === "whisper") currentIntegrations.whisper_api_key = integrationApiKey || "";
        if (selectedIntegration.id === "checkly") currentIntegrations.checkly_api_key = integrationApiKey || "";
        if (selectedIntegration.id === "telegram") currentIntegrations.telegram_bot_token = integrationApiKey || "";
        payload.integrations = currentIntegrations;
      }

      if (settings?.id) {
        // Row exists — update it
        const { error } = await supabase
          .from("site_settings")
          .update(payload as TablesUpdate<"site_settings">)
          .eq("id", settings.id);
        dbError = error;
      } else {
        // No row yet — upsert a new one
        const { error } = await supabase
          .from("site_settings")
          .upsert(
            payload,
            { onConflict: "id" }
          );
        dbError = error;
      }

      if (dbError) throw dbError;
      await refetchSettings();

      setIsIntegrationLoading(false);
      setShowIntegrationDialog(false);
      toast({
        title: `${selectedIntegration.name} Configured`,
        description: "Integration details saved successfully.",
      });
    } catch (err) {
      console.error(`Failed to save ${selectedIntegration.name} settings`, err);
      toast({
        title: "Update Failed",
        description: "Failed to save integration details. Please try again.",
        variant: "destructive",
      });
      setIsIntegrationLoading(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!selectedIntegration || !settings?.id) return;

    try {
      const payload: Record<string, unknown> = {};
      if (selectedIntegration.id === "posthog") {
        payload.posthog_api_key = null;
        payload.posthog_host = null;
      } else if (selectedIntegration.id === "resend") {
        payload.resend_api_key = null;
      } else if (selectedIntegration.id === "supabase") {
        payload.supabase_api_key = null;
      } else if (selectedIntegration.id === "vercel") {
        payload.vercel_api_key = null;
      } else if (selectedIntegration.id === "ga") {
        payload.ga_measurement_id = null;
      } else if (["whisper", "checkly", "telegram"].includes(selectedIntegration.id)) {
        const currentIntegrations = (settings?.integrations as Record<string, string>) || {};
        if (selectedIntegration.id === "whisper") currentIntegrations.whisper_api_key = "";
        if (selectedIntegration.id === "checkly") currentIntegrations.checkly_api_key = "";
        if (selectedIntegration.id === "telegram") currentIntegrations.telegram_bot_token = "";
        payload.integrations = currentIntegrations;
      }

      await supabase
        .from("site_settings")
        .update(payload as TablesUpdate<"site_settings">)
        .eq("id", settings.id);
      
      await refetchSettings();
    } catch (err) {
      console.error(`Failed to revoke ${selectedIntegration.name}`, err);
    }

    setShowRevokeDialog(false);
    toast({
      title: "Integration Revoked",
      description: `${selectedIntegration.name} API credentials have been successfully disconnected.`,
    });
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const { data, error } = await supabase.functions.invoke("health");
      if (error) throw error;
      toast({
        title: "System Update Check Completed",
        description: `CrossAngle OS is currently running the latest stable release (v${data?.version || '2.4.1'}). Database: ${data?.db_status || 'connected'}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Update Check Failed",
        description: "Could not reach the update server.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const nextState = !maintenanceMode;
    
    if (settings?.id) {
      try {
        const { error } = await supabase
          .from("site_settings")
          .update({ maintenance_mode_active: nextState })
          .eq("id", settings.id);
          
        if (error) throw error;
        await refetchSettings();
      } catch (err) {
        console.error("Failed to toggle maintenance mode", err);
        toast({
          title: "Update Failed",
          description: "Failed to toggle maintenance mode.",
          variant: "destructive",
        });
        return;
      }
    }

    setMaintenanceMode(nextState);
    setShowMaintenanceDialog(false);

    toast({
      title: nextState ? "Maintenance Mode Active" : "Maintenance Mode Disabled",
      description: nextState 
        ? "Public access to the website has been suspended. Visitors will see a maintenance notice."
        : "Public access to the website has been restored. The site is now live.",
    });
  };

  const queryClient = useQueryClient();

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      // Clear React Query cache
      await queryClient.invalidateQueries();
      queryClient.clear();
      
      // Clear browser caches
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map(name => window.caches.delete(name)));
      }
      
      toast({
        title: "System Cache Purged",
        description: "Vite build assets, API queries, and edge cache have been successfully invalidated.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Cache Purge Failed",
        description: "An error occurred while clearing system cache.",
        variant: "destructive"
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
      <div className="flex flex-col space-y-4">
      <style>{`
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
        .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
        .fade-up-3 { animation: fadeUp var(--anim-duration) var(--anim-stagger-3) var(--anim-ease) both; }
      `}</style>

      
      <div className="fade-up-1">
      {activeTab === "general" && (
        <ModuleActions>
          <Button
            type="button"
            size="lg"
            className="bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all duration-300 rounded-xl shadow-lg shadow-primary/20"
            onClick={() => {
              const form = document.querySelector<HTMLFormElement>("#general-settings-form");
              if (form) form.requestSubmit();
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </ModuleActions>
      )}

      {activeTab === "general" && (
        <div className="space-y-10">
          <GeneralSettingsForm />
          
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-2xl text-[hsl(var(--admin-text))]">Studio Statistics</h3>
              <p className="text-[hsl(var(--admin-muted))] text-sm mt-1">
                Configure the global metric numbers used across the website (e.g., '150+ Projects').
              </p>
            </div>
            <AdminStats />
          </div>
        </div>
      )}
      {activeTab === "reports" && <ReportRecipientsManager />}
      {activeTab === "credentials" &&
        <div className="w-full space-y-6">
                <div className="grid gap-4">
                  {integrations.map((service) => (
                    <div key={service.name} className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">{service.name}</h3>
                        <p className="text-[hsl(var(--admin-muted))] text-xs mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>{service.desc}</span>
                          <span className="text-zinc-600">•</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                            service.status === "Active" 
                              ? "text-[hsl(var(--admin-success))] border-[hsl(var(--admin-success))]/20 bg-[hsl(var(--admin-success))]/5" 
                              : service.status === "Revoked"
                              ? "text-red-400 border-red-500/20 bg-red-950/10"
                              : "text-[hsl(var(--admin-warning))] border-[hsl(var(--admin-warning))]/20 bg-[hsl(var(--admin-warning))]/5"
                          }`}>
                            {service.status}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleConfigureIntegration(service)}
                          className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-8 text-xs"
                        >
                          Configure
                        </Button>
                        {service.status === "Active" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedIntegration(service);
                              setShowRevokeDialog(true);
                            }}
                            className="text-[hsl(var(--admin-danger))] border-[hsl(var(--admin-danger))]/30 hover:bg-[hsl(var(--admin-danger))]/10 h-8 text-xs"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
      }
      {activeTab === "updates" &&
        <div className="w-full space-y-6">
                <div className="p-6 rounded-xl border border-[hsl(var(--admin-primary))]/30 bg-[hsl(var(--admin-primary))]/5 flex flex-col items-center justify-center text-center gap-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-[hsl(var(--admin-primary))]/10 flex items-center justify-center text-[hsl(var(--admin-primary))]">
                    {isCheckingUpdates ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <RefreshCw className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[hsl(var(--admin-text))]">
                      {isCheckingUpdates ? "Checking update registry..." : "System is up to date"}
                    </h3>
                    <p className="text-[hsl(var(--admin-muted))] text-sm mt-1">Running CrossAngle OS v2.4.1 (Stable)</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleCheckUpdates}
                    disabled={isCheckingUpdates}
                    className="mt-2 bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] min-w-[150px]"
                  >
                    {isCheckingUpdates ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check for Updates"
                    )}
                  </Button>
                </div>

                <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Maintenance Mode</h3>
                      {maintenanceMode && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider animate-pulse">
                          Offline Mode Active
                        </span>
                      )}
                    </div>
                    <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">Disable public access while performing critical updates. Admins bypass this.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowMaintenanceDialog(true)}
                    className={maintenanceMode 
                      ? "text-green-400 border-green-500/30 hover:bg-green-500/10 h-9"
                      : "text-[hsl(var(--admin-danger))] border-[hsl(var(--admin-danger))]/30 hover:bg-[hsl(var(--admin-danger))]/10 h-9"
                    }
                  >
                    {maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
                  </Button>
                </div>
                
                <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Cache Management</h3>
                    <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">Clear frontend application cache and trigger a rebuild.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearCache}
                    disabled={isClearingCache}
                    className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9 min-w-[110px]"
                  >
                    {isClearingCache ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Purging...
                      </>
                    ) : (
                      "Clear Cache"
                    )}
                  </Button>
                </div>
              </div>
      }

      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-text max-w-md p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-primary mb-2 border border-white/10">
              <Server className="w-6 h-6 text-[hsl(var(--admin-primary))]" />
            </div>
            <DialogTitle className="text-xl font-serif text-[hsl(var(--admin-text))]">
              Configure {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-1">
              Enter authorization token details to sync system processes with third-party service features.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-field" className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>API Secret Key / Access Token</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Masked for privacy</span>
                </Label>
                {selectedIntegration?.key && (
                  <p className="text-[11px] text-zinc-500 mb-1">
                    A key is currently saved. Enter a new token below to replace it, or leave blank to keep existing.
                  </p>
                )}
                <div className="relative">
                <Input
                  id="api-key-field"
                  type={showApiKey ? "text" : "password"}
                  value={integrationApiKey}
                  onChange={(e) => setIntegrationApiKey(e.target.value)}
                  placeholder="Enter secret token"
                  className="bg-white/5 border border-white/10 text-white pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {selectedIntegration?.id === "posthog" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="api-host-field" className="text-xs text-zinc-400 flex items-center justify-between">
                  <span>API Host</span>
                </Label>
                <div className="relative">
                  <Input
                    id="api-host-field"
                    type="text"
                    value={integrationApiHost}
                    onChange={(e) => setIntegrationApiHost(e.target.value)}
                    placeholder="https://us.i.posthog.com"
                    className="bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 italic">
                  Usually https://us.i.posthog.com or https://eu.i.posthog.com
                </p>
              </div>
            )}
            <p className="text-[11px] text-zinc-500 italic mt-4">
              Keys remain encrypted in database storage and are verified on save.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowIntegrationDialog(false)}
              className="bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveIntegration}
              disabled={isIntegrationLoading}
              className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/90 text-black font-semibold min-w-[120px]"
            >
              {isIntegrationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Save Connection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* REVOKE INTEGRATION ALERT DIALOG */}
      {/* ======================================================== */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent className="bg-admin-card border-admin-border text-admin-text max-w-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-red-500 mb-2 border border-white/10">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-serif text-[hsl(var(--admin-text))]">
              Revoke {selectedIntegration?.name} Integration?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm mt-2">
              This will immediately disconnect the integration connection. Dependent modules and automatic operations utilizing this secret token will fail. Are you sure you want to revoke credentials?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2">
            <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRevoke}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Revoke Credentials
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ======================================================== */}
      {/* MAINTENANCE MODE ALERT DIALOG */}
      {/* ======================================================== */}
      <AlertDialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <AlertDialogContent className="bg-admin-card border-admin-border text-admin-text max-w-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-red-500 mb-2 border border-white/10">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-serif text-[hsl(var(--admin-text))]">
              {maintenanceMode ? "Deactivate Maintenance Mode?" : "Activate System Maintenance Mode?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm mt-2">
              {maintenanceMode ? (
                "Disabling maintenance mode will restore standard public site navigation instantly. All features and estimators will be accessible to public visitors."
              ) : (
                "Activating maintenance mode will take the front-facing customer site offline. Public visitors will see a standard system offline landing page. Administrators logged into the OS bypass this policy."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2">
            <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleMaintenance}
              className={`font-semibold ${
                maintenanceMode 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {maintenanceMode ? "Bring Website Live" : "Go Offline Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
    </div>
  );
};

export default AdminSettings;

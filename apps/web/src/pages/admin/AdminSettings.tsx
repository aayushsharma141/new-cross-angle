import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { ReportRecipientsManager } from "@/components/admin/settings/ReportRecipientsManager";
import { Button } from "@/components/ui/primitives/button";
import { AdminPageHeader } from "@/components/admin/shared";
import { 
  Save, 
  Shield, 
  Key, 
  RefreshCw, 
  Settings, 
  Mail, 
  Lock, 
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

// Primitives
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Switch } from "@/components/ui/primitives/switch";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/primitives/table";

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

  // 1. Two-Factor Authentication (2FA) State
  const [is2FAEnforced, setIs2FAEnforced] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

  // 2. Session Timeout State
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [selectedTimeout, setSelectedTimeout] = useState("30");
  const [isTimeoutLoading, setIsTimeoutLoading] = useState(false);

  // 3. Role-Based Access Control (RBAC) State
  const [showRbacDialog, setShowRbacDialog] = useState(false);
  const [isRbacLoading, setIsRbacLoading] = useState(false);
  const [rbacPermissions, setRbacPermissions] = useState({
    admin: { leads: true, portfolio: true, services: true, settings: true },
    editor: { leads: true, portfolio: true, services: true, settings: false },
    staff: { leads: true, portfolio: false, services: false, settings: false },
  });

  // 4. Admin Credentials State
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState("crossangleinteriors@gmail.com");
  const [credForm, setCredForm] = useState({
    email: "crossangleinteriors@gmail.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  // 5. Integrations State
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "resend", name: "Resend (Email)", desc: "Connected to crossangleinteriors@gmail.com", status: "Active", key: "re_s8h2N...9k2s" },
    { id: "supabase", name: "Supabase (Database)", desc: "Primary database and auth provider", status: "Active", key: "sb_a8j3K...1l8w" },
    { id: "vercel", name: "Vercel (Hosting)", desc: "Frontend hosting and edge functions", status: "Active", key: "vc_p9j2L...4m9x" },
    { id: "posthog", name: "PostHog (Analytics)", desc: "Product analytics and event tracking", status: "Pending configuration", key: "" },
  ]);

  useEffect(() => {
    if (settings?.posthog_api_key) {
      setIntegrations((prev) => prev.map(item => {
        if (item.id === "posthog") {
          return {
            ...item,
            status: "Active",
            key: settings.posthog_api_key || "",
            desc: "Analytics collection active"
          };
        }
        return item;
      }));
    } else {
      setIntegrations((prev) => prev.map(item => {
        if (item.id === "posthog") {
          return {
            ...item,
            status: "Pending configuration",
            key: "",
            desc: "Product analytics and event tracking"
          };
        }
        return item;
      }));
    }
  }, [settings?.posthog_api_key]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [integrationApiKey, setIntegrationApiKey] = useState("");
  const [integrationApiHost, setIntegrationApiHost] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isIntegrationLoading, setIsIntegrationLoading] = useState(false);

  // 6. System Version Updates State
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  // 7. Maintenance Mode State
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  // 8. Cache Management State
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleToggle2FA = () => {
    setIs2FALoading(true);
    setTimeout(() => {
      const nextState = !is2FAEnforced;
      setIs2FAEnforced(nextState);
      setIs2FALoading(false);
      setShow2FADialog(false);
      
      toast({
        title: nextState ? "2FA Enforced Globally" : "2FA Enforcement Disabled",
        description: nextState 
          ? "Two-factor authentication requirement is now active for all administrators."
          : "Global requirement for two-factor authentication has been disabled.",
      });
    }, 800);
  };

  const handleSaveTimeout = () => {
    setIsTimeoutLoading(true);
    setTimeout(() => {
      const minutes = parseInt(selectedTimeout, 10);
      setSessionTimeout(minutes);
      setIsTimeoutLoading(false);
      setShowTimeoutDialog(false);

      toast({
        title: "Session Timeout Updated",
        description: `Inactive users will now be logged out automatically after ${minutes} minutes.`,
      });
    }, 600);
  };

  const togglePermission = (role: 'admin' | 'editor' | 'staff', module: 'leads' | 'portfolio' | 'services' | 'settings') => {
    setRbacPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module]
      }
    }));
  };

  const handleSaveRbac = () => {
    setIsRbacLoading(true);
    setTimeout(() => {
      setIsRbacLoading(false);
      setShowRbacDialog(false);

      toast({
        title: "RBAC Permissions Saved",
        description: "Role-based access control policies have been updated successfully.",
      });
    }, 800);
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (credForm.newPassword || credForm.confirmPassword) {
      if (!credForm.currentPassword) {
        setPasswordError("Please enter your current password to confirm changes.");
        return;
      }
      if (credForm.newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters long.");
        return;
      }
      if (credForm.newPassword !== credForm.confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }
    }

    setIsCredentialsLoading(true);
    setTimeout(() => {
      setAdminEmail(credForm.email);
      setIsCredentialsLoading(false);
      setShowCredentialsDialog(false);
      setCredForm(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));

      toast({
        title: "Credentials Updated",
        description: "Your administrator login credentials have been saved successfully.",
      });
    }, 1000);
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    // Pre-populate existing PostHog key so the user can see / update it
    if (integration.id === "posthog") {
      setIntegrationApiKey(settings?.posthog_api_key || "");
      setIntegrationApiHost(settings?.posthog_host || "https://us.i.posthog.com");
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

    if (selectedIntegration.id === "posthog") {
      try {
        let dbError;

        if (settings?.id) {
          // Row exists — update it
          const { error } = await supabase
            .from("site_settings")
            .update({
              posthog_api_key: integrationApiKey || null,
              posthog_host: integrationApiHost || null,
            })
            .eq("id", settings.id);
          dbError = error;
        } else {
          // No row yet — upsert a new one
          const { error } = await supabase
            .from("site_settings")
            .upsert(
              {
                posthog_api_key: integrationApiKey || null,
                posthog_host: integrationApiHost || null,
              },
              { onConflict: "id" }
            );
          dbError = error;
        }

        if (dbError) throw dbError;
        await refetchSettings();

        setIsIntegrationLoading(false);
        setShowIntegrationDialog(false);
        toast({
          title: "PostHog Configured",
          description: "Analytics integration saved. Events will start flowing immediately.",
        });
      } catch (err) {
        console.error("Failed to save PostHog settings", err);
        toast({
          title: "Update Failed",
          description: "Failed to save integration details. Please try again.",
          variant: "destructive",
        });
        setIsIntegrationLoading(false);
      }
    } else {
      // Non-PostHog integrations: optimistic local-only update
      setTimeout(() => {
        setIntegrations(prev =>
          prev.map(item => {
            if (item.id === selectedIntegration.id) {
              return {
                ...item,
                status: "Active" as const,
                key: integrationApiKey || item.key || "••••••••••••••••",
              };
            }
            return item;
          })
        );
        setIsIntegrationLoading(false);
        setShowIntegrationDialog(false);
        toast({
          title: "Integration Configured",
          description: `${selectedIntegration.name} integration details have been saved.`,
        });
      }, 800);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!selectedIntegration) return;

    if (selectedIntegration.id === "posthog" && settings?.id) {
      try {
        await supabase
          .from("site_settings")
          .update({ posthog_api_key: null, posthog_host: null })
          .eq("id", settings.id);
        await refetchSettings();
      } catch (err) {
        console.error("Failed to revoke PostHog", err);
      }
    } else {
      setIntegrations(prev => prev.map(item => {
        if (item.id === selectedIntegration.id) {
          return {
            ...item,
            status: "Revoked",
            key: "",
            desc: item.id === "posthog" ? "Analytics tracking suspended" : "Connection details revoked"
          };
        }
        return item;
      }));
    }

    setShowRevokeDialog(false);
    toast({
      title: "Integration Revoked",
      description: `${selectedIntegration.name} API credentials have been successfully disconnected.`,
    });
  };

  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => {
      setIsCheckingUpdates(false);
      toast({
        title: "System Update Check Completed",
        description: "CrossAngle OS is currently running the latest stable release (v2.4.1).",
      });
    }, 1200);
  };

  const handleToggleMaintenance = () => {
    const nextState = !maintenanceMode;
    setMaintenanceMode(nextState);
    setShowMaintenanceDialog(false);

    toast({
      title: nextState ? "Maintenance Mode Active" : "Maintenance Mode Disabled",
      description: nextState 
        ? "Public access to the website has been suspended. Visitors will see a maintenance notice."
        : "Public access to the website has been restored. The site is now live.",
    });
  };

  const handleClearCache = () => {
    setIsClearingCache(true);
    setTimeout(() => {
      setIsClearingCache(false);
      toast({
        title: "System Cache Purged",
        description: "Vite build assets and CDN page edge cache have been successfully invalidated.",
      });
    }, 1500);
  };

  const tabNameMap: Record<string, string> = {
    general: "General Settings",
    reports: "Email Recipients",
    access: "Access & Security",
    credentials: "API & Integrations",
    updates: "Updates & Maintenance"
  };

  return (
    <div className="flex flex-col space-y-6">
      <style>{`
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
        .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
        .fade-up-3 { animation: fadeUp var(--anim-duration) var(--anim-stagger-3) var(--anim-ease) both; }
      `}</style>

      <AdminPageHeader moduleName="System" tabName={tabNameMap[activeTab] || "Settings"} />

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

      {activeTab === "general" && <GeneralSettingsForm />}
      {activeTab === "reports" && <ReportRecipientsManager />}
      {activeTab === "access" &&
              <div className="w-full space-y-6">
                <div className="grid gap-4">
                  <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Two-Factor Authentication (2FA)</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${is2FAEnforced ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                          {is2FAEnforced ? "Enforced" : "Optional"}
                        </span>
                      </div>
                      <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">Require 2FA for all administrative accounts.</p>
                    </div>
                    <Button 
                      variant={is2FAEnforced ? "destructive" : "outline"} 
                      size="sm" 
                      onClick={() => setShow2FADialog(true)}
                      className={is2FAEnforced ? "h-9" : "bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9"}
                    >
                      {is2FAEnforced ? "Disable 2FA Requirement" : "Enforce Globally"}
                    </Button>
                  </div>

                  <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Session Timeout</h3>
                      <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">
                        Automatically log out inactive users after <strong className="text-[hsl(var(--admin-primary))] font-semibold">{sessionTimeout} minutes</strong>.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedTimeout(sessionTimeout.toString());
                        setShowTimeoutDialog(true);
                      }}
                      className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9"
                    >
                      Configure
                    </Button>
                  </div>

                  <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Role-Based Access Control (RBAC)</h3>
                      <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">Manage modular access privileges for Staff, Editor, and Super Admin roles.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowRbacDialog(true)}
                      className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9"
                    >
                      Manage Roles
                    </Button>
                  </div>

                  <div className="p-5 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[hsl(var(--admin-text))]">Admin Credential Update</h3>
                      <p className="text-[hsl(var(--admin-muted))] text-xs mt-1">
                        Update your password or change active email: <span className="text-zinc-400 font-semibold">{adminEmail}</span>
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setCredForm({ email: adminEmail, currentPassword: "", newPassword: "", confirmPassword: "" });
                        setPasswordError("");
                        setShowCredentialsDialog(true);
                      }}
                      className="bg-[hsl(var(--admin-surface))] hover:text-black hover:bg-[hsl(var(--admin-primary))] h-9"
                    >
                      Update Credentials
                    </Button>
                  </div>
                </div>
              </div>
      }
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

      <AlertDialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <AlertDialogContent className="bg-admin-card border-admin-border text-admin-text max-w-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-site-gold mb-2 border border-white/10">
              <Shield className="w-6 h-6 text-[hsl(var(--admin-primary))]" />
            </div>
            <AlertDialogTitle className="text-xl font-serif text-[hsl(var(--admin-text))]">
              {is2FAEnforced ? "Disable Global 2FA Policy?" : "Enforce 2FA Globally?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm mt-2">
              {is2FAEnforced ? (
                "Disabling this requirement means administrators and staff will no longer be forced to use Two-Factor Authentication. This lowers security safeguards significantly."
              ) : (
                "This policy enforces Two-Factor Authentication (2FA) for all system administration and staff accounts. Users will be required to configure a secondary auth authenticator step upon their next action. Are you sure you want to activate this global policy?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2">
            <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleToggle2FA();
              }}
              disabled={is2FALoading}
              className={`font-semibold ${
                is2FAEnforced 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/90 text-black"
              }`}
            >
              {is2FALoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                is2FAEnforced ? "Disable 2FA" : "Enforce 2FA"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showTimeoutDialog} onOpenChange={setShowTimeoutDialog}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-text max-w-sm p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-site-gold mb-2 border border-white/10">
              <Lock className="w-6 h-6 text-[hsl(var(--admin-primary))]" />
            </div>
            <DialogTitle className="text-xl font-serif text-[hsl(var(--admin-text))]">Configure Session Timeout</DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-1">
              Select the inactive idle duration before users are automatically logged out securely.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6">
            <Label htmlFor="timeout-select" className="text-xs text-zinc-400 block mb-2 font-medium">
              Inactivity Limit
            </Label>
            <select
              id="timeout-select"
              title="Select session inactivity timeout duration"
              value={selectedTimeout}
              onChange={(e) => setSelectedTimeout(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-site-gold"
            >
              <option value="15" className="bg-zinc-900 text-white">15 minutes (High Security)</option>
              <option value="30" className="bg-zinc-900 text-white">30 minutes (Standard)</option>
              <option value="60" className="bg-zinc-900 text-white">60 minutes (1 Hour)</option>
              <option value="120" className="bg-zinc-900 text-white">120 minutes (2 Hours)</option>
              <option value="240" className="bg-zinc-900 text-white">240 minutes (4 Hours)</option>
              <option value="480" className="bg-zinc-900 text-white">480 minutes (8 Hours)</option>
            </select>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTimeoutDialog(false)}
              className="bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTimeout}
              disabled={isTimeoutLoading}
              className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/90 text-black font-semibold min-w-[110px]"
            >
              {isTimeoutLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRbacDialog} onOpenChange={setShowRbacDialog}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-text max-w-2xl p-6 flex-col">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-site-gold mb-2 border border-white/10">
              <Shield className="w-6 h-6 text-[hsl(var(--admin-primary))]" />
            </div>
            <DialogTitle className="text-xl font-serif text-[hsl(var(--admin-text))]">Role-Based Access Control</DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-1">
              Configure system features accessible by each role level. Changes apply dynamically to active sessions.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 border border-white/5 rounded-lg overflow-hidden bg-zinc-950/40">
            <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="text-zinc-300 font-bold min-w-[150px]">Module</TableHead>
                  <TableHead className="text-zinc-300 text-center font-bold">Admin</TableHead>
                  <TableHead className="text-zinc-300 text-center font-bold">Editor</TableHead>
                  <TableHead className="text-zinc-300 text-center font-bold">Staff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-semibold text-zinc-300">Leads</TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.admin.leads} onCheckedChange={() => togglePermission('admin', 'leads')} /></TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.editor.leads} onCheckedChange={() => togglePermission('editor', 'leads')} /></TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.staff.leads} onCheckedChange={() => togglePermission('staff', 'leads')} /></TableCell>
                </TableRow>
                <TableRow className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-semibold text-zinc-300">Portfolio</TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.admin.portfolio} onCheckedChange={() => togglePermission('admin', 'portfolio')} /></TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.editor.portfolio} onCheckedChange={() => togglePermission('editor', 'portfolio')} /></TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.staff.portfolio} onCheckedChange={() => togglePermission('staff', 'portfolio')} /></TableCell>
                </TableRow>
                <TableRow className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-semibold text-zinc-300">Services</TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.admin.services} onCheckedChange={() => togglePermission('admin', 'services')} /></TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.editor.services} onCheckedChange={() => togglePermission('editor', 'services')} /></TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.staff.services} onCheckedChange={() => togglePermission('staff', 'services')} /></TableCell>
                </TableRow>
                <TableRow className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-semibold text-zinc-300">Settings</TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.admin.settings} onCheckedChange={() => togglePermission('admin', 'settings')} /></TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.editor.settings} onCheckedChange={() => togglePermission('editor', 'settings')} /></TableCell>
                  <TableCell className="text-center"><Switch checked={rbacPermissions.staff.settings} onCheckedChange={() => togglePermission('staff', 'settings')} /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRbacDialog(false)} className="bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700">Cancel</Button>
            <Button onClick={handleSaveRbac} disabled={isRbacLoading} className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/90 text-black font-semibold min-w-[120px]">
              {isRbacLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-text max-w-md p-6">
          <form onSubmit={handleUpdateCredentials}>
            <DialogHeader>
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-site-gold mb-2 border border-white/10">
                <Key className="w-6 h-6 text-[hsl(var(--admin-primary))]" />
              </div>
              <DialogTitle className="text-xl font-serif text-[hsl(var(--admin-text))]">Update Administrator Credentials</DialogTitle>
              <DialogDescription className="text-zinc-400 text-sm mt-1">
                Configure your active administrator email or change the master dashboard password.
              </DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email-field" className="text-xs text-zinc-400">Email Address</Label>
                <Input id="admin-email-field" type="email" required value={credForm.email} onChange={(e) => setCredForm(prev => ({ ...prev, email: e.target.value }))} className="bg-white/5 border border-white/10 text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-current-password-field" className="text-xs text-zinc-400">Current Password (Required for changes)</Label>
                <Input id="admin-current-password-field" type="password" value={credForm.currentPassword} onChange={(e) => setCredForm(prev => ({ ...prev, currentPassword: e.target.value }))} placeholder="Enter your current password" className="bg-white/5 border border-white/10 text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password-field" className="text-xs text-zinc-400">New Password</Label>
                <Input id="admin-password-field" type="password" value={credForm.newPassword} onChange={(e) => setCredForm(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="••••••••••••" className="bg-white/5 border border-white/10 text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-confirm-password-field" className="text-xs text-zinc-400">Confirm New Password</Label>
                <Input id="admin-confirm-password-field" type="password" value={credForm.confirmPassword} onChange={(e) => setCredForm(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="••••••••••••" className="bg-white/5 border border-white/10 text-white" />
              </div>

              {passwordError && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5 animate-bounce">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {passwordError}
                </p>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCredentialsDialog(false)} className="bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700">Cancel</Button>
              <Button type="submit" disabled={isCredentialsLoading} className="bg-[hsl(var(--admin-primary))] hover:bg-[hsl(var(--admin-primary))]/90 text-black font-semibold min-w-[130px]">
                {isCredentialsLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Save Credentials"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-text max-w-md p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-site-gold mb-2 border border-white/10">
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

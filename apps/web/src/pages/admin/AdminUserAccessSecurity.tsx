import React from 'react';
import { useState, useEffect, JSX } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2, Shield, User, X, Clock, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { changePasswordSchema } from "@/lib/auth/auth-validation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/primitives/card";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Progress } from "@/components/ui/primitives/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/primitives/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/primitives/dialog";
import { Badge } from "@/components/ui/primitives/badge";


const TIMEOUT_OPTIONS = [
  { value: 15, label: "15 minutes", desc: "High Security" },
  { value: 30, label: "30 minutes", desc: "Standard" },
  { value: 60, label: "1 hour", desc: "Relaxed" },
  { value: 120, label: "2 hours", desc: "Low Security" },
  { value: 240, label: "4 hours", desc: "Very Low" },
  { value: 480, label: "8 hours", desc: "Maximum" },
];

export default function AdminUserAccessSecurity(): JSX.Element {
  const { settings, refetch: refetchSettings } = useSiteSettings();
  const { toast } = useToast();

  // ── 2FA state ──
  const security = (settings?.security_config as { enforce_2fa?: boolean; session_timeout_minutes?: number }) || {};
  const [is2FAEnforced, setIs2FAEnforced] = useState(security.enforce_2fa ?? false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

  // ── Session timeout state ──
  const [sessionTimeout, setSessionTimeout] = useState(security.session_timeout_minutes ?? 30);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [selectedTimeout, setSelectedTimeout] = useState(sessionTimeout);
  const [isTimeoutLoading, setIsTimeoutLoading] = useState(false);

  // ── Password change state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Sync from settings when they load
  useEffect(() => {
    if (security.enforce_2fa !== undefined) setIs2FAEnforced(security.enforce_2fa);
    if (security.session_timeout_minutes !== undefined) {
      setSessionTimeout(security.session_timeout_minutes);
      setSelectedTimeout(security.session_timeout_minutes);
    }
  }, [security.enforce_2fa, security.session_timeout_minutes]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
        if (roleData) setUserRole(roleData.role);
      }
    };
    void fetchUserInfo();
  }, []);

  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (newPassword.match(/[A-Z]/)) strength += 25;
    if (newPassword.match(/[0-9]/)) strength += 25;
    if (newPassword.match(/[^A-Za-z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  }, [newPassword]);

  const getStrengthColor = (score: number) => score <= 25 ? "bg-red-500" : score <= 50 ? "bg-orange-500" : score <= 75 ? "bg-yellow-500" : "bg-green-500";
  const getStrengthLabel = (score: number) => score === 0 ? "" : score <= 25 ? "Weak" : score <= 50 ? "Fair" : score <= 75 ? "Good" : "Strong";

  // ── Save security config ──
  const saveSecurityConfig = async (updates: Record<string, unknown>) => {
    const { error } = await supabase
      .from("site_settings")
      .update({ security_config: { ...security, ...updates } })
      .eq("id", settings?.id || "");
    if (error) throw error;
    await refetchSettings();
  };

  // ── Handlers ──
  const handleToggle2FA = async () => {
    setIs2FALoading(true);
    try {
      await saveSecurityConfig({ enforce_2fa: !is2FAEnforced });
      setIs2FAEnforced(!is2FAEnforced);
      toast({
        title: is2FAEnforced ? "2FA requirement disabled" : "2FA requirement enabled",
        description: is2FAEnforced ? "Users can now log in without two-factor authentication." : "All admin users will be required to set up two-factor authentication.",
      });
    } catch {
      toast({ title: "Error", description: "Failed to update 2FA setting.", variant: "destructive" });
    } finally { setIs2FALoading(false); setShow2FADialog(false); }
  };

  const handleSaveTimeout = async () => {
    setIsTimeoutLoading(true);
    try {
      await saveSecurityConfig({ session_timeout_minutes: selectedTimeout });
      setSessionTimeout(selectedTimeout);
      toast({ title: "Session timeout updated", description: `Inactive users will be logged out after ${selectedTimeout} minutes.` });
    } catch {
      toast({ title: "Error", description: "Failed to update session timeout.", variant: "destructive" });
    } finally { setIsTimeoutLoading(false); setShowTimeoutDialog(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    const validation = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmNewPassword });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => { fieldErrors[String(err.path[0])] = err.message; });
      setPasswordErrors(fieldErrors);
      return;
    }
    setIsPasswordLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User not found");
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
      if (signInError) { setPasswordErrors({ currentPassword: "Current password is incorrect" }); setIsPasswordLoading(false); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      toast({ title: "Password updated", description: "Your password has been successfully changed." });
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
      setPasswordStrength(0);
    } catch {
      toast({ title: "Error", description: "Failed to update password. Please try again.", variant: "destructive" });
    } finally { setIsPasswordLoading(false); }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      
      {/* ── Account Information ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white/[0.02] border-b border-white/[0.05] pb-4 px-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><User className="text-primary h-5 w-5" /></div>
              <div><CardTitle className="text-lg font-serif">Account Information</CardTitle><CardDescription className="text-zinc-500">Your personal executive profile details.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                <div className="flex items-center gap-2 font-medium text-lg">{userEmail}{userEmail && <CheckCircle2 className="h-4 w-4 text-green-500" />}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize"><Shield size={12} />{userRole || "User"}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Global Security Settings ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 2FA Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden h-full">
            <CardHeader className="bg-white/[0.02] border-b border-white/[0.05] pb-4 px-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><KeyRound className="text-primary h-5 w-5" /></div>
                <div><CardTitle className="text-lg font-serif">Two-Factor Authentication</CardTitle><CardDescription className="text-zinc-500">Enforce 2FA for all administrative accounts.</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Status</span>
                <Badge variant={is2FAEnforced ? "default" : "secondary"} className={is2FAEnforced ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}>
                  {is2FAEnforced ? "Enforced" : "Optional"}
                </Badge>
              </div>
              <p className="text-sm text-zinc-500">
                {is2FAEnforced
                  ? "All admin users must set up two-factor authentication to access the panel."
                  : "Two-factor authentication is optional. Users can choose to enable it or not."}
              </p>
              <Button
                variant={is2FAEnforced ? "destructive" : "outline"}
                onClick={() => setShow2FADialog(true)}
                disabled={is2FALoading}
                className="w-full"
              >
                {is2FALoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {is2FAEnforced ? "Disable 2FA Requirement" : "Enforce Globally"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Timeout Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden h-full">
            <CardHeader className="bg-white/[0.02] border-b border-white/[0.05] pb-4 px-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><Clock className="text-primary h-5 w-5" /></div>
                <div><CardTitle className="text-lg font-serif">Session Timeout</CardTitle><CardDescription className="text-zinc-500">Automatically log out inactive users.</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-zinc-400">
                Inactive sessions expire after <span className="text-zinc-200 font-semibold">{sessionTimeout} minutes</span>.
              </p>
              <p className="text-xs text-zinc-600">
                Users will be redirected to the login page with a "session expired" message.
              </p>
              <Button variant="outline" onClick={() => { setSelectedTimeout(sessionTimeout); setShowTimeoutDialog(true); }} className="w-full">
                Configure
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Password Change ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white/[0.02] border-b border-white/[0.05] pb-4 px-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><Shield className="text-primary h-5 w-5" /></div>
              <div><CardTitle className="text-lg font-serif">Security Protocol</CardTitle><CardDescription className="text-zinc-500">Update your access credentials to maintain unit integrity.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={cn(passwordErrors.currentPassword ? "border-destructive focus-visible:ring-destructive" : "")} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setShowCurrentPassword(!showCurrentPassword)} aria-label={showCurrentPassword ? "Hide current password" : "Show current password"} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">{showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
                </div>
                {passwordErrors.currentPassword && <p className="text-sm text-destructive flex items-center gap-1"><X className="h-3 w-3" /> {passwordErrors.currentPassword}</p>}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={cn(passwordErrors.newPassword ? "border-destructive focus-visible:ring-destructive" : "")} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? "Hide new password" : "Show new password"} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
                  </div>
                </div>
                {newPassword && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Strength</span>
                      <span className={cn("font-medium", passwordStrength <= 25 ? "text-red-500" : passwordStrength <= 50 ? "text-orange-500" : passwordStrength <= 75 ? "text-yellow-500" : "text-green-500")}>{getStrengthLabel(passwordStrength)}</span>
                    </div>
                    <Progress value={passwordStrength} className="h-1.5" indicatorClassName={getStrengthColor(passwordStrength)} />
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 pt-1">
                      <li className={cn(newPassword.length >= 8 ? "text-green-600 font-medium" : "")}>At least 8 characters</li>
                      <li className={cn(/[A-Z]/.test(newPassword) ? "text-green-600 font-medium" : "")}>One uppercase letter</li>
                      <li className={cn(/[0-9]/.test(newPassword) ? "text-green-600 font-medium" : "")}>One number</li>
                    </ul>
                  </div>
                )}
                {passwordErrors.newPassword && <p className="text-sm text-destructive flex items-center gap-1"><X className="h-3 w-3" /> {passwordErrors.newPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input id="confirmNewPassword" type={showConfirmPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={cn(passwordErrors.confirmNewPassword ? "border-destructive focus-visible:ring-destructive" : "")} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
                </div>
                {passwordErrors.confirmNewPassword && <p className="text-sm text-destructive flex items-center gap-1"><X className="h-3 w-3" /> {passwordErrors.confirmNewPassword}</p>}
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={isPasswordLoading} className="rounded-xl shadow-lg shadow-primary/20">
                  {isPasswordLoading ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing�</>) : "Update Protocol"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 2FA Confirmation Dialog ── */}
      <AlertDialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <AlertDialogContent className="bg-admin-card border-admin-border text-admin-text">
          <AlertDialogHeader>
            <AlertDialogTitle>{is2FAEnforced ? "Disable 2FA Requirement" : "Enforce Two-Factor Authentication"}</AlertDialogTitle>
            <AlertDialogDescription>
              {is2FAEnforced
                ? "This will make two-factor authentication optional. Existing 2FA configurations will be preserved for users who already have it enabled."
                : "All admin users will be required to set up two-factor authentication on their next login. Users without 2FA configured will be prompted to set it up."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={is2FALoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void handleToggle2FA(); }} disabled={is2FALoading}>
              {is2FALoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {is2FAEnforced ? "Disable" : "Enforce"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Session Timeout Dialog ── */}
      <Dialog open={showTimeoutDialog} onOpenChange={setShowTimeoutDialog}>
        <DialogContent className="bg-admin-card border-admin-border text-admin-text sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Session Timeout</DialogTitle>
            <DialogDescription>Choose how long before an inactive session expires.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {TIMEOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedTimeout(opt.value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all ${
                  selectedTimeout === opt.value
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-zinc-800 hover:border-zinc-700 text-zinc-300"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-xs text-zinc-500">{opt.desc}</span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeoutDialog(false)}>Cancel</Button>
            <Button onClick={() => void handleSaveTimeout()} disabled={isTimeoutLoading}>
              {isTimeoutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

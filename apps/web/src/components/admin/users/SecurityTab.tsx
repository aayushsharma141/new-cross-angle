import React from 'react';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2, Shield, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { changePasswordSchema } from "@/lib/auth/auth-validation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { Surface, Stack, Text } from "@/components/primitives/foundation";
import { Input } from "@/components/primitives/interactive";
import { Label } from "@/components/ui/primitives/label";
import { Progress } from "@/components/ui/primitives/progress";

export const SecurityTab = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmNewPassword?: string }>({});
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    const validation = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmNewPassword });
    if (!validation.success) {
      const fieldErrors: typeof passwordErrors = {};
      validation.error.errors.forEach((err) => { fieldErrors[err.path[0] as keyof typeof passwordErrors] = err.message; });
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
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword(""); setPasswordStrength(0);
    } catch {
      toast({ title: "Error", description: "Failed to update password. Please try again.", variant: "destructive", duration: 3000 });
    } finally { setIsPasswordLoading(false); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Surface variant="primary" radius="lg" border shadow="sm" className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
          <Stack gap="sm" className="p-6" className="bg-white/[0.02] border-b border-white/[0.05] pb-4 px-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><User className="text-primary h-5 w-5" /></div>
              <div><Text as="h3" variant="h3" className="leading-none" className="text-lg font-serif">Account Information</Text><Text as="p" variant="caption" color="muted" className="text-zinc-500">Your personal executive profile details.</Text></div>
            </div>
          </Stack>
          <div className="p-6 pt-0" className="p-6">
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
          </div>
        </Surface>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Surface variant="primary" radius="lg" border shadow="sm" className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
          <Stack gap="sm" className="p-6" className="bg-white/[0.02] border-b border-white/[0.05] pb-4 px-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><Shield className="text-primary h-5 w-5" /></div>
              <div><Text as="h3" variant="h3" className="leading-none" className="text-lg font-serif">Security Protocol</Text><Text as="p" variant="caption" color="muted" className="text-zinc-500">Update your access credentials to maintain unit integrity.</Text></div>
            </div>
          </Stack>
          <div className="p-6 pt-0" className="p-6">
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
          </div>
        </Surface>
      </motion.div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Eye, EyeOff, User, Shield, Check, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { changePasswordSchema } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AuditLogTable } from "@/components/admin/settings/AuditLogTable";
import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmNewPassword?: string }>({});
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const { toast } = useToast();

  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData) {
          setUserRole(roleData.role);
        }
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    calculatePasswordStrength(newPassword);
  }, [newPassword]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  };

  const getStrengthColor = (score: number) => {
    if (score <= 25) return "bg-red-500";
    if (score <= 50) return "bg-orange-500";
    if (score <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return "";
    if (score <= 25) return "Weak";
    if (score <= 50) return "Fair";
    if (score <= 75) return "Good";
    return "Strong";
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword
    });

    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // First verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User not found");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        setErrors({ currentPassword: "Current password is incorrect" });
        setIsLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordStrength(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-3xl font-display font-bold text-[hsl(var(--admin-foreground))]">Settings</h1>
          <p className="text-[hsl(var(--admin-muted))] mt-2">Manage your account preferences and security.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettingsForm />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="text-blue-600 h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                    <CardDescription>Your personal account details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                    <div className="flex items-center gap-2 font-medium text-lg">
                      {userEmail}
                      {userEmail && <Check className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        <Shield size={12} />
                        {userRole || "User"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Lock className="text-amber-600 h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Security</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={cn(errors.currentPassword ? "border-destructive focus-visible:ring-destructive" : "")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <X className="h-3 w-3" /> {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={cn(errors.newPassword ? "border-destructive focus-visible:ring-destructive" : "")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Strength</span>
                          <span className={cn(
                            "font-medium",
                            passwordStrength <= 25 ? "text-red-500" :
                              passwordStrength <= 50 ? "text-orange-500" :
                                passwordStrength <= 75 ? "text-yellow-500" : "text-green-500"
                          )}>
                            {getStrengthLabel(passwordStrength)}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className="h-1.5" indicatorClassName={getStrengthColor(passwordStrength)} />
                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 pt-1">
                          <li className={cn(newPassword.length >= 8 ? "text-green-600 font-medium" : "")}>At least 8 characters</li>
                          <li className={cn(/[A-Z]/.test(newPassword) ? "text-green-600 font-medium" : "")}>One uppercase letter</li>
                          <li className={cn(/[0-9]/.test(newPassword) ? "text-green-600 font-medium" : "")}>One number</li>
                        </ul>
                      </div>
                    )}
                    {errors.newPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <X className="h-3 w-3" /> {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmNewPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={cn(errors.confirmNewPassword ? "border-destructive focus-visible:ring-destructive" : "")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmNewPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <X className="h-3 w-3" /> {errors.confirmNewPassword}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={isLoading} className="bg-[hsl(var(--brand-primary))]">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] shadow-sm">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="text-purple-600 h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Audit Logs</CardTitle>
                    <CardDescription>Track critical system events and user actions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <AuditLogTable />
              </CardContent>
            </Card>
          </motion.div >
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default AdminSettings;

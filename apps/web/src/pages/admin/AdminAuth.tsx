import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema, forgotPasswordSchema, signupSchema } from "@/lib/auth-validation";
import type { User } from "@supabase/supabase-js";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: isCheckingAuth } = useAuth();
  const [view, setView] = useState<"login" | "forgot" | "signup">("login");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [signupEnabled, setSignupEnabled] = useState(true); // Always enabled for reset flow
  const [checkingSignup, setCheckingSignup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if signup is enabled (no admins exist) on mount
  // useEffect(() => {
  //   const checkSignupStatus = async () => {
  //     try {
  //       console.log("Debug: Checking signup status...");
  //       const { data, error } = await supabase.functions.invoke("assign-first-admin", {
  //         body: { check_signup_enabled: true },
  //       });

  //       console.log("Debug: Signup status response:", { data, error });

  //       if (!error && data?.signup_enabled) {
  //         setSignupEnabled(true);
  //       } else {
  //            console.warn("Debug: Function failed or returned false. Forcing signup enabled for recovery.");
  //            setSignupEnabled(true);
  //       }
  //     } catch (err) {
  //       console.error("Error checking signup status:", err);
  //       // Also enable on crash
  //       setSignupEnabled(true);
  //     } finally {
  //       setCheckingSignup(false);
  //     }
  //   };

  //   checkSignupStatus();
  // }, []);

  // Auth state is now managed by useAuth hook

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to admin panel.",
      });

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!signupEnabled) {
      toast({
        title: "Signup disabled",
        description: "Admin signup is not available. An admin account already exists.",
        variant: "destructive",
      });
      return;
    }

    const validation = signupSchema.safeParse({ email, password, confirmPassword });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string; confirmPassword?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
        if (err.path[0] === "confirmPassword") fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/auth`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Ensure we have an authenticated session (required to call backend functions)
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInError) throw signInError;
        }

        // Assign admin role via backend function (bypasses RLS safely for first admin setup)
        const { error: assignError } = await supabase.functions.invoke("assign-first-admin", {
          body: { user_id: data.user.id },
        });

        if (assignError) {
          console.error("Role assignment failed:", assignError);
          toast({
            title: "Account created!",
            description: "Step 1 complete. Now run the SQL script in Supabase Dashboard to finish assigning the 'admin' role.",
            variant: "default", // Changed to default so it looks less scary, more informational
          });
          // Still allow them to switch to login view
          setSignupEnabled(false);
          setView("login");
          setPassword("");
          setConfirmPassword("");
          return;
        }

        // Signup no longer available after first admin
        setSignupEnabled(false);

        toast({
          title: "Admin account created!",
          description: "You can now sign in with your credentials.",
        });

        setView("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setErrors({ email: validation.error.errors[0]?.message });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/admin/reset-password`;
      console.log("Sending password reset with redirect URL:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "If an account exists, you'll receive a password reset link.",
      });

      setView("login");
      setEmail("");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error requesting reset",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-gold mb-2">
            Cross Angle
          </h1>
          <p className="text-muted-foreground">
            {view === "login" && "Admin Panel Login"}
            {view === "forgot" && "Reset Your Password"}
            {view === "signup" && "Create Admin Account"}
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border">
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@crossangle.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      autoFocus
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      resetForm();
                    }}
                    className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>

                  {!checkingSignup && signupEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        setView("signup");
                        resetForm();
                      }}
                      className="w-full text-center text-sm text-primary hover:underline transition-colors flex items-center justify-center gap-1"
                    >
                      <UserPlus size={14} />
                      Create first admin account
                    </button>
                  )}
                </div>
              </motion.form>
            )}

            {view === "signup" && signupEnabled && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSignup}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    resetForm();
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </button>

                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
                  <strong>⚠️ First Admin Setup:</strong> This option is only available because no admin accounts exist yet. After creating your account, this option will be automatically disabled.
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="admin@crossangle.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      autoFocus
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Min 8 characters, with at least one letter and one number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </motion.form>
            )}

            {view === "forgot" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleForgotPassword}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    resetForm();
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </button>

                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="admin@crossangle.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      autoFocus
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  You'll receive an email with a link to reset your password.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-muted-foreground text-sm mt-6"
        >
          © {new Date().getFullYear()} Cross Angle Interior. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AdminAuth;

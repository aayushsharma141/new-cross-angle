import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { useToast } from "@/hooks/useToast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Loader2,
  ShieldCheck,
  MailCheck,
  Timer,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedLogo } from "@/components/ui/enhanced/AnimatedLogo";
import { Image } from "@/components/ui/enhanced/image";
import logoIcon from "@/assets/logo-icon.png";

type AuthView = 'login' | 'forgot' | 'check-email' | 'reset-password' | 'reset-success' | 'expired' | 'logged-out';

// ─── Remember Me TTL ───────────────────────────────────────────────────────────
// Mirrors the constant in AuthProvider.tsx. Kept local to avoid a circular
// import — this module only writes, AuthProvider only reads.
const SESSION_EXPIRES_KEY = 'admin_session_expires';
const REMEMBER_ME_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Compute initial view from URL params to prevent login→logout flash bounce
function getInitialView(): AuthView {
  const params = new URLSearchParams(window.location.search);
  if (params.get('signed-out') === 'true') return 'logged-out';
  const hash = new URLSearchParams(window.location.hash.substring(1));
  if (hash.get('type') === 'recovery') return 'reset-password';
  if (hash.get('error') === 'access_denied') return 'expired';
  return 'login';
}

const AdminAuth: React.FC = () => {
  const [view, setView] = useState<AuthView>(getInitialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sentToEmail, setSentToEmail] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading, role } = useAuth();

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isSignedOut = searchParams.get('signed-out') === 'true';
    const roleError = searchParams.get('error') === 'role_unavailable' || searchParams.get('error') === 'unauthorized_role';

    // Check for logout confirmation first to prevent redirect race conditions
    if (isSignedOut && !user) {
      setView('logged-out');
      return;
    }

    // Show error if role could not be resolved — but do NOT redirect back to /admin
    // This breaks the redirect loop: auth → admin → auth → admin...
    if (roleError) {
      toast({
        title: "Access Denied",
        description: "Your admin role could not be verified. Please login again or contact the administrator.",
        variant: "destructive",
      });
      // Clear the error param from URL
      const newParams = new URLSearchParams(location.search);
      newParams.delete('error');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
      // Do NOT continue to the redirect logic below — stop here
      return;
    }

    const hashParams = new URLSearchParams(location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setView('reset-password');
      return;
    }

    if (hashParams.get('error') === 'access_denied') {
      setView('expired');
      return;
    }

    // KEY FIX: Only redirect to /admin when BOTH user AND role are resolved.
    // Previously, this fired as soon as `user` existed, racing ahead of role
    // resolution and causing the "retrying... access denied" loop.
    if (user && role && !isSignedOut && view === 'login') {
      setRedirecting(true);
      navigate('/admin', { replace: true });
    }
  }, [user, role, navigate, location, view, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // ─── Remember Me TTL ──────────────────────────────────────────────────────────
      // If "Keep me logged in" is UNCHECKED, write a 24-hour expiry timestamp.
      // AuthProvider reads this on every page load and signs the user out
      // automatically once the TTL has passed.
      // If CHECKED, clear any previous expiry so the session has no TTL.
      if (!rememberMe) {
        localStorage.setItem(SESSION_EXPIRES_KEY, String(Date.now() + REMEMBER_ME_TTL_MS));
      } else {
        localStorage.removeItem(SESSION_EXPIRES_KEY);
      }
      // NOTE: Do NOT navigate here. The useEffect below watches `user` from AuthProvider
      // and redirects once the SIGNED_IN event has processed and role has been resolved.
      // Navigating immediately would race with onAuthStateChange, arriving at AdminLayout
      // before role is fetched and causing the "Verifying access…" hang.
    } catch (err: unknown) {
      const error = err as { message?: string };
      let brandMessage = "An error occurred during authentication.";
      const msg = error?.message?.toLowerCase() || '';
      
      if (msg.includes('invalid login') || msg.includes('credentials')) {
        brandMessage = "The credentials provided do not match our secure records.";
      } else if (msg.includes('rate limit')) {
        brandMessage = "Too many secure requests. Please pause for a moment.";
      } else if (msg.includes('email not confirmed')) {
        brandMessage = "Please verify your email address to access the console.";
      } else {
        brandMessage = error.message || brandMessage;
      }

      toast({
        title: "Access Denied",
        description: brandMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendResetEmail = async (targetEmail: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/admin/auth#type=recovery`,
    });
    if (error) throw error;
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Make the forgot process faster, more reliable, and secure (prevent enumeration)
    // We intentionally don't await the result before updating UI for perceived performance
    sendResetEmail(email).catch(err => {
      console.error('Password reset soft fail (ignored for UX/security):', err);
    });
    
    // Simulate slight delay for brand feel, then immediately show success
    setTimeout(() => {
      setLoading(false);
      setSentToEmail(email);
      setResendCooldown(60);
      setView('check-email');
    }, 600);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !sentToEmail) return;
    setLoading(true);
    
    sendResetEmail(sentToEmail).catch(err => {
      console.error('Resend soft fail:', err);
    });
    
    setTimeout(() => {
      setLoading(false);
      setResendCooldown(60);
      toast({ 
        title: "Secure Link Sent", 
        description: "If the email is registered, a new recovery link is on its way.",
        variant: "default",
      });
    }, 600);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Verification Failed", description: "The passwords provided do not match.", variant: "destructive" });
      return;
    }
    
    if (password.length < 8) {
      toast({ title: "Security Requirement", description: "Password must be at least 8 characters long.", variant: "destructive" });
      return;
    }

    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      toast({ title: "Weak Password", description: "Must include at least one uppercase letter, one number, and one special character.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setView('reset-success');
    } catch (err: unknown) {
      const error = err as { message?: string };
      let brandMessage = "Could not update password.";
      const msg = error?.message?.toLowerCase() || '';
      
      if (msg.includes('expired') || msg.includes('invalid')) {
        brandMessage = "Your security link has expired. Please request a new one.";
        setView('expired');
      } else {
        brandMessage = error.message || brandMessage;
      }
      
      toast({ title: "Update Failed", description: brandMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-[hsl(220_25%_5%)] flex items-center justify-center admin-theme">
        <Loader2 className="w-8 h-8 text-[hsl(38_92%_50%)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(220_25%_5%)] relative flex items-center justify-center overflow-hidden p-6 admin-theme">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/projects/discovery/lifestyle-5.jpg"
          alt="Interior Luxury"
          className="w-full h-full opacity-10 blur-xl scale-110"
          imageClassName="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_25%_5%)/60%] via-[hsl(220_25%_5%)/85%] to-[hsl(220_25%_5%)]" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        <div className="absolute top-[20%] -left-[10%] w-[120%] h-px bg-gradient-to-r from-transparent via-[hsl(38_92%_50%)/40%] to-transparent rotate-12" />
        <div className="absolute top-[60%] -left-[10%] w-[120%] h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent -rotate-6" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[440px] z-10">
        <div className="flex flex-col items-center mb-10">
          <a
            href="/"
            className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0 hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[hsl(38_92%_50%)] focus-visible:outline-none focus-visible:ring-offset-2 transition-all duration-300 rounded-lg"
            aria-label="Return to CrossAngle Home"
          >
            <img 
              src={logoIcon} 
              alt="Cross Angle Interior" 
              className="h-11 md:h-16 w-auto transition-all duration-500 shrink-0" 
            />
            <AnimatedLogo
              isScrolled={false}
              className="flex gap-1 sm:gap-1.5 font-bold tracking-tight whitespace-nowrap min-w-0 [&_span]:text-[#D1AF6E]"
            />
          </a>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-3.5 font-sans">Admin Console</p>
        </div>

        <div className="bg-[hsl(220_18%_8%)/90%] backdrop-blur-2xl border border-[hsl(220_15%_18%)/60%] rounded-3xl p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[hsl(38_92%_50%)] to-transparent" />
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <h1 className="text-3xl font-serif text-white mb-1">Admin Login</h1>
                <p className="text-xs text-zinc-500 mb-8 font-sans uppercase tracking-[0.2em]">Authorized admins only</p>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-login" className="text-[10px] uppercase tracking-widest text-zinc-400 ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input id="email-login" name="email" type="email" autoComplete="username" placeholder="admin@crossangle.com" className="h-12 pl-12 bg-black/60 border-[hsl(220_15%_18%)] rounded-2xl focus:border-[hsl(38_92%_50%)/50%] transition-all font-sans text-white text-base md:text-base font-medium placeholder:font-normal placeholder:text-zinc-400" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <Label htmlFor="password-login" className="text-[10px] uppercase tracking-widest text-zinc-400">Password</Label>
                      <button type="button" onClick={() => setView('forgot')} className="text-[10px] uppercase tracking-widest text-[hsl(38_92%_50%)/60%] hover:text-[hsl(38_92%_50%)] transition-colors">Forgot Password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input id="password-login" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" className="h-12 pl-12 pr-12 bg-black/60 border-[hsl(220_15%_18%)] rounded-2xl focus:border-[hsl(38_92%_50%)/50%] transition-all font-sans text-white text-base md:text-base font-medium placeholder:font-normal placeholder:text-zinc-400" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} className="border-[hsl(220_15%_18%)] data-[state=checked]:bg-[hsl(38_92%_50%)] data-[state=checked]:border-[hsl(38_92%_50%)]" />
                    <label htmlFor="remember" className="text-[11px] text-zinc-500 cursor-pointer select-none">Keep me logged in</label>
                  </div>
                  <Button type="submit" disabled={loading || redirecting} className="w-full h-12 mt-4 bg-gradient-to-r from-[hsl(38_92%_50%)] to-[hsl(38_92%_45%)] hover:from-[hsl(38_92%_55%)] hover:to-[hsl(38_92%_50%)] text-black font-bold rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-[hsl(38_92%_50%)/20%]">
                    {(loading || redirecting) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
                    {!(loading || redirecting) && <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                  </Button>
                </form>
              </motion.div>
            )}

            {view === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <h1 className="text-3xl font-serif text-white mb-1">Reset Password</h1>
                <p className="text-xs text-zinc-500 mb-8 font-sans uppercase tracking-[0.2em]">Enter your email for a reset link</p>
                <form onSubmit={handleForgot} className="space-y-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-forgot" className="text-[10px] uppercase tracking-widest text-zinc-400 ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input id="email-forgot" name="email" type="email" autoComplete="email" placeholder="admin@crossangle.com" className="h-12 pl-12 bg-black/60 border-[hsl(220_15%_18%)] rounded-2xl focus:border-[hsl(38_92%_50%)/50%] transition-all font-sans text-white text-base md:text-base font-medium placeholder:font-normal placeholder:text-zinc-400" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-zinc-100 hover:bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 group shadow-xl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Secure Link"}
                    {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                  </Button>
                  <button type="button" onClick={() => setView('login')} className="w-full text-center text-xs text-zinc-500 hover:text-white transition-colors">Return to Login</button>
                </form>
              </motion.div>
            )}

            {view === 'check-email' && (
              <motion.div key="check-email" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-2">
                {/* Animated envelope icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-[hsl(38_92%_50%)/10%] rounded-2xl animate-pulse" />
                  <div className="relative w-20 h-20 bg-[hsl(38_92%_50%)/10%] border border-[hsl(38_92%_50%)/20%] rounded-2xl flex items-center justify-center">
                    <MailCheck className="w-9 h-9 text-[hsl(38_92%_50%)]" />
                  </div>
                </div>

                <h1 className="text-2xl font-serif text-white mb-2">Check your inbox</h1>
                <p className="text-xs text-zinc-500 mb-1 font-sans uppercase tracking-widest">Reset link sent</p>

                {/* Email address pill */}
                <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 mt-3 mb-6">
                  <Mail className="w-3 h-3 text-[hsl(38_92%_50%)]" />
                  <span className="text-xs text-zinc-300 font-mono">{sentToEmail}</span>
                </div>

                {/* Steps */}
                <div className="text-left space-y-3 mb-8 bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                  {[
                    { n: '1', text: 'Open the email from Crossangle Interior' },
                    { n: '2', text: 'Click the "Reset My Password" button' },
                    { n: '3', text: 'Set your new secure password' },
                  ].map(step => (
                    <div key={step.n} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(38_92%_50%)/10%] border border-[hsl(38_92%_50%)/20%] text-[hsl(38_92%_50%)] text-[10px] font-bold flex items-center justify-center mt-0.5">{step.n}</span>
                      <span className="text-xs text-zinc-400 font-sans leading-relaxed">{step.text}</span>
                    </div>
                  ))}
                </div>

                {/* Resend with cooldown */}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className={cn(
                    "w-full h-11 rounded-2xl border text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 mb-3",
                    resendCooldown > 0
                      ? "border-zinc-800 text-zinc-600 cursor-not-allowed bg-transparent"
                      : "border-zinc-700 text-zinc-300 hover:border-[hsl(38_92%_50%)/40%] hover:text-[hsl(38_92%_50%)] bg-transparent"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : resendCooldown > 0 ? (
                    <><Timer className="w-4 h-4" /> Resend in {resendCooldown}s</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> Resend link</>
                  )}
                </button>

                <button type="button" onClick={() => setView('login')} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  &larr; Return to Login
                </button>
              </motion.div>
            )}

            {view === 'expired' && (
              <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h1 className="text-3xl font-serif text-white mb-2">Link Expired</h1>
                <p className="text-sm text-zinc-500 mb-8 font-sans">The security link has expired. Please request a new one.</p>
                <Button onClick={() => setView('forgot')} className="w-full h-12 bg-[hsl(38_92%_50%)] hover:bg-[hsl(38_92%_55%)] text-black font-bold rounded-2xl shadow-lg shadow-[hsl(38_92%_50%)/20%]">Request New Link</Button>
              </motion.div>
            )}

            {view === 'logged-out' && (
              <motion.div key="logged-out" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-serif text-white mb-2">Logged Out</h1>
                <p className="text-sm text-zinc-500 mb-3 font-sans">You've been logged out securely.</p>
                <p className="text-[11px] text-zinc-600 mb-8 font-sans">For your security, you must login again to access the admin panel.</p>
                <Button
                  onClick={() => { setView('login'); navigate('/admin/auth', { replace: true }); }}
                  className="w-full h-12 bg-gradient-to-r from-[hsl(38_92%_50%)] to-[hsl(38_92%_45%)] hover:from-[hsl(38_92%_55%)] hover:to-[hsl(38_92%_50%)] text-black font-bold rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-[hsl(38_92%_50%)/20%]"
                >
                  Login Again
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </motion.div>
            )}

            {view === 'reset-password' && (
              <motion.div key="reset" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-3xl font-serif text-white mb-2">Set New Password</h1>
                <p className="text-sm text-zinc-500 mb-8 font-sans">Enter your new secure password below.</p>
                <form onSubmit={handleReset} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="password-reset" className="text-[10px] uppercase tracking-widest text-zinc-400 ml-1">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input id="password-reset" name="new-password" type="password" autoComplete="new-password" className="h-12 pl-12 bg-black/60 border-[hsl(220_15%_18%)] rounded-2xl focus:border-[hsl(38_92%_50%)/50%] transition-all font-sans text-white text-base md:text-base font-medium placeholder:font-normal placeholder:text-zinc-400" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password-confirm" className="text-[10px] uppercase tracking-widest text-zinc-400 ml-1">Confirm Password</Label>
                    <Input id="password-confirm" name="confirm-password" type="password" autoComplete="new-password" className="h-12 px-4 bg-black/60 border-[hsl(220_15%_18%)] rounded-2xl focus:border-[hsl(38_92%_50%)/50%] transition-all font-sans text-white text-base md:text-base font-medium placeholder:font-normal placeholder:text-zinc-400" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-[hsl(38_92%_50%)] hover:bg-[hsl(38_92%_55%)] text-black font-bold rounded-2xl shadow-lg shadow-[hsl(38_92%_50%)/20%]">Update Security Credentials</Button>
                </form>
              </motion.div>
            )}

            {view === 'reset-success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="w-8 h-8 text-emerald-500" /></div>
                <h1 className="text-3xl font-serif text-white mb-2">Password Updated</h1>
                <p className="text-sm text-zinc-500 mb-8 font-sans">Your secure credentials have been successfully updated.</p>
                <Button onClick={() => setView('login')} className="w-full h-12 bg-zinc-100 text-black font-bold rounded-2xl">Return to Login</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 opacity-30 group">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /><span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium group-hover:text-emerald-500 transition-colors">Secure Connection</span></div>
          <div className="w-px h-3 bg-zinc-800" /><span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium group-hover:text-[hsl(38_92%_50%)] transition-colors">Analytics OS v3.0.0</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuth;

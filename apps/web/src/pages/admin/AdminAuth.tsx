import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Check,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Loader2,
  ShieldCheck,
  RotateCcw,
  MailCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";

type AuthView = 'login' | 'forgot' | 'check-email' | 'reset-password' | 'reset-success' | 'expired' | 'signed-out';

const AdminAuth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isSignedOut = searchParams.get('signed-out') === 'true';

    // Check for sign-out confirmation first to prevent redirect race conditions
    if (isSignedOut && !user) {
      setView('signed-out');
      return;
    }

    // If user is already logged in and NOT in a special view, redirect to admin
    if (user && !isSignedOut && view !== 'reset-password' && view !== 'reset-success') {
      navigate('/admin', { replace: true });
    }

    const hashParams = new URLSearchParams(location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setView('reset-password');
    }

    if (hashParams.get('error') === 'access_denied') {
      setView('expired');
    }
  }, [user, navigate, location, view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({
        title: "Access Denied",
        description: error.message || "Invalid credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/auth#type=recovery`,
      });
      if (error) throw error;
      setView('check-email');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setView('reset-success');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center admin-theme">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center overflow-hidden p-6 admin-theme">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2574&auto=format&fit=crop"
          alt="Interior Luxury"
          className="w-full h-full object-cover opacity-20 blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] -left-[10%] w-[120%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent rotate-12" />
        <div className="absolute top-[60%] -left-[10%] w-[120%] h-px bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent -rotate-6" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[440px] z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="relative w-16 h-16 flex items-center justify-center mb-6">
            <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(124,58,237,0.5)] overflow-hidden p-1.5">
              <img src={logoIcon} alt="CrossAngle Intelligence" className="w-full h-full object-contain brightness-0 invert" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 rounded-3xl p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <h1 className="text-3xl font-serif text-white mb-1">Admin Sign In</h1>
                <p className="text-xs text-zinc-500 mb-8 font-sans uppercase tracking-[0.2em]">Authorized admins only</p>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-login" className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input id="email-login" name="email" type="email" autoComplete="username" placeholder="admin@crossangle.com" className="h-12 pl-12 bg-black/40 border-zinc-800 rounded-2xl focus:border-yellow-500/50 transition-all font-sans text-zinc-200" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <Label htmlFor="password-login" className="text-[10px] uppercase tracking-widest text-zinc-500">Password</Label>
                      <button type="button" onClick={() => setView('forgot')} className="text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Forgot Password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input id="password-login" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" className="h-12 pl-12 pr-12 bg-black/40 border-zinc-800 rounded-2xl focus:border-primary/50 transition-all font-sans text-zinc-200" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} className="border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <label htmlFor="remember" className="text-[11px] text-zinc-500 cursor-pointer select-none">Keep me signed in</label>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-bold rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-primary/20">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                    {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
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
                    <Label htmlFor="email-forgot" className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input id="email-forgot" name="email" type="email" autoComplete="email" placeholder="admin@crossangle.com" className="h-12 pl-12 bg-black/40 border-zinc-800 rounded-2xl focus:border-yellow-500/50 transition-all font-sans text-zinc-200" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-zinc-100 hover:bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 group shadow-xl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
                    {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                  </Button>
                  <button type="button" onClick={() => setView('login')} className="w-full text-center text-xs text-zinc-500 hover:text-white transition-colors">Return to Sign In</button>
                </form>
              </motion.div>
            )}

            {view === 'check-email' && (
              <motion.div key="check-email" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MailCheck className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-serif text-white mb-2">Check Mail</h1>
                <p className="text-sm text-zinc-500 mb-8 font-sans">If an account exists, a reset link has been sent.</p>
                <Button onClick={() => setView('login')} className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-2xl">Return to Sign In</Button>
              </motion.div>
            )}

            {view === 'expired' && (
              <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h1 className="text-3xl font-serif text-white mb-2">Link Expired</h1>
                <p className="text-sm text-zinc-500 mb-8 font-sans">The reset link has expired. Please request a new one.</p>
                <Button onClick={() => setView('forgot')} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20">Request New Link</Button>
              </motion.div>
            )}

            {view === 'signed-out' && (
              <motion.div key="signed-out" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-serif text-white mb-2">Signed Out</h1>
                <p className="text-sm text-zinc-500 mb-3 font-sans">You've been signed out securely.</p>
                <p className="text-[11px] text-zinc-600 mb-8 font-sans">For your security, you must sign in again to access the admin panel.</p>
                <Button
                  onClick={() => { setView('login'); navigate('/admin/auth', { replace: true }); }}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-bold rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-primary/20"
                >
                  Sign In Again
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </motion.div>
            )}

            {view === 'reset-password' && (
              <motion.div key="reset" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-3xl font-serif text-white mb-2">Set New Password</h1>
                <p className="text-sm text-zinc-500 mb-8 font-sans">Enter your new password below.</p>
                <form onSubmit={handleReset} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="password-reset" className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input id="password-reset" name="new-password" type="password" autoComplete="new-password" className="h-12 pl-12 bg-black/40 border-zinc-800 rounded-2xl focus:border-primary/50 transition-all font-sans text-zinc-200" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password-confirm" className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Confirm Password</Label>
                    <Input id="password-confirm" name="confirm-password" type="password" autoComplete="new-password" className="h-12 px-4 bg-black/40 border-zinc-800 rounded-2xl focus:border-primary/50 transition-all font-sans text-zinc-200" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20">Update Password</Button>
                </form>
              </motion.div>
            )}

            {view === 'reset-success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="w-8 h-8 text-emerald-500" /></div>
                <h1 className="text-3xl font-serif text-white mb-2">Password Updated</h1>
                <p className="text-sm text-zinc-500 mb-8 font-sans">Your password has been successfully updated.</p>
                <Button onClick={() => setView('login')} className="w-full h-12 bg-zinc-100 text-black font-bold rounded-2xl">Sign In</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-12 flex items-center justify-center gap-6 opacity-30 group">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /><span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium group-hover:text-emerald-500 transition-colors">Secure Connection</span></div>
          <div className="w-px h-3 bg-zinc-800" /><span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium group-hover:text-white transition-colors">Analytics OS v3.0.0</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuth;

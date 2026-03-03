import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Mail, Loader2, ChevronRight } from "lucide-react";

const AdminAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/admin');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({
        title: "Welcome back",
        description: "Successfully signed in to admin panel.",
      });
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Infiltrating System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/20 mb-6 group">
            <Shield className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 font-syne">Command Center</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Secure Administrative Access</p>
        </div>

        <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl relative group overflow-hidden">
          {/* subtle glow border */}
          <div className="absolute inset-0 border border-red-500/10 rounded-3xl pointer-events-none group-hover:border-red-500/20 transition-colors duration-500" />

          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground ml-1">Terminal ID (Email)</label>
              <div className="relative group/input">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-red-500 transition-colors" />
                <Input
                  type="email"
                  placeholder="admin@crossangle.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-white/5 pl-10 h-12 focus:border-red-500/50 focus:ring-red-500/20 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Key (Password)</label>
              <div className="relative group/input">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-red-500 transition-colors" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/40 border-white/5 pl-10 h-12 focus:border-red-500/50 focus:ring-red-500/20 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-300 rounded-xl group/btn overflow-hidden"
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AUTHORIZING...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>INITIALIZE ACCESS</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] font-mono text-muted-foreground/40 uppercase tracking-[0.3em]">
          Restricted Zone • Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
};

export default AdminAuth;

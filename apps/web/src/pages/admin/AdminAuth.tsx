import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Check } from "lucide-react";

type AuthView = 'login' | 'forgot-password' | 'check-email' | 'create-new-password';

const AdminAuth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if coming from a password reset email
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      setView('create-new-password');
    }

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && type !== 'recovery') {
          navigate('/admin');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkUser();
  }, [navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
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
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/auth#type=recovery`,
      });
      if (error) throw error;

      setView('check-email');
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords mismatch",
        description: "The provided passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password.",
      });
      setView('login');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c2957]"></div>
      </div>
    );
  }

  const renderForm = () => {
    switch (view) {
      case 'login':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-[32px] md:text-[40px] font-bold mb-4 tracking-tight leading-tight">
                Welcome to <span className="text-[#7c2957]">Dash</span>Board
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                commonly used in graphic design, publishing, and web development to fill empty spaces in a layout that do not yet have content.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="EsraaSaeed@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white border border-gray-300 rounded-xl focus:ring-[#7c2957] focus:border-[#7c2957] text-base shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="login-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white border border-gray-300 rounded-xl focus:ring-[#7c2957] focus:border-[#7c2957] text-base font-medium shadow-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-semibold text-gray-600 cursor-pointer">Remember me</Label>
                </div>

                <Button
                  type="button"
                  variant="link"
                  onClick={() => setView('forgot-password')}
                  className="text-sm font-semibold text-gray-600 hover:text-[#7c2957] p-0 h-auto"
                >
                  Forget password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#7c2957] hover:bg-[#602043] text-white rounded-xl font-medium tracking-wide transition-colors mt-2"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "LogIn"}
              </Button>
            </form>
          </div>
        );

      case 'forgot-password':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-[32px] md:text-[40px] font-bold mb-4 tracking-tight leading-tight">Reset Password</h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                commonly used, publishing, and web development to fill empty spaces in a layout that do not yet have content.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-semibold text-gray-700">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="EsraaSaeed@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white border border-gray-300 rounded-xl focus:ring-[#7c2957] focus:border-[#7c2957] text-base shadow-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#7c2957] hover:bg-[#602043] text-white rounded-xl font-medium tracking-wide transition-colors mt-2"
                disabled={loading}
              >
                {loading ? "Sending..." : "LogIn"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setView('login')}
                className="w-full text-center text-sm font-semibold text-gray-600 hover:text-[#7c2957]"
              >
                Back to Login
              </Button>
            </form>
          </div>
        );

      case 'check-email':
        return (
          <div className="w-full max-w-[420px] mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-[-8vh]">
            <div className="w-[100px] h-[100px] bg-[#E8DAE4] rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Mail className="w-12 h-12 text-[#7c2957]" strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Check your Email</h1>
            <p className="text-gray-500 text-sm leading-relaxed mx-auto max-w-[320px]">
              commonly used, publishing, and web development to fill empty spaces in a layout that do not yet have content.
            </p>

            <Button
              onClick={() => setView('login')}
              className="w-full h-12 bg-[#7c2957] hover:bg-[#602043] text-white rounded-xl font-medium tracking-wide transition-colors mt-8"
            >
              LogIn
            </Button>

            <div className="pt-8 text-sm max-w-[320px] mx-auto">
              <span className="text-gray-500">commonly used, publishing, and web development to fill empty spaces in a layout ....</span>
              <Button variant="link" onClick={handleResetPassword} className="text-[#7c2957] font-semibold p-0 h-auto ml-1">Send it Again?</Button>
            </div>
          </div>
        );

      case 'create-new-password':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-[32px] md:text-[40px] font-bold mb-4 tracking-tight leading-tight">Create New Password</h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                commonly used, publishing, and web development to fill empty spaces in a layout that do not yet have content.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-semibold text-gray-700">New Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white border border-gray-300 rounded-xl focus:ring-[#7c2957] focus:border-[#7c2957] text-base font-medium shadow-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 font-semibold pt-1">Password must be more than 8 letters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white border border-gray-300 rounded-xl focus:ring-[#7c2957] focus:border-[#7c2957] text-base font-medium shadow-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#7c2957] hover:bg-[#602043] text-white rounded-xl font-medium tracking-wide transition-colors mt-2"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col pt-4">
      {/* Header */}
      <header className="flex justify-between items-center px-8 md:px-16 py-6 font-sans">
        <div className="text-3xl font-bold tracking-tighter">
          <span className="text-[#7c2957]">Dash</span> <span className="text-black">Board</span>
        </div>
        <div className="hidden sm:block text-sm font-semibold text-gray-600">
          Don't have Account? <Button variant="link" className="text-[#7c2957] hover:text-[#602043] font-bold p-0 h-auto ml-1">Apply Now</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex w-full max-w-[1400px] mx-auto items-center ${view === 'check-email' ? 'justify-center items-center' : 'justify-between px-8 md:px-16 lg:px-24'} gap-12 lg:gap-24 mb-16`}>

        {/* Left constraints (Form Section) */}
        {view !== 'check-email' && (
          <div className="w-full max-w-[420px] flex-shrink-0 z-10 pt-8 pb-16">
            {renderForm()}
          </div>
        )}

        {/* Center explicitly for Check Email view */}
        {view === 'check-email' && (
          <div className="w-full z-10 flex items-center justify-center h-[70vh]">
            {renderForm()}
          </div>
        )}

        {/* Right Section (Image) */}
        {view !== 'check-email' && (
          <div className="hidden lg:flex flex-1 items-center justify-center relative scale-90 xl:scale-100 origin-right">
            <div className="relative w-[500px] h-[500px] flex items-center justify-center">
              {/* Outer rotated diamond border */}
              <div
                className="absolute inset-0 border-[3px] border-[#7c2957] rounded-[80px]"
                style={{ transform: 'rotate(45deg) scale(1.05)' }}
              />

              {/* Inner shape / Image container (Squircle-like) */}
              <div
                className="w-[400px] h-[400px] overflow-hidden z-10 shadow-xl relative bg-gray-100"
                style={{ borderRadius: '120px' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2790&auto=format&fit=crop"
                  alt="Library"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAuth;

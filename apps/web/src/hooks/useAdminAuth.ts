import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export const useAdminAuth = () => {
  const { user, loading, signOut, role, isAdmin, isEditor, isViewer, loggingOut } =
    useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const isLoading = loading;
  const isSuperAdmin = role === 'super_admin';

  const logout = async () => {
    // signOut sets loggingOut=true internally FIRST, which triggers
    // AuthGuard to show a "Logging out..." overlay on the current page.
    await signOut();
    // Small delay so the overlay is visible (feels intentional, not jarring)
    await new Promise(r => setTimeout(r, 400));
    // Use React Router navigation (no full page reload, no white flash)
    navigate('/admin/auth?signed-out=true', { replace: true });
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    loggingOut,
    user,
    role,
    isAdmin,
    isEditor,
    isViewer,
    isSuperAdmin,
  };
};

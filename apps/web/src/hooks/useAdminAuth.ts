import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export const useAdminAuth = () => {
  const { user, loading, roleLoading, roleError, signOut, role, isAdmin, isEditor, isViewer, loggingOut } =
    useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const isLoading = loading || roleLoading;
  const isSuperAdmin = role === 'super_admin';

  const logout = async () => {
    // signOut sets loggingOut=true internally FIRST, which triggers
    // AuthGuard to show a "Logging out..." overlay on the current page.
    await signOut();
    // Use window.location for a full reload to ensure absolutely clean state 
    // and no React Router race conditions causing flash bounces.
    window.location.href = '/admin/auth?logged-out=true';
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    loggingOut,
    roleLoading,
    roleError,
    user,
    role,
    isAdmin,
    isEditor,
    isViewer,
    isSuperAdmin,
  };
};

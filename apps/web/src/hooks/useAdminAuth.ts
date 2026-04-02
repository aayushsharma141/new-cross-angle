import { useAuth } from "@/components/auth/AuthProvider";

export const useAdminAuth = () => {
  const { user, loading, signOut, role, isAdmin, isEditor, isViewer } =
    useAuth();

  const isAuthenticated = !!user;
  const isLoading = loading;
  const isSuperAdmin = role === 'super_admin';

  const logout = async () => {
    await signOut();
    window.location.replace("/admin/auth?signed-out=true");
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    user,
    role,
    isAdmin,
    isEditor,
    isViewer,
    isSuperAdmin,
  };
};

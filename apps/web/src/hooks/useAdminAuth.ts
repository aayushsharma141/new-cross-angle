import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export const useAdminAuth = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const isLoading = loading;

  const logout = async () => {
    await signOut();
    navigate("/admin/auth");
  };

  return { isAuthenticated, isLoading, logout, user };
};

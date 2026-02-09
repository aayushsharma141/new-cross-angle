import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/admin/TopBar";
import { Sidebar } from "@/components/admin/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// Create a client
const queryClient = new QueryClient();

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/auth" replace />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[hsl(var(--admin-bg))] font-sans admin-theme">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

          {/* Main Content Wrapper */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />

            {/* Mobile Menu Toggle (Visible only on small screens, floated over content if needed, or part of topbar) */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
              <Button
                size="icon"
                className="rounded-full shadow-lg bg-[hsl(var(--brand-primary))]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="text-white" />
              </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AdminLayout;
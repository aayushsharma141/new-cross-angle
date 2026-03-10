import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Sidebar } from "@/components/admin/layout/Sidebar";
import { TopBar } from "@/components/admin/layout/TopBar";

const AdminLayout = (): JSX.Element | null => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-card text-text-primary">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/auth" replace />;

  return (
    <div className="min-h-screen flex w-full bg-surface text-text-primary admin-theme">
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Global Header */}
        <TopBar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
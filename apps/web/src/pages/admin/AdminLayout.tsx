import { Outlet, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { TopBar } from "@/components/admin/TopBar";

const AdminLayout = (): JSX.Element | null => {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) return <Navigate to="/admin/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-admin-bg admin-theme">
      {/* Premium Top Navigation */}
      <TopBar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Page content with Luxury Padding & Max-Width */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-10">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Module Navigation Context (Optional floating hub activator could go here) */}
    </div>
  );
};

export default AdminLayout;
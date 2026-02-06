import { useState, useEffect } from "react";
import { Outlet, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Edit3,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin", "editor"] },
  { name: "Site Content", href: "/admin/content", icon: Edit3, roles: ["admin", "editor"] },
  { name: "Blog Posts", href: "/admin/blogs", icon: FileText, roles: ["admin", "editor"] },
  { name: "Services", href: "/admin/services", icon: Home, roles: ["admin", "editor"] },
  { name: "Portfolio", href: "/admin/portfolio", icon: Image, roles: ["admin", "editor"] },
  { name: "Media", href: "/admin/media", icon: Image, roles: ["admin", "editor"] },
  { name: "Leads", href: "/admin/leads", icon: Users, roles: ["admin"] },
  { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin", "editor"] },
];

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (data) {
      setUserRole(data.role);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !userRole) {
    return <Navigate to="/admin/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-display text-xl font-bold text-gradient-gold">
                Cross Angle
              </span>
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems
              .filter((item) => item.roles.includes(userRole as string))
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </Link>
                );
              })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-border">
            <div className="mb-4 px-4">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-display text-lg font-bold text-gradient-gold">
            Cross Angle
          </span>
          <div className="w-6" />
        </header>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
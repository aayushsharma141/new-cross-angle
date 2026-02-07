import { useState, useEffect } from "react";
import { Outlet, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Home,
  ImagePlus,
  Bell,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin", "editor"] },
  { name: "Site Content", href: "/admin/content", icon: Edit3, roles: ["admin", "editor"] },
  { name: "Blog Posts", href: "/admin/blogs", icon: FileText, roles: ["admin", "editor"] },
  { name: "Services", href: "/admin/services", icon: Home, roles: ["admin", "editor"] },
  { name: "Portfolio", href: "/admin/portfolio", icon: Image, roles: ["admin", "editor"] },
  { name: "Media Library", href: "/admin/media", icon: ImagePlus, roles: ["admin", "editor"] },
  { name: "Leads", href: "/admin/leads", icon: Users, roles: ["admin"] },
  { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin", "editor"] },
];

interface Lead {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
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

  // Fetch new leads count
  useEffect(() => {
    if (userRole === 'admin') {
      fetchNewLeads();

      // Subscribe to new leads
      const channel = supabase
        .channel('new-leads')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'leads' },
          () => {
            fetchNewLeads();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userRole]);

  const fetchNewLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, email, created_at')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data && !error) {
      setNewLeadsCount(data.length);
      setRecentLeads(data);
    }
  };

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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
                const isLeads = item.name === "Leads";
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
                    {isLeads && newLeadsCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1.5">
                        {newLeadsCount}
                      </Badge>
                    )}
                    {isActive && !isLeads && <ChevronRight size={16} className="ml-auto" />}
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
        {/* Top header bar (visible on large screens) */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-foreground lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="font-display text-lg font-bold text-gradient-gold lg:hidden">
              Cross Angle
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Site Link */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </a>

            {/* Notification Bell (Admin only) */}
            {userRole === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <AnimatePresence>
                      {newLeadsCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center font-medium"
                        >
                          {newLeadsCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 border-b">
                    <h4 className="font-semibold">New Leads</h4>
                    <p className="text-xs text-muted-foreground">
                      {newLeadsCount > 0
                        ? `You have ${newLeadsCount} new lead${newLeadsCount > 1 ? 's' : ''}`
                        : 'No new leads'
                      }
                    </p>
                  </div>
                  {recentLeads.length > 0 ? (
                    <>
                      {recentLeads.map((lead) => (
                        <DropdownMenuItem
                          key={lead.id}
                          onClick={() => navigate('/admin/leads')}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{lead.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {lead.email} • {formatTimeAgo(lead.created_at)}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          className="w-full text-sm"
                          onClick={() => navigate('/admin/leads')}
                        >
                          View all leads
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No pending leads
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <div className="p-6 lg:p-8 min-h-[calc(100vh-65px)] overflow-y-auto scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
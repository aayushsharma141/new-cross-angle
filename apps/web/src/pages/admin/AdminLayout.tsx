import { useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LogOut,
  Home,
  Settings,
  Image,
  Users,
  MessageSquare,
  Briefcase,
  Mail,
  ChevronDown,
  Menu,
  PenSquare,
  ImagePlus,
  Calculator,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CommandMenu } from "@/components/admin/layout/CommandMenu";
import { cn } from "@/lib/utils";

// Per-page title + subtitle map
const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Intelligence Hub", subtitle: "Real-time business performance overview" },
  "/admin/portfolio": { title: "Portfolio", subtitle: "Manage your project showcase" },
  "/admin/services": { title: "Services", subtitle: "Configure your service offerings" },
  "/admin/team": { title: "Team Members", subtitle: "Manage your studio team" },
  "/admin/testimonials": { title: "Testimonials", subtitle: "Client reviews & ratings" },
  "/admin/blogs": { title: "Blog", subtitle: "Publish thought leadership content" },
  "/admin/media": { title: "Media Library", subtitle: "Centralized asset management" },
  "/admin/page-sections": { title: "Page Sections", subtitle: "Edit site content blocks" },
  "/admin/leads": { title: "Leads CRM", subtitle: "Qualify and manage your sales pipeline" },
  "/admin/users": { title: "Users", subtitle: "Admin user management" },
  "/admin/estimate-leads": { title: "Estimate Leads", subtitle: "High-intent project enquiries" },
  "/admin/estimate-rates": { title: "Rate Config", subtitle: "Estimator pricing configuration" },
  "/admin/settings": { title: "Settings", subtitle: "Site-wide configuration" },
};

const AdminLayout = () => {
  const { isAuthenticated, isLoading, logout, user } = useAdminAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(["content"]);

  // Live new-leads count badge
  const { data: newLeadsCount = 0 } = useQuery({
    queryKey: ["new-leads-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");
      return count || 0;
    },
    refetchInterval: 60_000, // refresh every minute
    enabled: isAuthenticated && !!supabase,
  });

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/auth" replace />;

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Derive user display info from Supabase user object
  const userEmail = user?.email ?? "Admin";
  const userInitial = (user?.user_metadata?.full_name as string | undefined)
    ? (user?.user_metadata?.full_name as string).charAt(0).toUpperCase()
    : userEmail.charAt(0).toUpperCase();
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    userEmail.split("@")[0];

  // Current page meta
  const currentPath = location.pathname;
  const matchedKey =
    Object.keys(PAGE_META)
      .filter((k) => k === "/admin" ? currentPath === "/admin" : currentPath.startsWith(k))
      .sort((a, b) => b.length - a.length)[0] ?? "/admin";
  const pageMeta = PAGE_META[matchedKey] ?? { title: "Design Intelligence", subtitle: "Manage your digital presence" };

  const menuSections = [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      label: "Content",
      id: "content",
      collapsible: true,
      items: [
        { title: "Page Sections", url: "/admin/page-sections", icon: LayoutDashboard },
        { title: "Services", url: "/admin/services", icon: Briefcase },
        { title: "Team", url: "/admin/team", icon: Users },
        { title: "Portfolio", url: "/admin/portfolio", icon: Image },
        { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquare },
        { title: "Blog", url: "/admin/blogs", icon: PenSquare },
        { title: "Media Library", url: "/admin/media", icon: ImagePlus },
      ],
    },
    {
      label: "CRM",
      id: "crm",
      collapsible: true,
      items: [
        { title: "Leads", url: "/admin/leads", icon: Mail, badge: newLeadsCount > 0 ? newLeadsCount : undefined },
        { title: "Users", url: "/admin/users", icon: Users },
      ],
    },
    {
      label: "Estimator",
      id: "estimator",
      collapsible: true,
      items: [
        { title: "Estimate Leads", url: "/admin/estimate-leads", icon: Calculator },
        { title: "Rate Config", url: "/admin/estimate-rates", icon: DollarSign },
      ],
    },
    {
      label: "System",
      id: "site",
      collapsible: true,
      items: [
        { title: "Settings", url: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const isActive = (url: string) =>
    url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(url);

  const NavItem = ({ item }: { item: { title: string; url: string; icon: React.ElementType; badge?: number } }) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          "rounded-none px-3 py-2 transition-all duration-200 my-0.5 border-l-2",
          isActive(item.url)
            ? "bg-gradient-to-r from-admin-gold/10 to-transparent text-admin-gold border-admin-gold"
            : "hover:bg-admin-surface text-admin-foreground border-transparent hover:text-admin-gold"
        )}
      >
        <Link to={item.url} className="flex items-center justify-between px-3 py-2">
          <span className="flex items-center gap-3">
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{item.title}</span>
          </span>
          {item.badge !== undefined && (
            <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {item.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[hsl(var(--admin-bg))] admin-theme">
        <Sidebar className="border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]">
          <SidebarContent className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b border-admin-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-admin-gold to-admin-gold-dim flex items-center justify-center text-admin-bg font-bold text-lg font-display">
                  CA
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg tracking-wide text-admin-foreground leading-none">
                    Crossangle
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-admin-gold">Intelligence</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              {menuSections.map((section) => (
                <SidebarGroup key={section.label} className="px-3 mb-1">
                  {section.collapsible ? (
                    <Collapsible
                      open={section.id ? openSections.includes(section.id) : false}
                      onOpenChange={() => section.id && toggleSection(section.id)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <SidebarGroupLabel className="flex items-center justify-between hover:bg-admin-surface rounded-md px-2 py-1.5 cursor-pointer transition-colors">
                          <span className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">
                            {section.label}
                          </span>
                          {section.id && (
                            <ChevronDown
                              className={cn(
                                "w-3.5 h-3.5 text-admin-muted transition-transform",
                                openSections.includes(section.id) && "rotate-180"
                              )}
                            />
                          )}
                        </SidebarGroupLabel>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarGroupContent className="mt-1">
                          <SidebarMenu>
                            {section.items.map((item) => (
                              <NavItem key={item.title} item={item as { title: string; url: string; icon: React.ElementType; badge?: number }} />
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <>
                      <SidebarGroupLabel className="px-2 mb-1">
                        <span className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">
                          {section.label}
                        </span>
                      </SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {section.items.map((item) => (
                            <NavItem key={item.title} item={item as { title: string; url: string; icon: React.ElementType; badge?: number }} />
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </>
                  )}
                </SidebarGroup>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-admin-border p-4 space-y-1 flex-shrink-0">
              <Button
                variant="ghost"
                className="w-full justify-start text-admin-muted hover:text-admin-foreground hover:bg-admin-surface text-sm"
                asChild
              >
                <Link to="/" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Website
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-sm"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="bg-admin-card border-b border-admin-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden text-admin-foreground hover:bg-admin-surface hover:text-admin-gold transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-display font-semibold text-admin-foreground tracking-tight">
                    {pageMeta.title}
                  </h1>
                  {newLeadsCount > 0 && currentPath.startsWith("/admin/leads") && (
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full px-2 py-0.5">
                      {newLeadsCount} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-admin-muted">{pageMeta.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CommandMenu />
              <div className="h-6 w-px bg-admin-border" />
              {/* User pill */}
              <div className="hidden md:flex items-center gap-2.5 pl-2 pr-4 py-1.5 bg-admin-surface border border-admin-border rounded-full hover:border-admin-gold/30 transition-colors group cursor-default">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-admin-gold to-admin-gold-dim flex items-center justify-center text-admin-bg text-xs font-bold shadow-sm">
                  {userInitial}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-admin-foreground leading-none text-xs">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-admin-muted uppercase tracking-wider mt-0.5">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
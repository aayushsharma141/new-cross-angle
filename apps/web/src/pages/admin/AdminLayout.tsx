import { useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Home,
  Settings,
  Image,
  Users,
  MessageSquare,
  FileText,
  Briefcase,
  Mail,
  Palette,
  Award,
  ChevronDown,
  Menu,
  PenSquare,
  UserPlus,
  ImagePlus,
  Calculator,
  DollarSign,
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
import { ModeToggle } from "@/components/mode-toggle";

const AdminLayout = () => {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(["content"]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/auth" replace />;
  }

  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]));
  };

  const menuSections = [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Content Management",
      id: "content",
      collapsible: true,
      items: [
        {
          title: "Page Sections",
          url: "/admin/page-sections",
          icon: LayoutDashboard,
        },
        {
          title: "Services",
          url: "/admin/services",
          icon: Briefcase,
        },
        {
          title: "Team Members",
          url: "/admin/team",
          icon: Users,
        },
        {
          title: "Portfolio",
          url: "/admin/portfolio",
          icon: Image,
        },
        {
          title: "Testimonials",
          url: "/admin/testimonials",
          icon: MessageSquare,
        },
        {
          title: "Blogs",
          url: "/admin/blogs",
          icon: PenSquare,
        },
        {
          title: "Media Library",
          url: "/admin/media",
          icon: ImagePlus,
        },
      ],
    },
    {
      label: "CRM & Users",
      id: "crm",
      collapsible: true,
      items: [
        {
          title: "Leads",
          url: "/admin/leads",
          icon: Mail,
        },
        {
          title: "Users",
          url: "/admin/users",
          icon: Users,
        },
      ],
    },
    {
      label: "Estimator",
      id: "estimator",
      collapsible: true,
      items: [
        {
          title: "Estimate Leads",
          url: "/admin/estimate-leads",
          icon: Calculator,
        },
        {
          title: "Rate Config",
          url: "/admin/estimate-rates",
          icon: DollarSign,
        },
      ],
    },
    {
      label: "Site Management",
      id: "site",
      collapsible: true,
      items: [
        {
          title: "Settings",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  type MenuSection = typeof menuSections[number];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[hsl(var(--admin-bg))] admin-theme">
        <Sidebar className="border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]">
          <SidebarContent>
            <div className="p-6 border-b border-admin-border">
              <div className="flex items-center gap-3">
                {/* Logo Icon (Gold Geometric) */}
                <div className="w-8 h-8 rounded bg-gradient-to-br from-admin-gold to-admin-gold-dim flex items-center justify-center text-admin-bg font-bold text-lg font-display">
                  CA
                </div>
                <div>
                  <h2 className="font-display font-semibold text-xl tracking-wide text-admin-foreground">Crossangle</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-admin-gold">Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {menuSections.map((section) => (
                <SidebarGroup key={section.label} className="px-3 mb-2">
                  {section.collapsible ? (
                    <Collapsible
                      open={section.id ? openSections.includes(section.id) : false}
                      onOpenChange={() => section.id && toggleSection(section.id)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <SidebarGroupLabel className="flex items-center justify-between hover:bg-[hsl(var(--sidebar-accent))] rounded-md px-2 py-1.5 cursor-pointer transition-colors">
                          <span className="text-xs font-semibold text-[hsl(var(--admin-muted))] uppercase tracking-wider">
                            {section.label}
                          </span>
                          {section.id ? (
                            <ChevronDown
                              className={`w-4 h-4 text-[hsl(var(--admin-muted))] transition-transform ${openSections.includes(section.id) ? "rotate-180" : ""
                                }`}
                            />
                          ) : null}
                        </SidebarGroupLabel>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarGroupContent className="mt-1">
                          <SidebarMenu>
                            {section.items.map((item) => (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                  asChild
                                  className={`${(item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url))
                                    ? "bg-gradient-to-r from-admin-gold/10 to-transparent text-admin-gold border-l-2 border-admin-gold"
                                    : "hover:bg-admin-surface text-admin-foreground border-l-2 border-transparent hover:text-admin-gold transition-colors"
                                    } rounded-none px-3 py-2 transition-all duration-200 my-0.5 group`}
                                >
                                  <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                                    <item.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{item.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <>
                      <SidebarGroupLabel className="px-2 mb-2">
                        <span className="text-xs font-semibold text-[hsl(var(--admin-muted))] uppercase tracking-wider">
                          {section.label}
                        </span>
                      </SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {section.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                asChild
                                className={`${(item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url))
                                  ? "bg-gradient-to-r from-admin-gold/10 to-transparent text-admin-gold border-l-2 border-admin-gold"
                                  : "hover:bg-admin-surface text-admin-foreground border-l-2 border-transparent hover:text-admin-gold transition-colors"
                                  } rounded-none px-3 py-2 transition-all duration-200 my-0.5 group`}
                              >
                                <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                                  <item.icon className="w-5 h-5" />
                                  <span className="text-sm font-medium">{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </>
                  )}
                </SidebarGroup>
              ))}
            </div>
            <div className="border-t border-[hsl(var(--admin-border))] p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start hover:bg-[hsl(var(--sidebar-accent))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-foreground))]" asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  View Website
                </Link>
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start bg-red-500 hover:bg-red-600"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-admin-card border-b border-admin-border px-8 py-5 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden text-admin-foreground hover:bg-admin-surface hover:text-admin-gold transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-display font-medium text-admin-foreground tracking-tight">
                    {menuSections
                      .flatMap((s) => s.items)
                      .find((item) => item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url))?.title || "Design Intelligence"}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-admin-gold/10 text-admin-gold text-[10px] font-bold tracking-wider uppercase border border-admin-gold/20">
                    Studio
                  </span>
                </div>
                <p className="text-xs text-admin-muted font-sans tracking-wide">Manage your interior design digital presence</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CommandMenu />
              <div className="h-8 w-px bg-admin-border mx-2" />
              <div className="hidden md:flex items-center gap-3 pl-2 pr-4 py-1.5 bg-admin-surface border border-admin-border rounded-full hover:border-admin-gold/30 transition-colors group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-admin-gold to-admin-gold-dim flex items-center justify-center text-admin-bg text-sm font-bold shadow-lg shadow-admin-gold/20 group-hover:shadow-admin-gold/40 transition-shadow">
                  A
                </div>
                <div className="text-sm">
                  <p className="font-medium text-admin-foreground group-hover:text-admin-gold transition-colors">Admin User</p>
                  <p className="text-[10px] text-admin-muted uppercase tracking-wider">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-admin-muted group-hover:text-admin-gold transition-colors" />
              </div>
            </div>
          </header>
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
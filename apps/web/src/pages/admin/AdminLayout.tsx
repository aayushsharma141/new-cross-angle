
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
          title: "Site Content",
          url: "/admin/content",
          icon: FileText,
        },
        {
          title: "Services",
          url: "/admin/services",
          icon: Briefcase,
        },
        {
          title: "Portfolio",
          url: "/admin/portfolio",
          icon: FolderKanban,
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
            <div className="p-6 border-b border-[hsl(var(--admin-border))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                  CA
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[hsl(var(--admin-foreground))]">Crossangle Interior</h2>
                  <p className="text-xs text-[hsl(var(--admin-muted))]">Admin Panel</p>
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
                                  isActive={item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url)}
                                  className={`${(item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url))
                                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                                    : "hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--admin-foreground))]"
                                    } rounded-lg transition-all duration-200 my-0.5`}
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
                                isActive={item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url)}
                                className={`${(item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url))
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                                  : "hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--admin-foreground))]"
                                  } rounded-lg transition-all duration-200 my-0.5`}
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
          <header className="bg-[hsl(var(--admin-card))] border-b border-[hsl(var(--admin-border))] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden text-[hsl(var(--admin-foreground))]">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div>
                <h1 className="text-2xl font-bold text-[hsl(var(--admin-foreground))]">
                  {menuSections
                    .flatMap((s) => s.items)
                    .find((item) => item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url))?.title || "Dashboard"}
                </h1>
                <p className="text-sm text-[hsl(var(--admin-muted))]">Manage your interior design website content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CommandMenu />
              <ModeToggle />
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[hsl(var(--admin-border))] rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <div className="text-sm">
                  <p className="font-medium text-[hsl(var(--admin-foreground))]">Admin</p>
                  <p className="text-xs text-[hsl(var(--admin-muted))]">Administrator</p>
                </div>
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
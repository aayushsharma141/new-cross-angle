import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
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
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  MousePointerClick,
  MonitorPlay,
  Briefcase,
  Star,
  Calculator,
  ChevronDown,
  LogOut,
  Home,
  ShieldCheck,
  FolderSearch,
  Sparkles,
  Menu
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CommandMenu } from "@/components/admin/layout/CommandMenu";
import { useTheme } from "@/components/theme-provider";

// Define allowed roles for each item
const menuSectionsRaw = [
  {
    label: "Overview",
    items: [
      { title: "Hub", url: "/admin", icon: MonitorPlay, roles: ["admin", "editor", "viewer"] },
      { title: "Dashboard KPI", url: "/admin/dashboard", icon: LayoutDashboard, roles: ["admin", "editor", "viewer"] },
    ],
  },
  {
    label: "Content Management",
    id: "cms",
    collapsible: true,
    items: [
      { title: "Pages & Sections", url: "/admin/cms/pages", icon: FileText, roles: ["admin", "editor"] },
      { title: "Portfolio", url: "/admin/cms/portfolio", icon: Briefcase, roles: ["admin", "editor"] },
      { title: "Services", url: "/admin/cms/services", icon: FolderSearch, roles: ["admin", "editor"] },
      { title: "Testimonials", url: "/admin/cms/testimonials", icon: Star, roles: ["admin", "editor"] },
      { title: "Team", url: "/admin/cms/team", icon: Users, roles: ["admin", "editor"] },
      { title: "Blog Posts", url: "/admin/cms/blogs", icon: MessageSquare, roles: ["admin", "editor"] },
      { title: "Media Library", url: "/admin/cms/media", icon: ImageIcon, roles: ["admin", "editor", "viewer"] },
    ],
  },
  {
    label: "Platform CRM",
    id: "crm",
    collapsible: true,
    items: [
      { title: "Pipeline & Leads", url: "/admin/crm/leads", icon: MousePointerClick, roles: ["admin", "editor", "viewer"] },
      { title: "User Management", url: "/admin/crm/users", icon: Users, roles: ["admin"] },
    ],
  },
  {
    label: "Discovery Engine",
    id: "discovery",
    collapsible: true,
    items: [
      { title: "Analytics & Insights", url: "/admin/discovery/analytics", icon: Sparkles, roles: ["admin", "editor", "viewer"] },
    ],
  },
  {
    label: "Estimator Tools",
    id: "estimator",
    collapsible: true,
    items: [
      { title: "Lead Management", url: "/admin/estimator/leads", icon: FolderSearch, roles: ["admin", "editor", "viewer"] },
      { title: "Rate Management", url: "/admin/estimator/rates", icon: Calculator, roles: ["admin"] },
    ],
  },
  {
    label: "System",
    id: "system",
    collapsible: true,
    items: [
      { title: "Global Settings", url: "/admin/system/settings", icon: Settings, roles: ["admin"] },
      { title: "Staff Access", url: "/admin/system/team-members", icon: ShieldCheck, roles: ["admin"] },
    ],
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(["cms"]);
  const { logout, role, isAuthenticated, isLoading, user } = useAdminAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  useEffect(() => {
    const activeSection = menuSectionsRaw.find(section =>
      section.items.some(item => location.pathname === item.url || location.pathname.startsWith(item.url + '/'))
    );

    if (activeSection?.id) {
      setOpenSections(prev => {
        if (!prev.includes(activeSection.id as string)) {
          return [...prev, activeSection.id as string];
        }
        return prev;
      });
    }
  }, [location.pathname]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-emerald-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/auth" replace />;
  }

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Define allowed roles for each item
  const menuSectionsRaw = [
    {
      label: "Overview",
      items: [
        { title: "Hub", url: "/admin", icon: MonitorPlay, roles: ["admin", "editor", "viewer"] },
        { title: "Dashboard KPI", url: "/admin/dashboard", icon: LayoutDashboard, roles: ["admin", "editor", "viewer"] },
      ],
    },
    {
      label: "Content Management",
      id: "cms",
      collapsible: true,
      items: [
        { title: "Pages & Sections", url: "/admin/cms/pages", icon: FileText, roles: ["admin", "editor"] },
        { title: "Portfolio", url: "/admin/cms/portfolio", icon: Briefcase, roles: ["admin", "editor"] },
        { title: "Services", url: "/admin/cms/services", icon: FolderSearch, roles: ["admin", "editor"] },
        { title: "Testimonials", url: "/admin/cms/testimonials", icon: Star, roles: ["admin", "editor"] },
        { title: "Team", url: "/admin/cms/team", icon: Users, roles: ["admin", "editor"] },
        { title: "Blog Posts", url: "/admin/cms/blogs", icon: MessageSquare, roles: ["admin", "editor"] },
        { title: "Media Library", url: "/admin/cms/media", icon: ImageIcon, roles: ["admin", "editor", "viewer"] },
      ],
    },
    {
      label: "Platform CRM",
      id: "crm",
      collapsible: true,
      items: [
        { title: "Pipeline & Leads", url: "/admin/crm/leads", icon: MousePointerClick, roles: ["admin", "editor", "viewer"] },
        { title: "User Management", url: "/admin/crm/users", icon: Users, roles: ["admin"] },
      ],
    },
    {
      label: "Discovery Engine",
      id: "discovery",
      collapsible: true,
      items: [
        { title: "Analytics & Insights", url: "/admin/discovery/analytics", icon: Sparkles, roles: ["admin", "editor", "viewer"] },
      ],
    },
    {
      label: "Estimator Tools",
      id: "estimator",
      collapsible: true,
      items: [
        { title: "Lead Management", url: "/admin/estimator/leads", icon: FolderSearch, roles: ["admin", "editor", "viewer"] },
        { title: "Rate Management", url: "/admin/estimator/rates", icon: Calculator, roles: ["admin"] },
      ],
    },
    {
      label: "System",
      id: "system",
      collapsible: true,
      items: [
        { title: "Global Settings", url: "/admin/system/settings", icon: Settings, roles: ["admin"] },
        { title: "Staff Access", url: "/admin/system/team-members", icon: ShieldCheck, roles: ["admin"] },
      ],
    },
  ];

  // Filter sections by role
  const currentRole = role || "viewer";
  console.log("=== AdminLayout Role Debug ===");
  console.log("Fetched role:", role);
  console.log("Applied currentRole:", currentRole);

  const menuSections = menuSectionsRaw
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(currentRole))
    }))
    .filter(section => section.items.length > 0);
  console.log("Final menuSections:", menuSections);

  type MenuSection = typeof menuSections[number];

  return (
    <SidebarProvider>
      <div className="dark min-h-screen flex w-full bg-slate-950 text-slate-200 relative overflow-hidden" style={{ backgroundColor: '#020617', color: '#e2e8f0' }}>
        {/* Dark Rich Mesh Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 z-0" style={{ backgroundImage: 'radial-gradient(ellipse at top right, rgba(49, 46, 129, 0.4), #020617, #020617)' }}></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/30 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px] pointer-events-none z-0"></div>

        <Sidebar className="border-r border-white/10 bg-white/5 backdrop-blur-xl z-20">
          <SidebarContent>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                  CA
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">Crossangle Interior</h2>
                  <p className="text-xs text-slate-400">Admin Panel</p>
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
                        <SidebarGroupLabel className="flex items-center justify-between hover:bg-white/5 rounded-md px-2 py-1.5 cursor-pointer transition-colors group/label">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover/label:text-slate-300">
                            {section.label}
                          </span>
                          {section.id ? (
                            <ChevronDown
                              className={`w-4 h-4 text-slate-500 transition-transform ${openSections.includes(section.id) ? "rotate-180" : ""
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
                                  isActive={location.pathname === item.url}
                                  className={`${location.pathname === item.url
                                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-600/20 text-emerald-400 font-medium border border-emerald-500/20 shadow-inner"
                                    : "hover:bg-white/10 text-slate-400 hover:text-slate-200"
                                    } rounded-lg transition-all duration-200 my-0.5`}
                                >
                                  <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                                    <item.icon className="w-4 h-4" />
                                    <span className="text-sm">{item.title}</span>
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
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {section.label}
                        </span>
                      </SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {section.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                asChild
                                isActive={location.pathname === item.url}
                                className={`${location.pathname === item.url
                                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-600/20 text-emerald-400 font-medium border border-emerald-500/20 shadow-inner"
                                  : "hover:bg-white/10 text-slate-400 hover:text-slate-200"
                                  } rounded-lg transition-all duration-200 my-0.5`}
                              >
                                <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                                  <item.icon className="w-5 h-5" />
                                  <span className="text-sm">{item.title}</span>
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
            <div className="border-t border-white/10 p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start hover:bg-white/10 border-white/10 bg-white/5 text-slate-300 hover:text-white transition-colors" asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  View Website
                </Link>
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/20 transition-colors"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden text-slate-300 hover:text-white">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  {menuSections
                    .flatMap((s) => s.items)
                    .find((item) => item.url === location.pathname)?.title || "Dashboard"}
                </h1>
                <p className="text-sm text-slate-400">Manage your interior design website content</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CommandMenu />
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-black/20 border border-white/10 rounded-xl backdrop-blur-md">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                  {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-200">
                    {user?.email?.split("@")[0] || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{currentRole}</p>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 md:p-8">
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

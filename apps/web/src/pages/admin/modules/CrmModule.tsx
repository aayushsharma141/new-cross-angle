import { useState } from "react";
import { Outlet, Navigate, useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ModuleLayout } from "@/components/admin/layout/ModuleLayout";
import { useQuery } from "@tanstack/react-query";
import { leadRepo } from "@/repositories";
import type { Lead } from "@/lib/scoring/leadScoring";
import {
  CRM_STAGES,
  CRM_WORKSPACE_NAV,
  CRM_SAVED_VIEWS,
  isCrmNavLink,
  isCrmNavView,
  applyCrmSavedView,
  isCrmStageId,
  type CrmNavItem,
} from "@/lib/crm";
import { Sheet, SheetContent } from "@/components/ui/primitives/sheet";
import { Menu } from "lucide-react";

// ─── Sidebar counter helpers ─────────────────────────────────────────────────
function getViewCount(viewId: string, leads: Lead[], now: Date): number {
  const view = CRM_SAVED_VIEWS.find((v) => v.id === viewId);
  if (!view) return 0;
  return applyCrmSavedView(view.id, leads, now).length;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const CrmModule = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stageParam = searchParams.get("stage");
  const statusFilter = stageParam && isCrmStageId(stageParam) ? stageParam : "all";
  const viewParam = searchParams.get("view") || "all";

  // Fetch leads to get stage counts for the sidebar
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      const raw = await leadRepo.getLeads();
      return raw as unknown as Lead[];
    },
  });

  // Redirect bare /admin/crm to /admin/crm/leads
  if (location.pathname === "/admin/crm" || location.pathname === "/admin/crm/") {
    return <Navigate to="/admin/crm/leads" replace />;
  }

  const now = new Date();

  const stageCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const isLeadsPage = location.pathname.startsWith("/admin/crm/leads");

  // ── Navigation handlers ──────────────────────────────────────────────────
  const handleStageClick = (stageId: string) => {
    const newParams = new URLSearchParams(isLeadsPage ? searchParams : undefined);
    newParams.delete("view");
    
    if (!isLeadsPage) {
      newParams.set("stage", stageId);
      navigate(`/admin/crm/leads?${newParams.toString()}`);
      return;
    }
    if (statusFilter === stageId) {
      newParams.delete("stage");
    } else {
      newParams.set("stage", stageId);
    }
    setSearchParams(newParams);
  };

  const handleViewClick = (viewId: string) => {
    const newParams = new URLSearchParams(isLeadsPage ? searchParams : undefined);
    newParams.delete("stage");
    if (viewId === "all" || viewParam === viewId) {
      newParams.delete("view");
    } else {
      newParams.set("view", viewId);
    }

    if (!isLeadsPage) {
      const query = newParams.toString();
      navigate(`/admin/crm/leads${query ? `?${query}` : ""}`);
      return;
    }
    setSearchParams(newParams);
  };

  // ── Rendering helpers ────────────────────────────────────────────────────
  const baseBtn = "flex items-center justify-between px-3 h-9 rounded-md text-[13px] transition-all duration-200 border relative overflow-hidden";
  const activeBtn = "bg-[hsl(var(--admin-primary)/0.1)] border-[hsl(var(--admin-primary)/0.25)] text-admin-primary font-bold shadow-[0_0_12px_hsl(var(--admin-primary)/0.05)] before:absolute before:left-0 before:top-[15%] before:bottom-[15%] before:w-[3px] before:rounded-r-md before:bg-admin-primary";
  const inactiveBtn = "border-transparent text-admin-text-muted hover:bg-admin-surface hover:text-admin-text";

  const renderNavItem = (item: CrmNavItem) => {
    const Icon = item.icon;

    if (isCrmNavLink(item)) {
      let isActive = item.isActive(location.pathname);
      if (item.id === "leads" && isLeadsPage && viewParam !== "all") {
        isActive = false;
      }

      return (
        <Link
          key={item.id}
          to={item.to}
          className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
        >
          <span className="flex items-center gap-3">
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </span>
        </Link>
      );
    }

    if (isCrmNavView(item)) {
      const isActive = isLeadsPage && viewParam === item.view && (!statusFilter || statusFilter === "all");
      const count = getViewCount(item.view, leads, now);
      const badgeColor =
        item.badgeTone === "danger"
          ? "bg-admin-danger-muted text-admin-danger border border-[hsl(var(--admin-danger)/0.2)]"
          : "text-admin-text-subtle";

      return (
        <button
          key={item.id}
          type="button"
          onClick={() => handleViewClick(item.view)}
          data-state={isActive ? "active" : "inactive"}
          className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
        >
          <span className="flex items-center gap-3"><Icon className="w-4 h-4" />{item.label}</span>
          <span className={`text-[10px] px-1.5 rounded ${badgeColor}`}>{count}</span>
        </button>
      );
    }

    return null;
  };

  const sidebarContent = (
    <div className="flex flex-col gap-1 h-full">
      <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.16em] text-admin-text-subtle font-semibold">Workspace Views</div>

      {CRM_WORKSPACE_NAV.map(renderNavItem)}

      <div className="mt-6 pt-5 border-t border-admin-border/50 px-3 pb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-text-subtle">Pipeline Stages</span>
      </div>

      {CRM_STAGES.map((stage) => {
        const isActive = isLeadsPage && statusFilter === stage.id && (!viewParam || viewParam === "all");
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => { handleStageClick(stage.id); setMobileNavOpen(false); }}
            data-state={isActive ? "active" : "inactive"}
            className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
          >
            <span className="flex items-center gap-2.5">
              <span className={`w-1.5 h-1.5 rounded-full ${stage.dotClass}`}></span>
              <span>{stage.label}</span>
            </span>
            <span className={`text-[10px] px-1.5 rounded ${isActive ? "bg-[hsl(var(--admin-primary)/0.2)] text-admin-primary" : "text-admin-text-subtle"}`}>
              {stageCounts[stage.id] || 0}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile CRM Nav Toggle */}
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-md bg-admin-surface border border-admin-border text-admin-text"
        aria-label="Open CRM navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile CRM Nav Sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[260px] bg-admin-bg border-r border-admin-border p-3 flex flex-col gap-1 overflow-y-auto">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Layout — reuses ModuleLayout with custom sidebar */}
      <ModuleLayout
        title="Client CRM"
        description="Manage leads, track pipeline stages, and review client interactions across the sales lifecycle."
        sidebar={sidebarContent}
      >
        <Outlet />
      </ModuleLayout>
    </>
  );
};

export default CrmModule;

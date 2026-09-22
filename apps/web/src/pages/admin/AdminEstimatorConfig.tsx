import { useState, Suspense, lazy, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Home, Wrench, Sparkles, IndianRupee, Loader2, Package, Eye, FileText, ImageIcon, Settings2 } from "lucide-react";
import { useEstimatorRegistry } from "@/lib/registry/EstimatorRegistry";
import { Separator } from "@/components/ui/primitives/separator";
import { calculateEstimate } from "@/addons/calculators/components/data/calculation-engine";
import { formatCurrency } from "@/addons/calculators/components/data/format-utils";
import type { CalculatorFormData } from "@/addons/calculators/components/data/types";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// Load workspace components lazily
const PricingIntelligenceWorkspace = lazy(() => import("@/components/admin/estimator-flow/PricingIntelligenceWorkspace"));
const ResultIntelligenceWorkspace = lazy(() => import("@/components/admin/estimator-flow/ResultIntelligenceWorkspace"));
const ExecutionTiersEditor = lazy(() => import("@/components/admin/estimator-flow/ExecutionTiersEditor").then(m => ({ default: m.ExecutionTiersEditor })));
const PropertyTypesEditor = lazy(() => import("@/components/admin/estimator-flow/PropertyTypesEditor").then(m => ({ default: m.PropertyTypesEditor })));
const ServicesEditor = lazy(() => import("@/components/admin/estimator-flow/ServicesEditor").then(m => ({ default: m.ServicesEditor })));
const AddonsEditor = lazy(() => import("@/components/admin/estimator-flow/AddonsEditor").then(m => ({ default: m.AddonsEditor })));

const NAVIGATION = [
  { id: "pricing", label: "Pricing Intelligence", icon: IndianRupee },
  { id: "packages", label: "Packages & Tiers", icon: Package },
  { id: "property", label: "Property Types", icon: Home },
  { id: "services", label: "Services", icon: Wrench },
  { id: "addons", label: "Add-ons", icon: Sparkles },
  { id: "results", label: "Result Experience", icon: FileText },
  { id: "media", label: "Media Assets", icon: ImageIcon },
] as const;

type NavId = (typeof NAVIGATION)[number]["id"];

export default function AdminEstimatorConfig() {
  const [activeTab, setActiveTab] = useState<NavId>("pricing");
  const registry = useEstimatorRegistry();

  const handleKeydown = (_e: React.KeyboardEvent) => {
    // Ctrl/Cmd+S handling could be added here if we want a global save, 
    // but each workspace/editor handles its own saving right now.
  };

  // Attach global keyboard shortcut listener to the document
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeydown(e as unknown as React.KeyboardEvent);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock Lead for Live Simulation Sandbox
  const mockLeadData: CalculatorFormData = {
    area: 1500,
    city: "Metro",
    propertyType: "apartment",
    bhk: "3 BHK",
    stage: "new_build",
    floors: 1,
    floorNumber: null,
    livingRooms: 1,
    bedrooms: 3,
    bathrooms: 3,
    toilets: 1,
    kitchen: 1,
    balconies: 2,
    renovationScope: null,
    renovationRooms: [],
    renovationPropertyType: null,
    selectedService: "C5",
    executionTier: "standard",
    projectMonths: 6,
    startTiming: "1-3 Months",
    extraVisits: 5,
    budgetAmount: 3000000,
    budgetPreset: "Premium",
    name: "Mock Client",
    email: "mock@example.com",
    phone: "9999999999",
    modularKitchen: true,
    wardrobes: 2,
    falseCeiling: false,
    smartHome: false,
    customFurniture: false,
    premiumLighting: false,
  } as unknown as CalculatorFormData;

  // Live simulation compute
  const estimate = calculateEstimate(mockLeadData, registry.pricingRates.data);


  return (
    <div
      className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]"
    >
      {/* Left Rail (Navigation) */}
      <aside className="w-[280px] shrink-0 border-r border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] hidden md:flex flex-col">
        <div className="p-4 border-b border-[hsl(var(--admin-border))]">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[hsl(var(--admin-primary))]" />
            Estimator OS
          </h2>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">Configure pricing, logic, and results</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {NAVIGATION.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))]"
                  : "text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-card))] hover:text-[hsl(var(--admin-text))]"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Workspace (Editor) */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <ErrorBoundary>
          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--admin-primary))]" /></div>}>
            {activeTab === "pricing" && <PricingIntelligenceWorkspace registry={registry} />}
            {activeTab === "packages" && <ExecutionTiersEditor />}
            {activeTab === "property" && <PropertyTypesEditor />}
            {activeTab === "services" && <ServicesEditor />}
            {activeTab === "addons" && <AddonsEditor />}
            {activeTab === "results" && <ResultIntelligenceWorkspace registry={registry} />}
            {activeTab === "media" && (
              <div className="flex items-center justify-center h-full text-[hsl(var(--admin-text-muted))]">
                Media Assets configuration coming soon
              </div>
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Right Rail (Live Simulation Sandbox) */}
      <aside className="w-[360px] xl:w-[400px] shrink-0 border-l border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] hidden lg:block overflow-y-auto">
        <div className="sticky top-0 bg-[hsl(var(--admin-card))] z-10 p-4 border-b border-[hsl(var(--admin-border))]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Live Simulation
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Mock Lead
            </span>
          </div>
          <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mt-1">
            1500 sqft • Metro • Standard
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Estimated Range */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Estimated Range</h4>
            <div className="bg-[hsl(var(--admin-surface))] rounded-lg p-3 border border-[hsl(var(--admin-border))] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--admin-text-muted))]">Design Fee</span>
                <span className="font-medium">{formatCurrency(estimate.designCost.min)} – {formatCurrency(estimate.designCost.max)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--admin-text-muted))]">Execution</span>
                <span className="font-medium">{formatCurrency(estimate.executionCost.min)} – {formatCurrency(estimate.executionCost.max)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--admin-text-muted))]">Add-ons</span>
                <span className="font-medium">{formatCurrency(estimate.addonCost)}</span>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Total Estimate</p>
              <p className="text-xl font-bold text-emerald-300 mt-1">
                {formatCurrency(estimate.total.min)} – {formatCurrency(estimate.total.max)}
              </p>
            </div>
          </div>

          <Separator className="bg-[hsl(var(--admin-border))]" />

          {/* ALCS Recommendation preview */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">ALCS Output</h4>
            <div className="bg-[hsl(var(--admin-surface))] rounded-lg p-3 border border-[hsl(var(--admin-border))]">
              <p className="text-xs font-medium text-blue-400 mb-1">Recommended Approach: Full Service</p>
              <p className="text-[11px] text-[hsl(var(--admin-text-muted))] leading-relaxed">
                {(registry.alcsRules.data as any)?.defaultRecommendation || "Based on the budget constraints and property specifics, a comprehensive design and execution package is recommended to ensure quality."}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-medium text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {(registry.resultTemplates.data as any)?.confidenceMessage || "High Confidence"}
                </span>
                <span className="text-[10px] font-medium text-[hsl(var(--admin-primary))] border border-[hsl(var(--admin-primary))]/20 bg-[hsl(var(--admin-primary))]/10 px-2 py-0.5 rounded-full">
                  {(registry.resultTemplates.data as any)?.ctaPrimary || "Book Consultation"}
                </span>
              </div>
            </div>
          </div>
          
          <Separator className="bg-[hsl(var(--admin-border))]" />

          {/* Configuration State */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Workspace State</h4>
            <div className="flex items-center gap-2 text-[11px]">
              <div className={cn("w-2 h-2 rounded-full", registry.isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              <span className="text-[hsl(var(--admin-text-muted))]">
                {registry.isLoading ? "Syncing�" : "Registry Synced"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

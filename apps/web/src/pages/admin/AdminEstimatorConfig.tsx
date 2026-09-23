import { useState, Suspense, lazy } from "react";
import { cn } from "@/lib/utils";
import { Home, Wrench, Sparkles, IndianRupee, Loader2, Package, Eye, FileText, ChevronDown, ExternalLink } from "lucide-react";
import { useEstimatorRegistry } from "@/lib/registry/EstimatorRegistry";
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

// "Media Assets" is omitted until it has an editor; it only rendered a "coming soon" stub.
const NAVIGATION = [
  { id: "pricing", label: "Pricing", hint: "Rates, multipliers and fees behind every estimate.", icon: IndianRupee },
  { id: "packages", label: "Packages & Tiers", hint: "Names, descriptions and images of the execution tiers.", icon: Package },
  { id: "property", label: "Property Types", hint: "Property options visitors choose from.", icon: Home },
  { id: "services", label: "Services", hint: "Service levels (C1–C5) and what each includes.", icon: Wrench },
  { id: "addons", label: "Add-ons", hint: "Optional extras visitors can add.", icon: Sparkles },
  { id: "results", label: "Result Screen", hint: "Copy and buttons on the final estimate screen.", icon: FileText },
] as const;

type NavId = (typeof NAVIGATION)[number]["id"];

// Fixed sample client for the preview: shows what the current rates quote for a typical lead.
const SAMPLE_LEAD = {
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
  name: "Sample Client",
  email: "sample@example.com",
  phone: "9999999999",
  modularKitchen: true,
  wardrobes: 2,
  falseCeiling: false,
  smartHome: false,
  customFurniture: false,
  premiumLighting: false,
} as unknown as CalculatorFormData;

const SAMPLE_SUMMARY = "3 BHK apartment · 1,500 sqft · Metro · Full service, Standard tier";

export default function AdminEstimatorConfig() {
  const [activeTab, setActiveTab] = useState<NavId>("pricing");
  const [previewOpen, setPreviewOpen] = useState(false);
  const registry = useEstimatorRegistry();

  const estimate = calculateEstimate(SAMPLE_LEAD, registry.pricingRates.data);
  const templates = (registry.resultTemplates.data ?? {}) as Record<string, unknown>;
  const alcsRules = (registry.alcsRules.data ?? {}) as Record<string, unknown>;
  const active = NAVIGATION.find((n) => n.id === activeTab) ?? NAVIGATION[0];

  return (
    <div className="flex flex-col gap-5 min-w-0">
      {/* What this page controls */}
      <p className="text-sm text-[hsl(var(--admin-text-muted))] max-w-3xl">
        These settings drive the public{" "}
        <a
          href="/estimate"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[hsl(var(--admin-primary))] hover:underline"
        >
          price estimator <ExternalLink className="w-3 h-3" />
        </a>
        : the prices it quotes, the options visitors pick from, and what they see on the result screen.
      </p>

      {/* Section tabs */}
      <div className="border-b border-[hsl(var(--admin-border))] overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div role="tablist" aria-label="Estimator settings sections" className="flex min-w-max">
          {NAVIGATION.map((item) => {
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                title={item.hint}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 h-10 -mb-px border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  selected
                    ? "border-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary))]"
                    : "border-transparent text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        {/* Editor */}
        <section className="min-w-0 order-2 xl:order-1" aria-label={active.label}>
          <ErrorBoundary>
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--admin-primary))]" /></div>}>
              {activeTab === "pricing" && <PricingIntelligenceWorkspace registry={registry} />}
              {activeTab === "packages" && <ExecutionTiersEditor />}
              {activeTab === "property" && <PropertyTypesEditor />}
              {activeTab === "services" && <ServicesEditor />}
              {activeTab === "addons" && <AddonsEditor />}
              {activeTab === "results" && <ResultIntelligenceWorkspace registry={registry} />}
            </Suspense>
          </ErrorBoundary>
        </section>

        {/* Sample estimate: beside the editor on wide screens, a collapsible card above it otherwise */}
        <aside className="order-1 xl:order-2 xl:sticky xl:top-0 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]">
          <button
            type="button"
            onClick={() => setPreviewOpen((o) => !o)}
            aria-expanded={previewOpen}
            className="w-full flex items-center justify-between gap-3 p-4 text-left xl:pointer-events-none"
          >
            <span className="min-w-0">
              <span className="text-sm font-bold flex flex-wrap items-center gap-x-2">
                <Eye className="w-4 h-4 text-[hsl(var(--admin-success))]" />
                Sample estimate
                <span className="xl:hidden text-xs font-medium text-[hsl(var(--admin-success))]">
                  {formatCurrency(estimate.total.min)} – {formatCurrency(estimate.total.max)}
                </span>
              </span>
              <span className="block text-[11px] text-[hsl(var(--admin-text-muted))] mt-1">{SAMPLE_SUMMARY}</span>
            </span>
            <ChevronDown className={cn("w-4 h-4 shrink-0 text-[hsl(var(--admin-text-muted))] transition-transform xl:hidden", previewOpen && "rotate-180")} />
          </button>

          <div className={cn("px-4 pb-4 space-y-5", previewOpen ? "block" : "hidden xl:block")}>
            <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">
              What the saved rates quote this sample client. Updates after you save.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg p-3 border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-[hsl(var(--admin-text-muted))]">Design fee</span>
                  <span className="font-medium text-right">{formatCurrency(estimate.designCost.min)} – {formatCurrency(estimate.designCost.max)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[hsl(var(--admin-text-muted))]">Execution</span>
                  <span className="font-medium text-right">{formatCurrency(estimate.executionCost.min)} – {formatCurrency(estimate.executionCost.max)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[hsl(var(--admin-text-muted))]">Add-ons</span>
                  <span className="font-medium text-right">{formatCurrency(estimate.addonCost)}</span>
                </div>
              </div>
              <div className="rounded-lg p-4 text-center border border-[hsl(var(--admin-success))]/20 bg-[hsl(var(--admin-success))]/10">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[hsl(var(--admin-success))]">Total estimate</p>
                <p className="text-xl font-bold text-[hsl(var(--admin-success))] mt-1">
                  {formatCurrency(estimate.total.min)} – {formatCurrency(estimate.total.max)}
                </p>
              </div>
            </div>

            {/* The saved result-screen templates, not a computed recommendation for this sample */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Result screen copy</h4>
              <div className="rounded-lg p-3 border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]">
                <p className="text-[11px] text-[hsl(var(--admin-text-muted))] leading-relaxed">
                  {(alcsRules.defaultRecommendation as string) || "Based on the budget constraints and property specifics, a comprehensive design and execution package is recommended to ensure quality."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[hsl(var(--admin-success))]/20 bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))]">
                    {(templates.confidenceMessage as string) || "High Confidence"}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[hsl(var(--admin-primary))]/20 bg-[hsl(var(--admin-primary))]/10 text-[hsl(var(--admin-primary))]">
                    {(templates.ctaPrimary as string) || "Review With Designer"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--admin-text-muted))]">
              <span className={cn("w-2 h-2 rounded-full", registry.isLoading ? "bg-[hsl(var(--admin-primary))] animate-pulse" : "bg-[hsl(var(--admin-success))]")} />
              {registry.isLoading ? "Loading saved settings…" : "Showing saved settings"}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

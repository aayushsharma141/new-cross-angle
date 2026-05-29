import { useState, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Home, LayoutList, Wrench, Sparkles, IndianRupee, Loader2 } from "lucide-react";
import { PropertyTypesEditor } from "@/components/admin/estimator-flow/PropertyTypesEditor";
import { DetailsEditor } from "@/components/admin/estimator-flow/DetailsEditor";
import { ServicesEditor } from "@/components/admin/estimator-flow/ServicesEditor";
import { AddonsEditor } from "@/components/admin/estimator-flow/AddonsEditor";

const AdminEstimateRates = lazy(() => import("./AdminEstimateRates"));

const TABS = [
  { id: "pricing", label: "Pricing & Rates", icon: IndianRupee },
  { id: "property", label: "Property Types", icon: Home },
  { id: "details", label: "Details & Rooms", icon: LayoutList },
  { id: "services", label: "Services", icon: Wrench },
  { id: "addons", label: "Add-ons", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminEstimateFlow() {
  const [tab, setTab] = useState<TabId>("pricing");

  return (
    <div className="space-y-4 py-4 animate-in fade-in duration-500">
      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--admin-border))]/50 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
              tab === t.id
                ? "border-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary))]"
                : "border-transparent text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "pricing" && (
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" /></div>}>
          <AdminEstimateRates />
        </Suspense>
      )}
      {tab === "property" && <PropertyTypesEditor />}
      {tab === "details" && <DetailsEditor />}
      {tab === "services" && <ServicesEditor />}
      {tab === "addons" && <AddonsEditor />}
    </div>
  );
}

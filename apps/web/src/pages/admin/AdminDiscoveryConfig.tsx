import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Palette, Sun, Users } from "lucide-react";
import { AdjectivesEditor } from "@/components/admin/discovery-flow/AdjectivesEditor";
import { MaterialsEditor } from "@/components/admin/discovery-flow/MaterialsEditor";
import { LightingEditor } from "@/components/admin/discovery-flow/LightingEditor";
import { ArchetypesEditor } from "@/components/admin/discovery-flow/ArchetypesEditor";

const TABS = [
  {
    id: "adjectives",
    label: "Adjectives",
    icon: MessageSquare,
    description: "Style words shown in Step 4",
  },
  {
    id: "materials",
    label: "Materials",
    icon: Palette,
    description: "Texture choices in Step 5",
  },
  {
    id: "lights",
    label: "Lighting",
    icon: Sun,
    description: "Mood options in Step 6",
  },
  {
    id: "archetypes",
    label: "Archetypes",
    icon: Users,
    description: "Result personalities",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminDiscoveryConfig() {
  const [tab, setTab] = useState<TabId>("adjectives");

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-5 py-4 animate-in fade-in duration-300">
      {/* Sub-nav */}
      <div className="flex gap-0.5 border-b border-[hsl(var(--admin-border))]/50 overflow-x-auto pb-px">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap",
                isActive
                  ? "border-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary))]"
                  : "border-transparent text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab hint */}
      <p className="text-[10px] text-[hsl(var(--admin-text-muted))] -mt-2">
        <span className="text-[hsl(var(--admin-text))] font-medium">{activeTab.label}</span>
        {" — "}
        {activeTab.description}
      </p>

      {/* Editor panels */}
      {tab === "adjectives" && <AdjectivesEditor />}
      {tab === "materials" && <MaterialsEditor />}
      {tab === "lights" && <LightingEditor />}
      {tab === "archetypes" && <ArchetypesEditor />}
    </div>
  );
}

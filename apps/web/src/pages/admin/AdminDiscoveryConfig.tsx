import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Palette, Sun, Users, Target, Sliders, FileText } from "lucide-react";

import { PosthogFunnelChart } from "@/components/admin/analytics/PosthogFunnelChart";

import { QuestionsEditor } from "@/components/admin/discovery-flow/QuestionsEditor";
import { AdjectivesEditor } from "@/components/admin/discovery-flow/AdjectivesEditor";
import { MaterialsEditor } from "@/components/admin/discovery-flow/MaterialsEditor";
import { LightingEditor } from "@/components/admin/discovery-flow/LightingEditor";
import { VisualPromptsEditor } from "@/components/admin/discovery-flow/VisualPromptsEditor";
import { ArchetypesEditor } from "@/components/admin/discovery-flow/ArchetypesEditor";
import { DiscoveryAssetsPanel } from "@/components/admin/discovery-flow/DiscoveryAssetsPanel";
import { ImageIcon } from "lucide-react";

const TABS = [
  {
    id: "questions",
    label: "Quiz Questions",
    icon: FileText,
    description: "Stated questions, design languages, color moods, and dislikes",
  },
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
    id: "visual-prompts",
    label: "Visual Prompts",
    icon: Sliders,
    description: "Manage visual instincts prompt scoring and weights",
  },
  {
    id: "archetypes",
    label: "Archetypes",
    icon: Users,
    description: "Result personalities",
  },
  {
    id: "media-slots",
    label: "Media Slots",
    icon: ImageIcon,
    description: "Manage visual prompts and archetype media",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminDiscoveryConfig() {
  const [tab, setTab] = useState<TabId>("questions");

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
      <div className="flex flex-col space-y-4">
      <style>{`
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp var(--anim-duration) var(--anim-stagger-1) var(--anim-ease) both; }
        .fade-up-2 { animation: fadeUp var(--anim-duration) var(--anim-stagger-2) var(--anim-ease) both; }
      `}</style>
      
      
      <div className="fade-up-1">
        {/* PostHog Engine Funnel summary */}
        <div className="mb-6 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-6">
          <h3 className="text-sm font-bold text-[hsl(var(--admin-text))] mb-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Discovery Engine Funnel (PostHog)
          </h3>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-4">PostHog conversion metrics (Last 30 Days)</p>
          <div className="h-[200px]">
            <PosthogFunnelChart action="funnel-discovery" color="emerald" />
          </div>
        </div>

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
      <p className="text-[10px] text-[hsl(var(--admin-text-muted))] -mt-2 mb-2">
        <span className="text-[hsl(var(--admin-text))] font-medium">{activeTab.label}</span>
        {" — "}
        {activeTab.description}
      </p>
      </div>

      {/* Editor panels */}
      <div className="fade-up-2">
        {tab === "questions" && <QuestionsEditor />}
        {tab === "adjectives" && <AdjectivesEditor />}
        {tab === "materials" && <MaterialsEditor />}
        {tab === "lights" && <LightingEditor />}
        {tab === "visual-prompts" && <VisualPromptsEditor />}
        {tab === "archetypes" && <ArchetypesEditor />}
        {tab === "media-slots" && <DiscoveryAssetsPanel />}
      </div>
    </div>
  );
}

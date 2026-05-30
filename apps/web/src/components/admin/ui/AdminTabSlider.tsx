import { useState, type ReactNode, type LucideIcon } from "react";
import { cn } from "@/lib/utils";

export interface AdminTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
}

interface AdminTabSliderProps {
  /** Fixed content rendered above the tabs (KPIs, toolbars, etc.) */
  header?: ReactNode;
  tabs: AdminTab[];
  /** Controlled active tab id. If omitted, component manages its own state. */
  activeTab?: string;
  defaultTab?: string;
  onTabChange?: (id: string) => void;
  /** Optional class name to override or append to the tab content container */
  contentClassName?: string;
}

/**
 * Fixed header + tab layout with simple conditional rendering.
 */
export function AdminTabSlider({ header, tabs, activeTab: controlledTab, defaultTab, onTabChange, contentClassName }: AdminTabSliderProps) {
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.id);
  const activeId = controlledTab ?? internalTab;

  const setTab = (id: string) => {
    setInternalTab(id);
    onTabChange?.(id);
  };

  return (
    <div className="flex flex-col">
      {header && <div className="shrink-0">{header}</div>}

      {/* Tab bar */}
      <div className="shrink-0 flex gap-1 mt-4 border-b border-[hsl(var(--admin-border))]/50 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px",
                isActive
                  ? "border-[hsl(var(--admin-primary))] text-[hsl(var(--admin-primary))]"
                  : "border-transparent text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]"
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <div className={cn("pt-6", contentClassName)}>
        {tabs.find((t) => t.id === activeId)?.content}
      </div>
    </div>
  );
}

import React from "react";

export interface AdminFilterBarProps {
  title?: React.ReactNode;
  icon?: React.ElementType;
  badgeCount?: string | number;
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function AdminFilterBar({
  title,
  icon: Icon,
  badgeCount,
  filters,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange
}: AdminFilterBarProps) {
  return (
    <div className="flex items-center justify-between mb-[14px] mt-8">
      {/* Section header left side */}
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-[15px] h-[15px] text-[hsl(var(--admin-accent))]" aria-hidden="true" />}
        {title && (
          <span className="text-[13px] font-semibold text-[hsl(var(--admin-text))]">
            {title}
          </span>
        )}
        {badgeCount !== undefined && (
          <span className="bg-[hsl(var(--admin-success)/0.12)] border border-[hsl(var(--admin-success)/0.25)] rounded-full px-[9px] py-[1px] text-[11px] font-semibold text-[hsl(var(--admin-success))]">
            {badgeCount}
          </span>
        )}
      </div>

      {/* Controls right side */}
      <div className="flex items-center gap-[12px]">
        {/* Search */}
        {onSearchChange && (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))]">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-7 pr-3 py-[5px] rounded-[5px] text-[11px] font-inherit transition-all duration-150 bg-transparent border border-[hsl(var(--admin-border-subtle))] text-[hsl(var(--admin-text))] w-[180px] focus:outline-none focus:border-[hsl(var(--admin-accent))]"
            />
          </div>
        )}

        {/* Segmented controls */}
        {filters.length > 0 && (
          <div className="flex gap-[6px]">
            {filters.map((f) => {
              const isActive = f === activeFilter;
              return (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`
                    px-[11px] py-[5px] rounded-[5px] text-[11px] font-inherit transition-all duration-150 cursor-pointer
                    ${isActive 
                      ? "bg-[rgba(255,255,255,0.07)] border border-[hsl(var(--admin-border-subtle))] text-[hsl(var(--admin-text))] font-medium" 
                      : "bg-transparent border border-transparent text-[hsl(var(--admin-text-muted))] font-normal hover:text-[hsl(var(--admin-text))]"
                    }
                  `}
                >
                  {f}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

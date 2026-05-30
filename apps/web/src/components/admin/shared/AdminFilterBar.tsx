import React from "react";

export interface AdminFilterBarProps {
  title?: React.ReactNode;
  icon?: React.ElementType;
  badgeCount?: string | number;
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function AdminFilterBar({
  title,
  icon: Icon,
  badgeCount,
  filters,
  activeFilter,
  onFilterChange
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

      {/* Segmented controls right side */}
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
  );
}

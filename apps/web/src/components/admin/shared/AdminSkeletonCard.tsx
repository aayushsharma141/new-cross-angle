import React from "react";

export interface AdminSkeletonCardProps {
  size?: "sm" | "md" | "lg";
}

export function AdminSkeletonCard({ size = "md" }: AdminSkeletonCardProps) {
  // We use standard admin card classes and our tailwind pulse/shimmer animation
  const baseCard = "w-full bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-[12px] p-5 flex flex-col justify-center animate-pulse";
  
  if (size === "sm") {
    // ~60px height (e.g., Team Members)
    return (
      <div className={`${baseCard} h-[60px] flex-row items-center justify-between`}>
        <div className="flex items-center gap-4 w-full">
          <div className="w-[32px] h-[32px] rounded-full bg-[hsl(var(--admin-surface-hover))]" />
          <div className="flex flex-col gap-2 w-1/3">
            <div className="h-3 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-3/4" />
            <div className="h-2 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-1/2" />
          </div>
        </div>
        <div className="h-8 w-24 bg-[hsl(var(--admin-surface-hover))] rounded-md" />
      </div>
    );
  }

  if (size === "md") {
    // ~72px height (e.g., CMS Content, Leads)
    return (
      <div className={`${baseCard} h-[72px] flex-row items-center justify-between`}>
        <div className="flex flex-col gap-3 w-1/2">
          <div className="flex items-center gap-3">
            <div className="h-4 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-1/2" />
            <div className="h-4 w-16 bg-[hsl(var(--admin-surface-hover))] rounded-full" />
          </div>
          <div className="h-2 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-1/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-[hsl(var(--admin-surface-hover))] rounded-md" />
          <div className="h-8 w-8 bg-[hsl(var(--admin-surface-hover))] rounded-md" />
        </div>
      </div>
    );
  }

  // lg variant (~110px height, Integrations)
  return (
    <div className={`${baseCard} h-[110px] grid grid-cols-[44px_1fr_auto] gap-4 items-center`}>
      <div className="w-[44px] h-[44px] rounded-[10px] bg-[hsl(var(--admin-surface-hover))]" />
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-4 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-1/4" />
          <div className="h-4 w-16 bg-[hsl(var(--admin-surface-hover))] rounded-full" />
        </div>
        <div className="h-2 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-1/3" />
        <div className="flex gap-4 mt-1">
          <div className="h-2 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-16" />
          <div className="h-2 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-16" />
          <div className="h-2 bg-[hsl(var(--admin-surface-hover))] rounded-sm w-16" />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="h-8 w-20 bg-[hsl(var(--admin-surface-hover))] rounded-md" />
        <div className="h-8 w-16 bg-[hsl(var(--admin-surface-hover))] rounded-md" />
      </div>
    </div>
  );
}

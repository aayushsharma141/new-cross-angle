import React from "react";

export interface AdminSkeletonCardProps {
  size?: "sm" | "md" | "lg";
}

export function AdminSkeletonCard({ size = "md" }: AdminSkeletonCardProps) {
  const baseCard =
    "w-full bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-[12px] p-5 flex flex-col justify-center";

  if (size === "sm") {
    return (
      <div className={`${baseCard} h-[60px] flex-row items-center justify-between`}>
        <div className="flex items-center gap-4 w-full">
          <div className="skeleton-shimmer-admin w-[32px] h-[32px] rounded-full flex-shrink-0" style={{ animationDelay: "0ms" }} />
          <div className="flex flex-col gap-2 w-1/3">
            <div className="skeleton-shimmer-admin h-3 rounded-sm w-3/4" style={{ animationDelay: "80ms" }} />
            <div className="skeleton-shimmer-admin h-2 rounded-sm w-1/2" style={{ animationDelay: "160ms" }} />
          </div>
        </div>
        <div className="skeleton-shimmer-admin h-8 w-24 rounded-md" style={{ animationDelay: "240ms" }} />
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className={`${baseCard} h-[72px] flex-row items-center justify-between`}>
        <div className="flex flex-col gap-3 w-1/2">
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer-admin h-4 rounded-sm w-1/2" style={{ animationDelay: "0ms" }} />
            <div className="skeleton-shimmer-admin h-4 w-16 rounded-full" style={{ animationDelay: "80ms" }} />
          </div>
          <div className="skeleton-shimmer-admin h-2 rounded-sm w-1/3" style={{ animationDelay: "160ms" }} />
        </div>
        <div className="flex gap-2">
          <div className="skeleton-shimmer-admin h-8 w-8 rounded-md" style={{ animationDelay: "240ms" }} />
          <div className="skeleton-shimmer-admin h-8 w-8 rounded-md" style={{ animationDelay: "320ms" }} />
        </div>
      </div>
    );
  }

  // lg variant (~110px height — Integrations)
  return (
    <div className={`${baseCard} h-[110px] grid grid-cols-[44px_1fr_auto] gap-4 items-center`}>
      <div className="skeleton-shimmer-admin w-[44px] h-[44px] rounded-[10px]" style={{ animationDelay: "0ms" }} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer-admin h-4 rounded-sm w-1/4" style={{ animationDelay: "60ms" }} />
          <div className="skeleton-shimmer-admin h-4 w-16 rounded-full" style={{ animationDelay: "120ms" }} />
        </div>
        <div className="skeleton-shimmer-admin h-2 rounded-sm w-1/3" style={{ animationDelay: "180ms" }} />
        <div className="flex gap-4 mt-1">
          <div className="skeleton-shimmer-admin h-2 rounded-sm w-16" style={{ animationDelay: "240ms" }} />
          <div className="skeleton-shimmer-admin h-2 rounded-sm w-16" style={{ animationDelay: "300ms" }} />
          <div className="skeleton-shimmer-admin h-2 rounded-sm w-16" style={{ animationDelay: "360ms" }} />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="skeleton-shimmer-admin h-8 w-20 rounded-md" style={{ animationDelay: "240ms" }} />
        <div className="skeleton-shimmer-admin h-8 w-16 rounded-md" style={{ animationDelay: "320ms" }} />
      </div>
    </div>
  );
}

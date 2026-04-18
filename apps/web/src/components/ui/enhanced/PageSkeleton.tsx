import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  variant?: "public" | "admin" | "admin-content";
  className?: string;
}

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={cn("animate-pulse rounded-none bg-white/[0.065]", className)} />
);

export function PageSkeleton({ variant = "public", className }: PageSkeletonProps) {
  if (variant === "admin") {
    return (
      <div className={cn("admin-theme min-h-screen bg-[hsl(var(--admin-bg))] p-6", className)}>
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden min-h-[calc(100vh-3rem)] rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:block">
            <SkeletonBlock className="h-10 w-32" />
            <div className="mt-10 space-y-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-11 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <SkeletonBlock className="h-16 w-full rounded-2xl" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-32 rounded-2xl" />
              ))}
            </div>
            <SkeletonBlock className="h-[52vh] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "admin-content") {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <SkeletonBlock className="h-24 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
        <SkeletonBlock className="h-[60vh] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen overflow-hidden bg-[#050505] text-white", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(196,18,48,0.16),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(209,175,110,0.08),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-5 pt-28 md:px-10 md:pt-36">
        <div className="flex items-center justify-between gap-5">
          <SkeletonBlock className="h-12 w-44 rounded-full" />
          <SkeletonBlock className="hidden h-12 w-[28rem] rounded-full lg:block" />
          <SkeletonBlock className="h-12 w-32 rounded-full" />
        </div>

        <div className="grid min-h-[60vh] items-end gap-10 pb-16 pt-24 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <SkeletonBlock className="h-4 w-56" />
            <SkeletonBlock className="mt-8 h-24 max-w-3xl md:h-36" />
            <SkeletonBlock className="mt-5 h-24 max-w-2xl" />
            <div className="mt-8 flex flex-wrap gap-4">
              <SkeletonBlock className="h-14 w-52" />
              <SkeletonBlock className="h-14 w-52 bg-white/[0.04]" />
            </div>
          </div>
          <SkeletonBlock className="hidden h-80 bg-white/[0.045] lg:block" />
        </div>

        <div className="grid gap-5 pb-20 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-44 bg-white/[0.045]" />
          ))}
        </div>
      </div>
    </div>
  );
}

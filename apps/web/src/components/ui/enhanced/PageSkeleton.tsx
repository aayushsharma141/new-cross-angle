import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  variant?: "public" | "admin" | "admin-content";
  className?: string;
}

const SkeletonBlock = ({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) => (
  <div
    className={cn("skeleton-shimmer", className)}
    style={{ animationDelay: `${delay}ms` }}
  />
);

export function PageSkeleton({ variant = "public", className }: PageSkeletonProps) {
  if (variant === "admin") {
    return (
      <div className={cn("admin-theme min-h-screen bg-[hsl(var(--admin-bg))] p-6", className)}>
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden min-h-[calc(100vh-3rem)] rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:block">
            <SkeletonBlock className="h-10 w-32 rounded-xl skeleton-shimmer-admin" delay={0} />
            <div className="mt-10 space-y-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  className="h-11 w-full rounded-xl skeleton-shimmer-admin"
                  delay={index * 60}
                />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <SkeletonBlock className="h-16 w-full rounded-2xl skeleton-shimmer-admin" delay={0} />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  className="h-32 rounded-2xl skeleton-shimmer-admin"
                  delay={index * 100}
                />
              ))}
            </div>
            <SkeletonBlock className="h-[52vh] rounded-2xl skeleton-shimmer-admin" delay={300} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "admin-content") {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <SkeletonBlock className="h-24 w-full rounded-2xl skeleton-shimmer-admin" delay={0} />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className="h-24 rounded-2xl skeleton-shimmer-admin"
              delay={index * 80}
            />
          ))}
        </div>
        <SkeletonBlock className="h-[60vh] rounded-2xl skeleton-shimmer-admin" delay={320} />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen overflow-hidden bg-[#050505] text-white", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(196,18,48,0.16),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(209,175,110,0.08),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-5 pt-28 md:px-10 md:pt-36">
        <div className="flex items-center justify-between gap-5">
          <SkeletonBlock className="h-12 w-44 rounded-full" delay={0} />
          <SkeletonBlock className="hidden h-12 w-[28rem] rounded-full lg:block" delay={80} />
          <SkeletonBlock className="h-12 w-32 rounded-full" delay={160} />
        </div>

        <div className="grid min-h-[60vh] items-end gap-10 pb-16 pt-24 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <SkeletonBlock className="h-4 w-56 rounded-xl" delay={80} />
            <SkeletonBlock className="mt-8 h-24 max-w-3xl rounded-xl md:h-36" delay={160} />
            <SkeletonBlock className="mt-5 h-24 max-w-2xl rounded-xl" delay={240} />
            <div className="mt-8 flex flex-wrap gap-4">
              <SkeletonBlock className="h-14 w-52 rounded-xl" delay={320} />
              <SkeletonBlock className="h-14 w-52 rounded-xl" delay={400} />
            </div>
          </div>
          <SkeletonBlock className="hidden h-80 rounded-xl lg:block" delay={200} />
        </div>

        <div className="grid gap-5 pb-20 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-44 rounded-xl" delay={index * 100} />
          ))}
        </div>
      </div>
    </div>
  );
}

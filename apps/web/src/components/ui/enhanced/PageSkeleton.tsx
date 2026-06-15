import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type PublicVariant = "public" | "public.blog" | "public.blog-detail" | "public.gallery" | "public.services" | "public.service-category" | "public.service-detail" | "public.contact" | "public.estimate";

interface PageSkeletonProps {
  variant?: PublicVariant | "admin" | "admin-content";
  className?: string;
}

const SkeletonBlock = ({
  className,
  delay = 0,
  style,
}: {
  className: string;
  delay?: number;
  style?: CSSProperties;
}) => (
  <div
    className={cn("skeleton-shimmer", className)}
    style={{ animationDelay: `${delay}ms`, ...style }}
    aria-hidden="true"
  />
);

function PublicShell({ children, className, ariaLabel }: { children: React.ReactNode; className?: string; ariaLabel: string }) {
  return (
    <div role="status" aria-busy className={cn("relative min-h-screen bg-[#050505] text-white", className)} aria-label={ariaLabel}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(196,18,48,0.16),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(209,175,110,0.08),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-5 pt-28 md:px-10 md:pt-36">
        {children}
      </div>
    </div>
  );
}

export function PageSkeleton({ variant = "public", className }: PageSkeletonProps) {
  if (variant === "admin") {
    return (
      <div role="status" aria-busy className={cn("admin-theme min-h-screen bg-[hsl(var(--admin-bg))] p-6", className)} aria-label="Loading admin dashboard">
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
      <div role="status" aria-busy className={cn("w-full space-y-6", className)} aria-label="Loading content">
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

  if (variant === "public.blog") {
    return (
      <PublicShell ariaLabel="Loading blog posts" className={className}>
        <SkeletonBlock className="h-12 w-44 rounded-full" delay={0} />
        <div className="mt-12 flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 w-28 rounded-full flex-shrink-0" delay={i * 60} />
          ))}
        </div>
        <div className="mt-6 flex gap-4">
          <div className="flex-1 space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-48 rounded-xl" delay={i * 80} />
            ))}
          </div>
          <div className="hidden w-80 space-y-4 lg:block">
            <SkeletonBlock className="h-64 rounded-xl" delay={0} />
            <SkeletonBlock className="h-40 rounded-xl" delay={100} />
            <SkeletonBlock className="h-52 rounded-xl" delay={200} />
          </div>
        </div>
      </PublicShell>
    );
  }

  if (variant === "public.blog-detail") {
    return (
      <PublicShell ariaLabel="Loading article" className={className}>
        <SkeletonBlock className="h-6 w-48 rounded-full" delay={0} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <SkeletonBlock className="aspect-[16/9] w-full rounded-xl" delay={0} />
            <SkeletonBlock className="h-10 w-3/4 rounded-xl" delay={80} />
            <div className="flex gap-4">
              <SkeletonBlock className="h-4 w-24 rounded-full" delay={120} />
              <SkeletonBlock className="h-4 w-32 rounded-full" delay={160} />
              <SkeletonBlock className="h-4 w-20 rounded-full" delay={200} />
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-4 w-full rounded-lg" delay={i * 60 + 240} />
            ))}
          </div>
          <div className="hidden space-y-4 lg:block">
            <SkeletonBlock className="h-12 w-full rounded-xl" delay={0} />
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-8 w-full rounded-lg" delay={i * 60} />
            ))}
          </div>
        </div>
      </PublicShell>
    );
  }

  if (variant === "public.gallery") {
    return (
      <PublicShell ariaLabel="Loading gallery" className={className}>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 rounded-full flex-shrink-0" delay={i * 60} style={{ width: `${70 + i * 15}px` }} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonBlock key={i} className={cn("rounded-xl", i % 5 === 0 ? "aspect-[3/4]" : "aspect-square")} delay={i * 60} />
          ))}
        </div>
      </PublicShell>
    );
  }

  if (variant === "public.services") {
    return (
      <PublicShell ariaLabel="Loading services" className={className}>
        <SkeletonBlock className="h-12 w-44 rounded-full" delay={0} />
        <div className="mt-12 flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-8 w-32 rounded-full flex-shrink-0" delay={i * 60} />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, section) => (
          <div key={section} className="mt-16">
            <SkeletonBlock className="h-8 w-64 rounded-lg" delay={section * 100} />
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, card) => (
                <SkeletonBlock key={card} className="h-56 rounded-xl" delay={section * 100 + card * 80} />
              ))}
            </div>
          </div>
        ))}
      </PublicShell>
    );
  }

  if (variant === "public.service-category") {
    return (
      <PublicShell ariaLabel="Loading service category" className={className}>
        <SkeletonBlock className="h-6 w-48 rounded-full" delay={0} />
        <SkeletonBlock className="mt-6 h-48 w-full rounded-xl" delay={80} />
        <div className="mt-10 space-y-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex flex-col gap-6", i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse")}>
              <SkeletonBlock className="h-40 flex-1 rounded-xl" delay={i * 100} />
              <div className="flex-1 space-y-3">
                <SkeletonBlock className="h-6 w-3/4 rounded-lg" delay={i * 100 + 60} />
                <SkeletonBlock className="h-4 w-full rounded-lg" delay={i * 100 + 120} />
                <SkeletonBlock className="h-4 w-5/6 rounded-lg" delay={i * 100 + 180} />
                <SkeletonBlock className="h-4 w-2/3 rounded-lg" delay={i * 100 + 240} />
              </div>
            </div>
          ))}
        </div>
      </PublicShell>
    );
  }

  if (variant === "public.service-detail") {
    return (
      <PublicShell ariaLabel="Loading service details" className={className}>
        <SkeletonBlock className="h-5 w-64 rounded-full" delay={0} />
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <SkeletonBlock className="h-10 w-3/4 rounded-xl" delay={80} />
            <SkeletonBlock className="h-4 w-full rounded-lg" delay={120} />
            <SkeletonBlock className="h-4 w-5/6 rounded-lg" delay={160} />
            <SkeletonBlock className="h-4 w-4/6 rounded-lg" delay={200} />
          </div>
          <SkeletonBlock className="h-64 rounded-xl" delay={100} />
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-40 rounded-lg" delay={240} />
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-12 w-full rounded-lg" delay={i * 60 + 300} />
            ))}
          </div>
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-40 rounded-lg" delay={280} />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 w-full rounded-lg" delay={i * 60 + 340} />
            ))}
          </div>
        </div>
        <div className="mt-16">
          <SkeletonBlock className="h-6 w-48 rounded-lg" delay={400} />
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-44 rounded-xl" delay={i * 80 + 460} />
            ))}
          </div>
        </div>
      </PublicShell>
    );
  }

  if (variant === "public.contact") {
    return (
      <PublicShell ariaLabel="Loading contact page" className={className}>
        <SkeletonBlock className="h-6 w-48 rounded-full" delay={0} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <SkeletonBlock className="h-10 w-64 rounded-xl" delay={80} />
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-14 w-full rounded-xl" delay={i * 80 + 120} />
            ))}
            <SkeletonBlock className="h-12 w-40 rounded-xl" delay={440} />
          </div>
          <div className="space-y-6">
            <SkeletonBlock className="h-48 w-full rounded-xl" delay={80} />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-16 w-full rounded-xl" delay={i * 80 + 160} />
              ))}
            </div>
          </div>
        </div>
      </PublicShell>
    );
  }

  if (variant === "public.estimate") {
    return (
      <PublicShell ariaLabel="Loading estimate" className={className}>
        <SkeletonBlock className="h-12 w-44 rounded-full" delay={0} />
        <SkeletonBlock className="mt-12 h-64 w-full rounded-xl" delay={80} />
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-40 rounded-xl" delay={i * 80 + 160} />
          ))}
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell ariaLabel="Loading page" className={className}>
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
    </PublicShell>
  );
}

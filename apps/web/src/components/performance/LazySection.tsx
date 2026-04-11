import { ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  /** HTML id forwarded to the wrapper — preserves anchor links (#about, #portfolio…) */
  id?: string;
  minHeight?: number;
  rootMargin?: string;
  fallback?: ReactNode;
}

const SectionPlaceholder = ({ minHeight }: { minHeight: number }) => (
  <div
    aria-hidden="true"
    className="relative overflow-hidden rounded-none border border-white/[0.04] bg-white/[0.015]"
    style={{ minHeight }}
  >
    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.05)_42%,transparent_68%)] animate-[shimmer_2.4s_infinite]" />
  </div>
);

export const LazySection = ({
  children,
  className,
  id,
  minHeight = 720,
  rootMargin = "320px 0px",
  fallback,
}: LazySectionProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = hostRef.current;
    if (!node || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div id={id} ref={hostRef} className={cn("relative", className)}>
      {isVisible ? (
        <Suspense fallback={fallback ?? <SectionPlaceholder minHeight={minHeight} />}>
          {children}
        </Suspense>
      ) : (
        fallback ?? <SectionPlaceholder minHeight={minHeight} />
      )}
    </div>
  );
};

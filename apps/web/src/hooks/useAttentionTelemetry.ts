import { useEffect, useRef } from "react";

export const useAttentionTelemetry = <T extends HTMLElement>(elementId: string) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let enterTime = 0;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          enterTime = performance.now();
        } else {
          if (enterTime > 0) {
            const timeSpent = performance.now() - enterTime;
            // In a real implementation this would dispatch to PostHog or Analytics API
            console.debug(`[API Telemetry] Attention Purity Index for ${elementId}: ${timeSpent.toFixed(0)}ms`);
            enterTime = 0;
          }
        }
      });
    }, { threshold: 0.8 }); // Require 80% visibility to count as true attention

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [elementId]);

  return ref;
};

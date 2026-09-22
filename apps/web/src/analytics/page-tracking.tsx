/**
 * page-tracking.tsx
 *
 * Fires `page_viewed` on every React Router navigation.
 * Mount once inside the router, inside `AnalyticsProvider`.
 *
 * Usage:
 *   <BrowserRouter>
 *     <AnalyticsProvider consent={consent}>
 *       <PageTracker />
 *       <App />
 *     </AnalyticsProvider>
 *   </BrowserRouter>
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "./AnalyticsProvider";
import { recordLearningEvent } from "./track";

export function PageTracker() {
  const location = useLocation();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.track("page_viewed", {
      path: location.pathname + location.search,
      title: document.title,
    });
  // Only fire when the pathname changes, not on hash-only changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const handleAttentionEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        recordLearningEvent(analytics, "attention_telemetry", customEvent.detail, true);
      }
    };

    window.addEventListener("attention-telemetry", handleAttentionEvent);
    return () => {
      window.removeEventListener("attention-telemetry", handleAttentionEvent);
    };
  }, [analytics]);

  return null;
}

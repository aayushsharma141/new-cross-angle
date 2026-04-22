/**
 * AnalyticsProvider.tsx
 *
 * Wraps the whole application. Creates the `AnalyticsClient` once,
 * gated by the cookie consent level from `CookieConsentProvider`.
 * Exposes the client via `useAnalytics()`.
 *
 * Usage:
 *   <AnalyticsProvider>
 *     <App />
 *   </AnalyticsProvider>
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import posthogJs from "posthog-js";
import { createAnalyticsClient, type AnalyticsClient, type ConsentLevel } from "./posthog-client";

// ── Context ───────────────────────────────────────────────────────────────────

const AnalyticsContext = createContext<AnalyticsClient | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface AnalyticsProviderProps {
  children: ReactNode;
  /** Consent level driven by CookieConsentProvider. Default is "strict". */
  consent: ConsentLevel;
  apiKey?: string;
  apiHost?: string;
}

/**
 * Creates the analytics client once per consent level change.
 * Must be placed INSIDE `CookieConsentProvider` so the consent value
 * is available before the first render.
 */
export function AnalyticsProvider({
  children,
  consent,
  apiKey = import.meta.env.VITE_POSTHOG_KEY ?? "",
  apiHost = `${typeof window !== "undefined" ? window.location.origin : ""}/ingest`,
}: AnalyticsProviderProps) {
  const clientRef = useRef<AnalyticsClient | null>(null);

  const client = useMemo(() => {
    clientRef.current = createAnalyticsClient({
      consent,
      posthog: posthogJs as unknown as Parameters<typeof createAnalyticsClient>[0]["posthog"],
      apiKey,
      apiHost,
    });
    return clientRef.current;
  }, [consent, apiKey, apiHost]);

  return (
    <AnalyticsContext.Provider value={client}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Access the typed analytics client from any component.
 *
 * @example
 *   const { track } = useAnalytics();
 *   track("cta_clicked", { location: "navbar", label: "Book Now" });
 */
export function useAnalytics(): AnalyticsClient {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    // Return a no-op client so callers never crash in tests or SSR.
    return {
      track: () => {},
      identify: () => {},
      reset: () => {},
    };
  }
  return ctx;
}

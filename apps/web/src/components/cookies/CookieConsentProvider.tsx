import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { runWhenIdle } from "@/lib/idle";

export type CookieConsent = "all" | "strict" | "unknown";

const STORAGE_KEY = "crossangle-cookie-consent:v1";

interface CookieConsentContextValue {
  consent: CookieConsent;
  hasChoice: boolean;
  acceptAll: () => void;
  acceptStrictOnly: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

type ConsentWindow = Window &
  typeof globalThis & {
    __crossangleAnalyticsLoaded?: boolean;
    __crossangleSentryLoaded?: boolean;
    __crossanglePostHogLoaded?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

const loadScript = (id: string, src: string) => {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
};

const loadGoogleAnalytics = (measurementId: string) => {
  const w = window as ConsentWindow;

  if (!measurementId || w.__crossangleAnalyticsLoaded) {
    return;
  }

  loadScript(
    "crossangle-ga-loader",
    `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
  );

  w.dataLayer = w.dataLayer ?? [];
  w.gtag =
    w.gtag ??
    function gtag(...args: unknown[]) {
      w.dataLayer?.push(args);
    };

  w.gtag("js", new Date());
  w.gtag("config", measurementId, {
    anonymize_ip: true,
    transport_type: "beacon",
  });

  w.__crossangleAnalyticsLoaded = true;
};



// Sentry initialization is handled globally in main.tsx to capture boot errors.
// Configuration for PII masking is defined in lib/sentry.ts.
const loadSentry = async () => {
  // Identification logic can go here if needed after consent.
};

export const CookieConsentProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [consent, setConsent] = useState<CookieConsent>(() => {
    if (typeof window === "undefined") {
      return "unknown";
    }

    const savedValue = window.localStorage.getItem(STORAGE_KEY);

    if (savedValue === "all" || savedValue === "strict") {
      return savedValue;
    }

    return "unknown";
  });

  useEffect(() => {
    if (consent === "unknown") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, consent);

    if (consent === "strict") {
      return;
    }

    return runWhenIdle(() => {
      const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

      if (gaMeasurementId) {
        loadGoogleAnalytics(gaMeasurementId);
      }

      // Sentry is already initialized in main.tsx
    }, 1800);
  }, [consent]);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      hasChoice: consent !== "unknown",
      acceptAll: () => setConsent("all"),
      acceptStrictOnly: () => setConsent("strict"),
    }),
    [consent],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }

  return context;
};

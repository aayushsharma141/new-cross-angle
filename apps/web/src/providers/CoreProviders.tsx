import { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { CookieConsentProvider, useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import { TooltipProvider } from "@/components/ui/primitives/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SystemProvider } from "@/context/SystemContext";
import { AdminProvider } from "@/context/AdminContext";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AnalyticsProvider } from "@/analytics/AnalyticsProvider";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function InnerAnalyticsProvider({ children }: { children: ReactNode }) {
  const { consent } = useCookieConsent();
  const { settings } = useSiteSettings();
  const consentLevel = consent === 'unknown' ? 'none' : consent;
  
  const apiKey = settings?.posthog_api_key || import.meta.env.VITE_POSTHOG_KEY || "";
  const apiHost = settings?.posthog_host || `${typeof window !== "undefined" ? window.location.origin : ""}/ingest`;

  return (
    <AnalyticsProvider consent={consentLevel} apiKey={apiKey} apiHost={apiHost}>
      {children}
    </AnalyticsProvider>
  );
}

export function CoreProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <CookieConsentProvider>
            <TooltipProvider>
              <InnerAnalyticsProvider>
                <AuthProvider>
                  <SystemProvider>
                    <AdminProvider>
                      <LanguageProvider>
                        {children}
                      </LanguageProvider>
                    </AdminProvider>
                  </SystemProvider>
                </AuthProvider>
              </InnerAnalyticsProvider>
            </TooltipProvider>
          </CookieConsentProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

import { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentProvider";
import { TooltipProvider } from "@/components/ui/primitives/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SystemProvider } from "@/context/SystemContext";
import { AdminProvider } from "@/context/AdminContext";
import { LanguageProvider } from "@/hooks/useLanguage";

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

export function CoreProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <CookieConsentProvider>
            <TooltipProvider>
              <AuthProvider>
                <SystemProvider>
                  <AdminProvider>
                    <LanguageProvider>
                      {children}
                    </LanguageProvider>
                  </AdminProvider>
                </SystemProvider>
              </AuthProvider>
            </TooltipProvider>
          </CookieConsentProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

import { Toaster } from "@/components/ui/primitives/toaster";
import { BrowserRouter, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, useEffect, useState } from "react";
import { CookieConsentBanner } from "./components/cookies/CookieConsentBanner";
import { runWhenIdle } from "./lib/idle";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { PageSkeleton } from "./components/ui/enhanced/PageSkeleton";
import { CoreProviders } from "./providers/CoreProviders";
import { PageTracker } from "./analytics/page-tracking";
import WhatsAppButton from "./components/layout/WhatsAppButton";
import FixedSocialBar from "./components/layout/FixedSocialBar";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { adminRoutes } from "./routes/adminRoutes";
import { publicRoutes } from "./routes/publicRoutes";
import { AdminDeviceGate } from "./components/admin/AdminDeviceGate";
import { AnimatedContent } from "./components/ReactBits/index";

const SmoothScroll = lazy(() => import("./components/layout/SmoothScroll").then(m => ({ default: m.SmoothScroll })));
const DeferredScrollManager = lazy(() =>
  import("./components/layout/ScrollManager").then((m) => ({ default: m.ScrollManager })),
);

const AdminPageLoader = () => <PageSkeleton variant="admin" />;

function getSkeletonVariant(pathname: string): string {
  if (pathname.startsWith("/blog/")) return "public.blog-detail";
  if (pathname === "/blog") return "public.blog";
  if (pathname === "/gallery") return "public.gallery";
  if (pathname === "/services") return "public.services";
  if (pathname.startsWith("/services/")) {
    const segments = pathname.split("/").filter(Boolean);
    return segments.length >= 3 ? "public.service-detail" : "public.service-category";
  }
  if (pathname === "/contact-us") return "public.contact";
  if (pathname === "/estimate") return "public.estimate";
  return "public";
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [pathname]);
  return null;
};

const DeferredExperienceEnhancements = () => {
  const [shouldEnhanceScroll, setShouldEnhanceScroll] = useState(false);
  useEffect(() => runWhenIdle(() => setShouldEnhanceScroll(true), 100), []);
  if (!shouldEnhanceScroll) return null;
  return (
    <Suspense fallback={null}>
      <DeferredScrollManager />
    </Suspense>
  );
};

import { useSiteSettings } from "./hooks/useSiteSettings";

const SiteMetaUpdater = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;
    
    // Update favicon
    const logoUrl = settings.company_logo_url || settings.logo_light_url || '/logo-icon.png';
    const links = document.querySelectorAll("link[rel~='icon']");
    if (links.length > 0) {
      links.forEach(link => {
        (link as HTMLLinkElement).href = logoUrl;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = logoUrl;
      document.head.appendChild(link);
    }

  }, [settings]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { settings } = useSiteSettings();

  return (
    <>
      <ScrollToTop />
      <PageTracker />
      {!isAdmin && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        >
          Skip to main content
        </a>
      )}
      {isAdmin ? (
        <ErrorBoundary>
          <AdminDeviceGate>
            <Suspense fallback={<AdminPageLoader />}>
              <Routes>{adminRoutes}</Routes>
            </Suspense>
          </AdminDeviceGate>
        </ErrorBoundary>
      ) : settings?.maintenance_mode_active ? (
        <div className="min-h-screen flex items-center justify-center bg-kiro-bg-dark text-white p-6 text-center">
          <div className="max-w-md">
            <h1 className="text-4xl font-serif mb-4 tracking-tight">System Update</h1>
            <p className="text-site-gray">Our digital experience is currently undergoing scheduled maintenance. Please check back shortly.</p>
          </div>
        </div>
      ) : (
        <Suspense fallback={<PageSkeleton variant={getSkeletonVariant(location.pathname) as React.ComponentProps<typeof PageSkeleton>["variant"]} />}>
          <SmoothScroll>
            <ErrorBoundary>
              <Suspense fallback={<PageSkeleton variant={getSkeletonVariant(location.pathname) as React.ComponentProps<typeof PageSkeleton>["variant"]} />}>
                <AnimatePresence mode="wait">
                  <AnimatedContent key={location.pathname} distance={15} duration={0.5} className="flex-1 w-full flex flex-col h-full">
                    <Routes location={location}>
                      {publicRoutes}
                    </Routes>
                  </AnimatedContent>
                </AnimatePresence>
                {location.pathname !== "/" && <WhatsAppButton />}
                {["/", "/about-us", "/our-process", "/services", "/portfolio", "/gallery", "/blog", "/contact-us", "/locations"].includes(location.pathname) && location.pathname !== "/" && <FixedSocialBar />}
              </Suspense>
            </ErrorBoundary>
          </SmoothScroll>
        </Suspense>
      )}
      {/* Cookie consent only shown on public pages — admin has no router context need */}
      {!isAdmin && !settings?.maintenance_mode_active && <CookieConsentBanner />}
    </>
  );
};

const App = () => (
  <CoreProviders>
    <SiteMetaUpdater />
    <DeferredExperienceEnhancements />
    <Toaster />
    <ErrorBoundary>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AnimatedRoutes />
      </BrowserRouter>
    </ErrorBoundary>
    <SpeedInsights />
    <Analytics />
  </CoreProviders>
);

export default App;

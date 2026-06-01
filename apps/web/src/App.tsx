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
import MobileStickyCTA from "./components/layout/MobileStickyCTA";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { adminRoutes } from "./routes/adminRoutes";
import { publicRoutes } from "./routes/publicRoutes";

const SmoothScroll = lazy(() => import("./components/layout/SmoothScroll").then(m => ({ default: m.SmoothScroll })));
const DeferredScrollManager = lazy(() =>
  import("./components/layout/ScrollManager").then((m) => ({ default: m.ScrollManager })),
);

const AdminPageLoader = () => <PageSkeleton variant="admin" />;
const PublicPageLoader = () => <PageSkeleton variant="public" />;

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

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

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
          <Suspense fallback={<AdminPageLoader />}>
            <Routes>{adminRoutes}</Routes>
          </Suspense>
        </ErrorBoundary>
      ) : (
        <Suspense fallback={null}>
          <SmoothScroll>
            <ErrorBoundary>
              <Suspense fallback={<PublicPageLoader />}>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    {publicRoutes}
                  </Routes>
                </AnimatePresence>
                <MobileStickyCTA />
              </Suspense>
            </ErrorBoundary>
          </SmoothScroll>
        </Suspense>
      )}
      {/* Cookie consent only shown on public pages — admin has no router context need */}
      {!isAdmin && <CookieConsentBanner />}
    </>
  );
};

const App = () => (
  <CoreProviders>
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

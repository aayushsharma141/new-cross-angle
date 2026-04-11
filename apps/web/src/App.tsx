import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, useEffect, useState } from "react";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { CookieConsentBanner } from "./components/cookies/CookieConsentBanner";
import { runWhenIdle } from "./lib/idle";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageSkeleton } from "./components/ui/PageSkeleton";

import { SmoothScroll } from "./components/layout/SmoothScroll";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = 'https://us.i.posthog.com';

// Public pages
const Index = lazy(() => import("./pages/Index"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceCategoryPage = lazy(() => import("./pages/ServiceCategoryPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const ProjectHubPage = lazy(() => import("./pages/ProjectHubPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const PriceEstimator = lazy(() => import("./addons/calculators/pages/PriceEstimator"));
const DiscoveryPage = lazy(() => import("./addons/discovery/pages/DiscoveryPage"));
const BlueprintPage = lazy(() => import("./addons/discovery/pages/BlueprintPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Shared route wrappers
import PageTransition from "./components/PageTransition";

// Admin routes
import AdminAuth from "./pages/admin/AdminAuth";
import AdminLayout from "./pages/admin/AdminLayout";
const AdminHub = lazy(() => import("./pages/admin/AdminHub"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminPortfolio = lazy(() => import("./pages/admin/AdminPortfolio"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminEstimateLeads = lazy(() => import("./pages/admin/AdminEstimateLeads"));
const AdminEstimateRates = lazy(() => import("./pages/admin/AdminEstimateRates"));
const AdminTeamMembers = lazy(() => import("./pages/admin/AdminTeamMembers"));
const AdminHero = lazy(() => import("./pages/admin/AdminHero"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const CmsModule = lazy(() =>
  import("./pages/admin/modules/CmsModule").then((module) => ({
    default: module.CmsModule,
  })),
);
const CrmModule = lazy(() =>
  import("./pages/admin/modules/CrmModule").then((module) => ({
    default: module.CrmModule,
  })),
);
const DiscoveryModule = lazy(() =>
  import("./pages/admin/modules/DiscoveryModule").then((module) => ({
    default: module.DiscoveryModule,
  })),
);
const EstimatorModule = lazy(() =>
  import("./pages/admin/modules/EstimatorModule").then((module) => ({
    default: module.EstimatorModule,
  })),
);
const SystemModule = lazy(() =>
  import("./pages/admin/modules/SystemModule").then((module) => ({
    default: module.SystemModule,
  })),
);
const BlogModule = lazy(() =>
  import("./pages/admin/modules/BlogModule").then((module) => ({
    default: module.BlogModule,
  })),
);
const AdminBlogOverview = lazy(() => import("./pages/admin/AdminBlogOverview"));
const AdminBlogPerformance = lazy(() => import("./pages/admin/AdminBlogPerformance"));
const AdminBlogEngagement = lazy(() => import("./pages/admin/AdminBlogEngagement"));
const DeferredScrollManager = lazy(() =>
  import("./components/layout/ScrollManager").then((module) => ({
    default: module.ScrollManager,
  })),
);

import { RoleGuard } from "./components/admin/RoleGuard";
import { AuthGuard } from "./components/auth/AuthGuard";

const AdminPageLoader = () => <PageSkeleton variant="admin" />;

const PublicPageLoader = () => <PageSkeleton variant="public" />;


const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const DeferredExperienceEnhancements = () => {
  const [shouldEnhanceScroll, setShouldEnhanceScroll] = useState(false);

  useEffect(() => runWhenIdle(() => setShouldEnhanceScroll(true), 1200), []);

  if (!shouldEnhanceScroll) {
    return null;
  }

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
      {isAdmin ? (
        <Suspense fallback={<AdminPageLoader />}>
          <Routes>
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/login" element={<Navigate to="/admin/auth" replace />} />
            <Route
              path="/admin/reset-password"
              element={<Navigate to="/admin/auth#type=recovery" replace />}
            />
            <Route element={<AuthGuard />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHub />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route
                  path="access"
                  element={
                    <RoleGuard allowedRoles={["super_admin", "admin"]}>
                      <AdminUsers />
                    </RoleGuard>
                  }
                />

                <Route
                  path="cms"
                  element={
                    <RoleGuard allowedRoles={["super_admin", "admin"]}>
                      <CmsModule />
                    </RoleGuard>
                  }
                >
                  <Route
                    path="portfolio"
                    element={
                      <RoleGuard allowedRoles={["super_admin", "admin"]}>
                        <AdminPortfolio />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="services"
                    element={
                      <RoleGuard allowedRoles={["super_admin", "admin"]}>
                        <AdminServices />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="testimonials"
                    element={
                      <RoleGuard allowedRoles={["super_admin", "admin"]}>
                        <AdminTestimonials />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="team"
                    element={
                      <RoleGuard allowedRoles={["super_admin", "admin"]}>
                        <AdminTeam />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="blogs"
                    element={
                      <RoleGuard allowedRoles={["super_admin", "admin"]}>
                        <AdminBlogs />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="media"
                    element={
                      <RoleGuard allowedRoles={["super_admin", "admin"]}>
                        <AdminMedia />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="hero"
                    element={
                      <RoleGuard allowedRoles={["super_admin", "admin"]}>
                        <AdminHero />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="gallery"
                    element={
                      <RoleGuard allowedRoles={["super_admin", "admin"]}>
                        <AdminGallery />
                      </RoleGuard>
                    }
                  />
                </Route>

                <Route
                  path="crm"
                  element={
                    <RoleGuard allowedRoles={["super_admin", "admin"]}>
                      <CrmModule />
                    </RoleGuard>
                  }
                >
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="users" element={<Navigate to="/admin/access" replace />} />
                </Route>

                <Route
                  path="discovery"
                  element={
                    <RoleGuard allowedRoles={["super_admin", "admin"]}>
                      <DiscoveryModule />
                    </RoleGuard>
                  }
                >
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                <Route
                  path="estimator"
                  element={
                    <RoleGuard allowedRoles={["super_admin", "admin"]}>
                      <EstimatorModule />
                    </RoleGuard>
                  }
                >
                  <Route path="leads" element={<AdminEstimateLeads />} />
                  <Route
                    path="rates"
                    element={
                      <RoleGuard allowedRoles={["super_admin"]}>
                        <AdminEstimateRates />
                      </RoleGuard>
                    }
                  />
                </Route>

                <Route
                  path="blog"
                  element={
                    <RoleGuard allowedRoles={["super_admin", "admin"]}>
                      <BlogModule />
                    </RoleGuard>
                  }
                >
                  <Route path="overview" element={<AdminBlogOverview />} />
                  <Route path="performance" element={<AdminBlogPerformance />} />
                  <Route path="engagement" element={<AdminBlogEngagement />} />
                </Route>

                <Route
                  path="system"
                  element={
                    <RoleGuard allowedRoles={["super_admin"]}>
                      <SystemModule />
                    </RoleGuard>
                  }
                >
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="team-members" element={<AdminTeamMembers />} />
                  <Route path="audit" element={<AdminAuditLogs />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      ) : (
        <AnimatePresence mode="wait">
          <Suspense fallback={<PublicPageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Index /></PageTransition>} />
              <Route path="/about-us" element={<PageTransition><AboutPage /></PageTransition>} />
              <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
              <Route
                path="/services/:category"
                element={<PageTransition><ServiceCategoryPage /></PageTransition>}
              />
              <Route
                path="/services/:category/:service"
                element={<PageTransition><ServiceDetailPage /></PageTransition>}
              />
              <Route path="/portfolio" element={<PageTransition><ProjectHubPage /></PageTransition>} />
              <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
              <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
              <Route
                path="/blog/:slug"
                element={<PageTransition><BlogDetailPage /></PageTransition>}
              />
              <Route path="/contact-us" element={<PageTransition><ContactPage /></PageTransition>} />
              <Route
                path="/estimate"
                element={<PageTransition><PriceEstimator /></PageTransition>}
              />
              <Route
                path="/style-quiz"
                element={<PageTransition><DiscoveryPage /></PageTransition>}
              />
              <Route path="/blueprint" element={<PageTransition><BlueprintPage /></PageTransition>} />
              <Route
                path="/portfolio/:slug"
                element={<PageTransition><ProjectPage /></PageTransition>}
              />
              <Route path="/about" element={<Navigate to="/about-us" replace />} />
              <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      )}
    </>
  );
};

const App = () => {
  return (
    <CoreProviders>
      <SchemaMarkup
        type="LocalBusiness"
        data={{
          "@type": "InteriorDesigner",
          name: "Cross Angle Interior",
          image: "https://crossangleinterior.com/logo-icon.png",
          "@id": "https://crossangleinterior.com",
          url: "https://crossangleinterior.com",
          telephone: "+917909041132",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress:
              "2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango",
            addressLocality: "Jamshedpur",
            addressRegion: "Jharkhand",
            postalCode: "831012",
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 22.8027,
            longitude: 86.2047,
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "09:00",
            closes: "20:00",
          },
          sameAs: [
            "https://www.instagram.com/crossangleinterior/",
            "https://www.facebook.com/crossangleinterior",
          ],
        }}
      />
      <DeferredExperienceEnhancements />
      <SmoothScroll>
                          <Toaster />
                          <Sonner />
                          <CookieConsentBanner />
                          <ErrorBoundary>
                            <BrowserRouter
                              future={{
                                v7_startTransition: true,
                                v7_relativeSplatPath: true,
                              }}
                            >
                              <AnimatedRoutes />
                            </BrowserRouter>
                          </ErrorBoundary>
      </SmoothScroll>
      <SpeedInsights />
      <Analytics />
    </CoreProviders>
  );
};

export default App;

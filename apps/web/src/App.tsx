import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminProvider } from "@/context/AdminContext";
import { SystemProvider } from "@/context/SystemContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import { useEffect, Suspense, lazy } from "react";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { LanguageProvider } from "./hooks/useLanguage";
import { ThemeProvider } from "./components/theme-provider";
import { ScrollManager } from "./components/layout/ScrollManager";
// Public Pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceCategoryPage from "./pages/ServiceCategoryPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import GalleryPage from "./pages/GalleryPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import ContactPage from "./pages/ContactPage";
import ProjectPage from "./pages/ProjectPage";
import PriceEstimator from "./addons/calculators/pages/PriceEstimator";
import DiscoveryPage from "./addons/discovery/pages/DiscoveryPage";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/PageTransition";
const BlueprintPage = lazy(() => import("./addons/discovery/pages/BlueprintPage"));
// Admin Pages — lazy-loaded so anonymous public visitors never download admin JS
// Auth + Layout stay static: they handle redirects before the user lands on any admin page
import AdminAuth from "./pages/admin/AdminAuth";
import AdminResetPassword from "./pages/admin/AdminResetPassword";
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
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
// Admin Module Wrappers — also lazy-loaded
const CmsModule = lazy(() => import("./pages/admin/modules/CmsModule").then(m => ({ default: m.CmsModule })));
const CrmModule = lazy(() => import("./pages/admin/modules/CrmModule").then(m => ({ default: m.CrmModule })));
const DiscoveryModule = lazy(() => import("./pages/admin/modules/DiscoveryModule").then(m => ({ default: m.DiscoveryModule })));
const EstimatorModule = lazy(() => import("./pages/admin/modules/EstimatorModule").then(m => ({ default: m.EstimatorModule })));
const SystemModule = lazy(() => import("./pages/admin/modules/SystemModule").then(m => ({ default: m.SystemModule })));
const BlogModule = lazy(() => import("./pages/admin/modules/BlogModule").then(m => ({ default: m.BlogModule })));
const AdminBlogOverview = lazy(() => import("./pages/admin/AdminBlogOverview"));
const AdminBlogPerformance = lazy(() => import("./pages/admin/AdminBlogPerformance"));
const AdminBlogEngagement = lazy(() => import("./pages/admin/AdminBlogEngagement"));
import { RoleGuard } from "./components/admin/RoleGuard";
import { AuthGuard } from "./components/auth/AuthGuard";

// Minimal admin loading skeleton shown while lazy chunks download
const AdminPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))] admin-theme">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

import useLenis from "./hooks/useLenis";

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  // Initialize smooth scrolling for the entire app
  useLenis();

  useEffect(() => {
    console.log("Debug: AnimatedRoutes rendered, path:", location.pathname, "isAdmin:", isAdmin);
  }, [location.pathname, isAdmin]);

  return (
    <>
      <ScrollToTop />
      {isAdmin ? (
        <Suspense fallback={<AdminPageLoader />}>
          <Routes>
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/login" element={<Navigate to="/admin/auth" replace />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />

            <Route element={<AuthGuard />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHub />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="access" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminUsers /></RoleGuard>} />

                <Route path="cms" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><CmsModule /></RoleGuard>}>
                  <Route path="portfolio" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminPortfolio /></RoleGuard>} />
                  <Route path="services" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminServices /></RoleGuard>} />
                  <Route path="testimonials" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminTestimonials /></RoleGuard>} />
                  <Route path="team" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminTeam /></RoleGuard>} />
                  <Route path="blogs" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminBlogs /></RoleGuard>} />
                  <Route path="media" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminMedia /></RoleGuard>} />
                  <Route path="hero" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminHero /></RoleGuard>} />
                </Route>

                <Route path="crm" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><CrmModule /></RoleGuard>}>
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="users" element={<Navigate to="/admin/access" replace />} />
                </Route>

                <Route path="discovery" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DiscoveryModule /></RoleGuard>}>
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                <Route path="estimator" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><EstimatorModule /></RoleGuard>}>
                  <Route path="leads" element={<AdminEstimateLeads />} />
                  <Route path="rates" element={<RoleGuard allowedRoles={["super_admin"]}><AdminEstimateRates /></RoleGuard>} />
                </Route>

                <Route path="blog" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><BlogModule /></RoleGuard>}>
                  <Route path="overview" element={<AdminBlogOverview />} />
                  <Route path="performance" element={<AdminBlogPerformance />} />
                  <Route path="engagement" element={<AdminBlogEngagement />} />
                </Route>

                <Route path="system" element={<RoleGuard allowedRoles={["super_admin"]}><SystemModule /></RoleGuard>}>
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="team-members" element={<AdminTeamMembers />} />
                </Route>
              </Route>
            </Route>
          </Routes >
        </Suspense >
      ) : (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            <Route path="/about-us" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
            <Route path="/services/:category" element={<PageTransition><ServiceCategoryPage /></PageTransition>} />
            <Route path="/services/:category/:service" element={<PageTransition><ServiceDetailPage /></PageTransition>} />
            <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
            <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
            <Route path="/blog/:slug" element={<PageTransition><BlogDetailPage /></PageTransition>} />
            <Route path="/contact-us" element={<PageTransition><ContactPage /></PageTransition>} />
            <Route path="/estimate" element={<PageTransition><PriceEstimator /></PageTransition>} />
            <Route path="/style-quiz" element={<PageTransition><DiscoveryPage /></PageTransition>} />
            <Route path="/blueprint" element={<PageTransition><Suspense fallback={<div className="min-h-screen bg-[#080808] w-full" />}><BlueprintPage /></Suspense></PageTransition>} />
            <Route path="/portfolio/:slug" element={<PageTransition><ProjectPage /></PageTransition>} />
            {/* Redirect routes for common variations */}
            <Route path="/about" element={<Navigate to="/about-us" replace />} />
            <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <SchemaMarkup
      type="LocalBusiness"
      data={{
        "@type": "InteriorDesigner",
        "name": "Cross Angle Interior",
        "image": "https://crossangleinterior.com/logo-icon.png",
        "@id": "https://crossangleinterior.com",
        "url": "https://crossangleinterior.com",
        "telephone": "+917909041132",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango",
          "addressLocality": "Jamshedpur",
          "addressRegion": "Jharkhand",
          "postalCode": "831012",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 22.8027,
          "longitude": 86.2047
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "09:00",
          "closes": "20:00"
        },
        "sameAs": [
          "https://www.instagram.com/crossangleinterior/",
          "https://www.facebook.com/crossangleinterior"
        ]
      }}
    />
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ScrollManager />
        <TooltipProvider>
          <AuthProvider>
            <SystemProvider>
              <AdminProvider>
                <LanguageProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true,
                    }}
                  >
                    <AnimatedRoutes />
                  </BrowserRouter>
                </LanguageProvider>
              </AdminProvider>
            </SystemProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

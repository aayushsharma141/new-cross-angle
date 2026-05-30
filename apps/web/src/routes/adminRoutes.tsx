import { Navigate, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AdminAuth from "@/pages/admin/AdminAuth";
import AdminLayout from "@/pages/admin/AdminLayout";

const AdminHub = lazy(() => import("@/pages/admin/AdminHub"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminBlogs = lazy(() => import("@/pages/admin/AdminBlogs"));
const AdminServices = lazy(() => import("@/pages/admin/AdminServices"));
const AdminPortfolio = lazy(() => import("@/pages/admin/AdminPortfolio"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminMedia = lazy(() => import("@/pages/admin/AdminMedia"));
const AdminTestimonials = lazy(() => import("@/pages/admin/AdminTestimonials"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminTeam = lazy(() => import("@/pages/admin/AdminTeam"));
const AdminEstimateLeads = lazy(() => import("@/pages/admin/AdminEstimateLeads"));
const AdminEstimateFlow = lazy(() => import("@/pages/admin/AdminEstimateFlow"));
const AdminTeamMembers = lazy(() => import("@/pages/admin/AdminTeamMembers"));
const AdminHero = lazy(() => import("@/pages/admin/AdminHero"));
const AdminGallery = lazy(() => import("@/pages/admin/AdminGallery"));
const AdminTransformations = lazy(() => import("@/pages/admin/AdminTransformations"));
const AdminStats = lazy(() => import("@/pages/admin/AdminStats"));
const AdminMilestones = lazy(() => import("@/pages/admin/AdminMilestones"));
const AdminProcessSteps = lazy(() => import("@/pages/admin/AdminProcessSteps"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminDiscoveryConfig = lazy(() => import("@/pages/admin/AdminDiscoveryConfig"));
const AdminAuditLogs = lazy(() => import("@/pages/admin/AdminAuditLogs"));
const CmsModule = lazy(() => import("@/pages/admin/modules/CmsModule").then((m) => ({ default: m.CmsModule })));
const CrmModule = lazy(() => import("@/pages/admin/modules/CrmModule").then((m) => ({ default: m.CrmModule })));
const DiscoveryModule = lazy(() => import("@/pages/admin/modules/DiscoveryModule").then((m) => ({ default: m.DiscoveryModule })));
const EstimatorModule = lazy(() => import("@/pages/admin/modules/EstimatorModule").then((m) => ({ default: m.EstimatorModule })));
const SystemModule = lazy(() => import("@/pages/admin/modules/SystemModule").then((m) => ({ default: m.SystemModule })));
const BlogModule = lazy(() => import("@/pages/admin/modules/BlogModule").then((m) => ({ default: m.BlogModule })));
const AdminBlogOverview = lazy(() => import("@/pages/admin/AdminBlogOverview"));
const AdminBlogPerformance = lazy(() => import("@/pages/admin/AdminBlogPerformance"));
const AdminBlogEngagement = lazy(() => import("@/pages/admin/AdminBlogEngagement"));

export const adminRoutes = (
  <>
    <Route path="/admin/auth" element={<AdminAuth />} />
    <Route path="/admin/login" element={<Navigate to="/admin/auth" replace />} />
    <Route path="/admin/reset-password" element={<Navigate to="/admin/auth#type=recovery" replace />} />
    <Route element={<AuthGuard />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHub />} />
        <Route path="dashboard/*" element={<AdminDashboard />} />

        <Route path="cms" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><CmsModule /></RoleGuard>}>
          <Route path="portfolio" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminPortfolio /></RoleGuard>} />
          <Route path="services" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminServices /></RoleGuard>} />
          <Route path="testimonials" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminTestimonials /></RoleGuard>} />
          <Route path="team" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminTeam /></RoleGuard>} />
          <Route path="blogs" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminBlogs /></RoleGuard>} />
          <Route path="media" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminMedia /></RoleGuard>} />
          <Route path="hero" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminHero /></RoleGuard>} />
          <Route path="gallery" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminGallery /></RoleGuard>} />
          <Route path="transformations" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminTransformations /></RoleGuard>} />
          <Route path="stats" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminStats /></RoleGuard>} />
          <Route path="milestones" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminMilestones /></RoleGuard>} />
          <Route path="process" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminProcessSteps /></RoleGuard>} />
        </Route>

        <Route path="crm" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><CrmModule /></RoleGuard>}>
          <Route path="leads" element={<AdminLeads />} />
          <Route path="analytics" element={null} />
          <Route path="settings" element={null} />
          <Route path="users" element={<Navigate to="/admin/access" replace />} />
        </Route>

        <Route path="discovery" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DiscoveryModule /></RoleGuard>}>
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="config" element={<RoleGuard allowedRoles={["super_admin"]}><AdminDiscoveryConfig /></RoleGuard>} />
        </Route>

        <Route path="estimator" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><EstimatorModule /></RoleGuard>}>
          <Route path="leads" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminEstimateLeads /></RoleGuard>} />
          <Route path="config" element={<RoleGuard allowedRoles={["super_admin"]}><AdminEstimateFlow /></RoleGuard>} />
        </Route>

        <Route path="blog" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><BlogModule /></RoleGuard>}>
          <Route path="overview" element={<AdminBlogOverview />} />
          <Route path="performance" element={<AdminBlogPerformance />} />
          <Route path="engagement" element={<AdminBlogEngagement />} />
        </Route>

        <Route path="system" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><SystemModule /></RoleGuard>}>
          <Route path="access" element={<AdminUsers />} />
          <Route path="settings" element={<RoleGuard allowedRoles={["super_admin"]}><AdminSettings /></RoleGuard>} />
          <Route path="team-members" element={<RoleGuard allowedRoles={["super_admin"]}><AdminTeamMembers /></RoleGuard>} />
          <Route path="audit" element={<RoleGuard allowedRoles={["super_admin"]}><AdminAuditLogs /></RoleGuard>} />
        </Route>
      </Route>
    </Route>
  </>
);

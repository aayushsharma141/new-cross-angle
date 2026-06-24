import { Navigate, Route } from "react-router-dom";
import { lazy } from "react";
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
const AdminUserAccessUsers = lazy(() => import("@/pages/admin/AdminUserAccessUsers"));
const AdminUserAccessRoles = lazy(() => import("@/pages/admin/AdminUserAccessRoles"));
const AdminUserAccessSecurity = lazy(() => import("@/pages/admin/AdminUserAccessSecurity"));
const UserAccessModule = lazy(() => import("@/pages/admin/modules/UserAccessModule"));
const AdminTeam = lazy(() => import("@/pages/admin/AdminTeam"));
const AdminEstimateLeads = lazy(() => import("@/pages/admin/AdminEstimateLeads"));
const AdminPricingConfig = lazy(() => import("@/pages/admin/AdminPricingConfig"));
const AdminHero = lazy(() => import("@/pages/admin/AdminHero"));
const AdminGallery = lazy(() => import("@/pages/admin/AdminGallery"));
const AdminBeforeAndAfter = lazy(() => import("@/pages/admin/AdminBeforeAndAfter"));
const AdminMilestones = lazy(() => import("@/pages/admin/AdminMilestones"));
const AdminProcessSteps = lazy(() => import("@/pages/admin/AdminProcessSteps"));
const AdminSiteAssets = lazy(() => import("@/pages/admin/AdminSiteAssets"));
const AdminQuizAnalytics = lazy(() => import("@/pages/admin/AdminQuizAnalytics"));
const AdminDiscoveryConfig = lazy(() => import("@/pages/admin/AdminDiscoveryConfig"));
const AdminAuditLogs = lazy(() => import("@/pages/admin/AdminAuditLogs"));
const AdminEmailTemplates = lazy(() => import("@/pages/admin/AdminEmailTemplates"));
const CmsModule = lazy(() => import("@/pages/admin/modules/CmsModule"));
const CrmModule = lazy(() => import("@/pages/admin/modules/CrmModule"));
const DiscoveryModule = lazy(() => import("@/pages/admin/modules/DiscoveryModule"));
const EstimatorModule = lazy(() => import("@/pages/admin/modules/EstimatorModule"));
const SystemModule = lazy(() => import("@/pages/admin/modules/SystemModule"));
const BlogModule = lazy(() => import("@/pages/admin/modules/BlogModule"));
const AdminBlogOverview = lazy(() => import("@/pages/admin/AdminBlogOverview"));
const AdminBlogPerformance = lazy(() => import("@/pages/admin/AdminBlogPerformance"));
const AdminBlogEngagement = lazy(() => import("@/pages/admin/AdminBlogEngagement"));
const CrmAnalytics = lazy(() => import("@/pages/admin/CrmAnalytics"));
const CrmSettings = lazy(() => import("@/pages/admin/CrmSettings"));
const AdminLeadWorkspace = lazy(() => import("@/pages/admin/workspace/AdminLeadWorkspace"));

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
          <Route path="team-members" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminTeam /></RoleGuard>} />
          <Route path="blog-posts" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminBlogs /></RoleGuard>} />
          <Route path="media-library" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminMedia /></RoleGuard>} />
          <Route path="hero-carousel" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminHero /></RoleGuard>} />
          <Route path="gallery" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminGallery /></RoleGuard>} />
          <Route path="before-and-after" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminBeforeAndAfter /></RoleGuard>} />
          <Route path="milestones" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminMilestones /></RoleGuard>} />
          <Route path="process-steps" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminProcessSteps /></RoleGuard>} />
          <Route path="site-assets" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminSiteAssets /></RoleGuard>} />
        </Route>

        <Route path="crm" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><CrmModule /></RoleGuard>}>
          <Route path="leads" element={<AdminLeads />} />
          <Route path="leads/:id/workspace" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminLeadWorkspace /></RoleGuard>} />
          <Route path="analytics" element={<CrmAnalytics />} />
          <Route path="settings" element={<CrmSettings />} />
          <Route path="users" element={<Navigate to="/admin/user-access/users" replace />} />
        </Route>

        <Route path="discovery" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><DiscoveryModule /></RoleGuard>}>
          <Route path="quiz-analytics" element={<AdminQuizAnalytics />} />
          <Route path="quiz-configuration" element={<RoleGuard allowedRoles={["super_admin"]}><AdminDiscoveryConfig /></RoleGuard>} />
        </Route>

        <Route path="estimator" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><EstimatorModule /></RoleGuard>}>
          <Route path="estimate-leads" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><AdminEstimateLeads /></RoleGuard>} />
          <Route path="pricing-configuration" element={<RoleGuard allowedRoles={["super_admin"]}><AdminPricingConfig /></RoleGuard>} />
        </Route>

        <Route path="blog" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><BlogModule /></RoleGuard>}>
          <Route path="overview" element={<AdminBlogOverview />} />
          <Route path="article-performance" element={<AdminBlogPerformance />} />
          <Route path="reader-engagement" element={<AdminBlogEngagement />} />
        </Route>

        <Route path="user-access" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><UserAccessModule /></RoleGuard>}>
          <Route path="users" element={<AdminUserAccessUsers />} />
          <Route path="roles" element={<RoleGuard allowedRoles={["super_admin"]}><AdminUserAccessRoles /></RoleGuard>} />
          <Route path="security" element={<AdminUserAccessSecurity />} />
        </Route>

        <Route path="system" element={<RoleGuard allowedRoles={["super_admin", "admin"]}><SystemModule /></RoleGuard>}>
          <Route path="settings" element={<RoleGuard allowedRoles={["super_admin"]}><AdminSettings /></RoleGuard>} />
          <Route path="email-templates" element={<RoleGuard allowedRoles={["super_admin"]}><AdminEmailTemplates /></RoleGuard>} />
          <Route path="audit-logs" element={<RoleGuard allowedRoles={["super_admin"]}><AdminAuditLogs /></RoleGuard>} />
        </Route>
      </Route>
    </Route>
  </>
);

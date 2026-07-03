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
const AdminEstimatorConfig = lazy(() => import("@/pages/admin/AdminEstimatorConfig"));
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

// ─── Role Sets ────────────────────────────────────────────────────────────────
// Kept as named constants so the intent is readable at a glance.

const ADMIN_ONLY    = ["super_admin", "admin"] as const;
const CMS_ROLES     = ["super_admin", "admin", "editor"] as const;
const CRM_ROLES     = ["super_admin", "admin", "viewer"] as const;
const SUPER_ONLY    = ["super_admin"] as const;

export const adminRoutes = (
  <>
    <Route path="/admin/auth" element={<AdminAuth />} />
    <Route path="/admin/login" element={<Navigate to="/admin/auth" replace />} />
    <Route path="/admin/reset-password" element={<Navigate to="/admin/auth#type=recovery" replace />} />

    <Route element={<AuthGuard />}>
      <Route path="/admin" element={<AdminLayout />}>
        {/* ── Hub: all authenticated admin roles ──────────────────────────── */}
        <Route index element={<AdminHub />} />

        {/* ── Dashboard: admin / super_admin only ──────────────────────── */}
        <Route path="dashboard/*" element={<RoleGuard allowedRoles={ADMIN_ONLY}><AdminDashboard /></RoleGuard>} />

        {/* ── CMS: super_admin | admin | editor ───────────────────────────── */}
        <Route path="cms" element={<RoleGuard allowedRoles={CMS_ROLES}><CmsModule /></RoleGuard>}>
          <Route path="portfolio"     element={<RoleGuard allowedRoles={CMS_ROLES}><AdminPortfolio /></RoleGuard>} />
          <Route path="services"      element={<RoleGuard allowedRoles={CMS_ROLES}><AdminServices /></RoleGuard>} />
          <Route path="testimonials"  element={<RoleGuard allowedRoles={CMS_ROLES}><AdminTestimonials /></RoleGuard>} />
          <Route path="team-members"  element={<RoleGuard allowedRoles={CMS_ROLES}><AdminTeam /></RoleGuard>} />
          <Route path="blog-posts"    element={<RoleGuard allowedRoles={CMS_ROLES}><AdminBlogs /></RoleGuard>} />
          <Route path="media-library" element={<RoleGuard allowedRoles={CMS_ROLES}><AdminMedia /></RoleGuard>} />
          <Route path="hero-carousel" element={<RoleGuard allowedRoles={CMS_ROLES}><AdminHero /></RoleGuard>} />
          <Route path="gallery"       element={<RoleGuard allowedRoles={CMS_ROLES}><AdminGallery /></RoleGuard>} />
          <Route path="before-and-after" element={<RoleGuard allowedRoles={CMS_ROLES}><AdminBeforeAndAfter /></RoleGuard>} />
          <Route path="milestones"    element={<RoleGuard allowedRoles={CMS_ROLES}><AdminMilestones /></RoleGuard>} />
          <Route path="process-steps" element={<RoleGuard allowedRoles={CMS_ROLES}><AdminProcessSteps /></RoleGuard>} />
          <Route path="site-assets"   element={<RoleGuard allowedRoles={CMS_ROLES}><AdminSiteAssets /></RoleGuard>} />
        </Route>

        {/* ── CRM: super_admin | admin | viewer ───────────────────────────── */}
        <Route path="crm" element={<RoleGuard allowedRoles={CRM_ROLES}><CrmModule /></RoleGuard>}>
          <Route path="leads"                  element={<AdminLeads />} />
          <Route path="leads/:id/workspace"    element={<AdminLeadWorkspace />} />
          <Route path="analytics"              element={<RoleGuard allowedRoles={ADMIN_ONLY}><CrmAnalytics /></RoleGuard>} />
          <Route path="settings"               element={<RoleGuard allowedRoles={ADMIN_ONLY}><CrmSettings /></RoleGuard>} />
          <Route path="users"                  element={<Navigate to="/admin/user-access/users" replace />} />
        </Route>

        {/* ── Discovery: super_admin | admin ──────────────────────────────── */}
        <Route path="discovery" element={<RoleGuard allowedRoles={ADMIN_ONLY}><DiscoveryModule /></RoleGuard>}>
          <Route path="quiz-analytics"    element={<AdminQuizAnalytics />} />
          <Route path="quiz-configuration" element={<RoleGuard allowedRoles={SUPER_ONLY}><AdminDiscoveryConfig /></RoleGuard>} />
        </Route>

        {/* ── Estimator: super_admin | admin ──────────────────────────────── */}
        <Route path="estimator" element={<RoleGuard allowedRoles={ADMIN_ONLY}><EstimatorModule /></RoleGuard>}>
          <Route path="estimate-leads" element={<AdminEstimateLeads />} />
          <Route path="config" element={<RoleGuard allowedRoles={SUPER_ONLY}><AdminEstimatorConfig /></RoleGuard>} />
          {/* Legacy redirects — old URLs before Phase 12 consolidation */}
          <Route path="pricing-configuration" element={<Navigate to="/admin/estimator/config" replace />} />
          <Route path="result-templates"      element={<Navigate to="/admin/estimator/config" replace />} />
          <Route path="flow-configuration"    element={<Navigate to="/admin/estimator/config" replace />} />
        </Route>

        {/* ── Blog analytics: super_admin | admin ─────────────────────────── */}
        <Route path="blog" element={<RoleGuard allowedRoles={ADMIN_ONLY}><BlogModule /></RoleGuard>}>
          <Route path="overview"            element={<AdminBlogOverview />} />
          <Route path="article-performance" element={<AdminBlogPerformance />} />
          <Route path="reader-engagement"   element={<AdminBlogEngagement />} />
        </Route>

        {/* ── User Access: super_admin | admin ────────────────────────────── */}
        <Route path="user-access" element={<RoleGuard allowedRoles={ADMIN_ONLY}><UserAccessModule /></RoleGuard>}>
          <Route path="users"    element={<AdminUserAccessUsers />} />
          <Route path="roles"    element={<RoleGuard allowedRoles={SUPER_ONLY}><AdminUserAccessRoles /></RoleGuard>} />
          <Route path="security" element={<AdminUserAccessSecurity />} />
        </Route>

        {/* ── System: super_admin only ─────────────────────────────────────── */}
        <Route path="system" element={<RoleGuard allowedRoles={SUPER_ONLY}><SystemModule /></RoleGuard>}>
          <Route path="settings"        element={<AdminSettings />} />
          <Route path="email-templates" element={<AdminEmailTemplates />} />
          <Route path="audit-logs"      element={<AdminAuditLogs />} />
        </Route>
      </Route>
    </Route>
  </>
);

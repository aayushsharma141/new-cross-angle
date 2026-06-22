# ROUTES.MD — Cross Angle Interior Route Map

> Derived from: `apps/web/src/routes/publicRoutes.tsx` + `adminRoutes.tsx`
> Router: React Router DOM v6 (BrowserRouter)

---

## Public Routes

| Route | File | Purpose | Auth | Lazy | Notes |
|---|---|---|---|---|---|
| `/` | `pages/Index.tsx` | Homepage | None | ✅ | Hero, services, portfolio, stats |
| `/about-us` | `pages/AboutPage.tsx` | Studio about page | None | ✅ | Team, values, story |
| `/our-process` | `pages/OurProcessPage.tsx` | Design process steps | None | ✅ | |
| `/services` | `pages/ServicesPage.tsx` | All service categories | None | ✅ | |
| `/services/:category` | `pages/ServiceCategoryPage.tsx` | Services in category | None | ✅ | Dynamic :category param |
| `/services/:category/:service` | `pages/ServiceDetailPage.tsx` | Service detail page | None | ✅ | Dynamic :category + :service |
| `/portfolio` | `pages/PortfolioPage.tsx` | All projects | None | ✅ | Filterable grid |
| `/portfolio/:slug` | `pages/ProjectPage.tsx` | Project detail | None | ✅ | Dynamic :slug from DB |
| `/gallery` | `pages/GalleryPage.tsx` | Full image gallery | None | ✅ | ImageKit photos |
| `/blog` | `pages/BlogPage.tsx` | Blog listing | None | ✅ | 45 KB — large file |
| `/blog/:slug` | `pages/BlogDetailPage.tsx` | Blog article | None | ✅ | 52 KB — large file |
| `/contact-us` | `pages/ContactPage.tsx` | Contact form | None | ✅ | Submits to leads table |
| `/estimate` | `addons/calculators/pages/PriceEstimator` | Cost estimator quiz | None | ✅ | Server-side total calc |
| `/aesthetic-discovery-engine` | `addons/discovery/pages/DiscoveryPage` | Style quiz | None | ✅ | Submits to quiz_results |
| `/aesthetic-discovery-engine/results/:slug` | `addons/discovery/pages/SharedResultPage` | Shareable quiz result | None | ✅ | |
| `/locations/:city` | `pages/LocationPage.tsx` | City SEO landing page | None | ✅ | Dynamic :city |
| `/system-blueprint` | `addons/discovery/pages/BlueprintPage` | Internal system viz | None | ✅ | 108 KB — very large |
| `/privacy` | `pages/PrivacyPage.tsx` | Privacy policy | None | ✅ | |
| `/terms` | `pages/TermsPage.tsx` | Terms & conditions | None | ✅ | |
| `/privacy-policy` | → `/privacy` | Redirect (legacy) | None | — | |
| `/terms-and-conditions` | → `/terms` | Redirect (legacy) | None | — | |
| `/about` | → `/about-us` | Redirect (legacy) | None | — | |
| `/contact` | → `/contact-us` | Redirect (legacy) | None | — | |
| `*` | `pages/NotFound.tsx` | 404 page | None | ✅ | |

---

## Admin Routes

All admin routes under `/admin` except `/admin/auth` require:
1. **AuthGuard** — valid Supabase session (JWT)
2. **RoleGuard** — role must be `super_admin`, `admin`, or `viewer`

Mobile devices are blocked at the Edge Middleware level (403 before React loads).

| Route | File | Purpose | Role Required | Lazy |
|---|---|---|---|---|
| `/admin/auth` | `pages/admin/AdminAuth.tsx` | Login page | None | ❌ (eager) |
| `/admin/login` | → `/admin/auth` | Redirect | None | — |
| `/admin/reset-password` | → `/admin/auth#type=recovery` | Redirect | None | — |
| `/admin` (index) | `pages/admin/AdminHub.tsx` | Main hub/dashboard | any | ✅ |
| `/admin/dashboard/*` | `pages/admin/AdminDashboard.tsx` | Analytics dashboard | any | ✅ |
| **CMS Module** | | | | |
| `/admin/cms` (layout) | `pages/admin/modules/CmsModule.tsx` | CMS nav layout | admin+ | ✅ |
| `/admin/cms/portfolio` | `pages/admin/AdminPortfolio.tsx` | Manage projects | admin+ | ✅ |
| `/admin/cms/services` | `pages/admin/AdminServices.tsx` | Manage services | admin+ | ✅ |
| `/admin/cms/testimonials` | `pages/admin/AdminTestimonials.tsx` | Manage testimonials | admin+ | ✅ |
| `/admin/cms/team-members` | `pages/admin/AdminTeam.tsx` | Manage team | admin+ | ✅ |
| `/admin/cms/blog-posts` | `pages/admin/AdminBlogs.tsx` | Manage blog posts | admin+ | ✅ |
| `/admin/cms/media-library` | `pages/admin/AdminMedia.tsx` | Media library | admin+ | ✅ |
| `/admin/cms/hero-carousel` | `pages/admin/AdminHero.tsx` | Hero slides | admin+ | ✅ |
| `/admin/cms/gallery` | `pages/admin/AdminGallery.tsx` | Gallery images | admin+ | ✅ |
| `/admin/cms/before-and-after` | `pages/admin/AdminBeforeAndAfter.tsx` | Transformation stories | admin+ | ✅ |
| `/admin/cms/milestones` | `pages/admin/AdminMilestones.tsx` | Studio milestones | admin+ | ✅ |
| `/admin/cms/process-steps` | `pages/admin/AdminProcessSteps.tsx` | Process steps | admin+ | ✅ |
| `/admin/cms/site-assets` | `pages/admin/AdminSiteAssets.tsx` | Logos, assets | admin+ | ✅ |
| **CRM Module** | | | | |
| `/admin/crm` (layout) | `pages/admin/modules/CrmModule.tsx` | CRM nav layout | admin+ | ✅ |
| `/admin/crm/leads` | `pages/admin/AdminLeads.tsx` | Lead pipeline | admin+ | ✅ |
| `/admin/crm/analytics` | `pages/admin/CrmAnalytics.tsx` | Lead analytics | admin+ | ✅ |
| `/admin/crm/settings` | `pages/admin/CrmSettings.tsx` | CRM config | admin+ | ✅ |
| `/admin/crm/users` | → `/admin/user-access/users` | Redirect | admin+ | — |
| **Discovery Module** | | | | |
| `/admin/discovery` (layout) | `pages/admin/modules/DiscoveryModule.tsx` | Discovery nav | admin+ | ✅ |
| `/admin/discovery/quiz-analytics` | `pages/admin/AdminQuizAnalytics.tsx` | Quiz results data | admin+ | ✅ |
| `/admin/discovery/quiz-configuration` | `pages/admin/AdminDiscoveryConfig.tsx` | Quiz config | **super_admin** | ✅ |
| **Estimator Module** | | | | |
| `/admin/estimator` (layout) | `pages/admin/modules/EstimatorModule.tsx` | Estimator nav | admin+ | ✅ |
| `/admin/estimator/estimate-leads` | `pages/admin/AdminEstimateLeads.tsx` | Estimate submissions | admin+ | ✅ |
| `/admin/estimator/pricing-configuration` | `pages/admin/AdminPricingConfig.tsx` | Pricing config | **super_admin** | ✅ |
| **Blog Analytics Module** | | | | |
| `/admin/blog` (layout) | `pages/admin/modules/BlogModule.tsx` | Blog analytics nav | admin+ | ✅ |
| `/admin/blog/overview` | `pages/admin/AdminBlogOverview.tsx` | Blog overview | admin+ | ✅ |
| `/admin/blog/article-performance` | `pages/admin/AdminBlogPerformance.tsx` | Per-article analytics | admin+ | ✅ |
| `/admin/blog/reader-engagement` | `pages/admin/AdminBlogEngagement.tsx` | Reader behavior | admin+ | ✅ |
| **User Access Module** | | | | |
| `/admin/user-access` (layout) | `pages/admin/modules/UserAccessModule.tsx` | User access nav | admin+ | ✅ |
| `/admin/user-access/users` | `pages/admin/AdminUserAccessUsers.tsx` | Manage users | admin+ | ✅ |
| `/admin/user-access/roles` | `pages/admin/AdminUserAccessRoles.tsx` | Manage roles | **super_admin** | ✅ |
| `/admin/user-access/security` | `pages/admin/AdminUserAccessSecurity.tsx` | Security settings | admin+ | ✅ |
| **System Module** | | | | |
| `/admin/system` (layout) | `pages/admin/modules/SystemModule.tsx` | System nav | admin+ | ✅ |
| `/admin/system/settings` | `pages/admin/AdminSettings.tsx` | Site settings | **super_admin** | ✅ |
| `/admin/system/email-templates` | `pages/admin/AdminEmailTemplates.tsx` | Email templates | **super_admin** | ✅ |
| `/admin/system/audit-logs` | `pages/admin/AdminAuditLogs.tsx` | Admin audit log | **super_admin** | ✅ |

---

## Vercel Rewrites (vercel.json)

| Source | Destination | Purpose |
|---|---|---|
| `/ingest/:path*` | `https://us.i.posthog.com/:path*` | PostHog analytics proxy |
| `/sitemap.xml` | Supabase edge function | Dynamic XML sitemap |
| `/(anything without extension)` | `/index.html` | SPA fallback routing |

---

## OG Middleware Route Handling (middleware.ts)

| Pattern | Resolution Strategy |
|---|---|
| `/` | Static OG from STATIC_OG_MAP |
| `/about-us` | Static OG from STATIC_OG_MAP |
| `/services` | Static OG from STATIC_OG_MAP |
| `/blog/:slug` | Fetch from `blog_posts` table → OG |
| `/portfolio/:slug` | Fetch from `projects` table → OG |
| `/projects/:slug` | Fetch from `projects` table → OG |
| `/services/:category/:slug` | Static from SERVICE_OG_MAP |
| Anything else | Default OG (Cross Angle brand) |

/**
 * Admin panel route constants — single source of truth.
 *
 * Every admin nav link, breadcrumb label, and quick-action href should be read
 * from here. When a route changes, updating this file propagates to:
 *   - TopBar breadcrumb
 *   - AdminPageHeader breadcrumbs (via consumers passing these refs)
 *   - QuickActions
 *   - Postbuild static-route emission via scripts/admin-route-paths.js
 *
 * ⚠️  STATIC ROUTE SIDECAR
 *   `scripts/copy-indexes.js` cannot import TypeScript at build time (plain
 *   `node`, no tsx). When you add or remove a route here, mirror the path
 *   change in `scripts/admin-route-paths.js` (ADMIN_STATIC_PATHS array).
 *   Missing entries → 404 on hard-refresh in production.
 *
 * Invariants:
 *   - `path` must exactly match the live React Router path (including leading /).
 *   - `parent` references another route key for breadcrumb ancestry.
 *   - Keys are kebab-safe identifiers, not paths.
 */

export interface AdminRoute {
    readonly path: string;
    readonly label: string;
    readonly parent?: AdminRouteKey;
}

export const ADMIN_ROUTES = {
    /* ─── Root ─────────────────────────────────────────────────────────── */
    hub: { path: "/admin", label: "Admin Hub" },

    /* ─── Auth (unauthenticated) ──────────────────────────────────────── */
    auth: { path: "/admin/auth", label: "Login" },

    /* ─── Dashboard ────────────────────────────────────────────────────── */
    dashboard: { path: "/admin/dashboard", label: "Dashboard", parent: "hub" },

    /* ─── Access / User management ────────────────────────────────────── */
    access: { path: "/admin/access", label: "User Access", parent: "hub" },

    /* ─── CMS module ──────────────────────────────────────────────────── */
    cms: { path: "/admin/cms", label: "Content", parent: "hub" },
    cmsPortfolio: { path: "/admin/cms/portfolio", label: "Portfolio", parent: "cms" },
    cmsServices: { path: "/admin/cms/services", label: "Services", parent: "cms" },
    cmsTestimonials: { path: "/admin/cms/testimonials", label: "Testimonials", parent: "cms" },
    cmsTeam: { path: "/admin/cms/team", label: "Team", parent: "cms" },
    cmsBlogs: { path: "/admin/cms/blogs", label: "Articles", parent: "cms" },
    cmsMedia: { path: "/admin/cms/media", label: "Media Library", parent: "cms" },
    cmsHero: { path: "/admin/cms/hero", label: "Hero", parent: "cms" },
    cmsGallery: { path: "/admin/cms/gallery", label: "Gallery", parent: "cms" },
    cmsTransformations: { path: "/admin/cms/transformations", label: "Transformations", parent: "cms" },

    /* ─── CRM module ──────────────────────────────────────────────────── */
    crm: { path: "/admin/crm", label: "Client CRM", parent: "hub" },
    crmLeads: { path: "/admin/crm/leads", label: "Leads", parent: "crm" },

    /* ─── Discovery engine ────────────────────────────────────────────── */
    discovery: { path: "/admin/discovery", label: "Discovery Engine", parent: "hub" },
    discoveryAnalytics: {
        path: "/admin/discovery/analytics",
        label: "Analytics & Insights",
        parent: "discovery",
    },

    /* ─── Cost estimator ──────────────────────────────────────────────── */
    estimator: { path: "/admin/estimator", label: "Estimator", parent: "hub" },
    estimatorLeads: { path: "/admin/estimator/leads", label: "Estimate Leads", parent: "estimator" },
    estimatorRates: { path: "/admin/estimator/rates", label: "Estimate Rates", parent: "estimator" },

    /* ─── Blog analytics ──────────────────────────────────────────────── */
    blog: { path: "/admin/blog", label: "Blog Engine", parent: "hub" },
    blogOverview: { path: "/admin/blog/overview", label: "Overview", parent: "blog" },
    blogPerformance: { path: "/admin/blog/performance", label: "Performance", parent: "blog" },
    blogEngagement: { path: "/admin/blog/engagement", label: "Engagement", parent: "blog" },

    /* ─── System settings ─────────────────────────────────────────────── */
    system: { path: "/admin/system", label: "System Settings", parent: "hub" },
    systemSettings: { path: "/admin/system/settings", label: "General", parent: "system" },
    systemTeamMembers: { path: "/admin/system/team-members", label: "Team Members", parent: "system" },
    systemAudit: { path: "/admin/system/audit", label: "Logs & Audit", parent: "system" },
} satisfies Record<string, { path: string; label: string; parent?: string }>;

export type AdminRouteKey = keyof typeof ADMIN_ROUTES;

/* ─── Derived lookups ─────────────────────────────────────────────────── */

const ROUTE_BY_PATH: ReadonlyMap<string, AdminRouteKey> = new Map(
    (Object.entries(ADMIN_ROUTES) as [AdminRouteKey, AdminRoute][]).map(
        ([key, value]) => [value.path, key] as const,
    ),
);

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

/**
 * Build a breadcrumb trail for a given pathname, including all ancestors.
 *
 * - Matches exact path first, then falls back to longest path-prefix match
 *   (handles future nested detail routes like `/admin/cms/portfolio/:id`).
 * - The leading "Admin" root is intentionally omitted — `AdminBreadcrumb`
 *   prepends it automatically.
 * - The last item has no `href` (current page, rendered as plain text).
 */
export function breadcrumbsForPath(pathname: string): BreadcrumbItem[] {
    const key = resolveRouteKey(pathname);
    if (!key || key === "hub") return [];

    const chain: AdminRouteKey[] = [];
    let cursor: AdminRouteKey | undefined = key;
    const seen = new Set<AdminRouteKey>();

    while (cursor && !seen.has(cursor)) {
        seen.add(cursor);
        chain.unshift(cursor);
        cursor = (ADMIN_ROUTES[cursor] as AdminRoute).parent;
    }

    // Drop "hub" — AdminBreadcrumb renders the Admin root itself.
    const filtered = chain.filter((k) => k !== "hub");

    return filtered.map((k, idx) => {
        const route = ADMIN_ROUTES[k];
        const isLast = idx === filtered.length - 1;
        return isLast ? { label: route.label } : { label: route.label, href: route.path };
    });
}

function resolveRouteKey(pathname: string): AdminRouteKey | undefined {
    // Exact match first.
    const exact = ROUTE_BY_PATH.get(pathname);
    if (exact) return exact;

    // Longest prefix match (handles detail routes not yet listed).
    let bestKey: AdminRouteKey | undefined;
    let bestLen = 0;
    for (const [path, key] of ROUTE_BY_PATH) {
        if (pathname.startsWith(path + "/") && path.length > bestLen) {
            bestKey = key;
            bestLen = path.length;
        }
    }
    return bestKey;
}

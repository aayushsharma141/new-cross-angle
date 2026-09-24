import { BookOpen, Calculator, FileText, Settings, Shield, Users, type LucideIcon } from "lucide-react";
import type { AppRole } from "@/lib/auth/rbac";
import { CRM_WORKSPACE_NAV, isCrmNavLink } from "@/lib/crm";

// Also consumed by the RoleGuards in routes/adminRoutes.tsx, so nav visibility and route access can't drift.
export const ADMIN_ONLY: readonly AppRole[] = ["super_admin", "admin"];
export const CMS_ROLES: readonly AppRole[] = ["super_admin", "admin", "editor"];
export const CRM_ROLES: readonly AppRole[] = ["super_admin", "admin", "viewer"];
export const SUPER_ONLY: readonly AppRole[] = ["super_admin"];

export interface AdminNavSection {
    label: string;
    path: string;
    group?: string;
    /** Narrower than the module's roles when the route has its own RoleGuard. */
    roles?: readonly AppRole[];
    /** Linked from the module sidebar but its route is not registered yet. */
    pending?: boolean;
}

export interface AdminNavModule {
    id: "cms" | "crm" | "estimator" | "blog" | "user-access" | "system";
    name: string;
    icon: LucideIcon;
    roles: readonly AppRole[];
    sections: readonly AdminNavSection[];
}

const CRM_SECTION_ROLES: Record<string, readonly AppRole[]> = {
    analytics: ADMIN_ONLY,
    settings: ADMIN_ONLY,
};

export const ADMIN_MODULE_NAV: readonly AdminNavModule[] = [
    {
        id: "crm",
        name: "Client CRM",
        icon: Users,
        roles: CRM_ROLES,
        sections: CRM_WORKSPACE_NAV.filter(isCrmNavLink).map((item) => ({
            label: item.label,
            path: item.to,
            roles: CRM_SECTION_ROLES[item.id],
        })),
    },
    {
        id: "cms",
        name: "Website Content",
        icon: FileText,
        roles: CMS_ROLES,
        sections: [
            { label: "Projects", path: "/admin/cms/portfolio", group: "Main Content" },
            { label: "Blog Posts", path: "/admin/cms/blog-posts", group: "Main Content" },
            { label: "Services", path: "/admin/cms/services", group: "Main Content" },
            { label: "Testimonials", path: "/admin/cms/testimonials", group: "Main Content" },
            { label: "Team Members", path: "/admin/cms/team-members", group: "Main Content" },
            { label: "Visual Media Library", path: "/admin/cms/visual-media", group: "Visual Media" },
            { label: "Media Uploader", path: "/admin/cms/media-library", group: "Visual Media" },
            { label: "Project Gallery", path: "/admin/cms/gallery", group: "Visual Media Gallery" },
            { label: "Before & After", path: "/admin/cms/before-and-after", group: "Visual Media Gallery" },
            { label: "Hero Carousel", path: "/admin/cms/hero-carousel", group: "Visual Media Gallery" },
            { label: "Process Steps", path: "/admin/cms/process-steps", group: "Page Sections" },
            { label: "Milestones", path: "/admin/cms/milestones", group: "Page Sections" },
            { label: "Static Resources", path: "/admin/cms/site-assets", group: "Resources" },
        ],
    },
    {
        id: "estimator",
        name: "Quotes & Estimates",
        icon: Calculator,
        roles: ADMIN_ONLY,
        sections: [
            { label: "Quote Requests", path: "/admin/estimator/estimate-leads", group: "Quotes" },
            { label: "Pricing & Settings", path: "/admin/estimator/config", group: "Configuration", roles: SUPER_ONLY },
        ],
    },
    {
        id: "blog",
        name: "Blog & SEO",
        icon: BookOpen,
        roles: ADMIN_ONLY,
        sections: [
            { label: "Overview", path: "/admin/blog/overview", group: "Analytics" },
            { label: "Article Performance", path: "/admin/blog/article-performance", group: "Analytics" },
            { label: "Reader Engagement", path: "/admin/blog/reader-engagement", group: "Analytics" },
        ],
    },
    {
        id: "user-access",
        name: "Team & Security",
        icon: Shield,
        roles: ADMIN_ONLY,
        sections: [
            { label: "Team Members", path: "/admin/user-access/users", group: "Team Management" },
            { label: "Roles & Permissions", path: "/admin/user-access/roles", group: "Access Control", roles: SUPER_ONLY },
            { label: "Security Settings", path: "/admin/user-access/security", group: "Security" },
        ],
    },
    {
        id: "system",
        name: "System Settings",
        icon: Settings,
        roles: SUPER_ONLY,
        sections: [
            { label: "General Settings", path: "/admin/system/settings?tab=general", group: "Configuration" },
            { label: "Email Delivery", path: "/admin/system/settings?tab=reports", group: "Configuration" },
            { label: "Email Templates", path: "/admin/system/email-templates", group: "Configuration" },
            { label: "Integrations", path: "/admin/system/settings?tab=credentials", group: "Integrations" },
            { label: "Service Integrations", path: "/admin/system/service-integrations", group: "Integrations" },
            { label: "Maintenance", path: "/admin/system/settings?tab=updates", group: "Maintenance" },
            { label: "Audit Logs", path: "/admin/system/audit-logs", group: "Audit & Security" },
        ],
    },
];

export function getModuleSections(id: AdminNavModule["id"]): readonly AdminNavSection[] {
    return ADMIN_MODULE_NAV.find((m) => m.id === id)?.sections ?? [];
}

/** Whether a role can open a section: not pending, and not narrowed past this role. Role-less sections are visible while the role loads. */
export function isSectionVisible(section: AdminNavSection, role: AppRole | null | undefined): boolean {
    if (section.pending) return false;
    if (!section.roles) return true;
    return !!role && section.roles.includes(role);
}

/** Modules and sections this role can actually open (pending routes excluded). */
export function getVisibleModules(role: AppRole | null | undefined): AdminNavModule[] {
    if (!role) return [];
    return ADMIN_MODULE_NAV.filter((m) => m.roles.includes(role))
        .map((m) => ({
            ...m,
            sections: m.sections.filter((s) => isSectionVisible(s, role)),
        }))
        .filter((m) => m.sections.length > 0);
}

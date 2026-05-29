/**
 * Admin route paths — static emission sidecar.
 *
 * This is a plain-JS mirror of the path values in:
 *   src/lib/admin-routes.ts → ADMIN_ROUTES
 *
 * WHY A SIDECAR?
 *   `copy-indexes.js` runs under plain `node` (no tsx/ts-node). It cannot
 *   import TypeScript source directly. This file bridges that gap.
 *
 * KEEPING IN SYNC:
 *   If you add or remove a route in admin-routes.ts, mirror that change here.
 *   The postbuild step will emit a folder for every path listed — a missing
 *   entry means the deployed route returns 404 on hard-refresh.
 *
 *   Search: "admin-route-paths.js" to find all callers.
 */

/** @type {string[]} */
export const ADMIN_STATIC_PATHS = [
  // Root & auth (unauthenticated flows always need static pages)
  '/admin',
  '/admin/auth',
  '/admin/login',
  '/admin/reset-password',

  // Top-level standalone pages
  '/admin/dashboard',
  '/admin/access',

  // CMS module
  '/admin/cms',
  '/admin/cms/portfolio',
  '/admin/cms/services',
  '/admin/cms/testimonials',
  '/admin/cms/team',
  '/admin/cms/blogs',
  '/admin/cms/media',
  '/admin/cms/hero',
  '/admin/cms/gallery',
  '/admin/cms/transformations',

  // CRM module
  '/admin/crm',
  '/admin/crm/leads',

  // Discovery module
  '/admin/discovery',
  '/admin/discovery/analytics',

  // Cost estimator module
  '/admin/estimator',
  '/admin/estimator/leads',
  '/admin/estimator/rates',

  // Blog analytics module
  '/admin/blog',
  '/admin/blog/overview',
  '/admin/blog/performance',
  '/admin/blog/engagement',

  // System module
  '/admin/system',
  '/admin/system/settings',
  '/admin/system/team-members',
  '/admin/system/audit',
];

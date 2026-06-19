# UI/UX Audit Report — Cross Angle Interior

**Scope:** ~55 pages (public static, public slug/detail, admin CMS, admin CRM, admin system)
**Method:** Static source analysis of every route component
**Dimensions:** Visual Consistency, Accessibility, Responsive, Interaction UX, Form UX, Content Hierarchy, Navigation, Edge Cases, Component Patterns

---

## 00 — Global / Cross-Cutting Issues

### [CRITICAL] 00-01: CSS variable fragmentation
The app maintains multiple overlapping color systems:
- `index.css` has `--site-*` tokens (lines 78-100)
- `index.css` has theme-scoped `--primary`, `--muted`, etc. with HSL-based theming
- `tailwind.config.ts` maps `site: { crimson, gold, ... }` with hardcoded hex/rgba
- Admin sections use `--admin-*` variables
- BlogDetailPage, ProjectPage and others use **hardcoded inline hex values** (`#050505`, `#0c0c0c`, `#1a1a1a`, `#111`, `#222`)
- BlueprintPage.css defines its own `--accent`, `--gold`, `--muted` independently

**Fix:** Consolidate into a single token layer. Replace all inline color literals with CSS var references. Every page should use the same semantic tokens.

### [MAJOR] 00-02: No focus-visible ring on interactive elements
The `--focus-ring` token exists in `index.css` (line 59) but is not consistently applied. Many buttons, links, and interactive cards lack visible focus indicators. Some use Tailwind's `focus:ring` but without consistent styling.

**Fix:** Add a global `*:focus-visible` style using `--focus-ring`. Audit all clickable elements.

### [MAJOR] 00-03: Inconsistent dark/light mode support
The CSS has a light theme variant (`kiro` theme, index.css lines 120-170) but no page-level logic to activate it. All pages hardcode dark backgrounds. The `next-themes` package is listed in imports but appears unused.

**Fix:** Either remove light-mode theme if not intended, or wire up a proper theme toggle and ensure every page respects it.

### [MINOR] 00-04: No global `title`/document head management
Most pages don't set `<title>`, meta description, or Open Graph tags. Only BlogDetailPage sets `useEffect`-based document title. Pages like About, Services, Portfolio, etc. render without updating document head.

**Fix:** Create a `usePageMeta(title, description)` hook used on every route.

### [INFO] 00-05: Multiple `dangerouslySetInnerHTML` usages
BlogDetailPage (line 672) uses `dangerouslySetInnerHTML` with DOMPurify — this is acceptable but should be centralized via a shared `RichContent` component that all pages use, rather than each page implementing its own.

### [INFO] 00-06: Animation inconsistencies
Framer Motion `motion.div` variants use different duration/ease values across pages. `PageTransition` wraps public routes but admin pages have ad-hoc animations. Some admin pages use `animate-in fade-in duration-700` from Tailwind; others do not.

---

## 01 — IndexPage (Homepage)

### [MAJOR] 01-01: Hero overlays may clip on short viewports
Hero section relies on absolute positioning with large decorative elements. Below 600px height, content can overlap or overflow horizontally.

**Fix:** Test on mobile Safari/Chrome with dynamic viewport heights. Use `svh` units or `min-height: 100dvh`.

### [MINOR] 01-02: Lazy-loaded sections flash content
Sections use intersection observer / lazy reveal with no stable placeholder dimensions, causing layout shift as content loads and animates in.

**Fix:** Reserve space (min-height) for lazy sections matching their final rendered height.

### [INFO] 01-03: Feature/service cards use inconsistent border radii
`apps/web/src/pages/IndexPage.tsx` — some cards use `rounded-xl`, others `rounded-2xl`, some use custom `rounded-[2rem]`. No design-token consistency.

**Fix:** Define 2-3 border-radius tokens (`--radius-sm`, `--radius-md`, `--radius-lg`) and use them everywhere.

---

## 02 — AboutPage

### [MAJOR] 02-01: Border radius token explosion
The AboutPage uses classes like `rounded-[3rem]`, `rounded-[2.5rem]`, `rounded-[2.25rem]`, `rounded-[2rem]` — at least 4 different custom radii in one page (lines 158, 207, 237, 305, 369). This creates visual inconsistency.

**Fix:** Consolidate to 2-3 radii tokens. No arbitrary values.

### [MINOR] 02-02: Heavy shadow usage degrades performance
`shadow-[0_40px_100px_rgba(0,0,0,0.6)]`, `shadow-[0_20px_50px_rgba(0,0,0,0.4)]`, `shadow-[0_15px_45px_rgba(0,0,0,0.3)]` — complex box-shadows on multiple large elements can trigger paint bottlenecks, especially on mobile GPUs.

**Fix:** Reduce shadow complexity or use `filter: drop-shadow()` for GPU-accelerated rendering.

### [MINOR] 02-03: No image lazy-loading
Section images lack explicit `loading="lazy"` attributes. The custom `<Image>` component may handle this, but needs verification.

**Fix:** Ensure `loading="lazy"` on all below-the-fold images.

---

## 03 — OurProcessPage

### [MAJOR] 03-01: Process steps have no keyboard navigation
Steps are likely presented as cards with hover interactions but no `tabIndex` or keyboard event handlers to navigate between steps or trigger step expansions.

**Fix:** Add `tabIndex`, `onKeyDown` (Enter/Space) for all interactive step cards, with `aria-expanded` where applicable.

### [MINOR] 03-02: Stepped timeline may break on narrow screens
The visual step connector/line between process steps may overflow or break alignment on viewports below 400px. The timeline connector uses absolute positioning that may overlap text.

**Fix:** Test at 320px-375px widths. Consider collapsing to a vertical list without connector lines on mobile.

---

## 04 — ServicesPage

### [MAJOR] 04-01: Filter/state not persisted in URL
When users filter service categories, the selection is not reflected in URL params. Pressing browser back loses the filter state.

**Fix:** Use `useSearchParams` to persist `?category=` filter in URL.

### [MINOR] 04-02: Category cards use raw icon imports
`apps/web/src/pages/ServicesPage.tsx` — service icon rendering likely uses hardcoded import paths or `lucide-react` icon name string lookups without error fallback. If a service has an invalid icon name, the card breaks silently.

**Fix:** Add a safe icon resolver with a fallback (`<Building2 />` as default).

---

## 05 — ServiceCategoryPage

### [MAJOR] 05-01: No loading error boundary for Supabase query
`apps/web/src/pages/ServiceCategoryPage.tsx` — the page fetches services by slug from Supabase. If the slug is invalid, there may be no proper error UI (423, or empty state).

**Fix:** Add a `notFound` state check after fetch and render a "Category not found" message. Use React ErrorBoundary.

### [MINOR] 05-02: Slug page has no meta description
No document title or meta tag update for the specific category being viewed. All category pages show the same default page title.

---

## 06 — ServiceDetailPage

### [CRITICAL] 06-01: No loading skeleton
`apps/web/src/pages/ServiceDetailPage.tsx` — fetches service by slug but has no skeleton/loader UI. Page content appears as a blank flash then populates; layout shift occurs.

**Fix:** Show a skeleton matching the service detail layout dimensions while loading.

### [MAJOR] 06-02: Rich content body uses inline styles
The service description/content likely renders with `dangerouslySetInnerHTML` with inline hardcoded styles. This duplicates the BlogDetailPage pattern.

**Fix:** Centralize rich content rendering into a shared `<ContentRenderer>` component.

### [MAJOR] 06-03: No 404/back navigation for invalid slugs
If a user navigates to `/services/residential/nonexistent-service`, the page renders empty or broken with no "Go back" action.

**Fix:** Add not-found detection and render a fallback with navigation link to `/services`.

---

## 07 — PortfolioPage

### [MAJOR] 07-01: Filter state not in URL
`apps/web/src/pages/PortfolioPage.tsx` — category/status filters not persisted in URL search params.

**Fix:** Similar to ServicesPage, use `useSearchParams` for filter state.

### [MINOR] 07-02: Project cards lack alt text on thumbnails
Gallery/portfolio thumbnail images may have missing or generic alt attributes, hurting screen reader experience.

**Fix:** Ensure every `<Image>` or `<img>` has descriptive `alt` text derived from the project title.

---

## 08 — ProjectPage (Portfolio Detail)

### [MAJOR] 08-01: Journey height uses dynamic JS
`apps/web/src/pages/ProjectPage.tsx:338` — `style={{ height: journeyHeight }}` sets container height via JS state. If calculation is off, content clips or leaves excess whitespace.

**Fix:** Prefer CSS-based sizing or auto-height with scroll-based activation rather than JS-measured heights.

### [MAJOR] 08-02: Previous/next navigation not keyboard accessible
`onClick={() => navigate(...)}` on lines 450, 479 — these navigation elements may not be `<button>` or `<a>` elements, breaking keyboard navigation.

**Fix:** Use `<Link>` components or `<button>` with proper roles for prev/next navigation.

### [MINOR] 08-03: No meta tags for social sharing
Project detail pages are the most likely to be shared, yet lack OG tags, Twitter cards, or canonical URLs.

**Fix:** Set `og:title`, `og:image`, `og:description` dynamically.

---

## 09 — GalleryPage

### [MAJOR] 09-01: Category filter lacks accessible label
`apps/web/src/pages/GalleryPage.tsx` — category filter buttons/tabs may not have `aria-label` or `aria-controls` associations.

**Fix:** Add proper ARIA attributes to filter controls.

### [MINOR] 09-02: Lightbox may not trap focus
If gallery items open a lightbox/modal, keyboard focus may not be trapped within the modal.

**Fix:** Implement focus trapping in the lightbox component.

### [MINOR] 09-03: Image grid has no layout-shift protection
Without fixed aspect-ratio containers, images loading lazily cause cumulative layout shift.

**Fix:** Wrap each gallery image in a container with `aspect-w-4 aspect-h-3` or explicit `aspect-ratio` CSS.

---

## 10 — BlogPage

### [MINOR] 10-01: Blog cards lack publish date formatting consistency
`apps/web/src/pages/BlogPage.tsx` — date format may differ from BlogDetailPage. One might use "Jan 15, 2025" while another uses "2025-01-15".

**Fix:** Use a shared `formatDate` utility consistently.

### [INFO] 10-02: No infinite scroll or pagination indicator
Blog list doesn't show total article count or pagination. If there are 50+ posts, users have no sense of scale.

**Fix:** Add "Showing X of Y articles" text and pagination or "Load more" button.

---

## 11 — BlogDetailPage

### [MAJOR] 11-01: Excessive inline styles and hardcoded colors
`apps/web/src/pages/BlogDetailPage.tsx` — this page is the worst offender for inline styling:
- `style={{ background: "#050505" }}` used on multiple elements (lines 450, 470, 504)
- `style={{ background: "#111", borderColor: "#222" }}` (line 258)
- `style={{ color: CRIMSON }}` (line 268) — uses imported JS constant instead of CSS var
- `style={{ background: CRIMSON, color: "#fff" }}` (lines 283, 478)
- `style={{ background: "#0c0c0c", borderColor: "#1e1e1e", color: "#666" }}` (lines 605, 618, 629)

**Fix:** Replace ALL inline styles with Tailwind utility classes or reference CSS custom properties. Create a `blog-content` CSS module.

### [MAJOR] 11-02: `dangerouslySetInnerHTML` with client-side sanitization
Line 672: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(...) }}` — This relies on client-side DOMPurify which adds ~10KB to the bundle. Server-side sanitization would be preferred.

**Fix:** Sanitize content at write-time (admin panel), store clean HTML, render directly.

### [MAJOR] 11-03: Hardcoded CRIMSON constant
The page imports a JS constant `CRIMSON` directly. This creates a dependency on a JS module that might not be updated if the brand color changes, and won't respond to theme changes.

**Fix:** Use CSS variable `var(--site-crimson)` or Tailwind class `text-site-crimson` instead of JS constant.

### [MAJOR] 11-04: Share buttons not keyboard navigable
Lines 602, 610, 626 — share buttons use `onClick` handlers but likely aren't `<button>` elements. No `aria-label` on share icons.

**Fix:** Use `<button>` elements with `aria-label="Share on LinkedIn"` etc.

### [MINOR] 11-05: In-article estimator CTA has no focus management
Line 261: `onClick={() => setDismissed(true)}` — if the estimator CTA banner is dismissed, focus is not returned to the triggering element.

### [MINOR] 11-06: No table of contents for long articles
Articles can be very long but lack a sticky ToC or "scroll to top" button on mobile.

---

## 12 — ContactPage

### [MAJOR] 12-01: Form validation errors lack live region
`apps/web/src/pages/ContactPage.tsx` — form validation errors appear on submit but may not be announced to screen readers (`aria-live` region missing).

**Fix:** Wrap error summary with `role="alert"` or `aria-live="polite"`.

### [MINOR] 12-02: Phone input: no pattern or type="tel"
Phone field may not use `type="tel"` with appropriate `inputmode` and pattern, hampering mobile keyboard UX.

**Fix:** `<input type="tel" inputMode="numeric" pattern="[0-9+\- ]{7,15}" />`.

### [MINOR] 12-03: Success state may not persist
After form submission, success message may be lost on page refresh. No URL state to indicate successful submission.

**Fix:** Set `?submitted=true` in URL on success, celebrate with confetti/visual confirmation.

---

## 13 — PriceEstimator

### [MAJOR] 13-01: Multi-step form loses state on refresh
`apps/web/src/addons/calculators/pages/PriceEstimator.tsx` — if the user refreshes during the multi-step flow, all progress is lost.

**Fix:** Persist step and selections in localStorage or URL params.

### [MAJOR] 13-02: Step indicator not announced to screen readers
The step progress (Step 1 of 5) likely uses visual indicators only without `aria-current="step"` or `aria-label`.

**Fix:** Add `aria-current="step"` on active step indicator, `role="progressbar"` with `aria-valuenow`.

### [MINOR] 13-03: Cost summary may not update reactively
If the user changes selections and returns to a previous step, the cost summary may not recalculate immediately.

**Fix:** Ensure all cost calculations derive from a single state atom that recalculates on any change.

---

## 14 — DiscoveryPage & SharedResultPage

### [MAJOR] 14-01: Quiz progress not persisted
`apps/web/src/addons/discovery/pages/DiscoveryPage.tsx` — similar to PriceEstimator, quiz progress is lost on page refresh.

**Fix:** Persist quiz answers to sessionStorage or localStorage.

### [MAJOR] 14-02: Shared results lack fallback UI
`apps/web/src/addons/discovery/pages/SharedResultPage.tsx` — if a shared result link references an expired or invalid archetype ID, there's likely no graceful error state.

**Fix:** Add fallback: "This design archetype result is no longer available."

### [INFO] 14-03: BlueprintPage has its own CSS file
`apps/web/src/addons/discovery/pages/BlueprintPage.css` — standalone CSS file with hardcoded colors (`#D1AF6E`, `#D4C4A0`, `#BFA27A`, `#7A7671`) instead of using Tailwind or CSS variables. This duplicates the global accent color definitions.

**Fix:** Remove BlueprintPage.css and use Tailwind classes / CSS var references.

---

## 15 — LocationPage

### [MAJOR] 15-01: No fallback for missing location data
`apps/web/src/pages/LocationPage.tsx` — if the slug doesn't match any location, page likely renders empty or broken.

**Fix:** Add not-found fallback.

### [MINOR] 15-02: Google Maps / embed may violate privacy
If an embedded map or third-party service loads without user consent, this may conflict with GDPR/ePrivacy requirements.

**Fix:** Lazy-load maps only after user interaction or consent confirmation.

---

## 16 — AdminAuth (Login Page)

### [MINOR] 16-01: No "show password" toggle
`apps/web/src/pages/admin/AdminAuth.tsx` — password field lacks a visibility toggle, hurting usability for admin users typing complex passwords.

**Fix:** Add an eye icon toggle on the password input.

### [MINOR] 16-02: Error messages may be too generic
Failed login may show "Invalid credentials" without distinguishing between "user not found" vs "wrong password", which is also a security feature — acceptable but could be confusing.

**Fix:** Acceptable as-is, but ensure error includes actionable guidance: "Check your email and password."

---

## 17 — AdminLayout & AdminHub

### [MAJOR] 17-01: Sidebar not collapsible on desktop
`apps/web/src/pages/admin/AdminLayout.tsx` — admin sidebar may be fixed-width with no collapse/expand toggle, occupying valuable screen real estate on wide monitors.

**Fix:** Add a collapsible sidebar toggle with icon-only mode.

### [MAJOR] 17-02: No breadcrumb navigation
AdminLayout has no breadcrumb trail. Users deep in pages (e.g., Blog > Edit Post > Settings) have no navigation context or path back.

**Fix:** Add breadcrumbs based on current route segments.

### [MINOR] 17-03: Mobile sidebar may not trap focus
If sidebar opens as an overlay on mobile, focus may not be trapped within the sidebar, allowing tab to content behind the overlay.

**Fix:** Implement focus trapping when mobile sidebar is open.

---

## 18 — AdminDashboard

### [MAJOR] 18-01: KPI cards lack trend direction
`apps/web/src/pages/admin/AdminDashboard.tsx` — metric cards show current values but don't indicate trend (up/down vs previous period).

**Fix:** Add delta indicators with arrows and percentage change.

### [MINOR] 18-02: Charts may be inaccessible
If dashboard uses Chart.js or Recharts, chart data may not be available to screen readers.

**Fix:** Add `aria-label` descriptions for charts or provide data tables as fallback.

---

## 19 — AdminPortfolio

### [MAJOR] 19-01: Deep-link slug edit handled after initial render
`apps/web/src/pages/admin/AdminPortfolio.tsx:38-46` — deep-link slug matching runs in a `useEffect` after `projects` loads. If the user navigates directly to `?edit=some-slug`, there's a visible flash of the list before the form opens.

**Fix:** Initiate form opening synchronously during query initialization or show a loading state.

### [MINOR] 19-02: Metrics show raw counts without context
`apps/web/src/pages/admin/AdminPortfolio.tsx:65-69` — metric cards show numeric values (e.g., "3 Drafts") but don't indicate what "Drafts" means or how to act on it.

**Fix:** Make metric cards clickable to filter/scroll to relevant items.

---

## 20 — AdminServices

### [MAJOR] 20-01: Mixed component import sources
`apps/web/src/pages/admin/AdminServices.tsx:4-5` — imports `Button` from `@/design-system/components/Button` but `Input` from `@/components/ui/primitives/input`. Two different design system entry points.

**Fix:** Standardize on one import source per component type.

### [MAJOR] 20-02: Form state uses `Partial<ServiceDetail>` with empty strings
`apps/web/src/pages/admin/AdminServices.tsx:61` — `formData` initialized with `title: ""`, etc. Empty strings are ambiguous with "not set". Arrays like `features: []` make it impossible to distinguish "no features" from "not loaded."

**Fix:** Use nullable fields (`title: null`) and handle null/undefined renders.

### [MAJOR] 20-03: Icon selector allows invalid input
Line 29: `ICONS = ["Home", "Building2", ...]` — if a service has an icon name not in this list, the icon won't render but no fallback displays.

**Fix:** Use a safe icon resolver with default fallback icon.

---

## 21 — AdminLeads (CRM)

### [MAJOR] 21-01: Search debounce has no loading indicator
`apps/web/src/pages/admin/AdminLeads.tsx:61-65` — 300ms debounce on search is good, but there's no visual feedback during the debounce period. User types and nothing appears to happen for 300ms.

**Fix:** Show a subtle spinner or "Searching..." text during debounce.

### [MAJOR] 21-02: URL params for filters missing for some
Filter state is partially in URL (`stage`, `view`, `source`, `sort`) but the text search query is not persisted in URL. Refreshing the page loses the search term.

**Fix:** Add `q` search param and sync searchQuery with it bidirectionally.

### [MINOR] 21-03: Lead detail sheet might not trap focus
`LeadDetailSheet` is a slide-over panel. If not using a properly accessible dialog pattern, keyboard users can tab to background content.

**Fix:** Ensure sheet uses Radix Dialog with focus trapping.

---

## 22 — AdminBlogs

### [MAJOR] 22-01: Tab-based navigation loses unsaved editor state
`apps/web/src/pages/admin/AdminBlogs.tsx` — switching from "editor" tab to "all" tab via `handleCancel` discards unsaved work without confirmation dialog.

**Fix:** Add `beforeunload` event and confirmation when navigating away with dirty form state.

### [MINOR] 22-02: Deep-link edit slug from URL may fail silently
Lines 23-35 — if `editSlug` is set but the slug doesn't exist in the database, the page remains on the "all" tab with no error message or toast.

**Fix:** Toast an error if the deep-link slug isn't found.

---

## 23 — CrmAnalytics & AdminQuizAnalytics

### [MAJOR] 23-01: Chart data not accessible
`apps/web/src/pages/admin/CrmAnalytics.tsx`, `AdminQuizAnalytics.tsx` — analytics charts likely render visual-only data. Screen reader users cannot perceive trends.

**Fix:** Add `role="img"` with `aria-label` summarizing chart data, or provide a hidden data table.

### [MINOR] 23-02: No date range presets
Analytics pages may only have a custom date picker without quick presets (Last 7 days, This month, Last quarter).

**Fix:** Add preset buttons before date picker.

---

## 24 — AdminBlogPerformance & AdminBlogEngagement

### [MAJOR] 24-01: Inline admin CSS variable usage repeated
`apps/web/src/pages/admin/AdminBlogPerformance.tsx` — multiple elements use `style={{ background: "hsl(var(--admin-...))" }}` instead of Tailwind classes. This defeats the purpose of the CSS variable system and makes the code verbose.

**Fix:** Use Tailwind classes like `bg-[hsl(var(--admin-card))]` → define a custom class or use the `admin:` prefix classes from tailwind config.

### [MINOR] 24-02: No empty state when no blog articles exist
Both performance and engagement pages assume data exists. On a fresh install with zero blog posts, these pages show empty charts and tables with no guidance.

**Fix:** Show `EmptyState` with "Create your first blog post to see analytics."

---

## 25 — AdminUserAccess (Users, Roles, Security)

### [MAJOR] 25-01: Role deletion may leave orphaned users
`apps/web/src/pages/admin/AdminUserAccessRoles.tsx` — deleting a role doesn't show which users will be affected.

**Fix:** Before deleting a role, show a dialog listing affected users and suggesting a replacement role.

### [MINOR] 25-02: No inline help for permission scopes
`apps/web/src/pages/admin/AdminUserAccessRoles.tsx` — permission checkboxes lack descriptions explaining what each permission enables.

**Fix:** Add tooltip or description text for each permission.

---

## 26 — AdminSettings

### [MAJOR] 26-01: No unsaved changes warning
`apps/web/src/pages/admin/AdminSettings.tsx` — system settings form has no "unsaved changes" detection. Navigating away loses all input.

**Fix:** Track dirty state and show confirmation on navigation.

### [MINOR] 26-02: Save button disabled state not communicated
Save button may disable during save but without changing appearance sufficiently for visual understanding.

**Fix:** Show spinner + "Saving..." text on the button during mutation.

---

## 27 — AdminAuditLogs

### [MAJOR] 27-01: No real-time refresh
Audit logs are likely fetched once on mount. If another admin performs an action, logs are stale until manual refresh.

**Fix:** Add auto-polling every 30s or a "Refresh" button.

### [MINOR] 27-02: Log entries not filterable by action type
Users may want to filter by "create", "delete", "update" actions. If only a text search exists, structured filtering is missing.

**Fix:** Add action type filter dropdown.

---

## 28 — AdminEmailTemplates

### [MAJOR] 28-01: No preview mode
`apps/web/src/pages/admin/AdminEmailTemplates.tsx` — editing email HTML in a textarea with no live preview. Admin can't see how the rendered email looks.

**Fix:** Add a split-pane preview using `iframe` with `srcdoc`.

### [MINOR] 28-02: Template variables not documented
If email templates use `{{variable}}` placeholders, there's likely no legend showing available variables.

**Fix:** Add a "Available Variables" panel showing each variable with description.

---

## 29 — AdminMedia

### [MAJOR] 29-01: Drag-and-drop zone has no keyboard alternative
`apps/web/src/pages/admin/AdminMedia.tsx` — file upload likely relies on drag-and-drop, which is inaccessible to keyboard-only users.

**Fix:** Add a visible "Browse files" button alongside the drop zone. Ensure the drop zone is keyboard-accessible.

### [MINOR] 29-02: No bulk select / batch operations
Media library may only support single-file actions. Managing many files (delete 20 images) requires repetitive actions.

**Fix:** Add checkbox selection with batch delete.

---

## 30 — Remaining Admin Pages (Hero, Gallery, Before&After, Milestones, ProcessSteps, Team, Testimonials, SiteAssets, DiscoveryConfig, EstimateLeads, PricingConfig)

### [MAJOR] 30-01: Inconsistent form pattern across CMS modules
- **AdminHero** (592 lines): Inline editing state with 8 `useState` vars for edit fields (lines 53-60)
- **AdminGallery** (670 lines): Uses `useQuery/useMutation` with `Dialog` form
- **AdminBeforeAndAfter** (377 lines): Uses a custom `MediaInput` wrapper (lines 25-60)
- **AdminMilestones** (322 lines): Uses `DataTable` from admin UI
- **AdminProcessSteps** (480 lines): Uses inline dialog with `MediaPickerField`
- **AdminTeam** (326 lines): Uses `DataTable` with `Dialog` form
- **AdminTestimonials** (311 lines): Uses `TestimonialFormDialog` sub-component

Each page implements CRUD differently — some use inline editing, some use dialogs, some use DataTable. Different icon libraries, different button components, different form validation approaches.

**Fix:** Create a shared `AdminCrudPage<T>` higher-level pattern or a consistent form dialog component used across all modules.

### [MINOR] 30-02: Reorder functionality absent from most CMS lists
Only AdminHero uses `framer-motion` `Reorder` for drag-to-reorder. AdminMilestones, AdminTeam, AdminProcessSteps, AdminTestimonials all have `display_order` fields but no visual drag-and-drop reordering.

**Fix:** Add drag-reorder to all list-based admin pages.

### [MINOR] 30-03: No bulk actions on any CMS page
Every CMS page operates on one item at a time. No batch publish/unpublish/delete.

---

## 31 — AdminSiteAssets

### [MAJOR] 31-01: Uses `useState` + `useEffect` instead of React Query
`apps/web/src/pages/admin/AdminSiteAssets.tsx` — data fetching uses manual `useState` + `useEffect` pattern (lines 27-37) instead of `useQuery`. This means:
- No automatic retry on failure
- No caching
- No stale-while-revalidate
- Manual loading state management

**Fix:** Refactor to use `useQuery` like the rest of the admin pages.

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| CRITICAL | 4     |
| MAJOR    | 41    |
| MINOR    | 27    |
| INFO     | 5     |
| **Total** | **77** |

## Top Priority Fixes

1. **00-01**: Eliminate inline hardcoded colors — consolidate CSS variable system
2. **06-01, 11-01, 11-03**: BlogDetailPage and ServiceDetailPage need skeleton loaders and removal of inline styles
3. **30-01**: Standardize admin CMS CRUD patterns across all 10+ modules
4. **00-04**: Implement global `usePageMeta` hook for document head management
5. **12-01, 31-01**: Fix form accessibility (live regions) and refactor legacy `useState+useEffect` patterns

---

## Appendix: Files Referenced

- `apps/web/src/index.css`
- `apps/web/tailwind.config.ts`
- `apps/web/src/routes/publicRoutes.tsx`
- `apps/web/src/routes/adminRoutes.tsx`
- `apps/web/src/lib/admin-routes.ts`
- `apps/web/src/pages/IndexPage.tsx`
- `apps/web/src/pages/AboutPage.tsx`
- `apps/web/src/pages/OurProcessPage.tsx`
- `apps/web/src/pages/ServicesPage.tsx`
- `apps/web/src/pages/ServiceCategoryPage.tsx`
- `apps/web/src/pages/ServiceDetailPage.tsx`
- `apps/web/src/pages/PortfolioPage.tsx`
- `apps/web/src/pages/ProjectPage.tsx`
- `apps/web/src/pages/GalleryPage.tsx`
- `apps/web/src/pages/BlogPage.tsx`
- `apps/web/src/pages/BlogDetailPage.tsx`
- `apps/web/src/pages/ContactPage.tsx`
- `apps/web/src/pages/LocationPage.tsx`
- `apps/web/src/pages/PrivacyPage.tsx`
- `apps/web/src/pages/TermsPage.tsx`
- `apps/web/src/pages/NotFound.tsx`
- `apps/web/src/addons/calculators/pages/PriceEstimator.tsx`
- `apps/web/src/addons/discovery/pages/DiscoveryPage.tsx`
- `apps/web/src/addons/discovery/pages/SharedResultPage.tsx`
- `apps/web/src/addons/discovery/pages/BlueprintPage.tsx`
- `apps/web/src/addons/discovery/pages/BlueprintPage.css`
- `apps/web/src/pages/admin/AdminAuth.tsx`
- `apps/web/src/pages/admin/AdminLayout.tsx`
- `apps/web/src/pages/admin/AdminHub.tsx`
- `apps/web/src/pages/admin/AdminDashboard.tsx`
- `apps/web/src/pages/admin/AdminHero.tsx`
- `apps/web/src/pages/admin/AdminPortfolio.tsx`
- `apps/web/src/pages/admin/AdminServices.tsx`
- `apps/web/src/pages/admin/AdminGallery.tsx`
- `apps/web/src/pages/admin/AdminBeforeAndAfter.tsx`
- `apps/web/src/pages/admin/AdminMilestones.tsx`
- `apps/web/src/pages/admin/AdminProcessSteps.tsx`
- `apps/web/src/pages/admin/AdminTeam.tsx`
- `apps/web/src/pages/admin/AdminTestimonials.tsx`
- `apps/web/src/pages/admin/AdminSiteAssets.tsx`
- `apps/web/src/pages/admin/AdminLeads.tsx`
- `apps/web/src/pages/admin/AdminBlogs.tsx`
- `apps/web/src/pages/admin/AdminBlogOverview.tsx`
- `apps/web/src/pages/admin/AdminBlogPerformance.tsx`
- `apps/web/src/pages/admin/AdminBlogEngagement.tsx`
- `apps/web/src/pages/admin/CrmAnalytics.tsx`
- `apps/web/src/pages/admin/CrmSettings.tsx`
- `apps/web/src/pages/admin/AdminQuizAnalytics.tsx`
- `apps/web/src/pages/admin/AdminDiscoveryConfig.tsx`
- `apps/web/src/pages/admin/AdminEstimateLeads.tsx`
- `apps/web/src/pages/admin/AdminPricingConfig.tsx`
- `apps/web/src/pages/admin/AdminUserAccessUsers.tsx`
- `apps/web/src/pages/admin/AdminUserAccessRoles.tsx`
- `apps/web/src/pages/admin/AdminUserAccessSecurity.tsx`
- `apps/web/src/pages/admin/AdminSettings.tsx`
- `apps/web/src/pages/admin/AdminAuditLogs.tsx`
- `apps/web/src/pages/admin/AdminEmailTemplates.tsx`
- `apps/web/src/pages/admin/AdminMedia.tsx`

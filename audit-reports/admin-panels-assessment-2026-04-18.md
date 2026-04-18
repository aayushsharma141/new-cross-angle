# Admin Panel Technical Audit

Date: 2026-04-18
Workspace: `C:\Users\aayus\Desktop\main`
Primary Scope: `apps/web` admin routes, admin pages, admin CRUD flows, shared auth/RBAC, service integrations, practical verification coverage
Audit Perspective: Senior Full-Stack QA Engineer and System Architect

## Executive Summary

The admin panel has a workable structural base: the route tree is coherent, authentication and role-gating primitives exist, several important forms are validated with Zod, and the web build completes successfully. The module is not fundamentally broken.

The main risk is not basic rendering. The risk is operational trustworthiness. A few important areas currently weaken confidence in production administration:

1. Automated verification is not exercising real authenticated admin behavior.
2. Several CRUD paths lack consistent audit logging.
3. Some UI controls imply persisted workflow state even when no such persistence exists.
4. A few async flows are non-transactional and can leave related records or storage state partially updated.
5. Some status and dashboard behaviors can misrepresent real backend state.

## Audit Method

- Reviewed the live admin router in [App.tsx](C:\Users\aayus\Desktop\main\apps\web\src\App.tsx:155).
- Reviewed auth and authorization controls in:
  - [AuthProvider.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\auth\AuthProvider.tsx:1)
  - [AuthGuard.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\auth\AuthGuard.tsx:1)
  - [RoleGuard.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\RoleGuard.tsx:1)
  - [rbac.ts](C:\Users\aayus\Desktop\main\apps\web\src\lib\auth\rbac.ts:1)
- Reviewed representative CRUD/admin modules:
  - [AdminDashboard.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminDashboard.tsx:1)
  - [AdminUsers.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminUsers.tsx:1)
  - [AdminEstimateLeads.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminEstimateLeads.tsx:1)
  - [AdminServices.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminServices.tsx:1)
  - [AdminMedia.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx:1)
  - [AdminBlogs.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminBlogs.tsx:1)
  - [AdminTeamMembers.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminTeamMembers.tsx:1)
- Reviewed validation and micro-function behavior in:
  - [UserFormSheet.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\users\UserFormSheet.tsx:1)
  - [LeadDetailSheet.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\leads\LeadDetailSheet.tsx:1)
  - [GeneralSettingsForm.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\settings\GeneralSettingsForm.tsx:1)
- Reviewed audit infrastructure:
  - [AuditService.ts](C:\Users\aayus\Desktop\main\apps\web\src\services\AuditService.ts:1)
  - [UserService.ts](C:\Users\aayus\Desktop\main\apps\web\src\services\UserService.ts:1)
  - [AdminAuditLogs.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminAuditLogs.tsx:1)
- Reviewed verification/build support:
  - [copy-indexes.js](C:\Users\aayus\Desktop\main\apps\web\scripts\copy-indexes.js:1)
  - [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:1)

## Practical Validation

### Build Validation

Command run:

```powershell
npm.cmd run build --workspace=web
```

Observed result:

- Passed
- Admin bundle compiled successfully
- Postbuild route-copy completed
- The route-copy output itself exposed stale route drift, which is documented below

### E2E Validation

Command run:

```powershell
npx.cmd playwright test e2e/admin-interactions.spec.ts --project=chromium
```

Observed result:

- `12 passed`
- `1 failed`
- `62 did not run`

Failure behavior:

- The first failing admin test expected the leads grid but landed on the sign-in page instead.
- Captured evidence shows the suite was not operating inside an authenticated admin session.
- The suite therefore does not currently prove authenticated admin CRUD behavior.

## Confirmed Operational

### Confirmed Operational: Routing and Module Structure

- The live admin route hierarchy in [App.tsx](C:\Users\aayus\Desktop\main\apps\web\src\App.tsx:155) is internally coherent and grouped by domain:
  - `/admin/dashboard`
  - `/admin/access`
  - `/admin/cms/*`
  - `/admin/crm/*`
  - `/admin/discovery/*`
  - `/admin/estimator/*`
  - `/admin/blog/*`
  - `/admin/system/*`
- The route organization is suitable for modular growth and role-based segmentation.

### Confirmed Operational: RBAC Foundation

- Authenticated access protection exists through [AuthGuard.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\auth\AuthGuard.tsx:1).
- Role-based gating exists through [RoleGuard.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\RoleGuard.tsx:11).
- Shared role definitions are centralized in [rbac.ts](C:\Users\aayus\Desktop\main\apps\web\src\lib\auth\rbac.ts:1).
- The access-control model is materially present and not limited to cosmetic UI hiding.

### Confirmed Operational: User Management API Invocation Pattern

- [UserFormSheet.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\users\UserFormSheet.tsx:97) uses `zodResolver(userFormSchema)` for input validation before submission.
- The create/update flows explicitly inspect both transport-level errors and application-level `data?.error` from edge functions:
  - `invite-user` at [line 120](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\users\UserFormSheet.tsx:120)
  - `manage-user` at [line 150](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\users\UserFormSheet.tsx:150)
- This is a good example of API response mapping and defensive error handling.

### Confirmed Operational: Validation in High-Risk Forms

- [LeadDetailSheet.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\leads\LeadDetailSheet.tsx:151) uses `leadSchema.safeParse(formData)` and surfaces human-readable validation errors through `formatZodErrors(...)`.
- [AdminServices.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminServices.tsx:185) validates service payloads using `serviceSchema.safeParse(formData)` before write operations.
- These patterns reduce malformed writes and show that at least part of the admin surface has proper micro-function validation.

### Confirmed Operational: Targeted Operational Logging in Lead Workflow

- [LeadDetailSheet.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\leads\LeadDetailSheet.tsx:131) records activity into `lead_activities`.
- This is not the same as centralized audit logging, but it is a positive signal that the lead workflow has at least localized activity tracking.

### Confirmed Operational: Empty-State Handling in Estimate Leads

- [AdminEstimateLeads.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminEstimateLeads.tsx:1) now safely handles empty Supabase responses via `(data ?? [])`, which prevents a class of null/undefined list failures.

### Confirmed Operational: Audit Log Read/Export Surface Exists

- [AuditService.ts](C:\Users\aayus\Desktop\main\apps\web\src\services\AuditService.ts:5) provides paginated reads, entity/user filtering, recent activity, stats, unique users, and export functions for `audit_logs`.
- [AdminAuditLogs.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminAuditLogs.tsx:10) is wired to that service.
- The audit-reading/reporting layer exists; the main gap is write coverage across all CRUD modules.

## Requires Attention/Fix

### Critical

#### 1. Automated admin verification is not exercising authenticated workflows

Files:
- [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:136)
- [error-context.md](C:\Users\aayus\Desktop\main\test-results\admin-interactions-Admin-D-7b6cf-ions-Table-headers-sortable-chromium\error-context.md:1)

Why it matters:

- The current test suite does not establish a real authenticated admin session.
- A protected admin route was validated against the sign-in screen instead of the target module.
- This means the primary practical verification layer for the admin panel is currently unreliable.

Operational risk:

- Regressions in actual admin CRUD flows can ship while the suite still appears partially healthy.

Recommended fix:

- Add authenticated setup through Playwright `storageState` or a deterministic login helper.
- Separate unauthenticated access tests from authenticated workflow tests.
- Remove pass-by-swallow patterns such as assertions wrapped in `.catch(() => {})`.

#### 2. Audit logging coverage is incomplete across most admin CRUD modules

Files:
- [AuditService.ts](C:\Users\aayus\Desktop\main\apps\web\src\services\AuditService.ts:5)
- [UserService.ts](C:\Users\aayus\Desktop\main\apps\web\src\services\UserService.ts:193)
- [AdminServices.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminServices.tsx:219)
- [AdminMedia.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx:113)
- [AdminBlogs.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminBlogs.tsx:232)
- [SupabaseLeadRepo.ts](C:\Users\aayus\Desktop\main\apps\web\src\repositories\SupabaseLeadRepo.ts:1)

Why it matters:

- The system has an audit log reader/exporter and `UserService` writes into `audit_logs`, but that write pattern is not consistently applied across the other admin CRUD modules.
- Most content modules write directly to Supabase tables without a mirrored audit event.

Operational risk:

- Administrative changes can occur without a durable central audit trail.
- This weakens accountability, incident review, rollback analysis, and compliance posture.

Recommended fix:

- Introduce a shared write-side audit helper and call it for all create/update/delete operations.
- Prefer wrapping domain write + audit write together in a single server-side operation when possible.
- At minimum, cover CMS, CRM, media, estimator, and settings mutations.

### High

#### 3. Static deep-link generation is out of sync with the real admin router

Files:
- [copy-indexes.js](C:\Users\aayus\Desktop\main\apps\web\scripts\copy-indexes.js:35)
- [App.tsx](C:\Users\aayus\Desktop\main\apps\web\src\App.tsx:155)

Issue:

- The postbuild route-copy script still emits legacy folders like `/admin/projects`, `/admin/leads`, and `/admin/settings`.
- The real router serves current module paths like `/admin/cms/portfolio`, `/admin/crm/leads`, and `/admin/system/settings`.

Operational risk:

- Direct navigation and refresh behavior can fail on static hosting for active admin routes.

Recommended fix:

- Replace the legacy route list with the actual route map from `App.tsx`.
- Prefer generating static route folders from a single shared route constant to eliminate drift.

#### 4. The Playwright suite also contains stale and nonexistent admin routes

Files:
- [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:254)
- [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:368)
- [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:426)
- [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:553)
- [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:631)
- [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:668)
- [admin-interactions.spec.ts](C:\Users\aayus\Desktop\main\e2e\admin-interactions.spec.ts:698)

Examples:

- `/admin/crm/pipeline`
- `/admin/cms/blogs/new`
- `/admin/settings`
- `/admin/users`
- `/admin/crm/leads/new`
- `/admin/team`
- `/admin/testimonials`

Operational risk:

- Even after auth is fixed, the suite would still validate routes that no longer exist in the live router.

Recommended fix:

- Rewrite route coverage against the current router.
- Use shared route constants or a test route manifest derived from the application route tree.

#### 5. `GeneralSettingsForm` contains an invalid hook usage pattern

File:
- [GeneralSettingsForm.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\settings\GeneralSettingsForm.tsx:473)

Issue:

- `useState("")` is called inside a `FormField` render callback.

Operational risk:

- This violates React hook rules and can produce unstable rerender behavior or runtime errors.

Recommended fix:

- Extract that sub-editor into its own component and keep hooks at the component top level.
- Reinstate lint coverage that enforces `react-hooks` rules.

#### 6. Dashboard KPI logic masks backend failures as legitimate empty values

File:
- [AdminDashboard.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminDashboard.tsx:139)

Issue:

- `Promise.allSettled(...)` failures are converted to `null`, then rendered as zeroes or empty placeholders.

Operational risk:

- RLS failures, schema drift, RPC removal, or network issues can present as apparently valid low-value dashboards instead of explicit failure states.

Recommended fix:

- Preserve and render per-metric error metadata.
- Show a partial-data/degraded-state banner when any source fails.

#### 7. `AdminServices` has a hardcoded published status display

File:
- [AdminServices.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminServices.tsx:517)

Issue:

- The service listing renders `<StatusBadge status={"published"} />` regardless of actual persisted state.

Operational risk:

- Operators can be shown a false status even when the underlying entity model changes later or supports drafts.

Recommended fix:

- Bind the badge to a real persisted status field, or remove the badge until the domain model supports meaningful status state.

#### 8. `AdminServices` save flow is non-transactional across parent and child records

Files:
- [AdminServices.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminServices.tsx:219)
- [AdminServices.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminServices.tsx:237)
- [AdminServices.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminServices.tsx:253)

Issue:

- The service record is inserted/updated first.
- `service_steps` are then deleted and recreated.
- `service_faqs` are then deleted and recreated.

Operational risk:

- A later failure can leave the primary service updated while steps or FAQs are partially deleted or partially recreated.
- This is a data integrity risk in async workflows.

Recommended fix:

- Move the full save sequence into a single database function or transactional server-side endpoint.
- If full transaction support is not immediately available, add compensating rollback behavior and clearer partial-failure messaging.

#### 9. `AdminMedia` storage/database flows are non-transactional

Files:
- [AdminMedia.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx:122)
- [AdminMedia.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx:133)
- [AdminMedia.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx:163)
- [AdminMedia.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx:167)
- [AdminMedia.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminMedia.tsx:223)

Issue:

- Upload writes to storage and then inserts the DB row.
- Delete removes from storage and then deletes the DB row.
- Sync imports files from storage into DB records.

Operational risk:

- Partial failures can leave storage and DB out of sync.
- This is especially visible in retry, network, or permission edge cases.

Recommended fix:

- Introduce reconciliation-safe server-side endpoints or background repair logic.
- Surface partial-sync results explicitly and log failures by file.

### Medium

#### 10. Team Members exposes a `Published` checkbox that is not persisted

Files:
- [AdminTeamMembers.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminTeamMembers.tsx:38)
- [AdminTeamMembers.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminTeamMembers.tsx:153)

Issue:

- The file itself notes the schema lacks `is_published`, but the dialog still shows a `Published` control.
- The resulting UI implies workflow state that is not saved.

Operational risk:

- Operators can believe they published/unpublished a team member when nothing changed in persistence.

Recommended fix:

- Remove the control until backed by schema and writes, or implement full persistence and list rendering support.

#### 11. Bulk delete in estimate leads does not verify per-item Supabase errors

File:
- [AdminEstimateLeads.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminEstimateLeads.tsx:114)

Issue:

- The bulk delete logic uses `Promise.all(...)`, but success is inferred without checking each returned `{ error }`.

Operational risk:

- The UI can report success when one or more deletions actually failed.

Recommended fix:

- Inspect all delete results, report partial failures, and preserve failed selections for retry.

#### 12. Status modeling is inconsistent between blogs and shared badge rendering

Files:
- [StatusBadge.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\StatusBadge.tsx:3)
- [AdminBlogs.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminBlogs.tsx:39)
- [AdminBlogs.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminBlogs.tsx:724)

Issue:

- `StatusBadge` only supports `"draft" | "published" | "archived"`.
- `AdminBlogs` models blog status as `"draft" | "review" | "published"`.
- The blog row passes `post.status` through a cast instead of a truly compatible type.

Operational risk:

- The `"review"` state is not accurately represented by the shared status component.

Recommended fix:

- Expand the shared badge model to include `"review"` or use a blog-specific badge component.

#### 13. Command palette exists in code but is not mounted in the admin shell

Files:
- [CommandPalette.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\CommandPalette.tsx:40)
- [TopBar.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\TopBar.tsx:1)

Issue:

- The feature exists but is not integrated into the rendered admin experience.

Operational risk:

- Test and product expectations can drift away from what operators can actually use.

Recommended fix:

- Mount it intentionally in the admin shell or remove the dormant implementation and related expectations.

### Low

#### 14. Shared quick actions still reference legacy admin routes

File:
- [QuickActions.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\QuickActions.tsx:69)

Issue:

- Internal quick-action links still reference old paths like `/admin/portfolio` and `/admin/leads`.

Operational risk:

- If reintroduced, the helper will route users to dead locations.

Recommended fix:

- Replace hardcoded paths with a shared route map tied to the current router.

#### 15. Some admin fallback strings contain encoding corruption

File:
- [AdminDashboard.tsx](C:\Users\aayus\Desktop\main\apps\web\src\pages\admin\AdminDashboard.tsx:159)

Issue:

- Some fallback copy renders as mojibake instead of a clean placeholder.

Operational risk:

- Low functional risk, but it degrades admin UX polish and operator confidence.

Recommended fix:

- Normalize source encoding and replace corrupted placeholders with ASCII-safe values such as `"-"` or `"N/A"`.

## CRUD, Micro-Functions, and Operational Interpretation

### CRUD Assessment

- User management shows the strongest discipline in this audit:
  - validation present
  - API error mapping present
  - audit logging present
- Leads have better-than-average workflow instrumentation through `lead_activities`.
- Services and media support CRUD but need stronger transactional integrity.
- Team members and some content modules expose UI affordances that are ahead of actual persisted behavior.

### State Management and Async Edge Cases

- The most important async weakness is multi-step write orchestration without a transaction boundary.
- The most important state weakness is presenting synthetic or hardcoded UI states that do not necessarily reflect persisted backend truth.
- The dashboard also has a state-trust issue because failure is collapsed into zero-state rendering.

### Error Handling and API Response Mapping

- Stronger examples:
  - [UserFormSheet.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\users\UserFormSheet.tsx:115)
  - [LeadDetailSheet.tsx](C:\Users\aayus\Desktop\main\apps\web\src\components\admin\leads\LeadDetailSheet.tsx:151)
- Weaker examples:
  - `Promise.all` without per-response error inspection in estimate lead deletion
  - transactional gaps in services/media flows
  - dashboard masking backend errors as empty success states

## Recommended Remediation Order

1. Rebuild admin verification around authenticated Playwright coverage and current routes.
2. Add centralized audit-log writes for all admin mutations.
3. Fix the hook-rule violation in settings.
4. Eliminate misleading status/UI states:
   - team-member publish checkbox
   - hardcoded service status
   - blog/status badge mismatch
5. Make service and media mutation flows transactional or compensating.
6. Surface degraded dashboard data instead of silently rendering zeroes.
7. Clean up stale helpers, stale routes, and encoding defects.

## Overall Conclusion

The admin panel is structurally viable and partially well-engineered, especially in routing, role gating, and some validated form flows. It does not currently provide enough operational certainty for a high-confidence administrative system because its audit coverage, automated verification, and several async/data-integrity behaviors are inconsistent.

The module should be treated as functional but not yet fully trustworthy for governance-sensitive administration until the critical and high-severity items are addressed.

## Assessment Limitation

No authenticated admin credentials were available during this audit. Because of that, authenticated CRUD behavior was validated through code-path inspection, build verification, and test execution evidence rather than a full signed-in manual browser session across all modules.

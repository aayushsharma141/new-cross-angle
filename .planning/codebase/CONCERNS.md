# Codebase Concerns

**Analysis Date:** 2026-06-08

## Tech Debt

**Inline translation checks:**
- Issue: Hardcoded checks for Hindi (`lang === "hi"`) in pages and wizards rather than using a unified dictionary system.
- Files: `apps/web/src/addons/discovery/components/WelcomeScreen.tsx`
- Impact: Increases code duplication and makes it harder to support multiple languages dynamically.
- Fix approach: Move all text nodes to centralized JSON dictionary structures under `apps/web/src/i18n/`.

**Direct Supabase Client queries in UI Repositories:**
- Issue: The frontend client directly runs queries and updates database states instead of passing queries through a secure middleware/API proxy layer.
- Files: `apps/web/src/repositories/SupabaseLeadRepo.ts`, `apps/web/src/repositories/SupabaseProjectRepo.ts`
- Why: High-speed developer iteration.
- Impact: SQL schema names are exposed in Javascript bundles, requiring strict enforcement of RLS policies to prevent direct DB manipulation.
- Fix approach: Move critical state-mutating actions (like lead scoring, status overrides) entirely to Supabase Edge Functions.

## Known Bugs

- None currently documented.

## Security Considerations

**Admin access control relies heavily on client-side router checks:**
- Risk: Role-based admin sub-paths are validated in `apps/web/src/routes/adminRoutes.tsx` using `RoleGuard`. An attacker could hypothetically spoof role checks to bypass UI protections.
- Files: `apps/web/src/routes/adminRoutes.tsx`, `apps/web/src/components/admin/RoleGuard.tsx`
- Current mitigation: Supabase Row Level Security (RLS) is enabled on all PostgreSQL tables to prevent unauthorized reads/writes even if UI pages are accessed.
- Recommendations: Implement middleware validation checks in `apps/web/middleware.ts` to assert session claims on server side.

## Performance Bottlenecks

**High-resolution image assets in Portfolio Gallery:**
- Problem: Large portfolio imagery can trigger slow page loads and increase Core Web Vitals LCP times.
- Current mitigation: Custom image optimization scripts (`node scripts/optimize-images.js`) executed during builds.
- Recommendations: Leverage ImageKit's dynamic, query-based resizing params in all frontend list components.

## Fragile Areas

**Custom Image Optimization Scripts:**
- File: `apps/web/scripts/optimize-images.js`
- Why fragile: Relies on native node modules (`sharp`) which have compilation steps that frequently fail during cross-platform installations (e.g. Windows vs Linux CI pipelines).
- Safe modification: Check pipeline logs when upgrading packages; verify dependency versions before run.

## Scaling Limits

**Supabase Free Tier Constraints:**
- Current capacity: 500MB database storage and 1GB file storage limit.
- Limit: Easily exceeded if gallery uploads high-resolution portfolio images or if audit logs accumulate.
- Scaling path: Upgrade database tier or route gallery assets to a secondary dedicated CDN bucket.

## Test Coverage Gaps

**Aesthetic Style Quiz DNA Outcomes:**
- What's not tested: The dynamic routing matching DNA characteristics to specific archetypes.
- Risk: Changes in variables could match users to wrong style profiles.
- Priority: Medium.
- Difficulty to test: Requires mocking complex state sequences in Vitest.

---

*Concerns audit: 2026-06-08*
*Update as issues are fixed or new ones discovered*

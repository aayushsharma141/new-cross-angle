# Homepage (Index.tsx) Restructure Plan

**Goal:** Restructure the homepage content hierarchy to improve conversion flow — introduce style discovery teaser, reorder sections, add final CTA, remove low-value sections.

## Files to Modify
- `apps/web/src/pages/Index.tsx` — reorder/remove/add sections
- `apps/web/src/components/home/Hero.tsx` — revamp CTAs (+stats strip, lower-friction entry)

## Files to Create
- `apps/web/src/components/home/StyleDiscoveryTeaser.tsx` — NEW quick archetype cards + CTA to /aesthetic-discovery-engine
- `apps/web/src/components/home/HomeFinalCTA.tsx` — NEW final closing CTA section (3 paths)

## Files to Remove from Index (components stay, just stop importing)
- CredibilityStrip (stats absorbed into Hero)
- Philosophy
- ProjectFailurePrevention
- About (Founder Note)

## New Section Order:
1. Hero (revamped CTAs + stats strip)
2. StyleDiscoveryTeaser (NEW)
3. Portfolio (existing, project gallery with merged filters)
4. BeforeAfterShowcase (existing)
5. Process (existing, "How We Work")
6. Testimonials (existing, moved up as trust section)
7. EstimatorPromo (existing)
8. HomeFinalCTA (NEW)
9. Footer

# UI/UX Audit Remediation Plan (Phase 8)

**Goal:** Execute the prioritized remediation phases derived from `mentor_crosscheck_report.md` starting with Phase 0.

## Phase 0: Quick Confidence Restorers
- [x] Fix `ServicesHero.tsx` (#FF2A2A -> brand crimson, width fix)
- [x] Fix `TimelineGantt.tsx` (Week 8 out of bounds)
- [x] Fix `AdminSiteAssets.tsx` (sonner -> useToast)
- [x] Fix `ErrorBoundary.tsx` (Phantom @sentry/react dependency)
- [x] Update `index.css` (Add prefers-reduced-motion global support)

## Phase 1: Frontend Trust & Credibility
- [x] Fix metrics drift — unify stats across Hero, CredibilityStrip, Home About, and AboutPage to use `useSiteSettings`
- [x] Move `FixedSocialBar` to PublicLayout/App instead of rendering separately on every page
- [x] Fix `BlogDetailPage` — replace inline style constants with Tailwind `text-site-crimson`

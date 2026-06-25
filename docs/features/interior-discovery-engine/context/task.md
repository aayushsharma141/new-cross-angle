# task.md — Discovery UI Overhaul
**Sprint:** Discovery Visual Redesign — Wave 1
**Created:** 2026-05-24
**Priority:** High

---

## Sprint Goal
Transform the Discovery Engine from a minimal dot-nav to a premium, luxury-grade 3-panel experience that matches the kiro-p1/kiro-p2 aesthetic and CrossAngle brand identity.

---

## Tasks

### Wave 1 — Core Layout (DONE)
- [x] **T01 · Remove old 72px sidebar**
  - Deleted `DOT_NAV_STAGES` array
  - Removed old sidebar JSX block from `DiscoveryEngine.tsx`

- [x] **T02 · Create `DiscoveryProgressSidebar.tsx`**
  - 260px sticky sidebar (hidden on mobile)
  - Gold spine with animated completion fill
  - 3-state per stage: idle / active-pulsing / completed-check
  - Progress % bar at top
  - Archetype preview panel with mini score bars (unlocks at PatternPreview)
  - Brand header + auto-save footer

- [x] **T03 · Wire sidebar into `DiscoveryEngine.tsx`**
  - `isQuizStage` gate
  - Archetype + scores only passed after Stage.PatternPreview

---

### Wave 2 — WelcomeScreen Polish (NEXT)
- [ ] **T04 · Polish archetype preview cards**
  - Change border from `border-zinc-800` to `border-white/[0.06]`
  - Add gold left-border accent on hover: `hover:border-l-site-gold`
  - Add subtle gold glow on card hover
  - Keep existing card content (tag, title, description) intact

- [ ] **T05 · WelcomeScreen hero section rhythm**
  - Tighten vertical spacing for a more editorial feel
  - Move "Quick Version" button below CTA with cleaner typographic hierarchy
  - Optionally: replace `ShimmerButton` with `btn-brand` class from design.lock

- [ ] **T06 · WelcomeScreen "How it works" section**
  - Add step numbers (01–05) in gold mono above each input node label
  - Optionally: add a bottom CTA after the archetypes grid: "Begin your discovery →"

---

### Wave 3 — Stage-Level QA (AFTER Wave 2)
- [ ] **T07 · TypeScript compile check**
  - Run `tsc --noEmit` on modified files
  - Fix any prop type errors in `DiscoveryProgressSidebar`

- [ ] **T08 · Visual QA (dev server)**
  - Take screenshots at: Welcome, Reflection, PatternPreview (sidebar preview unlocked), Analysis, Results
  - Check mobile (no sidebar regression)
  - Check sidebar scroll behavior when many stages completed

- [ ] **T09 · Design.lock integrity check**
  - `grep -r "bg-white" apps/web/src/addons/discovery/` → 0 results
  - `grep -r "bg-gray-" apps/web/src/addons/discovery/` → 0 results
  - `grep -r "text-blue-" apps/web/src/addons/discovery/` → 0 results

- [ ] **T10 · Update `decisions.log`**
  - Log sidebar architecture decision
  - Log removal of `DOT_NAV_STAGES`

---

### Wave 4 — Data Handoff (FUTURE, separate context)
- [ ] **T11 · Discovery → Estimator handoff via sessionStorage**
  - On `Stage.LeadCapture` complete: write archetype + scores to `sessionStorage`
  - `useCalculatorStore` reads sessionStorage on mount (optional pre-fill)
  - Track `discovery_to_estimator_handoff` event

---

## Active Task
**T04 · Polish archetype preview cards in WelcomeScreen**

---

## Blocked Tasks
- T11 (Wave 4) — blocked on Wave 1–3 completion

---

## Dependencies
- No new packages required
- `site.gold` Tailwind token already exists
- `scrollbar-hide` utility needed — verify in tailwind plugins

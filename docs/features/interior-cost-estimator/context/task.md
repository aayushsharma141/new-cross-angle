# task.md — Estimator UI Overhaul
**Sprint:** Estimator Visual Redesign — Wave 1
**Created:** 2026-05-24
**Priority:** High

---

## Sprint Goal
Upgrade the Estimator add-on's aesthetic to match the new luxury standard established by `kiro-p1`, `kiro-p2`, and the overhauled Discovery add-on.

---

## Tasks

### Wave 1 — Main Orchestrator (CostEstimator.tsx)
- [ ] **T01 · Left Panel Styling**
  - Update `bg-gradient-to-b from-site-bg-card to-site-bg` to luxury deep obsidian.
  - Apply `font-serif` to the main step title (`{stepInfo.title}`).
  - Change "Cost Estimator" small overline from `text-site-crimson` to `text-site-gold`.
  - Update the "Personalized for" Discovery badge styling to use gold borders and text instead of crimson.
  - Update "Estimate Your Dream Space" and its underline to use gold.

- [ ] **T02 · Middle Progress Panel Styling**
  - Change the progress bar `bg-site-crimson` to `bg-site-gold` with appropriate gold shadow glow (`rgba(209, 175, 110, 0.5)`).
  - Update nav buttons (dots): completed state `bg-site-crimson` → `bg-site-gold`, active state glow to gold.
  - Update text highlights from crimson to gold.

- [ ] **T03 · Right Panel Headers**
  - On mobile view, update the step label overline and discovery badge from crimson to gold.

### Wave 2 — Inner Step Components (QA)
- [ ] **T04 · Step Component Review**
  - Identify and replace any localized `site-crimson` classes inside `StepPropertyType`, `StepPropertyDetails`, etc., with gold where appropriate to ensure full aesthetic continuity.

### Wave 3 — QA & Integrity
- [ ] **T05 · TypeScript compile check**
  - Run `tsc --noEmit` on modified files.
- [ ] **T06 · Visual QA**
  - Verify layout in browser for both desktop and mobile modes.

---

## Active Task
**T01 · Left Panel Styling in CostEstimator.tsx**

---

## Blocked Tasks
- None.

---

## Dependencies
- `site.gold` Tailwind token.

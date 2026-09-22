# state.md — Estimator UI Overhaul
**Feature Context:** estimator-ui-overhaul-2026-05-24
**Last Agent:** Antigravity
**Last Updated:** 2026-05-24T06:32:00+05:30

---

## Current Architecture

### Files Involved
| File | Role | Status |
|------|------|--------|
| `apps/web/src/addons/calculators/components/CostEstimator.tsx` | Orchestrator — mounts 3-panel split layout | TO BE MODIFIED |
| `apps/web/src/addons/calculators/components/steps/*` | Individual step forms | TO BE REVIEWED |
| `apps/web/tailwind.config.ts` | Design tokens | NO CHANGE NEEDED |

### Structure Managed in CostEstimator
- Fixed 3-panel split layout: Left (Info), Middle (Progress), Right (Content).
- Currently utilizes `site-crimson` for accents, progress bars, and active states.

---

## Planned Work This Session

### PENDING
- [ ] Refactor `CostEstimator.tsx` left panel background to obsidian and add subtle gold glows.
- [ ] Replace all `site-crimson` progress elements (dots, lines, text) with `site-gold` variants in `CostEstimator.tsx`.
- [ ] Review child step components for any straggling crimson elements that need gold alignment.
- [ ] Add `font-serif` to relevant headers to match luxury typography standards.

---

## Known Issues / Risks
- Changes to `site-crimson` classes must be careful not to break other conditional Tailwind classes (e.g., hover states).
- Inner step files (`StepPropertyType`, `StepPropertyDetails`, etc.) might have hardcoded crimson values that need to be tracked down and replaced.

---

## Environment
- Dev server: `npm run dev` running (port 8080)
- React 18, Tailwind CSS, Framer Motion

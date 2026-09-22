# Phase 25 — Plan: Semantic Design Token Architecture (Revised)

**Goal:** Establish the refined 5-stage token hierarchy and primitives that future UI phases must consume. No visible UI changes. No component refactors. Infrastructure only.

See the full plan in the artifacts: `phase_25_plan.md`

**Tasks:**
1. Setup folders in `apps/web/src/tokens/`
2. `tokens/foundation/colors.css` — Raw materials (`--f-*`)
3. `tokens/foundation/materials.css` — Material roles (`--m-*`)
4. `tokens/primitives/` — Independent scales (spacing, radius, motion, typography, elevation)
5. `tokens/semantic/semantic.css` — Intent-named tokens (`--s-*`) remapping to `--m-*`
6. `tokens/environments/environments.css` — Swaps material assignments for environments
7. `tokens/index.css` — Single entry point with correct cascade
8. `index.css` — `@import "./tokens/index.css"` at top
9. `tailwind.config.ts` — Bridging limited to core primitives (canvas, surface, display, body, etc.)
10. `tokens/TOKENS.md` — Living reference table and governance rule

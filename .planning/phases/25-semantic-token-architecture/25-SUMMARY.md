# Phase 25 Summary — Semantic Design Token Architecture

Established the refined 5-stage token system and primitives architecture in parallel to the legacy CSS configuration.

## What Was Shipped

### 1. Token Directory Structure
Organized under `apps/web/src/tokens/` to separate concerns:
- `foundation/colors.css` — Raw colors and shadow opacity values (`--f-*`).
- `materials/materials.css` — Architectural components mapping to foundation (`--m-*`).
- `primitives/` — Independent scale variables (spacing, radius, motion, interaction, elevation).
- `primitives/type/` — Typographic structure (families, scale, tracking, leading).
- `semantic/semantic.css` — Interface intention mapped to materials (`--s-*`).
- `environments/environments.css` — Emotional atmosphere mapping (`gallery`, `entrance`, `workspace`, `consultation`).
- `index.css` — Orchestrates imports in correct cascade order.

### 2. Global Integration
- Wired `@import "./tokens/index.css"` to the top of `apps/web/src/index.css`.
- Registered core primitives (`canvas`, `surface`, `display`, `body`, `border-subtle`, `border-default`, `cx-accent`, `cx-focus`) and radii (`cx-none`, `cx-sm`, `cx-md`) to `tailwind.config.ts` to prevent duplicate variable drift.
- Reset the global `--radius` used by Radix/Shadcn components to our MD primitive variable (`4px`).

### 3. Governance
- Created `TOKENS.md` describing stability levels (`CORE`, `STABLE`, `EXPERIMENTAL`) and remappings.
- Initialized `TOKEN_DECISIONS.md` to track all future changes and their justification.

---

## Verification
- Clean token separation: Zero components reference foundation variables.
- All styles compiled successfully without Tailwind duplication errors.
- Stable base ready for primitive component refactoring.

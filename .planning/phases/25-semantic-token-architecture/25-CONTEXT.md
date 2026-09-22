# Phase 25 — Context: Semantic Token Architecture (Revised)
**Phase:** 25 — Semantic Design Token Architecture
**Slug:** semantic-token-architecture
**Date captured:** 2026-07-03
**Status:** Ready to plan

---

## Domain

This phase establishes the **refined 5-stage token hierarchy** that all future UI phases must consume:
`Foundation → Material Roles → Semantic Tokens → Environments`.

It separates design primitives (spacing, radius, motion, typography, elevation) from semantic variables and limits the Tailwind config integration to a core set of frequently used utility classes.

---

<decisions>

## Architecture Decisions (Locked)

### Layer 1 — Foundation (colors.css)
- Contains only raw color scales (`--f-stone-*`, `--f-charcoal-*`, `--f-bronze-*`, `--f-linen-*`, `--f-sage-*`, `--f-terracotta-*`, etc.)

### Layer 2 — Material Roles (materials.css)
- Represents architectural building elements (`--m-wall`, `--m-slab`, `--m-paper`, `--m-metal`, `--m-glass`, `--m-wood`, `--m-detail`, `--m-subtext`, `--m-caption`, `--m-line`, `--m-shadow`).
- Maps directly to foundation variables.

### Layer 3 — Semantic Tokens (semantic.css)
- Maps UI intent (`--s-canvas-primary`, `--s-surface-primary`, `--s-text-body`, etc.) to the Material Roles.
- Components reference only these semantic tokens.

### Layer 4 — Environments (environments.css)
- Switches the material mapping layer by re-binding `--m-*` roles to different `--f-*` values under `data-environment="..."` selectors.

### Independent Primitives
- Spacing, radius, motion, typography, and elevation reside in their own files under `tokens/primitives/`. They are separate from semantic color layers.

### Tailwind Bindings
- We only expose the core interactive properties to Tailwind:
  - `bg-canvas` -> `var(--s-canvas-primary)`
  - `bg-surface` -> `var(--s-surface-primary)`
  - `text-display` -> `var(--s-text-display)`
  - `text-body` -> `var(--s-text-body)`
  - `border-subtle` -> `var(--s-border-subtle)`
  - `border-default` -> `var(--s-border-default)`
  - `accent` -> `var(--s-action-primary-bg)`
  - `focus` -> `var(--s-focus-ring)`

### Token Governance Rule (Constitutional Enforcement)
A new token may only be added if:
1. No existing token can express the intent.
2. The token is expected to be reused at least three times.
Otherwise, reuse an existing semantic token.

</decisions>

---

<canonical_refs>
- `c:/Users/aayus/Desktop/main/apps/web/src/index.css` — Global CSS entry point
- `c:/Users/aayus/Desktop/main/tailwind.config.ts` — Tailwind configuration
- `c:/Users/aayus/Desktop/main/audit-reports/10_crossangle_constitution.md` — The immutable constitutional laws
- `c:/Users/aayus/Desktop/main/audit-reports/09_creative_direction_bible.md` — The architectural environment pacing
</canonical_refs>

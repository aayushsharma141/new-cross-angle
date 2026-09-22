# Crossangle Token System Reference

This document is the single source of truth for the token system mapping layers. It defines the categories, stability levels, and environments of each token.

---

## Token Stability Levels

Every token is marked as one of:
*   **CORE:** Essential design system tokens that should never be altered or removed.
*   **STABLE:** Reliable primitives that can be extended or remapped but are protected against removal.
*   **EXPERIMENTAL:** Newly introduced tokens or page-specific tokens undergoing validation before promotion.

---

## 1. Foundation (colors.css)
*Stability: CORE*
*   `--f-stone-[25-950]` — Cool architectural stone scale.
*   `--f-charcoal-[50-950]` — Warm gallery charcoal scale.
*   `--f-bronze-[100-500]` — Warm metallic bronze accents.
*   `--f-linen-[50-300]` — Tactile linen workspace paper.
*   `--f-terracotta-[300-500]` — Muted feedback red/orange.
*   `--f-sage-[300-500]` — Muted feedback green.
*   `--f-shadow-[100-600]` — Ambient occlusion shadows.

---

## 2. Materials (materials.css)
*Stability: CORE*
Bridges foundation colors to physical architectural structures:
*   `--m-wall` — Background canvas base.
*   `--m-floor` — Flooring/outer canvas.
*   `--m-surface` — Card / raised container surfaces.
*   `--m-panel` — Secondary panels.
*   `--m-paper` — Form controls / interactive drafting vellum.
*   `--m-glass` — Smoked navigation / backdrop overlays.
*   `--m-metal` — Primary actions / branding highlights.
*   `--m-fabric` — Tactile secondary card fills.
*   `--m-wood` — Alternative luxury accent material.
*   `--m-shadow` — Shadow properties.
*   `--m-highlight` — Extreme high-contrast foreground highlight.
*   `--m-line` — Borders and gridlines.
*   `--m-detail` — Primary display ink.
*   `--m-subtext` — Body paragraph copy.
*   `--m-caption` — Muted labels/metadata.

---

## 3. Primitives
*Stability: CORE / STABLE*
Independent scale primitives decoupled from colors:
*   `--p-space-*` — Spacing scale.
*   `--p-radius-*` — Radius scale (none, sm, md).
*   `--p-motion-*` — Motion durations and easings.
*   `--p-shadow-*` — Shadow elevation profiles.
*   `--i-*` — Interaction tokens (hover opacity/scale, focus rings).
*   `--p-font-*` — Font families (serif, sans, mono).
*   `--p-font-size-*` — Typographic modular size scale.
*   `--p-tracking-*` — Typographic tracking scale.
*   `--p-leading-*` — Typographic leading/line-height scale.

---

## 4. Semantic (semantic.css)
*Stability: STABLE*
UI intent consumed by components:
*   `--s-canvas-primary` $\rightarrow$ `--m-wall`
*   `--s-canvas-secondary` $\rightarrow$ `--m-plaster`
*   `--s-surface-primary` $\rightarrow$ `--m-slab`
*   `--s-surface-secondary` $\rightarrow$ `--m-panel`
*   `--s-surface-elevated` $\rightarrow$ `--m-surface`
*   `--s-surface-overlay` $\rightarrow$ `--m-glass`
*   `--s-text-display` $\rightarrow$ `--m-detail`
*   `--s-text-heading` $\rightarrow$ `--m-detail`
*   `--s-text-body` $\rightarrow$ `--m-subtext`
*   `--s-text-muted` $\rightarrow$ `--m-caption`
*   `--s-text-subtle` $\rightarrow$ `--m-caption`
*   `--s-border-subtle` $\rightarrow$ `--m-line`
*   `--s-border-default` $\rightarrow$ calculated from `--m-detail`
*   `--s-action-primary-bg` $\rightarrow$ `--m-metal`
*   `--s-action-primary-text` $\rightarrow$ `--m-wall`

---

## 5. Environments (environments.css)
*Stability: STABLE*
Remaps `--m-*` roles under specific `data-environment` triggers. Available environments:
1.  `gallery` (Default, moody/spotlit)
2.  `entrance` (Morning Light, high contrast)
3.  `workspace` (Skylight, bright/tactile)
4.  `consultation` (Golden Hour, warm/intimate)

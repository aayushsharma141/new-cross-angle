# ADR-002: Three-Layer Token Architecture Mapping

**Status:** Accepted  
**Date:** 2026-08-01  
**Deciders:** Lead Product Designer, Frontend Architect  

## Context
Components were directly consuming hardcoded hex colors (`bg-[#060504]`) or raw foundation HSL variables, leading to theme instability when switching lighting environments (`gallery` $\rightarrow$ `workspace`).

## Decision
All components MUST consume semantic CSS variables (`--s-*`). Direct consumption of foundation tokens (`--f-*`) or hardcoded hex colors in component JSX is strictly prohibited.

```
Layer 1: Foundation Tokens (--f-stone-*, --f-charcoal-*)
      │
      ▼
Layer 2: Semantic Intent Tokens (--s-canvas-primary, --s-surface-primary)
      │
      ▼
Layer 3: Lighting Environments (data-environment="gallery|workspace")
```

## Consequences
- **Positive:** Decouples component design from color choices; enables instantaneous environment theme remapping.
- **Negative:** Requires strict PR linting to reject hardcoded hex colors in JSX.

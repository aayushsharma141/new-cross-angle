# Design Surface Review: [Surface Name]

| Review Metadata | Detail |
|:----------------|:-------|
| **Surface / Component** | `apps/web/...` |
| **Review Date**         | YYYY-MM-DD |
| **Reviewer / Agent**    | Principal Software Architect & Design Lead |
| **Verdict**             | [Draft / Certified Frozen (v1.0.0)] |

---

## Surface Freeze Checklist

### Architecture
- [ ] No structural hacks or arbitrary offsets
- [ ] No duplicate narrative intent or redundant components
- [ ] Clean component boundaries and single responsibility

### Design & Visual Rhythm
- [ ] Typography standardized to font hierarchy (`font-serif` display, `font-sans` body)
- [ ] Museum-cadence spacing (`clamp()` fluid padding, no visual crowding)
- [ ] Photography dominance (>90% attention purity index)
- [ ] Motion restraint (restrained spring stiffness/damping, GPU-accelerated transforms)
- [ ] Rich interaction states (subtle micro-interactions, clean focus indicators)

### Accessibility & Ergonomics
- [ ] Full keyboard navigability with visible `:focus-visible` styling
- [ ] Touch target floor (≥44x44px interactive areas)
- [ ] Reduced motion support (`prefers-reduced-motion` fallbacks)
- [ ] Contrast ratio compliance (WCAG AA standard across all states)
- [ ] Mobile-first default readability (no essential information hidden behind hover)

### Performance
- [ ] Cumulative Layout Shift (CLS < 0.05)
- [ ] Largest Contentful Paint (LCP < 1.2s priority loading)
- [ ] Lazy loading with responsive image dimensions
- [ ] Viewport resilience (tested across 390px, 768px, 1024px, 1440px, 1920px)

### Engineering & Tokens
- [ ] Strict Three-Layer Token Architecture compliance (`var(--s-canvas-primary)`, `primary`, etc.)
- [ ] Zero hardcoded hex codes in component styles
- [ ] Clean event cleanup (listeners, observers, animation frames)
- [ ] Clean console and strict type verification

### Evidence & Documentation
- [ ] Structured audit report logged in `/design-reviews/`
- [ ] Visual verification criteria confirmed
- [ ] ADR recorded if intentional architectural exception made

---

## Issues Identified & Fixes Applied

| # | File / Component | Category | Fix Applied | Result / Metric |
|---|:-----------------|:---------|:------------|:----------------|
| 1 | `apps/web/...` | Tokens | [Describe change] | Semantic compliance |

---

## Final Certification Verdict

- **Status:** [Needs Improvement / Certified Frozen]


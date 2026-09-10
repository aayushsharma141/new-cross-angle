# Design Surface Review: [Surface Name]

| Review Metadata | Detail |
|:----------------|:-------|
| **Surface / Component** | `apps/web/...` |
| **Review Date**         | YYYY-MM-DD |
| **Reviewer / Agent**    | [Name / Agent ID] |
| **Certification Tier**  | [✓ Certified / ✓ Premium / ✓ Production Ready / ⚠ Needs Review] |

---

## 1. 100-Point Objective Audit Rubric

| Dimension | Points Available | Points Awarded | Traceable Evidence & Observations |
|:----------|:----------------:|:--------------:|:----------------------------------|
| **1. Accessibility & Semantics** | 20 | [0–20] | Semantic tags, 48×48px touch targets, WCAG AA contrast (≥4.5:1), ARIA labels, keyboard navigability. |
| **2. Performance & Web Vitals** | 20 | [0–20] | LCP priority loading, CLS = 0, INP ≤ 50ms, no layout thrashing, efficient asset compression. |
| **3. Typography & Hierarchy** | 15 | [0–15] | Cormorant display + grotesque sans pair, measure (60–70ch), rhythmic spacing, clean line breaks. |
| **4. Motion & Tactility** | 15 | [0–15] | `--ease-gallery` curves, <300ms micro-animations, tactile `:active` (0.97), `prefers-reduced-motion`. |
| **5. Photography & Visual Dominance** | 15 | [0–15] | >90% Attention Purity Index, natural lighting, strict 3:4 or 16:9 aspect ratios, organic tones. |
| **6. Ergonomics & Interaction** | 15 | [0–15] | Fluid responsive breakdown, zero overflow jitter, load-bearing whitespace framing interactive controls. |
| **TOTAL SCORE** | **100** | **[Total]** | **Assigned Tier:** [✓ Certified / ✓ Premium / ✓ Production Ready / ⚠ Needs Review] |

---

## 2. Issues Identified & Fixes Applied

| # | File / Component | Rule Violated | Fix Applied | Performance / A11y Impact |
|---|:-----------------|:--------------|:------------|:--------------------------|
| 1 | `apps/web/...` | Layer X.X | [Describe fix] | [Resulting metric change] |

---

## 3. Regression Check

- [ ] **Performance unchanged:** Core Web Vitals and LCP meet or exceed threshold.
- [ ] **Accessibility unchanged:** 48×48px touch targets, `:focus-visible`, WCAG AA contrast verified.
- [ ] **SEO unchanged:** Meta tags, canonical links, and Schema.org JSON-LD maintained.
- [ ] **CLS unchanged:** Layout stability preserved across viewport breakpoints.
- [ ] **Bundle unchanged:** No redundant packages or unneeded component dependencies introduced.
- [ ] **Architecture unchanged:** Token contracts and layer boundaries respected.

---

## 4. Architectural Decision Records (ADR) Logged

*If any intentional rule exception was granted for this surface, record it here:*
- **ADR Ref:** None / ADR-XXX
- **Rationale:** 

---

## 5. Token Extraction & Promotion

- [ ] New 3x recurring pattern identified for promotion to design tokens
- **Proposed Token:** (e.g. `--space-hero-gap: 5rem;`)

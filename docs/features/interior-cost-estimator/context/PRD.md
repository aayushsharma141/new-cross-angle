# PRD — Estimator UI Overhaul
**Feature:** Estimator Add-on Aesthetic & Layout Alignment
**Date:** 2026-05-24
**Owner:** Aayush Sharma
**Status:** IN PROGRESS

---

## 1. Problem Statement

The Cost Estimator (`CostEstimator.tsx`) currently utilizes the legacy `site-crimson` accent color and basic styling. To achieve a cohesive, luxury brand identity across the CrossAngle platform, the Estimator must be updated to align with the "Dream Home Brief" (`kiro-p1` & `kiro-p2`) and the newly overhauled Discovery add-on. This means transitioning to the "Luxury Obsidian-Gold" palette.

---

## 2. Goals

| # | Goal | Success Metric |
|---|------|---------------|
| G1 | Transition primary accent from Crimson to Gold | All `bg-site-crimson` and `text-site-crimson` references updated to use `site-gold` or specific gold hex `#D1AF6E` |
| G2 | Apply Luxury Obsidian-Gold styling to Left Panel | Left information panel uses deep obsidian backgrounds with subtle gold ambient glows |
| G3 | Update Progress Sidebar Visuals | Middle panel progress bar and active/completed dot states use gold glows and borders |
| G4 | Typographic Alignment | Ensure `font-serif` (Cormorant Garamond) is used appropriately for luxury headers |
| G5 | Maintain existing 3-panel split layout | Structural layout remains unchanged (30% | 10% | 60%) |

---

## 3. Scope

### In Scope
- `CostEstimator.tsx` — Left info panel, middle progress panel, and right content headers.
- Inner step components (`StepPropertyType`, `StepPropertyDetails`, `StepResults`, etc.) — update any crimson buttons or active states to gold.
- Animations and glows related to progress.

### Out of Scope
- Backend logic or pricing calculation algorithms.
- Changing the actual 7-step sequence (Type, Details, Location, Investment, Services, Bespoke, Timeline).

---

## 4. Design Reference

| Source | What to borrow |
|--------|---------------|
| `kiro-p1/` & `kiro-p2/` | Obsidian dark backgrounds (`#0a0907` or `#080808`), gold accents (`#D1AF6E`), elegant thin borders (`white/[0.06]`). |
| `Discovery UI` (recent overhaul) | Gold spine line progress, pulsing gold dots, and luxury hover states. |

---

## 5. Design Tokens (locked)

```
Background base : #080808 / #0f0f0f
Gold accent     : #c8a96e / #D1AF6E (Tailwind: site.gold)
Border          : rgba(255,255,255,0.06)
Font            : Cormorant Garamond (serif headings), DM Sans (body), JetBrains Mono (labels)
```

---

## 6. User Flow (Unchanged)

```
[Start] 
  → Step 0: Property Type 
  → Step 1: Property Details 
  → Step 2: Location 
  → Step 3: Investment Scope 
  → Step 4: Service Level 
  → Step 5: Bespoke Commissions 
  → Step 6: Timeline 
  → [Results / Lead Capture]
```

---

## 7. Acceptance Criteria

- [ ] AC1: Left panel features luxury obsidian styling with subtle background textures.
- [ ] AC2: All progress indicators (vertical bar, active dots) are gold with appropriate drop-shadow glows (no crimson).
- [ ] AC3: Step content uses `font-serif` for primary headers.
- [ ] AC4: Discovery personalization badge uses gold accents instead of crimson.
- [ ] AC5: Mobile layout continues to function with horizontal gold progress bar.
- [ ] AC6: No `bg-site-crimson` classes remain in the core Estimator orchestrator.

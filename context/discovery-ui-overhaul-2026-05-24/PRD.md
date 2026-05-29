# PRD — Discovery UI Overhaul
**Feature:** Discovery Add-on Aesthetic & Layout Alignment
**Date:** 2026-05-24
**Owner:** Aayush Sharma
**Status:** IN PROGRESS

---

## 1. Problem Statement

The Discovery Engine (`DiscoveryEngine.tsx`) uses a minimal 72px dot-nav sidebar — visually inconsistent with the luxury Estimator add-on and the high-premium `kiro-p1` / `kiro-p2` reference designs. Users have no clear sense of journey progress, which reduces engagement and completion rates.

---

## 2. Goals

| # | Goal | Success Metric |
|---|------|---------------|
| G1 | Replace 72px dot-nav with a 260px luxury progress sidebar | Sidebar rendered, shows live stage progress |
| G2 | Add stage workflow visual (label + eyebrow number + spine line) | All 10 stages legible at a glance |
| G3 | Show archetype preview panel mid-quiz (PatternPreview+) | Panel appears after Stage 8 with live score bars |
| G4 | Ambient gold glow + grain noise retained | Visual quality maintained from existing engine |
| G5 | WelcomeScreen step cards visually aligned with kiro-p1 EntryIntent style | Cleaner stage preview section |
| G6 | Mobile: keep horizontal ProgressBar (no regression) | Mobile experience unchanged |

---

## 3. Scope

### In Scope
- `DiscoveryEngine.tsx` — replace sidebar, keep all stage logic/analytics untouched
- `DiscoveryProgressSidebar.tsx` (new) — luxury 260px sidebar
- `WelcomeScreen.tsx` — polish archetype card section (gold border on hover, tighter layout)
- `tailwind.config.ts` — verify `site.gold` token exists (already present: `#D1AF6E`)

### Out of Scope
- Stage logic changes (scoring, transitions, session persistence)
- Analytics events (PostHog task is separate)
- Estimator add-on (separate feature)
- Mobile layout (existing horizontal ProgressBar remains)

---

## 4. Design Reference

| Source | What to borrow |
|--------|---------------|
| `kiro-p1/ProgressSidebar.tsx` | Stage list structure, label + number + done/active/idle states |
| `kiro-p1/RealityCheck.tsx` | Conflict card UI pattern (future: can add a "tension check" to Discovery) |
| `kiro-p2/` | Visual rhythm: tight typography, gold accent, obsidian background |
| `Estimator/CostEstimator.tsx` | 3-panel split (30% sidebar / 70% content) — apply same to Discovery |

---

## 5. Design Tokens (locked)

```
Background base : #080808 / #0f0f0f
Gold accent     : #c8a96e  (Tailwind: site.gold = #D1AF6E — use CSS vars for #c8a96e shade)
Border          : rgba(255,255,255,0.06)
Sidebar width   : 260px (lg+)
Spine line      : 1px, white/5 → animated gold fill on completion
Font            : Cormorant Garamond (serif headings), DM Sans (body), JetBrains Mono (labels)
```

---

## 6. User Flow

```
WelcomeScreen (full-width, no sidebar)
  ↓ onStart("deep")
[Sidebar appears] Reflection → Lifestyle → VisualInstinct → AdjectiveSelection
  → EmotionalMapping → MaterialResonance → LightCalibration
  → PatternPreview  [Archetype preview panel unlocks in sidebar]
  → Analysis → MiniResult → LeadCapture → Results
[Sidebar hides]
```

---

## 7. Acceptance Criteria

- [ ] AC1: Sidebar visible on lg+ screens during all quiz stages (Reflection → MiniResult)
- [ ] AC2: Completed stages show gold ✓ checkmark
- [ ] AC3: Active stage shows pulsing gold dot with "In Progress" label
- [ ] AC4: Progress % updates correctly as stages advance
- [ ] AC5: Archetype preview panel fades in after PatternPreview stage
- [ ] AC6: Score bars animate smoothly in archetype preview panel
- [ ] AC7: Mobile: horizontal ProgressBar still shows (no sidebar on mobile)
- [ ] AC8: No regressions in analytics, scoring, or session persistence
- [ ] AC9: TypeScript compiles without errors
- [ ] AC10: No `bg-white`, `bg-gray-*`, `text-blue-*` classes in new components (design.lock integrity)

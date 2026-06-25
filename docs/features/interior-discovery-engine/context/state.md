# state.md — Discovery UI Overhaul
**Feature Context:** discovery-ui-overhaul-2026-05-24
**Last Agent:** Antigravity
**Last Updated:** 2026-05-24T06:01:00+05:30

---

## Current Architecture

### Files Involved
| File | Role | Status |
|------|------|--------|
| `apps/web/src/addons/discovery/components/DiscoveryEngine.tsx` | Orchestrator — mounts sidebar + all stages | MODIFIED |
| `apps/web/src/addons/discovery/components/DiscoveryProgressSidebar.tsx` | NEW luxury 260px sidebar | CREATED |
| `apps/web/src/addons/discovery/components/WelcomeScreen.tsx` | Entry landing page | PENDING POLISH |
| `apps/web/tailwind.config.ts` | Design tokens | NO CHANGE NEEDED (`site.gold` already exists) |

### Stage Flow (unchanged)
```
Stage.Welcome → Stage.Reflection → Stage.Lifestyle → Stage.VisualInstinct
  → Stage.AdjectiveSelection → Stage.EmotionalMapping → Stage.MaterialResonance
  → Stage.LightCalibration → Stage.PatternPreview → Stage.Analysis
  → Stage.MiniResult → Stage.LeadCapture → Stage.Results
```

### State Managed in DiscoveryEngine
- `stage: Stage` — current quiz stage
- `scores: AestheticScores` — `{ minimalism, warmth, social, structure, novelty }` (0–1 normalized)
- `signals: UserSignals` — reflections, image picks, material choice, light preference
- `aiResult: AIAestheticResult | null` — AI-generated archetype result
- `sessionId: string | null` — PostHog session tracking
- `mode: "quick" | "deep"` — quiz length mode

### Sidebar Props Contract
```ts
interface DiscoveryProgressSidebarProps {
  currentStage: Stage;
  archetype?: string;           // shown after Stage.PatternPreview
  scores?: AestheticScores;     // shown after Stage.PatternPreview
}
```

---

## Completed Work This Session

### DONE
- [x] Removed old 72px dot-nav sidebar (`DOT_NAV_STAGES` array + JSX block)
- [x] Created `DiscoveryProgressSidebar.tsx` with:
  - 260px sticky left sidebar (lg+)
  - Gold spine line with animated completion fill
  - Per-stage: ✓ check (completed) | pulsing dot (active) | number (idle)
  - Progress % display with animated gold bar
  - Archetype preview panel (unlocks at PatternPreview+) with mini score bars
  - Auto-save hint footer
- [x] Wired sidebar into `DiscoveryEngine.tsx`:
  - `isQuizStage` gates sidebar visibility
  - Archetype passed only after `Stage.PatternPreview`
  - `normalizedScores` passed for live score bars

### PENDING
- [ ] WelcomeScreen.tsx polish — gold border on archetype cards, tighter section spacing
- [ ] TypeScript compile check — verify no type errors in new component
- [ ] Visual QA — run dev server, screenshot sidebar at multiple stages
- [ ] Update `decisions.log`

---

## Known Issues / Risks
- `site.gold` Tailwind class maps to `#D1AF6E` — our sidebar uses inline `#c8a96e` (slightly darker). Acceptable for now; can harmonize in design.lock v1.2 if needed.
- Sidebar uses `scrollbar-hide` utility — verify this class is defined (comes from `tailwindcss-animate` plugin or custom utility in config).
- `writing-vertical-rl` class used in old sidebar — no longer needed, removed.

---

## Environment
- Dev server: `npm run dev` running (port 8080)
- Build: `npm run build` running
- TypeScript: not yet re-checked post-edit
- Last known state: Vite SPA, React 18, Tailwind CSS, Framer Motion

---
title: "Phase 1B IA Decision — Hybrid Chrome Ownership"
date: 2026-06-26
context: "Explored during /gsd-explore session before Phase 1B planning"
---

## Decision

The sidebar owns all global navigation chrome. The main panel retains a compact, static H2 and an optional one-line helper sentence directly above inputs.

**Not** full sidebar ownership (starts main panel directly with inputs — disorienting on back-nav and for returning users).  
**Not** keeping current structure (duplicated chrome, top-heavy layout).

## Sidebar Owns

- Step counter ("Step 3 of 7")
- Step subtitle (was animated BlurText — plain text in sidebar, no animation)
- Discovery Applied badge (compact, in sidebar above step list)
- Completed step summaries ("✓ Property — Apartment · 2 BHK", "✓ Location — Delhi NCR", "● Services — Selecting")

## Main Panel Retains

- A **compact static H2** — the step's contextual question label (e.g. "Kitchen & Interior Services")
- An optional **one-line helper sentence** if the step needs it
- Directly followed by inputs

**Vertical cost:** ~28–36px for H2 + helper (vs current ~140px for counter + animated title + subtitle + discovery banner)

## Remove from Main Panel

- `SplitText` animated title (CostEstimator.tsx:262–268) — replace with static heading
- `BlurText` animated subtitle (CostEstimator.tsx:270–276) — move to sidebar, no animation
- Step counter label ("Step N of 7") (line 260) — move to sidebar
- Discovery Applied banner in main (line 278–286, step 0) — collapse into sidebar badge

## Rationale

Users focus on the content pane first. A compact H2 answers "What am I selecting?" without requiring a sidebar glance, preserving orientation after back-navigation and for returning users. Keeping only the H2 (not the full animated block) still recovers ~80% of the intended vertical space.

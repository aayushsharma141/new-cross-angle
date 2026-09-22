# Phase 30: Room Migration

## Objective
Migrate application pages ("Rooms") to strictly use the new Pattern/Primitive architecture in isolated, sequential steps.

## Principles & Governance
1. **Never migrate more than one room in a single PR.** One room → one review → one Genome → one Drift Report.
2. **Room Scorecard:** Every migrated room must graduate with a generated Room Scorecard detailing metrics like Design System Compliance, Genome Confidence, Legacy Dependencies, Accessibility, Performance, and Constitution Compliance.
3. **Legacy Dependencies:** Aim to reduce legacy dependencies to 0 for each room (including replacing legacy `button.tsx` and legacy tokens).
4. **Target Compliance:** Achieve ≥90% Design System Compliance for each room.

## Sub-phases

### Phase 30A — Entrance Room (Homepage)
* **Target:** Migrate **only** the Homepage.
* **Goals:**
  * Replace legacy components with Patterns.
  * Remove all Homepage-only legacy tokens.
  * Remove Homepage-only `button.tsx` usages.
  * Achieve ≥90% Design System Compliance.
  * Regenerate a **Room Genome** and **Room Scorecard** after completion.
* **Outcome:** Becomes the reference implementation and gold standard for every remaining room.

### Phase 30B — Gallery Room
* **Target:** Migrate Portfolio, Project Detail, and Gallery layouts.
* **Goals:** 
  * Execute after Phase 30A is stable.
  * Focus on editorial rhythm and imagery.
  * Ensure legacy references are cleared from these routes.

### Phase 30C — Workspace
* **Target:** Migrate Estimator, Discovery, and Workspace.
* **Goals:**
  * Execute only after the marketing experience is complete.
  * This is the highest-risk room because of interaction density.
  * Pay extra attention to data-heavy UI components and interaction states.

## The Room Scorecard Format
Example to be included in the PR or audit report for each room:

| Metric                   | Score |
| ------------------------ | ----: |
| Design System Compliance |   96% |
| Genome Confidence        |   94% |
| Legacy Dependencies      |     0 |
| Accessibility            |  Pass |
| Performance              |  Pass |
| Constitution Compliance  |  Pass |

## Next Step
Commence **Phase 30A — Entrance Room** migration.

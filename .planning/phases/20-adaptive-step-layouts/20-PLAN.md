# Phase 20: Adaptive Step Layouts (Phase B)

**Goal:** Refactor Estimator Steps 1-7 into their specific, task-driven layouts (Grid, Dashboard, Comparison Matrix). Enforce the "One Primary Decision" rule.

## Overview
Currently, the estimator acts like a mobile form, stretching awkwardly on desktop. This phase redesigns the internal layout of each of the 7 steps to maximize desktop width, improve usability, and embrace task-specific spatial arrangements.

## Step Refactoring Plan

### Task 1: Step 1 - Property (Grid Layout)
- **Current State:** Likely a vertical list of buttons.
- **Target Layout:** Dense, responsive grid (`grid-cols-2` or `grid-cols-3`). 
- **Action:** Convert the property options into a grid. Keep interactions immediate.

### Task 2: Step 2 - Details (Dashboard Layout)
- **Target Layout:** Split control dashboard.
  - Left/Top: Inline counters for configuration (e.g., 2 BHK, 3 BHK).
  - Right/Center: Wide area slider (Carpet Area).
  - Bottom: Segmented stage controls (Current Stage).
- **Action:** Replace vertical stacked inputs with a horizontal dashboard-style layout.

### Task 3: Step 3 - Location (Split Directory Layout)
- **Target Layout:** 
  - Left: Searchable index/list of cities.
  - Right: Visual indicator, map, or market insight panel (placeholder if necessary).
- **Action:** Convert the city dropdown/list into a two-pane layout.

### Task 4: Step 4 - Budget (Split Decision Layout)
- **Target Layout:** 
  - Left: Presets (Essential, Premium).
  - Center: Visual "OR" divider.
  - Right: Custom Slider.
- **Action:** Implement a clear visual separation between preset budgets and custom budgets.

### Task 5: Step 5 - Services (Recommendation Matrix)
- **Target Layout:** Side-by-side split.
  - Left side: Highlighted **Recommended** package (e.g., ⭐ Design & Build), followed by a list of **Alternatives**.
  - Right side: Detail pane (Deliverables, Ideal For, Timeline) that updates when a package is selected.
- **Action:** This is the highest ROI change. Replace generic stacked cards with a Master-Detail matrix layout.

### Task 6: Step 6 - Add-ons (Tag Cloud / Chips)
- **Target Layout:** High-density grouped categories of compact toggle chips.
- **Action:** Refactor long lists of checkboxes into organized tag clouds.

### Task 7: Step 7 - Timeline (Horizontal Selector)
- **Target Layout:** Single horizontal track.
- **Action:** Convert timeline options into a horizontal progress-bar style selector.

## Verification
- Each step must render gracefully on Desktop (`lg`, `xl`) taking up the available horizontal space of the 896px Workspace column.
- Each step must gracefully fall back to a stacked column layout on mobile screens (`< md`).
- No secondary widgets or sidebars belong in these steps—only the controls required to make the primary decision for that step.

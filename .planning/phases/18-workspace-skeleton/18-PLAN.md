# Phase 18: Workspace Skeleton (Phase A1)

**Goal:** Build the strict 3-column responsive layout (Sidebar | Workspace | Dossier) and establish ultra-wide (1800px+) max-width bounds. No logic or widgets—just plumbing and structure.

## Overview
This phase establishes the foundational layout for the Estimator Interactive Workspace. We will transition from the single-column centered mobile-first view on desktop to a true 3-column application shell, while preserving the mobile layout.

## Steps

### Step 1: Component Scaffolding
- Create `EstimatorWorkspace.tsx` layout shell component.
- Create `ProjectDossierPanel.tsx` placeholder component.
- (Assume `Sidebar.tsx` already exists or adjust existing navigation).

### Step 2: Implement Responsive Grid/Flex Shell
- Update the main layout wrapper (`EstimatorLayout.tsx` or equivalent) to conditionally render the 3 columns on `lg` and `xl` breakpoints.
- Ensure the layout is strictly constrained horizontally:
  - Sidebar: fixed width (e.g., 280px).
  - Dossier: fixed width on right (e.g., 340px or 400px).
  - Main Workspace: flexible center column, constrained to `max-w-4xl` for ultra-wide monitors.

### Step 3: Implement Scroll Lock (Plumbing)
- Ensure the left Sidebar and right Dossier panels are `sticky` or `fixed` so they do not scroll with the main workspace.
- The center Workspace column should be the only scrollable area.

### Step 4: Verification
- Run local dev server and test layout against these viewports:
  - Mobile (375px): Stacked (unchanged).
  - Tablet (768px): Sidebar + Workspace (Dossier hidden in drawer or stacked below).
  - Desktop (1440px): 3 columns active, filling the screen.
  - Ultra-wide (1920px+): 3 columns active, center column constrained (does not stretch infinitely), empty space distributed symmetrically.

## End State
The UI renders a 3-column skeleton on desktop where the center column is scrollable and the flanking columns are sticky. There is no business logic, no calculated estimates, and no complex widgets yet.

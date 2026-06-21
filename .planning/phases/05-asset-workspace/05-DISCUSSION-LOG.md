# Phase 5 Discussion Log

> **Note:** This log is for human reference, audits, and retrospectives. It is NOT consumed by downstream agents (gsd-researcher, gsd-planner). The canonical decisions are in CONTEXT.md.

---

### Area: Layout & Navigation Model

**Question 1:**
How should the editor enter and exit the Asset Workspace?

**Options presented:**
- Dedicated Route (`/admin/media/:id`) - Good for deep linking, sharing, and browser history.
- Full-screen Overlay - Keeps the media grid mounted underneath for fast open/close without routing delays.
- Split-pane Layout - Clicking an asset opens it on the right half, keeping the grid on the left.

**User selected:**
Split-pane Layout - Clicking an asset opens it on the right half, keeping the grid on the left.

---

**Question 2:**
How should space be allocated in the split-pane layout to fit the image preview, Usage Panel, and Versions Panel?

**Options presented:**
- Standard Sidebar (30%) - Keep the image preview small or hidden, focusing primarily on the data (Usage, Versions, Metadata).
- Equal Split (50/50) - The grid takes half, the workspace takes half. The workspace stacks the image preview above the data panels.
- Collapsible Grid - When an asset is clicked, the grid collapses to a narrow strip (20%) and the workspace takes 80% of the screen.

**User selected:**
Collapsible Grid - When an asset is clicked, the grid collapses to a narrow strip (20%) and the workspace takes 80% of the screen.

---

### Deferred Ideas
None.

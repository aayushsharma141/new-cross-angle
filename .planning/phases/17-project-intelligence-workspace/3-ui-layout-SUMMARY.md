# Plan 3: Workspace UI Layout & Before Meeting State

**Status:** Completed
**Focus:** Scaffold the Project Intelligence Workspace full-page layout and build the 'Before Meeting' content.

## What Was Accomplished
- **CRM Integration**: Modified `AdminEstimateLeads.tsx` to replace the "Generate Brief" button with a "Open Project Intelligence →" button that links to `/admin/leads/:id/workspace`.
- **Routing**: Added `/admin/leads/:id/workspace` path in `adminRoutes.tsx`.
- **Workspace UI**: 
  - Created `AdminLeadWorkspace.tsx` implementing a full-screen layout with a 3-pane structure (20% left rail, 55% center, 25% right rail).
  - Added the 'Before / During / After' meeting state pill toggle in the header.
  - Rendered `conversation-strategy` and `risk-cards` engine outputs inside the 'Before Meeting' state in the center panel.
- **Cockpit Component**: Implemented `WorkspaceCockpit.tsx` to display essential lead details (archetype, budget, timeline, meeting checklist).
- **Evidence Panel Component**: Implemented `WorkspaceEvidencePanel.tsx` that dynamically updates to show evidence and confidence based on the actively selected strategy or risk block.

## Design Decisions
- Utilized CSS grid/flex properties with `-mx-4 -mt-4` to achieve a full-screen view while remaining inside the `AdminLayout` wrapper.
- Strategy and Risk cards were styled as interactive elements (clickable) to pass their `activeBlockId` state downwards.
- Adhered strictly to UHNW Admin UI aesthetics (glassmorphism accents, Lucide icons, `admin-card` and `admin-primary` color variables).

## Next Steps
- Execute Wave 3 (4-meeting-states-PLAN.md) to implement the "During" and "After" meeting states, capturing human validation and mapping it back to the database.

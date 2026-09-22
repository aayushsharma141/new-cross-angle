---
wave: 2
depends_on: [2-engines]
files_modified:
  - apps/web/src/pages/admin/adminRoutes.tsx
  - apps/web/src/pages/admin/AdminEstimateLeads.tsx
  - apps/web/src/pages/admin/workspace/AdminLeadWorkspace.tsx
  - apps/web/src/pages/admin/workspace/WorkspaceCockpit.tsx
  - apps/web/src/pages/admin/workspace/WorkspaceEvidencePanel.tsx
autonomous: true
requirements:
  - INTEL-06
  - INTEL-07
---

# Plan 3: Workspace UI Layout & Before Meeting State

<objective>
Scaffold the Project Intelligence Workspace full-page layout (Left Rail Cockpit, Center Workspace, Right Rail Evidence Panel) and build the 'Before Meeting' content.
</objective>

<must_haves>
- [ ] Replace "Generate Brief" button with "Open Project Intelligence" in CRM.
- [ ] Implement a full-screen layout with 20% left rail, 55% center, 25% right rail.
- [ ] Header must include the Before/During/After meeting state switcher (pill toggle).
- [ ] Right rail must auto-update based on the currently focused center block.
</must_haves>

<task>
<read_first>
- apps/web/src/pages/admin/AdminEstimateLeads.tsx
- apps/web/src/pages/admin/adminRoutes.tsx
</read_first>
<action>
In `AdminEstimateLeads.tsx`:
Rename the "Generate Brief" button to "Open Project Intelligence →" using Lucide icons `Sparkles` or `Brain`.
Change its `onClick` to navigate to `/admin/leads/:id/workspace` instead of setting `showBrief` state.
In `adminRoutes.tsx`:
Add the new route `/admin/leads/:id/workspace` mapped to the new `AdminLeadWorkspace` component.
</action>
<acceptance_criteria>
- The button text is "Open Project Intelligence →".
- Navigating to `/admin/leads/123/workspace` loads `AdminLeadWorkspace`.
</acceptance_criteria>
</task>

<task>
<read_first>
- apps/web/src/pages/admin/workspace/AdminLeadWorkspace.tsx
</read_first>
<action>
Create `AdminLeadWorkspace.tsx`, `WorkspaceCockpit.tsx` (left rail), and `WorkspaceEvidencePanel.tsx` (right rail).
`AdminLeadWorkspace` should fetch the lead data using `useQuery`.
Implement the 3-panel layout:
- Left (20%, sticky): `WorkspaceCockpit` showing name, archetype, budget, timeline, and meeting checklist.
- Center (55%, scrollable): Renders the state switcher and the "Before Meeting" content (incorporating Executive Summary from `brief-generator.ts`, Strategy from `conversation-strategy.ts`, and Risks from `risk-cards.ts`).
- Right (25%, sticky): `WorkspaceEvidencePanel` showing evidence chain. Context is passed down via a shared `activeBlockId` state.
</action>
<acceptance_criteria>
- Layout renders exactly as a 20/55/25 horizontal split.
- Left and right panels are sticky (non-scrolling with the document body).
- State switcher toggle exists and defaults to "Before Meeting".
- Strategy and Risk cards render in the center panel.
</acceptance_criteria>
</task>

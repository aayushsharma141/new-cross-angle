---
wave: 3
depends_on: [1-database, 3-ui-layout]
files_modified:
  - apps/web/src/pages/admin/workspace/AdminLeadWorkspace.tsx
  - apps/web/src/pages/admin/workspace/WorkspaceDuringMeeting.tsx
  - apps/web/src/pages/admin/workspace/WorkspaceAfterMeeting.tsx
autonomous: true
requirements:
  - INTEL-06
  - INTEL-07
---

# Plan 4: Workspace During & After Meeting States and Flywheel Capture

<objective>
Implement the active and post-meeting states for the workspace, wiring up the recommendation acceptance actions to the Decision Events table.
</objective>

<must_haves>
- [ ] During Meeting state must show live notes and decisions.
- [ ] After Meeting state must show the debrief outcome form.
- [ ] Accept/Modify/Reject decisions on recommendation blocks must save to `decision_events`.
</must_haves>

<task>
<read_first>
- apps/web/src/pages/admin/workspace/AdminLeadWorkspace.tsx
- apps/web/src/services/decision-events.ts
</read_first>
<action>
Create `WorkspaceDuringMeeting.tsx`.
It should render the "During Meeting" specific views: Live Notes textarea, Questions to Ask (from Strategy), and Action Items.
Add this component to the `AdminLeadWorkspace` when the state switcher is on "During".
</action>
<acceptance_criteria>
- Selecting "During Meeting" replaces the center panel content with `WorkspaceDuringMeeting`.
</acceptance_criteria>
</task>

<task>
<read_first>
- apps/web/src/pages/admin/workspace/AdminLeadWorkspace.tsx
- apps/web/src/services/decision-events.ts
</read_first>
<action>
Create `WorkspaceAfterMeeting.tsx`.
It should render a debrief form capturing:
- Which recommendations/strategies were Accepted, Modified, or Rejected.
- Which predicted objections actually occurred (Correct/Partially Correct/Incorrect).
- Client decisions and follow-up actions.
Wire the save action to `useCreateDecisionEvent` from `decision-events.ts`, creating a single `Meeting` event payload with all responses.
</action>
<acceptance_criteria>
- Selecting "After Meeting" replaces the center panel with the debrief form.
- Submitting the form calls `useCreateDecisionEvent` with the correct structured payload.
</acceptance_criteria>
</task>

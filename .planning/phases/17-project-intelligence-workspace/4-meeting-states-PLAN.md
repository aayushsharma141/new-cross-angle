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
Implement the active and post-meeting states for the workspace, ensuring the design intelligence flywheel is powered by immutable `decision_events`. No business intelligence should be written directly to the `leads` table.
</objective>

<must_haves>
- [ ] During Meeting state must show live notes and allow Accept/Modify/Reject directly on recommendation/strategy cards.
- [ ] Every Accept/Modify/Reject action must immediately create a Decision Event capturing timestamp, user, original recommendation, final decision, and optional reason.
- [ ] **Every `decision_event` must reference the recommendation it originated from.** Each event should store a stable `recommendation_id` (or equivalent immutable identifier) for historical tracking.
- [ ] After Meeting state must present a structured outcome form (objections raised, client decisions, follow-up actions, outcome, designer notes).
- [ ] Submitting the debrief form must create a new Decision Event linked to the lead (and not just update the `leads` table).
</must_haves>

<task>
<read_first>
- apps/web/src/pages/admin/workspace/AdminLeadWorkspace.tsx
- apps/web/src/services/decision-events.ts
</read_first>
<action>
Create `WorkspaceDuringMeeting.tsx` and update the recommendation cards (from `Before Meeting` or shared components) to support **Accept / Modify / Reject** actions.
When a designer clicks Accept/Modify/Reject on a recommendation, it must prompt for an optional reason and then call `useCreateDecisionEvent` to log the decision with the original recommendation context.
The "During Meeting" view should also render a Live Notes textarea and action items.
</action>
<acceptance_criteria>
- Recommendation cards have Accept/Modify/Reject buttons.
- Clicking an action creates a `decision_events` record immediately with full context (no direct writes to `leads` for this intelligence).
- Selecting "During Meeting" shows the During Meeting layout.
</acceptance_criteria>
</task>

<task>
<read_first>
- apps/web/src/pages/admin/workspace/AdminLeadWorkspace.tsx
- apps/web/src/services/decision-events.ts
</read_first>
<action>
Create `WorkspaceAfterMeeting.tsx`.
It should render a structured debrief form capturing:
- Actual objections raised (vs predicted)
- Client decisions
- Follow-up actions
- Meeting outcome/status
- Designer notes
Wire the save action to `useCreateDecisionEvent` from `decision-events.ts`, creating a `Meeting Debrief` event payload containing all structured responses. Do not save this intelligence to the `leads` table.
</action>
<acceptance_criteria>
- Selecting "After Meeting" replaces the center panel with the structured debrief form.
- Submitting the form calls `useCreateDecisionEvent` with the correct structured payload.
- No historical business intelligence is written to the `leads` table.
</acceptance_criteria>
</task>

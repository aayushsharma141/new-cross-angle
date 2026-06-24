---
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/20260625110000_decision_events.sql
  - apps/web/src/services/decision-events.ts
autonomous: true
requirements:
  - INTEL-06
  - INTEL-07
---

# Plan 1: Database Schema and Service for Decision Events

<objective>
Implement the `decision_events` Supabase table and its corresponding React Query service layer to serve as the atomic data capture layer for the Decision Intelligence flywheel.
</objective>

<must_haves>
- [ ] `decision_events` table must support generic event typing (`Meeting`, `Call`, etc.).
- [ ] `decision_events` must store payloads for recommendation decisions (Accept/Modify/Reject).
- [ ] Service layer must expose typed `useMutation` hooks for writing these events.
- [ ] Human validation remains the gatekeeper for institutional knowledge (Law 2).
</must_haves>

<task>
<read_first>
- supabase/migrations/20260625100000_alcs_recommendation_evidence.sql
</read_first>
<action>
Create a new Supabase migration `20260625110000_decision_events.sql`.
Define the `decision_events` table with:
- `id` (UUID, primary key)
- `lead_id` (UUID, foreign key to `leads`)
- `event_type` (text enum: 'Meeting', 'Call', 'Proposal', 'Revision', 'SiteVisit', 'Approval', 'Handover')
- `occurred_at` (timestamptz)
- `payload` (JSONB - to hold accepted/modified/rejected recommendations, actual objections, client decisions, follow_up actions, outcome)
- `created_at` (timestamptz)
Set up RLS policies so authenticated users can insert and select events.
</action>
<acceptance_criteria>
- `supabase/migrations/20260625110000_decision_events.sql` exists and defines the table with all specified columns and RLS.
</acceptance_criteria>
</task>

<task>
<read_first>
- supabase/migrations/20260625110000_decision_events.sql
</read_first>
<action>
Create `apps/web/src/services/decision-events.ts`.
Implement the TypeScript interfaces `DecisionEvent` and `DecisionEventPayload`.
Implement `useCreateDecisionEvent` utilizing `@tanstack/react-query` and Supabase client to insert records into `decision_events`.
</action>
<acceptance_criteria>
- `decision-events.ts` exports `useCreateDecisionEvent` which correctly calls Supabase `from('decision_events').insert()`.
</acceptance_criteria>
</task>

# Phase 17: Acceptance & Stress Audit (Browser UAT)

This User Acceptance Testing (UAT) document governs the transition from Phase 17 into production. It must be passed fully before closing V5 (Decision Intelligence) and shifting focus to evidence collection.

### Browser UAT Scenarios

#### Scenario 1 — Happy Path
- [ ] Open a lead.
- [ ] Review Before Meeting.
- [ ] Accept one recommendation.
- [ ] Modify one recommendation.
- [ ] Reject one recommendation.
- [ ] Complete After Meeting.
- [ ] Verify **6–10 `decision_events`** were created.
- [ ] Verify every event shares the same `session_id`.

#### Scenario 2 — Refresh Recovery
- [ ] Accept two recommendations.
- [ ] Refresh midway.
- [ ] Continue meeting.
- [ ] Confirm no duplicate events.
- [ ] Confirm session remains intact (same `session_id`).

#### Scenario 3 — Double Submit
- [ ] Double-click Accept.
- [ ] Double-click Debrief Save.
- [ ] Database should contain **one** event only for each.

#### Scenario 4 — Timeline Replay
- [ ] Open the lead again.
- [ ] Verify you can answer:
  - What did ALCS recommend?
  - Which recommendations were accepted?
  - Which were modified?
  - Why?
  - Which objections actually happened?
  - What did the client decide?
  - What follow-up exists?
  *(without reading raw JSON)*

#### Scenario 5 — Multi-meeting
- [ ] Create two sessions.
- [ ] Verify timeline groups as:
  - Meeting #1 (Strategy decisions, Risk decisions, Debrief)
  - Meeting #2 (Strategy decisions, Risk decisions, Debrief)

#### Scenario 6 — Failure Recovery
- [ ] Disconnect network.
- [ ] Accept recommendation.
- [ ] Reconnect.
- [ ] Ensure no silent failures, clear retry state, and no duplicate events.

### Final Gate
- [ ] One real designer can complete a meeting and, one week later, another designer can open the workspace and reconstruct the entire conversation without asking the original designer any questions.

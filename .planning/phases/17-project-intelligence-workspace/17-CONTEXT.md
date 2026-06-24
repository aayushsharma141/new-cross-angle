# Phase 17: Project Intelligence Workspace - Context

**Gathered:** 2026-06-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Evolve the CRM Lead Detail into a dedicated **Project Intelligence Workspace** — a full-page environment at `/admin/leads/:id/workspace` where a designer opens one screen before every client meeting and finds everything needed to prepare. The workspace has three temporal states: **Before Meeting** (preparation), **During Meeting** (live notes and decisions), **After Meeting** (outcome capture and feedback).

The Proposal Generator is explicitly deferred. This phase delivers the intelligence and decision-capture infrastructure, not the output artifact.

</domain>

<decisions>
## Implementation Decisions

### D-1 — Workspace Entry Point
- **D-01:** Rename the Phase 16 "Generate Brief" button to **"Open Project Intelligence →"** in the CRM Lead Detail drawer.
- **D-02:** The button navigates to `/admin/leads/:id/workspace` — a dedicated full page, not a modal or slide-over.
- **D-03:** The Lead Detail drawer stays lightweight (contact, discovery summary, estimate, status). The workspace is the deep-work environment.

### D-2 — Page Layout (Three-Panel Hybrid)
- **D-04:** **Left rail (20%, sticky):** Client context cockpit — name, archetype, budget, property, timeline, lead status, meeting checklist. Never becomes the primary working area.
- **D-05:** **Center (55%, scrollable):** Working area. Sections scroll vertically. Content changes based on the active Meeting State.
- **D-06:** **Right rail (25%, sticky):** Evidence Panel + Notes + Quick Actions. Auto-updates based on the currently selected recommendation. Read-only intelligence context.
- **D-07:** Meeting State is controlled by a **state switcher** (Before / During / After) in the page header — not tabs. Only the center content changes; layout stays constant.

### D-3 — Center Content by Meeting State
- **D-08:** **Before Meeting:** Executive Summary (from Phase 16 brief), Conversation Strategy, AI Recommendation, Conversation Risk Cards, Visual References.
- **D-09:** **During Meeting:** Live Notes, Questions to ask, Decisions captured, Action Items. Evidence Panel on the right updates dynamically.
- **D-10:** **After Meeting:** Outcome form — Recommendations accepted/modified/rejected, Objections that actually occurred, Client decisions, Follow-up actions.

### D-4 — Conversation Strategy Engine
- **D-11:** Deterministic, modular strategy engine — extends `brief-generator.ts` with structured decision blocks (archetype + sensory signals + ALCS recommendation + budget + CRM context + meeting state).
- **D-12:** Each strategy block (opening hook, conversation order, topics to explore, topics to avoid, visual references to show first) is independently sourced from evidence and carries its own confidence signal.
- **D-13:** LLM is explicitly **optional and presentation-layer only** — may polish tone of generated text, never decides strategy content. Phase 17 ships with rule-based only; LLM integration is a future enhancement.
- **D-14:** Each strategy block shows an **Accept / Modify / Reject** action. The decision is logged, linked to the supporting evidence, and becomes the first input to the Decision Intelligence flywheel.

### D-5 — Evidence Panel (Right Rail)
- **D-15:** Persistent sticky right rail. Read-only. Auto-updates to show evidence for whichever recommendation or strategy block the designer is currently viewing.
- **D-16:** Evidence chain displayed: Evidence → Insights → Confidence → Supporting Observations (current phase shows rule-based evidence from ALCS; V6+ will show institutional observations).
- **D-17:** Accept / Modify / Reject actions live on the **recommendation card in the center**, not in the evidence panel. Evidence panel is context only.

### D-6 — Conversation Risk Cards (Objection Predictions)
- **D-18:** Maximum **3 cards**, ranked by **business impact** (not probability).
- **D-19:** Each card contains: Risk headline, Why (evidence from archetype + budget + timeline + property + family signals), Early Signals (what to listen for), Recommended Response, Confidence (High/Medium/Low), Success Indicator (how to know the concern was resolved).
- **D-20:** After the meeting, the designer marks each prediction: **Correct / Partially Correct / Incorrect**. This feeds the future Decision Intelligence engine.
- **D-21:** Risk prediction is rule-based — same deterministic approach as Conversation Strategy. No autonomous learning in Phase 17.

### D-7 — Decision Capture & Flywheel Infrastructure
- **D-22:** New Supabase table: **`decision_events`** — generic, event-typed. Columns: `id`, `lead_id` (FK), `event_type` (enum: Meeting, Call, Proposal, Revision, SiteVisit, Approval, Handover), `occurred_at`, `payload` (JSONB — recommendations accepted/modified/rejected, actual objections, client decisions, follow-up actions, outcome).
- **D-23:** The After Meeting state creates exactly one `Meeting` event record per session in `decision_events`.
- **D-24:** Every recommendation decision (Accept / Modify / Reject) captured in the event is linked to its source evidence via the existing `alcs_evidence` field on the `leads` table.
- **D-25:** No automatic learning. Human validation is required before any outcome becomes institutional knowledge (per Constitution Law 8 and Law 2).

### D-8 — Deferred (Out of Scope for Phase 17)
- **Proposal Generator** — deferred. Proposals consume workspace intelligence; they do not generate it. Belongs in V5+ after the workspace is validated.
- **Similar Projects / Institutional Insights** — deferred to V6. Right rail placeholder may be added but no data populates it yet.
- **LLM tone polishing** — deferred. Rule-based engine ships first.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prior Phase Context
- `apps/web/src/addons/calculators/components/data/engines/brief-generator.ts` — Phase 16 synthesis engine. Phase 17 extends this with the Conversation Strategy and Risk Card generators.
- `apps/web/src/pages/admin/AdminEstimateLeads.tsx` — Current CRM page. Phase 17 adds the "Open Project Intelligence" button and creates the new workspace route.
- `.planning/phases/16-designer-briefing-card/16-CONTEXT.md` — Phase 16 decisions; the brief becomes the Executive Summary section of the workspace.
- `.planning/phases/15-recommendation-explainability/15-CONTEXT.md` — Evidence model that the right rail Evidence Panel consumes.

### Platform Constitution & Architecture
- `.planning/CONSTITUTION.md` — Ten immutable laws. Law 2 (Human Judgment Wins), Law 3 (Every Decision is Traceable), Law 6 (Reduce Cognitive Load), Law 7 (Every Feature Closes a Loop) are directly exercised by this phase.
- `.planning/PROJECT.md` — Four intelligence layers; `decision_events` table is the first V6 Institutional Intelligence infrastructure.
- `.planning/VALIDATION-SPRINT.md` — The sprint that shaped Phase 17's scope. Informs which brief sections were adopted vs. unused.
- `.planning/NEVER-BUILD.md` — Validated rejections from sprint. Check before adding any UI element to the workspace.

### Database
- `supabase/migrations/20260625100000_alcs_recommendation_evidence.sql` — Adds `alcs_evidence`, `alcs_confidence`, `alcs_reasoning` to `leads`. The right rail reads these.
- New migration required for `decision_events` table (to be authored in Phase 17).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `brief-generator.ts` (`generateDesignerBrief`): Core synthesis function. Phase 17 extends it — do not replace it. The brief output becomes the Executive Summary section.
- `AdminEstimateLeads.tsx` (`detailLead`, `showBrief` state, `briefData` memo): Existing brief trigger pattern. Phase 17 changes `setShowBrief` to a router navigation to `/admin/leads/:id/workspace`.
- `adminRoutes.tsx`: Add the new `/admin/leads/:id/workspace` route here.
- Lucide icons already imported in `AdminEstimateLeads.tsx`: `Brain`, `Sparkles`, `FileText` — reuse for workspace entry button.

### Established Patterns
- **Rule-based engine in TypeScript, no API calls** — maintains the determinism standard set in Phase 16.
- **`useMemo` for synthesis** — follow the pattern in `AdminEstimateLeads.tsx` line 51-55 for derived workspace data.
- **Supabase `@tanstack/react-query`** — all data fetching uses `useQuery`; the new `decision_events` writes use `useMutation`.

### Integration Points
- New `/admin/leads/:id/workspace` page component (new file, e.g., `AdminLeadWorkspace.tsx`).
- New `conversation-strategy.ts` engine alongside `brief-generator.ts` in the engines directory.
- New `risk-cards.ts` engine for Conversation Risk generation.
- New `decision-events.ts` service for Supabase `decision_events` CRUD.

</code_context>

<specifics>
## Specific Ideas

- **State switcher design:** "Before Meeting / During Meeting / After Meeting" as pill toggle in the page header, not tabs. Same three-panel layout stays; only the center content changes.
- **Evidence Panel behavior:** When the designer hovers or focuses a recommendation block in the center, the right rail automatically updates to show that block's evidence. This mirrors IDE-style contextual help — no extra click required.
- **Conversation Risk Cards:** Visual hierarchy should communicate impact severity immediately. High-impact risks should be visually distinct (e.g., a coloured left border or badge), not just ranked.
- **After Meeting capture:** Should feel like a quick debrief form (under 2 minutes to complete), not a database form. Structured but conversational in language.

</specifics>

<deferred>
## Deferred Ideas

- **Proposal Generator** — Out of scope for Phase 17. The workspace must be validated before generating output artifacts from it. Future phase (V5+).
- **LLM tone polishing layer** — Rule-based engine ships first. LLM is an optional enhancement once the strategy engine is validated.
- **Similar Projects / Institutional Insights panel** — Placeholder in the right rail is acceptable; data populates in V6+ when `decision_events` has sufficient history.
- **Multiple meeting sessions per lead** — `decision_events` table is generic enough to support this, but the UI should surface only the most recent session in the workspace for now.
- **Email/calendar integration for follow-up actions** — Natural next step after After Meeting capture is proven useful, but out of Phase 17 scope.

</deferred>

---

*Phase: 17-project-intelligence-workspace*
*Context gathered: 2026-06-25*

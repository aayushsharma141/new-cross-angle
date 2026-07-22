# Operational Investigations

*Purpose: Separate channel for operational integrity issues discovered during Dataset collection. These are instrument problems — not product learnings. Do not conflate the two.*

**Rule:** An OI is closed only when the facts are established. Architecture changes require a separate governance decision.

---

## OI-001 — Missing `submit-workspace-commitment` Edge Function Deployment

**Opened:** 2026-07-07
**Closed:** 2026-07-07
**Discovered during:** Founding Case 001 execution
**Status:** ✅ Closed — two root causes identified, both resolved

---

### Symptom

Calling `submit-workspace-commitment` on the remote Supabase staging environment returned HTTP 404. The local implementation exists. The `submit-estimate` function deployed and executed successfully in the same environment.

---

### Evidence Chain

#### Baseline (pre-deploy) — 2026-07-07T16:09:00Z

```
HTTP GET https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/submit-workspace-commitment
Response: {"code":"NOT_FOUND","message":"Requested function was not found"}
```

Confirms: the failure was **deployment absence** at the Supabase routing layer, not a code bug.

#### Deploy — 2026-07-07T16:09:47Z

```
npx supabase functions deploy submit-workspace-commitment
Output: {"project_ref":"iuuivmwqodefdrrrewol","functions":["submit-workspace-commitment"],"message":"Deployed Functions."}
```

Git SHA at deploy time: `914183b72d22e5af1cb7f8758ac7e1b5244f4fd4`

#### First Verification (post-deploy) — 2026-07-07T16:10:59Z

```
HTTP POST → 500
{"error":"Failed to create CRM lead: invalid input value for enum lead_source_enum: \"workspace_studio\"","request_id":"a1781f5e492793c2-CCU"}
```

404 resolved. Secondary failure discovered: **schema mismatch**. The function calls `lead_source: 'workspace_studio'` but this value was absent from `lead_source_enum`.

**Valid enum values at time of discovery:**
`aesthetic_discovery_engine`, `estimator`, `instagram`, `other`, `referral`, `style_quiz`, `website_contact`, `welcome_popup`, `whatsapp`

#### Schema Fix — 2026-07-07T16:13:26Z

Migration: `20260707000001_add_workspace_studio_lead_source.sql`

```sql
ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'workspace_studio';
```

Pushed via `npx supabase db push --linked`. Confirmed applied.

#### Final Verification — 2026-07-07T16:14:41Z

```
HTTP POST → 200
{"success":true,"id":"b77b00f2-f4de-4592-ab7a-e308cda00476"}
```

Database write confirmed:
```
id:          b77b00f2-f4de-4592-ab7a-e308cda00476
email:       oi001-final-1783440850643@test.example.com
lead_source: workspace_studio
created_at:  2026-07-07 16:14:41.742491+00
```

---

### Root Causes (both resolved)

| # | Root Cause | Category | Resolution |
|---|-----------|----------|------------|
| 1 | Function never deployed to remote staging | Deployment drift | `npx supabase functions deploy submit-workspace-commitment` |
| 2 | `workspace_studio` absent from `lead_source_enum` | Schema mismatch | Migration `20260707000001_add_workspace_studio_lead_source.sql` |

---

### Acceptance Criteria — All Met

- [x] Root cause identified: **deployment drift** (primary) + **schema mismatch** (secondary)
- [x] Function deployed and smoke-tested on remote — HTTP 200 confirmed
- [x] Database write verified — lead `b77b00f2` persisted with `lead_source: workspace_studio`
- [x] Finding recorded below as PL-007

---

### Process Learning Generated

**PL-007** — A deployed edge function can be operationally broken in two independent layers: (1) the deployment routing layer (function not present on remote), and (2) the schema validation layer (function present but referencing an enum value the database rejects). Both layers must be verified before declaring a function production-ready. A smoke-test that returns non-404 is not sufficient; it must also return HTTP 200 with a confirmed database write.

*Classification: [Likely] — generalised from one instance. Upgrade to [Certain] if recurs on another function.*

---

## OI-002 — Append-Only Ledger Query Strategy

**Opened:** 2026-07-07
**Discovered during:** Founding Case 001 — Open Question
**Status:** Open — documenting, not solving

### Symptom / Observation

`workspace_commitment_revisions` functions as the primary ledger with no parent `workspace_commitments` aggregate table. To determine the "current" commitment for a given workspace, a query must traverse revision history and resolve the latest state. The query pattern for this is unknown.

### What this is NOT

This is not a performance problem (we have n=1 case). It is an **undocumented assumption** in the architecture. The risk is not present yet; it may never materialise. The investigation goal is documentation, not optimization.

### Investigation Questions

1. What is the current SQL query path to retrieve "current commitment status" for a workspace?
2. Are there indexes on `workspace_id`, `created_at`, or `status` in `workspace_commitment_revisions`?
3. What is the expected query complexity at n=100? n=10,000?
4. Is there a view, materialized view, or RPC that abstracts this?
5. Is the append-only design intentional event-sourcing, or an accidental absence of the parent table?

### Acceptance Criteria for Close

- [ ] Current query path documented (SQL or RPC).
- [ ] Index coverage assessed.
- [ ] Scalability assumption stated (e.g., "acceptable to n=X revisions per workspace without optimization").
- [ ] Design intent confirmed: intentional event-sourcing OR missing parent table to be added.
- [ ] Finding recorded in process learnings if a pattern emerges from later cases.

### Risk

**Low now. Monitor.** If Cases 2–10 all expose query pain around this pattern, graduate OI-002 to an engineering priority with evidence backing.

---

*OI cadence rule: An OI opened during a Founding Case must be assessed (not necessarily closed) before the following Founding Case begins.*

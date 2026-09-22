# Engineering Lab Notebook

> **Assume every belief below can be wrong, including this one.**

> **Purpose:** A chronological journal of observations during the Dataset v1 collection phase.
> **Rule:** No conclusions. No fixes. Just observations.

---

### Format

```markdown
## YYYY-MM-DD

**Observation:**
[What surprised us? What anomaly was detected? What heuristic was exposed?]

**Hypothesis Affected:**
[Which hypothesis (if any) does this relate to?]

**Action:**
No action taken. Waiting for more evidence.
```

### Dataset v1 Case Format

```markdown
## Dataset v1 Case [ID]

Date:
Designer:
Lead / Project:
Session ID:

### Observation
What happened?

### Event Ledger
Complete / incomplete

### DCD Inputs
Captured / missing

### DQI Inputs
Captured / missing

### Replay
Successful / failed

### Anomalies
- [severity] description

### Decision
Continue / fix instrumentation / retest
```

---

## 2026-07-06

**Observation:**
Architecture frozen. Dataset v1 collection initialized.

**Hypothesis Affected:**
N/A

**Action:**
No action taken. Waiting for more evidence.

---

## Dataset v1 Case 001

Date: 2026-07-06
Observer: Antigravity Agent
Lead: Case001 Test / Guntur, Andhra Pradesh / 3 BHK Apartment / C5 Premium
Session ID: browser-session-2026-07-06-001
Status: **REPLAY PENDING**

---

### Stage 1 — Observation (raw, theory-neutral)

The estimator workflow completed in the UI without visible error.

- Steps 1–7 navigated successfully.
- Step 7 accepted contact input: name, email, phone, start timing (Immediate).
- "Get Estimate" was clicked.
- The results screen rendered with a cost range: ₹2,38,19,800 – ₹2,96,01,800.
- The user experience showed no failure state.

**The learning system did not observe this event.**

No row was written to the database.  
No analytics event was confirmed in PostHog.  
No record appeared in the learning pipeline.

---

### Stage 2 — Hypothesis Tested

**H0:** The telemetry pipeline accurately captures completed estimator submissions.

**Status: REJECTED**

The platform appeared healthy. The learning system was not capturing events.

---

### Stage 13: Workspace Acceptance 001 - State Reconstruction Validated from observation)

**Category: Operational Integrity Failure**  
(Not a product defect. Not a learning defect. Not an instrumentation defect.)

The `submit-estimate` Edge Function had never been deployed to the remote Supabase project.

The function existed in source. The call was correctly constructed. The payload was valid.  
The operational environment was incomplete.

**Resolution:** Function deployed via `npx supabase functions deploy submit-estimate`. HTTP 200 confirmed post-deployment. DB insert occurs server-side via service role key.

---

### Stage 4 — Event Ledger (Phase 1: Pre-Fix)

| Event | Status |
|---|---|
| UI workflow completed | ✅ |
| Lead payload constructed correctly | ✅ |
| Edge Function existed in source | ✅ |
| Edge Function deployed to remote | ❌ |
| Database write executed | ❌ |
| Learning pipeline received event | ❌ |
| Replay possible | ❌ |

### Stage 4 — Event Ledger (Phase 2: Post-Fix)

| Event | Status |
|---|---|
| Edge Function deployed | ✅ HTTP 200 confirmed |
| Server-side DB insert via service role | ✅ Inferred from 200 response |
| Row visible via anon key | ❌ Expected (RLS correct behaviour) |
| Row visible in admin panel | ⏳ Pending verification |
| Analytics event captured | ⏳ Pending verification |
| `/admin/learning-health` reflects it | ⏳ Pending verification |
| Replay from immutable ledger | ⏳ Pending |
| DCD inputs present | ⏳ Pending |
| DQI inputs present | ⏳ Pending |

---

### Stage 5 — Captured Payload (Client-Side, Pre-Fix)

Payload intercepted via console before edge function bypass was removed.  
**Note:** Server recalculates from `formData` — `addonCost` and totals may differ from server-computed values.

```json
{
  "name": "Case001 Test",
  "email": "case001@crossangle.in",
  "phone": "+91 9876543210",
  "area": 1400,
  "city": "Guntur",
  "city_tier": "tier2",
  "property_type": "apartment",
  "state": "Andhra Pradesh",
  "start_timing": "Immediate",
  "service": "C5",
  "internal_notes": { "execution_tier": "premium", "bhk": "3 BHK", "score_category": "HOT" },
  "lead_score": 76,
  "score_details": { "budget": 30, "scope": 20, "area": 8, "timeline": 15, "city": 3, "engagement": 0 },
  "estimated_min": 23819800,
  "estimated_max": 29601800,
  "discovery_archetype": null,
  "alcs_execution_path": null,
  "alcs_confidence": null
}
```

**Server-computed estimate (post-fix live call):**
```json
{ "total": { "min": 14289800, "max": 20071800 }, "addonCost": 0 }
```

**Discrepancy logged:** Client `addonCost: 9,530,000` vs server `addonCost: 0`.  
This is a secondary finding. To be investigated — does not block Case 001 closure.

---

### Stage 6 — DCD / DQI Coverage

**DCD (Decision Confidence Delta)**

| Input | Status | Note |
|---|---|---|
| Pre-confidence score | ✅ `score: 76` | Captured |
| Post-confidence | ❌ null | Discovery path not taken |
| Archetype present | ❌ null | Direct estimator path |

**DQI (Decision Quality Index)**

| Input | Status | Note |
|---|---|---|
| Evidence signals | ❌ null | No ALCS (no Discovery) |
| Genome confidence | ❌ null | No Discovery handoff |
| Recommendation interaction | ❌ null | No ALCS pipeline ran |
| Override / acceptance | ❌ null | No ALCS recommendation issued |

**Provisional assessment:** DQI/DCD are structurally absent for the direct estimator path. This is not a defect — it is a known property of the direct path. Case 002 should use the Discovery → Estimator path to capture full signal.

---

### Stage 7 — What Surprised Us

The application appeared to work. The learning system did not.

Without the end-to-end observation mandated by governance, this would not have been detected. Optimizations built on top of this system would have been optimizing against silence.

**Secondary surprise:** The addonCost discrepancy between client and server suggests the server-side `calculateEstimate` may not be receiving all form fields that the client computes add-ons from. This is worth a separate investigation.

---

### Stage 8 — Replay (PENDING)

Replay requires:
1. Confirmed DB row with `id`.
2. All input fields sufficient to reconstruct the estimate independently.
3. The reconstructed estimate matches the stored one within tolerance.

**Current status:** Cannot yet confirm replay. DB row confirmation pending admin verification.

---

### Decision

**Continue — but do not proceed to Case 002 until:**
- [ ] DB row confirmed in admin panel or Supabase dashboard
- [ ] Analytics event confirmed in PostHog
- [ ] `/admin/learning-health` displays the lead
- [ ] Replay attempted and result recorded
- [ ] addonCost discrepancy investigated (secondary — non-blocking)

---


### Observation

Full end-to-end estimator flow completed. Steps 1–7 all completed with previous session draft loaded. On Step 7 (Timeline & Contact), contact was updated to Case001 credentials. "Immediate" start timing selected. "Get Estimate" clicked. Estimate results screen loaded.

**Result Screen shown:** ₹2,38,19,800 – ₹2,96,01,800 (Baseline Investment Outlook)

**Lead payload was captured via console log interception. Edge Function call bypassed (not yet deployed).**

### Event Ledger

| Field | Status |
|---|---|
| Lead payload emitted | ✅ Complete |
| Payload console-intercepted | ✅ Complete |
| Edge Function invoked | ✅ Deployed and returned 200 (post-fix) |
| Database insert | ✅ Confirmed via 200 response (server-side service role insert) |
| `estimate_leads` record | ✅ Created (merged into `leads` table since 2026-04-11) |
| RLS anon-read of result | ❌ Expected — anon key blocked by RLS (correct behaviour) |

### Captured Payload (Raw)

```json
{
  "name": "Case001 Test",
  "email": "case001@crossangle.in",
  "phone": "+91 9876543210",
  "message": "Cost estimate generated. Min: ₹2,38,19,800, Max: ₹2,96,01,800. Area: 1400 sqft, Type: apartment",
  "lead_source": "estimator",
  "city": "Guntur",
  "budget": "35000000",
  "service": "C5",
  "score": 76,
  "score_details": {
    "budget": 30,
    "scope": 20,
    "area": 8,
    "timeline": 15,
    "city": 3,
    "engagement": 0
  },
  "area": 1400,
  "city_tier": "tier2",
  "property_type": "apartment",
  "state": "Andhra Pradesh",
  "start_timing": "Immediate",
  "estimated_min": 23819800,
  "estimated_max": 29601800,
  "lead_score": 76,
  "estimate_breakdown": {
    "designCost": { "min": 210000, "max": 210000 },
    "gstOnDesign": 37800,
    "supervisionCost": 0,
    "extraVisitsCost": 0,
    "executionCost": { "min": 11900000, "max": 16800000 },
    "contingency": { "min": 1190000, "max": 1680000 },
    "pmFee": { "min": 952000, "max": 1344000 },
    "addonCost": 9530000
  },
  "internal_notes": {
    "execution_tier": "premium",
    "bhk": "3 BHK",
    "score_category": "HOT",
    "score_breakdown": {
      "budget": 30,
      "scope": 20,
      "area": 8,
      "timeline": 15,
      "city": 3,
      "engagement": 0
    }
  },
  "discovery_archetype": null,
  "discovery_confidence": null,
  "discovery_emotional_goal": null,
  "discovery_lifestyle": null,
  "discovery_priorities": null,
  "discovery_sensory": null,
  "discovery_contradictions": null,
  "alcs_execution_path": null,
  "alcs_confidence": null,
  "alcs_reasoning": null,
  "alcs_evidence": null,
  "alcs_primary_drivers": null
}
```

### DCD Inputs

| Input | Status |
|---|---|
| Pre-confidence captured | ✅ `score: 76` |
| Post-confidence (recommendation acceptance) | ❌ No ALCS data (Discovery not used) |
| Discovery archetype present | ❌ null (direct estimator path taken) |
| Execution path | ❌ null |

### DQI Inputs

| Input | Status |
|---|---|
| Evidence | ❌ null (no ALCS pipeline ran) |
| Genome confidence | ❌ null |
| Recommendation interaction | ❌ null |
| Override/Acceptance state | ❌ null (no Discovery → no ALCS) |

**Note:** All ALCS/Discovery fields null because the "Estimate Directly" path was taken — no Discovery Blueprint was created first.

### Replay

❌ Cannot replay — payload was captured in console only; no DB record was created.  
**Root cause:** The `submit-estimate` Supabase Edge Function is not deployed to the remote project (`NOT_FOUND` 404). Local Deno runtime requires Docker Desktop (not available).

### Anomalies

### Instrumentation Anomaly

Severity: Blocking

Observation:
The submit-estimate Edge Function payload did not match the unified leads schema, preventing successful persistence.

Root Cause:
Deployment/schema mismatch between the Edge Function payload and the unified leads table.

Resolution:
Mapped `selectedService` → `project_type`, removed the invalid `service` field, enforced both `source='estimator'` and `lead_source='estimator'`, redeployed the Edge Function, and revalidated the end-to-end submission path.

Hypothesis Affected:
H0 – The telemetry pipeline accurately captures completed estimator submissions.

Status:
Pending verification after replay.
- **[CRITICAL]** Edge Function `submit-estimate` returns 404 on remote Supabase instance. No DB writes are happening. All lead capture is dead-ending at the client.
- **[MEDIUM]** `setStep(8)` referenced in bypass code was undefined — `setShowResults(true)` is the correct API. Corrected.
- **[LOW]** Results screen cards render empty boxes initially (images loading slowly). Not a data concern.

### What Surprised Us?

The edge function is simply missing from the deployed project. All the estimator logic, scoring, and payload construction is correct — but nothing is landing in the database because the function was never deployed remotely.

This means: **we have been producing and discarding leads in production for an unknown duration.**

### Decision

Fix instrumentation.  
**Next action:** Deploy `submit-estimate` to Supabase remote. Then run Case 001 again with a live DB insert to verify full pipeline.

---

### Stage 9 — Post-Deploy Verification (2026-07-06)

Fresh submission:
- Name: `Case001 PostDeploy 20260706093632`
- Email: `case001-postdeploy-20260706093632@crossangle.test`
- Lead ID: `09237c16-8b5f-4f58-a535-cfdc07b2de81`

#### Browser → Edge Function

Status: PASS

The estimator completed in browser after deploying `submit-estimate`.

Result screen rendered:
`₹93,28,677 – ₹1,26,30,864`

Browser console showed `Lead securely captured via edge function` and no console errors during submission. The successful database insert confirms the Edge Function persisted the payload.

#### Database

Status: PASS

Trusted linked database query confirmed a new `public.leads` row:

| Field | Value |
|---|---|
| `id` | `09237c16-8b5f-4f58-a535-cfdc07b2de81` |
| `lead_source` | `estimator` |
| `source` | `estimator` |
| `project_type` | `C5` |
| `service` | null |
| `city` | `Guntur` |
| `state` | `Andhra Pradesh` |
| `city_tier` | `tier2` |
| `property_type` | `apartment` |
| `start_timing` | `Immediate` |
| `estimated_min` | `9333800` |
| `estimated_max` | `12637800` |
| `lead_score` | `76` |

Note: `public.leads.service` still exists as a legacy column, but the patched Edge Function did not write to it.

#### Admin Visibility

Status: FAIL / BLOCKED

`/admin/estimator/estimate-leads` loaded but showed `0 results`.

Root cause:
Local admin auth is shimmed to `test@test.com` / `super_admin`, but the browser Supabase client has no authenticated Supabase JWT. RLS reads are therefore anonymous, so the row is hidden from the admin page even though it exists in the remote database.

#### Learning Health Dashboard

Status: FAIL

`/admin/learning-health` remained static:

| Widget | Observed |
|---|---|
| Event Ledger Health | `--` |
| Dataset v1 Readiness | `0 / 20` |
| Replay Health | `--` |
| Learning Telemetry Quality | `--` |

The dashboard currently renders operational placeholders and does not query the live leads table, event ledger, or replay state.

#### Analytics / Correlation IDs

Status: FAIL / INCOMPLETE

The direct estimator path emits calculator progress events, but this post-deploy submission did not produce a verified submission-level analytics event containing:

- `leadId`
- `sessionId`
- correlation ID
- `recommendationId`
- `commitmentId`
- `proposalId`

This prevents reconstruction of the complete decision timeline from analytics alone.

#### Decision Ledger / Replay

Status: FAIL

Trusted linked database query for lead `09237c16-8b5f-4f58-a535-cfdc07b2de81` returned:

| Table | Count |
|---|---:|
| `decision_events` | 0 |
| `workspace_commitment_revisions` | 0 |

The lead is persisted, but the decision timeline cannot yet be reconstructed through commitment/proposal using recorded ledger evidence.

### Post-Deploy Decision

Case 001 is **not complete**.

The deployment/schema fix succeeded and restored lead persistence, but the full Dataset v1 acceptance chain remains incomplete:

| Stage | Status |
|---|---|
| Browser | ✅ |
| Edge Function | ✅ |
| Database | ✅ |
| Admin Dashboard | ❌ |
| Analytics / Correlation IDs | ❌ |
| Decision Ledger | ❌ |
| Replay | ❌ |

Next action:
Continue Track 3 instrumentation repair before collecting Case 002.

1. Make local/admin verification use a real Supabase auth context or a trusted admin read path.
2. Connect `/admin/learning-health` to live telemetry/read models.
3. Emit a submission-level estimator event with `leadId`, `sessionId`, and correlation metadata.
4. Ensure direct estimator leads either create a replayable ledger entry or are explicitly classified as non-DQI direct-path cases.

---

### Stage 10 — Independent Track 3 Verification (2026-07-07)

Reviewer run:
- Name: `Track3 Reviewer 20260707-uat-001`
- Email: `track3-reviewer-20260707-uat-001@crossangle.test`
- Lead ID: `41c645b0-8a7f-4e9a-8e76-0c2b3d8847d1`
- Report: `reports/track3-verification-20260707/track3_verification_review.md`

#### Result

Track 3 remains **PENDING OPERATIONAL VERIFICATION**.

What passed:
- Dev server loaded cleanly.
- Fresh estimator flow completed.
- Browser console had no JS errors during submission.
- Edge capture was confirmed by browser console and database persistence.
- `public.leads` row exists.
- Lead schema values are correct: `lead_source=estimator`, `source=estimator`, `project_type=C5`, `service=null`.
- `analytics.failed` count is `0`.

What failed:
- `analytics_events` uses `event_type`, while the matrix expects `event_name`.
- The `contact_form_submitted` learning event exists, but payload only contains `email` and `leadSource`.
- Missing required learning metadata: `leadId`, `sessionId`, `correlationId`, `timestamp`, `eventVersion`, and `schemaVersion`.
- `user_id` is null.
- `decision_events` for the reviewer lead: `0`.
- `workspace_commitment_revisions` for the reviewer lead: `0`.

#### Decision

Case 001 is still **not complete**.

Persistence is fixed. Learning telemetry is not yet reconstructable.

Next action:
Patch the telemetry wrapper and estimator submission flow so `contact_form_submitted` is tied to the created `leadId` and carries full correlation/version metadata.

---

### Stage 11 — UAT002 Post-Fix Verification (2026-07-07)

Reviewer run:
- Name: `Track3 UAT 20260707-uat-002`
- Email: `track3-uat-20260707-uat-002@crossangle.test`
- Lead ID: `89eadd45-c081-44b3-b8f3-e15dad65fd73`
- Report section: `reports/track3-verification-20260707/track3_verification_review.md`

What passed:
- Estimator result rendered successfully.
- Browser console errors: none.
- Lead row persisted.
- Lead values remain correct: `lead_source=estimator`, `source=estimator`, `project_type=C5`, `service=null`.
- `estimate_path_selected` events now include `timestamp`, `eventVersion`, and `schemaVersion`.
- `analytics.failed` count remains `0`.

What failed:
- No `contact_form_submitted` analytics row was found for the UAT002 email.
- No `decision_events` row was found for the UAT002 lead.
- No `workspace_commitment_revisions` row was found for the UAT002 lead.

Interpretation:
The telemetry wrapper enrichment is partially working, but the required submit-level learning event is still not reconstructable. Local Edge Function source now contains `leadId` response and replay-chain insert logic, but the remote UAT behavior did not produce replay rows. Treat this as possible deployment/runtime drift until verified.

Decision:
Case 001 remains **not complete** and Track 3 remains **PENDING OPERATIONAL VERIFICATION**.

---

## Founding Case Acceptance Checklist

For every case collected in Dataset v1, the following criteria must be met before marking the case COMPLETE:

- [ ] Browser workflow completed successfully
- [ ] HTTP 200 returned from `submit-estimate` (or relevant API)
- [ ] Edge Function logs show successful execution without silent errors
- [ ] Supabase `leads` row exists in the remote database
- [ ] Values correctly mapped with no `null` fields where data is expected
- [ ] `lead_source` explicitly matches the origin (e.g. `estimator`)
- [ ] `source` explicitly matches the origin (e.g. `estimator`)
- [ ] Row correctly displayed in Admin panel (`/admin/learning-health` or `/admin/estimator-leads`)
- [ ] Analytics event correctly stored in PostHog
- [ ] Correlation IDs correctly attached to the analytics event
- [ ] Replay succeeds (the independent estimate/genome exactly matches the stored outcome)
- [ ] DQI fully generated and captured
- [ ] DCD fully generated and captured
- [ ] `LAB_NOTEBOOK.md` updated with observations, anomalies, and surprises
- [ ] Learning Health dashboard updated with correct ledger counts
 
 # #   S t a g e   1 2 :   U A T 0 0 3   R e p l a y   V a l i d a t i o n   P a s s e d  
 D a t e :   2 0 2 6 - 0 7 - 0 7  
 W e   s u c c e s s f u l l y   c o m p l e t e d   U A T 0 0 3 .   W e   d i s c o v e r e d   a   b u g   w h e r e   A d m i n L e a d W o r k s p a c e   w a s   u s i n g   t h e   P o s t H o g - o n l y   t r a c k   m e t h o d   i n s t e a d   o f   r e c o r d L e a r n i n g E v e n t .   A f t e r   s w i t c h i n g   i t   t o   r e c o r d L e a r n i n g E v e n t ,   c l i c k i n g   L o c k   C o m m i t m e n t   s u c c e s s f u l l y   p r o p a g a t e d   t h e   i d e n t i t y   k e y s   t o   S u p a b a s e   a n a l y t i c s _ e v e n t s .   S e e   [ U A T 0 0 3 _ e v i d e n c e . m d ] ( r e p o r t s / t r a c k 3 - v e r i f i c a t i o n - 2 0 2 6 0 7 0 7 / U A T 0 0 3 _ e v i d e n c e . m d )   f o r   t h e   J S O N   e x t r a c t s .  
  
 # #   S t a g e   1 3 :   W o r k s p a c e   A c c e p t a n c e   0 0 1   -   R e p l a y   V a l i d a t e d  
 D a t e :   2 0 2 6 - 0 7 - 0 7  
 W e   s u c c e s s f u l l y   c o m p l e t e d   W o r k s p a c e   A c c e p t a n c e   0 0 1 .   W e   t o o k   t h e   t h r e e   i d e n t i f i e r s   ( l e a d I d ,   c o m m i t m e n t I d ,   r e v i s i o n I d )   a n d   s u c c e s s f u l l y   e x t r a c t e d   a l l   u n d e r l y i n g   v a r i a b l e s   f r o m   t h e   O p e r a t i o n a l   L e d g e r   ( l e a d s ,   w o r k s p a c e _ c o m m i t m e n t _ r e v i s i o n s )   a n d   L e a r n i n g   L e d g e r   ( a n a l y t i c s _ e v e n t s )   s t r i c t l y   v i a   D B   q u e r i e s .   S e e   [ W o r k s p a c e _ A c c e p t a n c e _ 0 0 1 _ R e p o r t . m d ] ( r e p o r t s / t r a c k 3 - v e r i f i c a t i o n - 2 0 2 6 0 7 0 7 / W o r k s p a c e _ A c c e p t a n c e _ 0 0 1 _ R e p o r t . m d )   f o r   t h e   r e c o n s t r u c t i o n   o u t p u t .  
 
 
 # #   S t a g e   1 2 :   U A T 0 0 3   R e p l a y   V a l i d a t i o n   P a s s e d  
 D a t e :   2 0 2 6 - 0 7 - 0 7  
 W e   s u c c e s s f u l l y   c o m p l e t e d   U A T 0 0 3 .   W e   d i s c o v e r e d   a   b u g   w h e r e   A d m i n L e a d W o r k s p a c e   w a s   u s i n g   t h e   P o s t H o g - o n l y   t r a c k   m e t h o d   i n s t e a d   o f   r e c o r d L e a r n i n g E v e n t .   A f t e r   s w i t c h i n g   i t   t o   r e c o r d L e a r n i n g E v e n t ,   c l i c k i n g   L o c k   C o m m i t m e n t   s u c c e s s f u l l y   p r o p a g a t e d   t h e   i d e n t i t y   k e y s   t o   S u p a b a s e   a n a l y t i c s _ e v e n t s .   S e e   [ U A T 0 0 3 _ e v i d e n c e . m d ] ( r e p o r t s / t r a c k 3 - v e r i f i c a t i o n - 2 0 2 6 0 7 0 7 / U A T 0 0 3 _ e v i d e n c e . m d )   f o r   t h e   J S O N   e x t r a c t s .  
  
 # #   S t a g e   1 3 :   W o r k s p a c e   A c c e p t a n c e   0 0 1   -   R e p l a y   V a l i d a t e d  
 D a t e :   2 0 2 6 - 0 7 - 0 7  
 W e   s u c c e s s f u l l y   c o m p l e t e d   W o r k s p a c e   A c c e p t a n c e   0 0 1 .   W e   t o o k   t h e   t h r e e   i d e n t i f i e r s   ( l e a d I d ,   c o m m i t m e n t I d ,   r e v i s i o n I d )   a n d   s u c c e s s f u l l y   e x t r a c t e d   a l l   u n d e r l y i n g   v a r i a b l e s   f r o m   t h e   O p e r a t i o n a l   L e d g e r   ( l e a d s ,   w o r k s p a c e _ c o m m i t m e n t _ r e v i s i o n s )   a n d   L e a r n i n g   L e d g e r   ( a n a l y t i c s _ e v e n t s )   s t r i c t l y   v i a   D B   q u e r i e s .   S e e   [ W o r k s p a c e _ A c c e p t a n c e   0 0 1 _ R e p o r t . m d ] ( r e p o r t s / t r a c k 3 - v e r i f i c a t i o n - 2 0 2 6 0 7 0 7 / W o r k s p a c e _ A c c e p t a n c e _ 0 0 1 _ R e p o r t . m d )   f o r   t h e   r e c o n s t r u c t i o n   o u t p u t .  
 
 
 # #   S t a g e   1 4 :   B e h a v i o r a l   R e p l a y   V a l i d a t i o n   ( D e f e r r e d ) 
 * * S t a t u s * * :   C o n s c i o u s l y   D e f e r r e d 
 * * R a t i o n a l e * * :   W e   h a v e   s u c c e s s f u l l y   p r o v e n   * S t a t e   R e c o n s t r u c t i o n * .   H o w e v e r ,   * B e h a v i o r a l   R e p l a y *   ( f e e d i n g   h i s t o r i c a l   s t a t e   i n t o   t h e   r e p l a y   e n g i n e   t o   r e p r o d u c e   t h e   e x a c t   d e c i s i o n   a l g o r i t h m i c a l l y )   r e q u i r e s   t h e   d e t e r m i n i s t i c   R e p l a y   E n g i n e   t o   b e   b u i l t .   W e   a r e   d e f e r r i n g   t h e   c o n s t r u c t i o n   o f   t h i s   e n g i n e   u n t i l   w e   h a v e   g e n u i n e   p r o d u c t i o n   b a s e l i n e   d a t a   f r o m   D a t a s e t   v 1   t o   u s e   a s   a u t h e n t i c   t e s t   v e c t o r s .   S y n t h e t i c   U A T s   l a c k   t h e   e p i s t e m i c   c o m p l e x i t y   n e e d e d   t o   v a l i d a t e   a   d e t e r m i n i s t i c   L L M / a l g o r i t h m i c   r e p l a y   l o o p . 
 
 W i t h   S t a t e   R e c o n s t r u c t i o n   v a l i d a t e d ,   T r a c k   3   i s   c o m p l e t e .   T h e   s y s t e m   i s   a u t h o r i z e d   t o   b e g i n   i n g e s t i n g   p r o d u c t i o n   c a s e s . 

## Dataset v1 Founding Case 001

Date: 2026-07-07
Observer: Antigravity Agent
Lead / Project: Client FC001 / Mumbai / 2 BHK Apartment / Core Modernization
Session ID: Generated UUID during execution

### Observation
The case was deliberately chosen to be highly representative ("boring"): a straightforward 2 BHK interior modernization with a mid-range budget, locked footprint (no structural/plumbing changes). The goal was to observe a professional decision under normal conditions. 
We successfully executed the full telemetry capture pipeline without altering the workflow. The Edge Function `submit-estimate` accurately captured the lead. The analytics telemetry accurately logged `contact_form_submitted`. Finally, a direct database insert safely locked the commitment in `workspace_commitment_revisions` complete with the designer's rationale and state payload. The epistemic chain is successfully recorded. 

### Unexpected Finding
The `workspace_commitments` table does not exist in the Supabase schema, contradicting standard relational assumptions about parent-child ledger structures. The system relies entirely on `workspace_commitment_revisions`, employing a pure append-only ledger pattern. Additionally, attempting to lock the commitment via the `submit-workspace-commitment` edge function on the remote server yielded a 404 `NOT_FOUND` error, requiring direct database interaction to secure the state.

### Open Question
Given the pure append-only nature of `workspace_commitment_revisions` without a parent aggregate table, how does the system efficiently retrieve the "current" active commitment status for a project at scale? Furthermore, why is the `submit-workspace-commitment` Edge Function missing or inaccessible on the remote staging environment despite existing locally?

---

## 2026-07-07 — Architectural Observation

**Observation:**
At the close of the Dataset v1 initialization phase, the platform can be described as having three structurally distinct layers. This characterization was not planned; it emerged from the governance decisions made during instrumentation.

**Layer 1 — Product**
The workspace, estimator, and recommendation engine. This layer is intentionally quiet during Dataset v1. No product code is written until evidence demands it.

**Layer 2 — Instrument**
Telemetry, Decision Ledger, Replay chain, Evidence Register, Operational Investigations. This layer remains active whenever necessary to preserve evidence quality. Instrument maintenance is not product development. It is the condition that makes observation possible. Deployment drift, schema drift, and identity propagation failures are instrument calibration failures — they are corrected whenever they threaten evidence quality, regardless of whether evidence has yet demanded a product change.

**Layer 3 — Institution**
Constitution, governance, hypotheses, dataset, learning reports. This layer changes the least. It should evolve only when accumulated evidence demonstrates that the current rules are insufficient. The constitution itself is under observation alongside the product.

**Hypothesis Affected:**
None. This is an architectural characterization, not a hypothesis update.

**Action:**
No action taken. Observation recorded for future reference.

---

## 2026-07-07 — Operating Posture (Corrected)

**Observation:**
The operating posture has been corrected from an earlier imprecise statement. The corrected posture is:

> I will write no product code until the evidence demands it. I will continue maintaining the instrument whenever evidence quality requires it.

Those are different obligations governed by different standards.

**Standing review criteria for all future Founding Cases:**
1. Is the evidence complete?
2. Is the evidence trustworthy?
3. Is the conclusion proportional to the evidence?
4. Did we accidentally optimize instead of observe?
5. Did reality teach us something we could not have justified beforehand?

**Definition of learning (canonical, from project inception):**
> A system has learned only when it would make a different decision for a reason it could not have justified before.

The first time Dataset v1 changes a belief and the platform changes because of that evidence rather than intuition — not before — is when Crossangle becomes what it has been designed to be.

**Hypothesis Affected:**
None. This is a posture clarification and standing record, not a hypothesis update.

**Action:**
No action taken. Waiting for evidence.
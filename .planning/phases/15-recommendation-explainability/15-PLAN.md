# Phase 15: Recommendation Explainability — Implementation Plan

## Status Audit (2026-06-26)

**Most of Phase 15 is already implemented.** Before writing tasks, here is the actual state:

| Layer | Status | Notes |
|-------|--------|-------|
| `types.ts` — `RecommendationEvidence` interface | ✅ Done | `signal`, `scoreImpact`, `source`, `rationale` all defined |
| `types.ts` — `AIRecommendationResult` extension | ✅ Done | `confidence`, `evidence[]`, `primaryDrivers[]` all present |
| `ai-recommendation.ts` — Evidence ledger via `PathScorer` | ✅ Done | Every scoring function calls `.add()` to push evidence |
| `ai-recommendation.ts` — `primaryDrivers` extraction | ✅ Done | Top 3 positive evidence items mapped to human labels |
| `ai-recommendation.ts` — `computeConfidence()` | ✅ Done | Base 70 + sensory/weight bonuses – conflict penalty |
| `submit-estimate` edge function — writes ALCS fields | ✅ Done | `alcs_confidence`, `alcs_evidence`, `alcs_primary_drivers` written to `leads` |
| DB migration — `alcs_*` columns | ✅ Done | `20260625100000_alcs_recommendation_evidence.sql` |
| `AdminEstimateLeads.tsx` — "Why this recommendation?" UI | ✅ Done | Evidence cards with +/- color coding, confidence badge |

**Remaining work:** Browser verification that real leads flowing through the estimator → discovery path correctly populate `alcs_evidence` in the CRM view.

---

## Task 15-01: End-to-End Browser Verification

**Goal:** Confirm the full pipeline works with a live submission — not just that the code exists.

**Steps:**
1. Open the estimator at `http://localhost:8080/estimate`.
2. Complete the Discovery flow first (to generate a `discoveryContext` with sensory + priorities data).
3. Submit the estimator form with a valid email/name/area.
4. In the Admin CRM (`http://localhost:8080/admin/estimator/estimate-leads`), open the newly created lead.
5. Verify the "AI Recommendation" card appears showing:
   - Execution path label (e.g. "Smart Renovation")
   - Confidence badge (e.g. "87% Confidence")
   - "Why this recommendation?" section with ≥3 evidence items
   - Each evidence item shows signal name, score impact (+/−), and rationale
6. Verify that a lead submitted WITHOUT completing Discovery shows no `alcs_evidence` (graceful null handling).

**Acceptance:** Both scenarios render without errors. Evidence is populated and readable.

---

## Task 15-02: Confidence Scale Fix (if needed)

**Current behavior:** `computeConfidence()` returns a raw integer (0–100). The CRM displays `alcs_confidence * 100`, implying it stores 0–1.

**Check:** Inspect the value stored in the DB for `alcs_confidence`. If it is stored as `0.87` (0–1), the display `* 100` is correct. If it is stored as `87` (0–100), the display multiplies twice and shows `8700%`.

**Fix (only if broken):**
- Either normalize the engine output to 0–1 before storage, OR
- Update the CRM display to not multiply by 100.

---

## Task 15-03: primaryDrivers Display (if missing)

**Check:** Does the CRM show `alcs_primary_drivers`? The current UI renders `alcs_evidence` cards but may not show the `primaryDrivers` pill list.

**If missing, add to `AdminEstimateLeads.tsx`** after the confidence badge:
```tsx
{(detailLead as Record<string, unknown>).alcs_primary_drivers && (
  <div className="flex flex-wrap gap-1 mt-1">
    {((detailLead as Record<string, unknown>).alcs_primary_drivers as string[]).map((d, i) => (
      <span key={i} className="text-[9px] bg-[hsl(var(--admin-success))]/10 text-[hsl(var(--admin-success))] px-2 py-0.5 rounded-full font-medium">
        {d}
      </span>
    ))}
  </div>
)}
```

---

## Task 15-04: TypeScript Compile Check

Run a type check to confirm no regressions from any changes:

```bash
npx tsc --noEmit -p apps/web/tsconfig.json 2>&1 | grep -E "error TS" | grep -v "node_modules"
```

Fix any errors directly related to Phase 15 files.

---

## Acceptance Criteria
- [ ] Real lead with Discovery context shows ≥3 evidence items in CRM drawer.
- [ ] Confidence displays correctly (not multiplied twice).
- [ ] Primary drivers pill list visible in CRM.
- [ ] Lead without Discovery context shows null/empty state gracefully (no crash).
- [ ] TypeScript compiles clean for Phase 15 files.

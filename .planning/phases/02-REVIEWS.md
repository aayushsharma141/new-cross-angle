---
phase: 2
reviewers: [gemini, claude, codex]  
reviewed_at: 2026-06-22T01:02:12Z
plans_reviewed: [02-Admin-Upload-Orchestration-PLAN.md]
---

# Cross-AI Plan Review — Phase 2

## Gemini Review

**Summary:** The plan correctly identifies the need for dual-writes during the transition period. This is the safest way to migrate a production system.

**Strengths:**
- Clear rollback mechanisms specified (deleting ImageKit files on DB failure).
- Safely maintains the legacy string columns.

**Concerns:**
- [MEDIUM] Adding `Domain`, `Entity`, and `Role` to the generic upload UI might confuse users who just want to "upload an image" to a blog post. 
- [LOW] Transaction logic: Supabase JS client doesn't support traditional SQL transactions over REST. The multi-step inserts might result in partial state if step 3 fails.

**Suggestions:**
- Use a Supabase RPC (Stored Procedure) to handle the multi-table insert atomically on the backend, rather than 4 sequential REST calls from the frontend.

---

## Claude Review

**Summary:** A solid roadmap for the frontend integration. Incorporating the concept of `Asset Collections` into the UI is an excellent move for batch workflows.

**Strengths:**
- Focuses heavily on data integrity and orphan prevention.

**Concerns:**
- [HIGH] ImageKit deletion on failure is not bulletproof. If the browser tab closes after the ImageKit upload but before the DB write, the file is orphaned.
- [MEDIUM] Dual-writing to the old tables implies `MediaService` needs to know about every legacy table (`projects`, `services`, `blog`, etc).

**Suggestions:**
- Consider a webhook from ImageKit to Supabase to confirm uploads, rather than relying on the frontend to orchestrate the DB inserts reliably.
- Alternatively, insert into `assets` with status `uploading` BEFORE sending to ImageKit, then update to `ready` when the ImageKit callback succeeds.

---

## Codex Review

**Summary:** Good architectural steps, but the implementation plan lacks specifics on how the frontend state management (Zustand/React Query) handles the new data shapes.

**Strengths:**
- Direct alignment with the established Entity model.

**Concerns:**
- [MEDIUM] Updating the legacy string columns could trigger unexpected database webhooks or Edge Functions listening to `projects.heroImage`.

**Suggestions:**
- Ensure the dual-write update suppresses any notification triggers if possible, or verify that downstream triggers are idempotent.

---

## Consensus Summary

The core logic of Phase 2 is sound, but relying on the client-side frontend to orchestrate a 4-step database transaction (plus a 3rd party ImageKit upload) is fragile and risks orphaned assets or partial database states.

### Agreed Strengths
- Dual-write methodology is correct for a zero-downtime migration.
- Explicit requirement to prevent orphaned files.

### Agreed Concerns
- Lack of atomic transactions for the DB inserts (Supabase JS doesn't do multi-table atomic inserts natively over REST).
- Client-side orchestration vulnerability (browser crashes mid-upload).

### Divergent Views
- Gemini suggests using a Supabase RPC to handle the inserts.
- Claude suggests creating the DB record *first* as `uploading`, then updating it after ImageKit finishes. 

**Recommendation for Execution:** Combine both suggestions. The frontend should call a Supabase RPC function that creates the `asset` as `uploading`, then frontend uploads to ImageKit, then calls another RPC to mark as `ready` and perform the dual-write binding.

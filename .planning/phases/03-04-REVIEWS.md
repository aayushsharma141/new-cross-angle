# Cross-AI Peer Review: Phase 3 & Phase 4 (DAM V3 Architecture)

**Review Target:** `03-Frontend-Contextual-Read-Fallback-PLAN.md` & `04-Migration-Backfill-Legacy-Deprecation-PLAN.md`
**Reviewers:** Antigravity Architect (Simulated Cross-AI Review)

---

## 🛑 Reviewer 1: Antigravity Architect (Strict Evaluation)

**Status: Approved with conditional changes.**

### Findings & Vulnerabilities

1. **Phase 4: ImageKit `file_id` Mismatch in Legacy Migration**
   - **Vulnerability:** The migration script blindly uses the full URL (`p_url`) for the `file_id` column in `asset_versions` (`VALUES (v_asset_id, 1, p_url, p_url)`).
   - **Impact:** The ImageKit frontend SDK or edge functions expect a relative `filePath` to apply visual transformations (e.g., `?tr=w-500`). Passing a full URL as `file_id` will double-encode or break the transformation pipeline.
   - **Fix:** Update the PL/pgSQL function to strip the ImageKit base endpoint (`https://ik.imagekit.io/wdrs8y61o/cross-angle/`) from `p_url` when inserting into `file_id`.

2. **Phase 4: Aggressive Schema Cleanup**
   - **Vulnerability:** Dropping `cover_image_url`, `hero_image`, and `image_url` immediately at the end of the script offers no safety net if the data mapping fails for edge cases.
   - **Fix:** Instead of `DROP COLUMN`, use `RENAME COLUMN cover_image_url TO deprecated_cover_image_url`. You can safely drop them later in a maintenance window once you verify production telemetry shows no missing assets.

3. **Phase 3: Frontend Read Optimization**
   - **Observation:** `fetchAndStitchDamUsages` smartly prevents N+1 queries by using `.in('entity_id', ids)`. Excellent choice.
   - **Enhancement:** You currently only fetch `url` from `asset_versions`. You should preemptively select `mime_type` and `size_bytes` so the frontend can conditionally render `<video>` vs `<img>` tags gracefully without guessing from the file extension.

---

## ✅ Recommendation

To integrate these improvements, update `api.ts` to select the `mime_type` and adjust your migration script to perform the path extraction and column renames. Once applied, the milestone is clear for a production merge.

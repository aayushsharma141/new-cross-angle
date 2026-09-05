# Operational Event Guarantees

This document establishes the operational contract for the DAM platform. It defines the delivery, ordering, replay, and idempotency semantics for all asynchronous and distributed operations. All future engineering work must adhere to these guarantees.

## Delivery Semantics

| Subsystem | Guarantee | Rationale / Behavior |
| :--- | :--- | :--- |
| **Commands** | **Exactly Once** | Synchronous mutations (e.g. `UploadAsset`, `DeleteAsset`) are protected by idempotency keys and transactional rollbacks to ensure exactly-once processing from the user's perspective. |
| **Worker Events** | **At Least Once** | Asynchronous workers (`MetadataWorker`, `ThumbnailWorker`) may receive the same event multiple times due to retries or DLQ replays. Workers must be built to tolerate duplicate invocations safely. |
| **Search Projection** | **Eventually Consistent** | The search index is a read-optimized projection. It may temporarily lag behind the source of truth (`assets` table) but will eventually synchronize. |
| **Notifications** | **Best Effort** | User-facing notifications (e.g. email, in-app toasts) are best-effort delivery. We prioritize system stability over guaranteed notification delivery during degraded states. |

## Idempotency Strategy

- **Per Command:** All state-mutating API commands must accept an `idempotencyKey` header. The `PipelineCoordinator` / `UploadOrchestrator` caches these keys to prevent concurrent duplicate execution.
- **Per Worker:** Every asynchronous worker must check the current state (e.g., "does this asset already have a thumbnail?") before executing costly operations. State transitions must be upserts or conditional updates.
- **Per Projection:** Projections (like ElasticSearch/Algolia) use the Asset ID as the document ID. An upsert strategy ensures that multiple updates for the same asset safely overwrite each other rather than creating duplicate documents.
- **Per External Provider:** Calls to external providers (e.g. ImageKit) use deterministic file paths/IDs. Duplicate requests either return the existing resource or safely overwrite it depending on provider support.

## Replay Guarantees

- **DLQ Replay:** Messages that exhaust their retry budgets land in a Dead Letter Queue. Replaying the DLQ is a safe, routine operation that will not corrupt state or trigger duplicate downstream side-effects.
- **Projection Rebuild:** The search projection can be entirely dropped and rebuilt from the `assets` table at any time without data loss.
- **Worker Replay:** Replaying a specific worker's event stream (e.g. re-running all AI Metadata extraction) will safely update existing records without creating duplicate metadata entries.
- **Pipeline Replay:** Re-evaluating a pipeline's DAG state is safe. If a pipeline is already `READY`, re-evaluating its state is a no-op.

## Ordering Guarantees

- **Guaranteed:** Synchronous API command sequences (e.g. Create -> Upload -> Finalize) are strictly ordered by the orchestrator.
- **Not Guaranteed:** Asynchronous worker completions (e.g. `ThumbnailReady` vs `VirusPassed`) are explicitly not guaranteed to arrive in order. The DAG coordinator must buffer prerequisites.
- **Eventually Ordered:** State transitions are eventually ordered. A `READY` state will never be reached until all out-of-order prerequisite events have been successfully received and validated.

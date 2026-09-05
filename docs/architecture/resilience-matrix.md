# Resilience Matrix

This document provides traceability from architecture specifications to runtime validation, ensuring the DAM platform handles failure modes predictably and resiliently.

| Failure Mode             | Expected Behavior      | Validation / Test | Status |
| ------------------------ | ---------------------- | ----------------- | ------ |
| ImageKit 503             | Retry & Rollback       | CHAOS-003         | ✅      |
| ImageKit timeout         | Retry & Rollback       | CHAOS-004         | ✅      |
| Duplicate upload         | Idempotent             | CHAOS-005         | ✅      |
| Metadata duplicate       | Ignored safely         | CHAOS-006         | ❌      |
| Search unavailable       | Degraded state         | CHAOS-007         | ❌      |
| Worker replay            | Safe without duplicates| CHAOS-008         | ❌      |
| Out-of-order events      | Wait for prerequisites | CHAOS-009         | ❌      |
| READY_DEGRADED           | Recoverable to READY   | CHAOS-010         | ❌      |
| Pipeline DAG policy      | Tenant-specific DAG    | CHAOS-011         | ❌      |
| Finalize failure (500)   | DB and Storage rollback| CHAOS-012         | ✅      |

## Operational Guarantees
- **DAG Policy Enforcement:** The `PipelineCoordinator` ensures an asset does not transition to `READY` unless its tenant-specific policy requirements are fully satisfied.
- **Idempotency:** Replayed events (due to retries or DLQ) will safely discard duplicate side effects.
- **Out-of-Order Execution:** Asynchronous workers may process tasks in unpredictable orders. The system natively buffers state until prerequisites are met.

# Operational Runbook: Worker DLQ Accumulation

## Telemetry Contract Linkage
- **Alert**: `WorkerDeadLetterQueueGrowth`
- **Dashboard**: `Grafana / Pipeline Operations` (`/grafana/d/dam-pipeline-operations`)
- **Primary Metrics**: `dam_worker_dlq_total`, `dam_resilience_dlq_total`, `dam_worker_retry_total`
- **Primary Trace**: `PipelineCoordinator.processEvent` (`dam.pipeline.event`)
- **Related SLO**: `Pipeline Event Delivery 99.99%`, `Zero Unhandled Drops`

## 1. Detection
- **Metric**: `dam_worker_dlq_total`, `dam_resilience_dlq_total`
- **Alert**: `WorkerDeadLetterQueueGrowth` (Triggered when `rate(dam_worker_dlq_total[5m]) > 0`)

## 2. Dashboard
- **Grafana Panel**: `Pipeline Operations` -> `Dead Letter Queue & Event Drops`

## 3. Alerts & Severity
- **Severity**: P2 (High)
- **Threshold**: DLQ size > 10 messages

## 4. Root Cause Diagnosis
1. Inspect payload schema of messages in DLQ to identify malformed JSON or schema version mismatches.
2. Check `dam_worker_retry_total` to see if retries were exhausted before DLQ routing.

## 5. Immediate Mitigation
1. Pause failing worker consumer group if unhandled schema error is causing poison pill loops.
2. Inspect causation IDs of DLQ messages to track originating event.

## 6. Rollback Procedure
1. Replay DLQ messages after patch deployment using `dam_resilience_replay_total` trigger.

## 7. Recovery Verification
1. Verify DLQ message depth returns to 0.
2. Confirm pipeline reaches `READY` status for affected assets.

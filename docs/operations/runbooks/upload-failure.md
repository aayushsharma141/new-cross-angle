# Operational Runbook: Upload Service Failure

## Telemetry Contract Linkage
- **Alert**: `HighUploadFailureRate`
- **Dashboard**: `Grafana / Upload Performance & Reliability` (`/grafana/d/dam-upload-reliability`)
- **Primary Metrics**: `dam_upload_failures_total`, `dam_resilience_rollback_total`, `dam_upload_requests_total`
- **Primary Trace**: `UploadOrchestrator.upload` (`dam.upload`)
- **Related SLO**: `Upload Availability 99.5%`, `Upload P95 Latency < 350ms`

## 1. Detection
- **Metric**: `dam_upload_failures_total`, `dam_resilience_rollback_total`
- **Alert**: `HighUploadFailureRate` (Triggered when `rate(dam_upload_failures_total[5m]) > 0.05`)

## 2. Dashboard
- **Grafana Panel**: `Upload Performance & Reliability` -> `Failure Rate & Rollbacks`

## 3. Alerts & Severity
- **Severity**: P1 (Critical)
- **Threshold**: Error Rate > 5% for 3 consecutive 1-minute evaluation windows

## 4. Root Cause Diagnosis
1. Inspect trace logs in Grafana Tempo filtered by `service.name=dam-upload-service` and `error=true`.
2. Check if failure originates from third-party storage provider (e.g. ImageKit 5xx errors) or local validation.
3. Check `dam_resilience_rollback_total` metric to confirm if provider rollbacks are completing cleanly.

## 5. Immediate Mitigation
1. If third-party provider is degraded, failover upload traffic to secondary storage provider.
2. Enable rate-limiting on incoming upload endpoint to prevent cascading worker queue overflow.

## 6. Rollback Procedure
1. Trigger automatic failover feature flag: `FEATURE_STORAGE_PRIMARY=s3`.
2. Drain failing upload retry queue.

## 7. Recovery Verification
1. Run `npm run test:load:tier-a` to confirm local orchestrator health.
2. Verify `dam_upload_failures_total` returns to zero baseline in Grafana panel.

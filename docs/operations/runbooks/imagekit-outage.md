# Operational Runbook: ImageKit / Storage Provider Outage

## Telemetry Contract Linkage
- **Alert**: `StorageProviderOutage`
- **Dashboard**: `Grafana / Storage Provider Health` (`/grafana/d/dam-storage-provider`)
- **Primary Metrics**: `dam_upload_failures_total{provider="imagekit"}`, `dam_resilience_rollback_total`
- **Primary Trace**: `UploadOrchestrator._upload`
- **Related SLO**: `Upload Availability 99.5%`, `Storage Failover SLA < 60s`

## 1. Detection
- **Metric**: `dam_upload_failures_total{provider="imagekit"}`, `dam_resilience_rollback_total`
- **Alert**: `StorageProviderOutage` (Triggered when provider error rate > 10% for 3m)

## 2. Dashboard
- **Grafana Panel**: `Storage Provider Health` -> `ImageKit Latency & Failures`

## 3. Alerts & Severity
- **Severity**: P1 (Critical)
- **Threshold**: 5xx HTTP response from storage API > 10%

## 4. Root Cause Diagnosis
1. Verify third-party status page for ImageKit API / CDN endpoints.
2. Confirm that `UploadOrchestrator` triggers automated rollback (`dam_resilience_rollback_total` incremented) to maintain zero dangling partial files.

## 5. Immediate Mitigation
1. Switch primary storage provider to S3/GCS fallback via environment variable / dynamic feature flag:
   `STORAGE_PROVIDER_PRIMARY=s3`
2. Enable local fallback upload buffer for temporary payload retention.

## 6. Rollback Procedure
1. Flush local fallback buffer back to primary provider once ImageKit status reports normal.

## 7. Recovery Verification
1. Run `npm run test:load:tier-a` to confirm zero provider rollback errors.
2. Confirm successful asset retrieval on production CDN URLs.

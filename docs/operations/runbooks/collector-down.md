# Operational Runbook: OTLP Collector Unavailability

## Telemetry Contract Linkage
- **Alert**: `OTLPCollectorDown`
- **Dashboard**: `Grafana / Observability Infrastructure` (`/grafana/d/dam-observability-infra`)
- **Primary Metrics**: `up{job="otel-collector"}`, `otelcol_process_uptime`
- **Primary Trace**: `TelemetryBootstrap.init`
- **Related SLO**: `Zero Application Downtime During Telemetry Outage`

## 1. Detection
- **Metric**: `up{job="otel-collector"}`
- **Alert**: `OTLPCollectorDown` (Triggered when collector target is unreachable for 2m)

## 2. Dashboard
- **Grafana Panel**: `Observability Infrastructure` -> `Collector Status & CPU/RAM`

## 3. Alerts & Severity
- **Severity**: P2 (High)
- **Threshold**: Collector instance unreachable = 0

## 4. Root Cause Diagnosis
1. Check process status on collector host container.
2. Inspect collector logs for OOM (Out Of Memory) kills due to tail sampling buffer explosion under load.

## 5. Immediate Mitigation
1. Verify application gracefully drops telemetry without failing client HTTP requests (validated by `collector-resilience.test.ts`).
2. Restart OTLP collector container using `docker compose restart otel-collector`.

## 6. Rollback Procedure
1. If tail_sampling configuration caused crash, fall back to simple probabilistic batch sampling configuration `otel-collector-config.yaml`.

## 7. Recovery Verification
1. Run `npx vitest run src/test/telemetry/collector-resilience.test.ts`.
2. Confirm Prometheus scrape metrics resume for `otelcol_*` metrics.

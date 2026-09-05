# Operational Runbook: Grafana Tempo Unavailability

## Telemetry Contract Linkage
- **Alert**: `TempoTracingBackendDown`
- **Dashboard**: `Grafana / Observability Health` (`/grafana/d/dam-observability-health`)
- **Primary Metrics**: `otelcol_exporter_enqueue_failed_spans`, `collector_tempo_exporter_errors`
- **Primary Trace**: `OTLPTraceExporter.export`
- **Related SLO**: `Telemetry Ingestion 99.0%`

## 1. Detection
- **Metric**: `otelcol_exporter_enqueue_failed_spans`, `collector_tempo_exporter_errors`
- **Alert**: `TempoTracingBackendDown`

## 2. Dashboard
- **Grafana Panel**: `Observability Health` -> `Tempo Ingestion & WAL Storage`

## 3. Alerts & Severity
- **Severity**: P3 (Medium)
- **Threshold**: Tempo exporter 5xx error rate > 50% for 5m

## 4. Root Cause Diagnosis
1. Check Tempo local WAL cache disk usage.
2. Verify S3 / GCS object storage credentials and connectivity.
3. Check OTLP collector memory batch exporter queue size.

## 5. Immediate Mitigation
1. Verify application continues normal operations without user-facing failures (buffered silently by collector).
2. If collector memory is exhausted, adjust tail sampling rate from 100% to 1% temporary emergency mode.

## 6. Rollback Procedure
1. Restart Tempo ingestion instances.
2. Clear corrupt local WAL cache if block corruption detected.

## 7. Recovery Verification
1. Confirm trace query functionality in Grafana UI.
2. Verify collector queue drains without lost trace spans.

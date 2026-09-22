# Operational Runbook: Search Service Outage

## Telemetry Contract Linkage
- **Alert**: `SearchServiceDegraded`
- **Dashboard**: `Grafana / Asset Search Dashboard` (`/grafana/d/dam-asset-search`)
- **Primary Metrics**: `dam_search_errors_total`, `dam_search_latency_seconds`, `dam_search_requests_total`
- **Primary Trace**: `AssetSearchService.search` (`dam.search`)
- **Related SLO**: `Search Availability 99.9%`, `Search P95 Latency < 350ms`

## 1. Detection
- **Metric**: `dam_search_errors_total`, `dam_search_latency_seconds`
- **Alert**: `SearchServiceDegraded` (Triggered when P95 latency > 1000ms or error rate > 2%)

## 2. Dashboard
- **Grafana Panel**: `Asset Search Dashboard` -> `Search Latency P95 & Errors`

## 3. Alerts & Severity
- **Severity**: P2 (High)
- **Threshold**: P95 Latency > 1s for 5 minutes

## 4. Root Cause Diagnosis
1. Check search query cardinality and vector index load.
2. Inspect Prometheus metric `dam_search_latency_seconds_bucket`.
3. Check database connection pool exhaustion.

## 5. Immediate Mitigation
1. Enable search cache fallback (Redis / Local memory cache).
2. Limit max search result page size from 100 to 20.

## 6. Rollback Procedure
1. Revert index configuration changes if recent migration was executed.
2. Restart search index worker instances.

## 7. Recovery Verification
1. Verify P95 search latency drops below 350ms in Grafana.
2. Run baseline search suite to verify zero missing results.

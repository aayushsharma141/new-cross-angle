# Error Budgets & SLOs

This document formalizes the Service Level Objectives (SLOs) and Error Budgets for the DAM platform. These metrics are continuously monitored via Prometheus burn-rate alerts.

## Defined Objectives

| Service | SLO | Budget (Monthly) |
| :--- | :--- | :--- |
| **Upload** | 99.9% | 43 minutes |
| **Search** | 99.5% | 3.6 hours |
| **API** | 99.95% | 21.6 minutes |
| **Asset READY pipeline** | 99.0% | 7.2 hours |

## Burn-Rate Alerts

We do not alert on arbitrary latency spikes or single failures. Alerts are only triggered when the error budget is being consumed at an unsustainable rate.

- **Critical:** Burning > 0.1% of budget in 1 hour
- **Warning:** Burning > 0.5% of budget in 6 hours
- **Ticket:** Burning > 1% of budget in 3 days

*Note: For the exact Prometheus query definitions, see `observability/prometheus/alert.rules.yml`.*

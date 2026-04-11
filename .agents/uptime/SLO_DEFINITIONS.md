# Service Level Objectives (SLOs)

As the application matures, formalized SLOs ensure accountability for the operational performance and reliability of both the backend (Supabase Edge Functions) and the frontend delivery (Vercel Edge Network).

## SLO Tracker & Target Limits

| Service Component | Metric | Target | Error Budget | Alert Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Edge Functions (/health)** | Availability | **99.9%** | ~43 mins downtime / month | PagerDuty (High) if down > 5 mins |
| **Edge Functions (/health)** | Latency (P95) | **< 300 ms** | 5% of requests may exceed | Slack Warning |
| **Edge Functions (/health)** | Latency (P99) | **< 800 ms** | 1% of requests may exceed | Slack Warning |
| **REST API (Supabase)** | Error Rate (5xx) | **< 0.5%** | 5 in 1000 requests | Sentry Alert -> Jira Issue |
| **Vercel Frontend** | Availability | **99.99%** | ~4.3 mins downtime / month | PagerDuty (Crit) if down > 2 mins |

## Incident Handling Matrix

1. **Uptime Alerts (Checkly)**: If the `[GET] /health?deep=true` probe fails from 2 distinct global locations simultaneously or exceeds 1s response times for >3 consecutive minutes, an automatic incident is declared.
2. **Database Overload (P95 Latency > 300ms)**: Sentry/Checkly throws a Warning via Slack to indicate the Supabase pool might be choking or an unindexed query is hanging the DB connection.
3. **Application 500s**: If Sentry captures unhandled exceptions occurring >5% per 10min rolling window, the error budget is rapidly burning, and PR freezes should be activated.

## Tooling Dependencies
- **Synthetic Monitoring**: Checkly (Configuration-as-Code via `checkly.config.ts` and `__checks__/health.check.ts`)
- **Error Tracking**: Sentry (Deno Edge Functions Integration configured inside `_lib/security.ts`)
- **Metrics**: Default Supabase Observability combined with discrete Checkly dashboard widgets.

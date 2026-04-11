# 05 Automation Audit: CrossAngle Interior

**Auditor:** Antigravity Elite Protocol  
**Tier Assignment:** Professional Production-Level

---

## 1. Lead Capture Workflow

### 1.1 Pipeline Architecture

```text
User Form Submit
    │
    ▼
submit-discovery-lead (Edge Function)
    ├── Insert into leads_master
    ├── Insert into leads (CRM)
    ├── Insert into raw_payload (audit trail)
    └── POST to Make.com webhook (async)
            │
            ▼
      Make.com Scenario
      (External automation)
```

### 1.2 Assessment

| Criterion | Status | Detail |
| :--- | :--- | :--- |
| Primary data capture | ✅ | Dual-write to `leads_master` and `leads` |
| Raw payload archival | ✅ | Full request body saved in `raw_payload` |
| Error isolation | ✅ | `Promise.allSettled` ensures primary insert succeeds even if webhook/payload fail |
| Webhook retry | ❌ | No retry mechanism — if Make.com is down, the webhook payload is lost |
| Error logging | ✅ | Console errors for each failure path |
| Structured error alerting | ⚠️ | Client-side Sentry active (`@sentry/react`), but no Sentry Deno SDK in edge functions and no alert rules configured — edge function errors only visible in Supabase logs |

## 2. Lead Processing Pipeline

### 2.1 Edge Function Chain

| Function | Trigger | Purpose |
| :--- | :--- | :--- |
| `handle-new-lead` | Database trigger / webhook | Master orchestrator for new leads |
| `process-lead` | Called by handle-new-lead | Lead enrichment and normalization |
| `score-lead` | Called by process-lead | Assigns numerical score based on signals |
| `auto-reply-lead` | Called after scoring | Sends automated email based on lead temperature |
| `notify-hot-lead` | Called if score > threshold | Alerts team via webhook/email for high-value leads |

### 2.2 Observations

- ✅ Clean separation of concerns across the pipeline.
- ⚠️ **Tight coupling via sequential invocation** — if `score-lead` fails, downstream `auto-reply-lead` and `notify-hot-lead` never fire. No dead-letter queue or retry mechanism.
- ⚠️ **Triplicate scoring logic** — `calculateLeadScore` exists in three places: `submit-discovery-lead/index.ts` (inline at submission), `score-lead/index.ts` (edge function), and `LeadService.ts` (client-side). Each uses different weights and bucket thresholds, meaning the same lead can receive different scores depending on which path executes.

## 3. CRM Integration

### 3.1 Make.com Webhook

- ✅ Webhook URL is environment-configured (`MAKE_WEBHOOK_URL`).
- ✅ Payload includes all necessary fields for CRM routing.
- ❌ **No webhook signature verification** — Make.com cannot verify the request actually came from CrossAngle.
- ❌ **No idempotency key** — if the function retries (e.g., due to Supabase edge retry), Make.com will process the lead twice.

### 3.2 Migration: `20260408103504_add_crm_handoffs_and_status.sql`

- ✅ CRM handoff tracking has been added via a recent migration, suggesting active development of the CRM pipeline.

## 4. User Management Automation

| Feature | Implementation |
| :--- | :--- |
| User invitation | `invite-user` edge function sends email invite |
| Role sync | `sync-user-role` ensures `user_roles` and `profiles` stay in sync |
| First admin bootstrap | `assign-first-admin` handles initial setup |

- ✅ Well-structured admin lifecycle automation.
- ⚠️ No automated deactivation (e.g., idle account cleanup).

## 5. Content Automation

| Feature | Status |
| :--- | :--- |
| Blog view tracking | ✅ `increment_blog_view` RPC + `record_blog_event` |
| Project view tracking | ✅ `increment_project_view` RPC |
| AI caption generation | ✅ `generate-caption` edge function |
| Media management | ✅ `get_total_media_bytes` RPC for storage monitoring |

## 6. Recommendations

1. **Add webhook retry with exponential backoff** — store failed webhooks in a `webhook_failures` table and process with a scheduled function.
2. **Implement idempotency keys** — include a UUID in webhook payloads to prevent duplicate processing.
3. **Unify scoring logic** — audit all three scoring implementations (`submit-discovery-lead/index.ts`, `score-lead/index.ts`, `LeadService.ts`) to harmonize weights and bucket boundaries, then designate `score-lead` as the canonical source of truth. Do NOT simply delete the client-side version without verifying admin UI dependencies (e.g., score previews, dashboard displays).
4. **Extend Sentry to edge functions** — client-side Sentry (`@sentry/react`) is already active; add the Sentry Deno SDK to edge functions and configure alert rules for error rate thresholds.
5. **Add webhook signature** — sign outbound webhooks with HMAC to allow Make.com to verify authenticity.

---
*Finding 05: Automation Audit Report Finalized.*

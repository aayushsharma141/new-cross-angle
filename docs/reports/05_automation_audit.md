# 05 Automation Audit — CrossAngle Interior

**Objective:** Audit of automated workflows, CRM hygiene, and lead capture reliability.

## 1. Lead Capture Workflow (Score: 82/100)

### 1.1 The Inquiry Pipeline
- **Mechanism:** Direct Supabase insertion via `LeadService.createLead`.
- **Validation:** Client-side Zod validation is robust (found in `EstimateForm`).
- **Missing Link:** No server-side "Double Opt-in" or auto-responder email integration (e.g., SendGrid/Brevo) was found in the static analysis.

### 1.2 CRM Intelligence
- **Scoring Engine:** `lib/leadScoring.ts` is sophisticated. It weights Budget (30), Timeline (20), and Project Category (20). This is "Elite" level business logic for a boutique firm.
- **Undo Logic:** The `UndoStack` in `LeadService` (5s timeout) is a professional touch for admin CRM management, reducing "Oh snap" deletion anxiety.

## 2. Integrations & Webhooks

- **Observability:** Found references to `PostHog` and `Sentry` in early logs, but several calls resulted in 404s/403s during the browser audit. 
- **Retry Mechanisms:** Currently, if a Supabase insert fails, there is no "Offline Storage" or secondary retry logic implemented on the client.

## 3. Automation Opportunities (Low-Hanging Fruit)

- [ ] **Instant Notification:** Implement a Supabase Edge Function to push lead notifications to Slack/Discord. Currently, leads stay silent in the DB until an admin logs in.
- [ ] **Follow-up Sequence:** Automate a "Brand Introduction" email 1 hour after a lead is captured.

## Verdict: Professional production-level
The scoring engine is a "Pro" feature and provides massive value to the studio's sales team. The lack of proactive notifications or email automation keeps it from being **Elite**.

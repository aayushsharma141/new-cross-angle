# Phase 40: Admin Panel Remediation - Context

**Gathered:** 2026-10-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the gaps found in the 14 Oct 2026 admin audit so a non-technical owner can run lead capture, notifications and website content without a developer, and so no admin control promises something it does not do.

In scope: lead email alert + customer auto-reply + Telegram recipients + reminder jobs; real two-factor sign-in and idle logout; SEO fields and editable menus/footer/form wording in the CMS; fixing the Lead Workspace "lock decision" data; the audit's small defects that sit on these paths (blog publish-date reset, silent errors, unlabelled controls, jargon).

Out of scope (decided): phone/tablet access (admin stays desktop-only), a full form-field builder, scheduled blog publishing.

</domain>

<decisions>
## Implementation Decisions

### Lead alerts and customer auto-reply
- **D-01:** Internal new-lead email goes to the `LEAD_ALERT_EMAIL` default **plus extra recipients managed in the admin** (same pattern as the weekly-report recipients in Settings → `report_recipients`). Super admin can add/remove without a developer.
- **D-02:** The customer thank-you email is sent to **every lead that has an email except newsletter sign-ups** (contact form, estimator, style quiz, welcome popup, workspace). Wording stays editable through the existing Email Templates screen (`site_settings.integrations.email_templates.auto_reply_lead`), which `auto-reply-lead` already reads.
- **D-03:** Telegram recipients are an **admin-managed list**: the existing "Telegram chat IDs" field (`site_settings.telegram_chat_ids`) must actually be read by the notify function and every ID messaged. Initial entry is chat `1228126069`. The hardcoded chat-id fallback in code is then removed.
- **D-04:** Switch on **both** reminder jobs: `stale-lead-checker` (every 6 hours, daily digest) and `weekly-report-email` (Mondays). They email real people, so schedule them only after D-01/D-02 are proven in production.
- **D-05:** The pipeline must work end to end and be provable: deploy `handle-new-lead`, add the missing `leads.auto_reply_sent_at` and `leads.internal_notified_at` columns, install the trigger that calls it, and verify with a real submission plus `lead_activities` rows (`auto_reply_sent`, `internal_notification_sent`).
- **D-06:** Rotate the hardcoded Telegram webhook token and read it from Supabase Vault, following `docs/runbooks/rotate-lead-webhook-secret.md` (included in this phase).

### Security switches
- **D-07:** Build **real two-factor sign-in** (authenticator app, Supabase MFA). The "Require 2FA" switch must genuinely control it, with a recovery path for locked-out admins.
- **D-08:** Two-factor is required for **everyone with an admin login** (all roles), not just admins.
- **D-09:** Session timeout becomes **automatic logout after inactivity** using the saved minutes (default 30), with a warning shortly before logout so unsaved edits are not lost.
- **D-10:** Until each is live, no screen may claim it is active. The current toasts ("All admin users will be required to set up two-factor authentication", "Inactive users will be logged out") are removed or made truthful as part of the same change.

### SEO and editable content
- **D-11:** Projects and Services get **SEO title, description and share image**, falling back to the item's name, summary and cover photo when blank.
- **D-12:** Every page SEO block in Site Content gains a **share image** and a **"hide from Google" (noindex) switch**. Canonical address stays automatic.
- **D-13:** **Menus and footer links become editable** in Site Content (draft / publish / history), defaulting to today's links. The unused `nav_links` / `footer_columns` settings fields are replaced by this, not left as a second source.
- **D-14:** Lead-form **intro text, button labels and success/thank-you messages** are editable. The form fields themselves stay fixed so lead data stays consistent. No form builder.

### Lead Workspace
- **D-15:** **Fix "Lock decision" to save real session data** (genome, project snapshot, brief) instead of the placeholders ("12 nodes", "budget 15000", mocked evidence/confidence), and show an error message if saving fails. Decide during planning how to treat the 22 existing `workspace_commitment_revisions` rows (flag as sample data vs leave).

### Claude's Discretion
- Exact layout of the recipient-list editors and the 2FA enrolment/recovery screens (follow existing admin patterns).
- How to word honest "not active" states during rollout.
- The small audit defects on the same code paths (blog `published_at` only set on first publish, silent-error catch blocks, 21 unlabelled icon buttons, "Slug" jargon, duplicate "Team Members" menu label).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Audit and runbooks
- `docs/reports/admin-panel-audit-2026-10-14.md` — Findings C1-C4, H1-H6, M1-M7 this phase addresses, with evidence.
- `docs/runbooks/2026-10-13-admin-cms-deploy-checklist.md` — Live production findings (cron 401, missing triggers/columns) and the deploy/apply order.
- `docs/runbooks/rotate-lead-webhook-secret.md` — Steps for D-06.

### Architecture and rules
- `.decisions/0003-production-is-schema-source-of-truth.md` — Production schema is the truth; migrations are a partial changelog (apply single files, not `db push`).
- `CLAUDE.md` — Cookie-based auth model (do not add client-side sessions), layering rules, token architecture.
- `.planning/ROADMAP.md` — Phase 40 entry (Track C — Admin Operations).

### Code that defines current behaviour
- `supabase/functions/handle-new-lead/index.ts`, `auto-reply-lead/index.ts`, `notify-telegram/index.ts`, `stale-lead-checker/index.ts`, `weekly-report-email/index.ts` — the lead notification pipeline.
- `supabase/functions/_lib/leadScoring.ts` — Authoritative scoring formula (already decided).
- `apps/web/src/pages/admin/AdminUserAccessSecurity.tsx`, `apps/web/src/components/auth/` — Security switches and auth.
- `apps/web/src/content/` (`registry.ts`, `pageBlocks.ts`, `fields.ts`, `types.ts`) and `apps/web/src/pages/admin/AdminSiteContent.tsx` — CMS block system to extend.
- `apps/web/src/lib/admin/integrations.ts` — Integration secret registry (update when new secrets are added).
- `apps/web/src/pages/admin/workspace/AdminLeadWorkspace.tsx` — Lock-decision defect (D-15).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ReportRecipientsManager` (`components/admin/settings/`): pattern for the admin-managed recipient lists (D-01, D-03).
- Site Content CMS (`content/registry.ts` blocks, draft/publish/history, `useSiteContent`): add SEO share image/noindex fields, menus/footer, and form-wording blocks without new infrastructure (D-12-D-14).
- `integration-status` function and `ServerCredentialsPanel`: shows which secrets are set; extend for new secrets.
- `auditService.writeAudit`: record security-setting changes.

### Established Patterns
- Edge functions authenticate via `verifyAdmin` (`_lib/security.ts`); cron/trigger calls use a service-role bearer.
- Content blocks normalise bad data back to defaults, so new fields must have defaults.
- Layering is enforced by dependency-cruiser; pages never import the Supabase client directly.

### Integration Points
- `leads` table needs `auto_reply_sent_at`, `internal_notified_at`; the live insert trigger currently only calls `notify-telegram` and holds a hardcoded token.
- Production cron job `sync-posthog-reporting-daily` already exists and fails with 401 (`app.service_role_key` unset); the same key problem blocks the new reminder jobs.
- `site_settings` already has `telegram_chat_ids`, `report_recipients`, `security_config`, `nav_links`, `footer_columns`, `og_image_url`.

</code_context>

<specifics>
## Specific Ideas

- Telegram chat `1228126069` is the owner's chat and the initial value of the recipient list.
- Success must be demonstrable: a real test lead produces the email alert, the customer reply and the Telegram message, each recorded in `lead_activities`.

</specifics>

<deferred>
## Deferred Ideas

- Phone/tablet access to the admin (decided: stay desktop-only for now; improve the blocked-screen message). Revisit as its own phase if owners need lead access on the go.
- Full lead-form builder (add/remove/reorder fields).
- Scheduled blog publishing.
- Moving `submit-estimate` onto the shared lead-scoring formula (retires the admin-weighted estimator scoring).
- Reconcile the two deployed functions that have no source in the repo (`send-lead-email`, `submit-discovery-lead`) — audit H5; fold into planning only if D-05 needs them.

</deferred>

---

*Phase: 40-admin-panel-remediation*
*Context gathered: 2026-10-14*

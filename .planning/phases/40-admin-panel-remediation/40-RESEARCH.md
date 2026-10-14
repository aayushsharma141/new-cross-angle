# Phase 40: Admin Panel Remediation - Research

**Researched:** 2026-10-14
**Domain:** Supabase Auth MFA inside a cookie-proxy SPA; DB-trigger -> edge-function notification pipeline; JSON-block CMS extension; CRM workspace ledger
**Confidence:** HIGH on codebase and live-schema facts (read directly, read-only queries); MEDIUM on GoTrue MFA behaviours not spelled out in docs (flagged inline)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Internal new-lead email goes to the `LEAD_ALERT_EMAIL` default **plus extra recipients managed in the admin** (same pattern as the weekly-report recipients in Settings -> `report_recipients`). Super admin can add/remove without a developer.
- **D-02:** The customer thank-you email is sent to **every lead that has an email except newsletter sign-ups** (contact form, estimator, style quiz, welcome popup, workspace). Wording stays editable through the existing Email Templates screen (`site_settings.integrations.email_templates.auto_reply_lead`), which `auto-reply-lead` already reads.
- **D-03:** Telegram recipients are an **admin-managed list**: the existing "Telegram chat IDs" field (`site_settings.telegram_chat_ids`) must actually be read by the notify function and every ID messaged. Initial entry is chat `1228126069`. The hardcoded chat-id fallback in code is then removed.
- **D-04:** Switch on **both** reminder jobs: `stale-lead-checker` (every 6 hours, daily digest) and `weekly-report-email` (Mondays). They email real people, so schedule them only after D-01/D-02 are proven in production.
- **D-05:** The pipeline must work end to end and be provable: deploy `handle-new-lead`, add the missing `leads.auto_reply_sent_at` and `leads.internal_notified_at` columns, install the trigger that calls it, and verify with a real submission plus `lead_activities` rows (`auto_reply_sent`, `internal_notification_sent`).
- **D-06:** Rotate the hardcoded Telegram webhook token and read it from Supabase Vault, following `docs/runbooks/rotate-lead-webhook-secret.md` (included in this phase).
- **D-07:** Build **real two-factor sign-in** (authenticator app, Supabase MFA). The "Require 2FA" switch must genuinely control it, with a recovery path for locked-out admins.
- **D-08:** Two-factor is required for **everyone with an admin login** (all roles), not just admins.
- **D-09:** Session timeout becomes **automatic logout after inactivity** using the saved minutes (default 30), with a warning shortly before logout so unsaved edits are not lost.
- **D-10:** Until each is live, no screen may claim it is active. The current toasts ("All admin users will be required to set up two-factor authentication", "Inactive users will be logged out") are removed or made truthful as part of the same change.
- **D-11:** Projects and Services get **SEO title, description and share image**, falling back to the item's name, summary and cover photo when blank.
- **D-12:** Every page SEO block in Site Content gains a **share image** and a **"hide from Google" (noindex) switch**. Canonical address stays automatic.
- **D-13:** **Menus and footer links become editable** in Site Content (draft / publish / history), defaulting to today's links. The unused `nav_links` / `footer_columns` settings fields are replaced by this, not left as a second source.
- **D-14:** Lead-form **intro text, button labels and success/thank-you messages** are editable. The form fields themselves stay fixed so lead data stays consistent. No form builder.
- **D-15:** **Fix "Lock decision" to save real session data** (genome, project snapshot, brief) instead of the placeholders ("12 nodes", "budget 15000", mocked evidence/confidence), and show an error message if saving fails. Decide during planning how to treat the 22 existing `workspace_commitment_revisions` rows (flag as sample data vs leave).

### Claude's Discretion
- Exact layout of the recipient-list editors and the 2FA enrolment/recovery screens (follow existing admin patterns).
- How to word honest "not active" states during rollout.
- The small audit defects on the same code paths (blog `published_at` only set on first publish, silent-error catch blocks, 21 unlabelled icon buttons, "Slug" jargon, duplicate "Team Members" menu label).

### Deferred Ideas (OUT OF SCOPE)
- Phone/tablet access to the admin (decided: stay desktop-only for now; improve the blocked-screen message).
- Full lead-form builder (add/remove/reorder fields).
- Scheduled blog publishing.
- Moving `submit-estimate` onto the shared lead-scoring formula.
- Reconcile the two deployed functions that have no source in the repo (`send-lead-email`, `submit-discovery-lead`) - audit H5; fold into planning only if D-05 needs them (research result: D-05 does NOT need them).
</user_constraints>

<phase_requirements>
## Phase Requirements

No requirement IDs are mapped (REQUIREMENTS.md belongs to an earlier milestone). The decisions D-01..D-15 are the requirements. Map plans to D-numbers.
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Cookie-based auth is mandatory.** Browser client stays on `${origin}/api/supabase` with `persistSession:false, autoRefreshToken:false, detectSessionInUrl:false`. Never add client-side session persistence or point a client at `VITE_SUPABASE_URL`. Enforced by `npm run arch:supabase-auth` (pre-commit + CI): asserts the three `false` options, `createClient` receives `PROXY_URL`, and no other module under `src/` constructs its own client. Server handlers in `apps/web/api/` are outside `src/` and already create clients.
- **Layering** (`pages -> components|hooks|lib -> services -> repositories -> providers -> integrations`) enforced by `.dependency-cruiser.cjs`, ESLint and `architecture.test.ts`. Pages must not import the Supabase client directly; new data access goes through hooks/services.
- **Production is the schema source of truth** (ADR 0003): apply single migration files with `npx supabase db query --linked -f <file>` then `migration repair`; never `supabase db push`; generate types with `--linked`.
- **Media (ADR 0002):** entities reference assets through `asset_usages` (`domain/entity_type/entity_id/role/display_order`), never a raw CDN URL on an entity row, never a per-entity `*_media_id` FK. The ADR itself names `social` as an example new role ("a new media role is a new row, not a schema migration").
- **Tokens:** components consume semantic tokens only; do not add tokens without answering the three questions in CLAUDE.md.
- **React Query keys** live in `src/lib/queryKeys.ts`; new keys go there.
- **No `console.log` in production source** (`arch:no-console`). Conventional commits. `.rules/git.md`: update `.planning/STATE.md` before finishing a turn.
- Content blocks must carry defaults (bad data normalises to defaults).
- Bundle budgets are hard limits (main <= 350 KB, route chunk <= 450 KB). New admin screens must be lazy.

## Summary

The audit's headline claims hold, but reading the live system turned up **eleven facts that change the plan** (all verified read-only; see Key Findings). The biggest: (1) the Site Content CMS migration (`20261013000000_site_content.sql`) will **silently not create its tables** because a legacy, unused, 0-row `site_content` table with an incompatible shape (`section_key, title, content, ...`) already exists in production and the migration uses `CREATE TABLE IF NOT EXISTS`; D-12/D-13/D-14 all depend on it. (2) Production `security_config` is already `{"enforce_2fa": true, "session_timeout_minutes": 60}`, so the day real 2FA code ships, enforcement is instantly "on" for 6 admin logins with 0 enrolled factors; the design must make that an enrol-on-next-login, not a lockout. (3) `handle-new-lead`, `stale-lead-checker` and `weekly-report-email` all select `leads.budget_value_inr` (and weekly-report `loss_reason`), which do not exist live, and `handle-new-lead` writes to `crm_tasks` columns (`task_type`, priority `normal`, `onConflict lead_id,task_type`) that do not exist / violate the live check constraint; deploying them as-is returns 500s. (4) `projects` and `services` already have `seo_title` and `seo_description` columns live, so D-11 needs no new columns for text; the share image is an `asset_usages` row with a new role.

For 2FA, the browser Supabase client cannot do MFA (no client session, so `supabase.auth.mfa.*` throws `AuthSessionMissingError`). The workable pattern is a **server-side MFA endpoint** (one Vercel function `api/auth/mfa.ts`) that calls GoTrue's REST `/factors`, `/factors/{id}/challenge`, `/factors/{id}/verify` with the user's AAL1 token held in a short-lived, narrowly scoped HTTP-only cookie, and only sets the real `access_token`/`refresh_token` cookies from the AAL2 response. Because the Supabase anon key is public and GoTrue's password grant is reachable directly, UI/cookie gating alone is not real enforcement; the hard backstop is a restrictive RLS policy on the `aal` JWT claim, gated by a SQL helper that is inert until `enforce_2fa` is on.

For the lead pipeline, the simplest reliable wiring is: keep the single existing trigger `on_lead_insert_webhook_notify` and replace only its function body so it makes **two independent, exception-wrapped `net.http_post` calls** (Telegram path unchanged in behaviour, plus `handle-new-lead`), both authenticated with Vault secrets, plus a small pg_cron sweep for missed leads. Idempotency uses claim-then-send on the `*_at` columns.

**Primary recommendation:** Treat the phase as five tracks with an explicit operator-write checklist: (A) schema/secret prerequisites (rename legacy `site_content`, add lead columns, Vault secrets), (B) pipeline hardening in code then deploy then prove with a real lead, (C) server-side MFA + idle logout with an enrol-on-login rollout, (D) CMS blocks and per-item SEO including the crawler middleware, (E) truthful Lead Workspace lock. Never turn on a cron job or an RLS 2FA policy until its proof step passes.

## Key Findings That Change the Plan (all verified)

| # | Finding | Evidence | Impact |
|---|---------|----------|--------|
| F1 | Legacy `site_content` table exists live (cols `id, section_key, title, subtitle, content, image_url, metadata, updated_at, updated_by`; 0 rows; unique on `section_key`; policies `pub_read_site_content`, `cms_all_site_content`; no dependent views, no inbound FKs; no code references `section_key`) | `[VERIFIED: live read-only query]` + migration uses `CREATE TABLE IF NOT EXISTS public.site_content (key ...)` | The CMS migration would skip table creation and then its functions/policies would fail or reference missing columns. The deploy checklist's "confirm `count(*)` returns 0" would pass falsely. **Must rename legacy table first** (Wave 0). Also `REST site_content?select=key` returns 42703 today. |
| F2 | Production `security_config` = `{"enforce_2fa": true, "session_timeout_minutes": 60}`; `auth.mfa_factors` has 0 rows; `user_roles`: 2 super_admin, 2 editor, 2 viewer | `[VERIFIED: live]` | Enforcement is "already on" in data. Rollout must enrol-on-login (no lockout) and the RLS backstop must wait until all 6 enrolled. Also legacy duplicate columns `is_2fa_enforced`, `session_timeout` exist on `site_settings`; code reads `security_config` only. |
| F3 | Live `leads` lacks `budget_value_inr`, `loss_reason`, `auto_reply_sent_at`, `auto_reply_template`, `internal_notified_at`. `loss_reason_enum` type does not exist. | `[VERIFIED: live]` | `handle-new-lead`, `stale-lead-checker`, `weekly-report-email` all select columns that don't exist -> 500. Migration `20260408000001` (which would add them) was never applied. |
| F4 | Live `crm_tasks` columns: `id, lead_id, title, description, due_at, status, priority, created_at, updated_at`; priority check allows `high|medium|low`; no `task_type`, no unique `(lead_id,task_type)`. No UI code uses `crm_tasks`. | `[VERIFIED: live]` | `handle-new-lead`'s task upsert (`task_type`, `priority:'normal'`, `onConflict`) fails. Task creation is not in D-05: **remove it** from `handle-new-lead`. |
| F5 | `handle-new-lead` does not read the Email Templates; it hardcodes two customer emails. `auto-reply-lead` reads the template but is **unauthenticated** (deployed `verify_jwt:true`, so any holder of the public anon JWT can call it; recipient and `lead.name` are caller-supplied and substituted into HTML unescaped). Template has no subject; `integrations` is currently empty (no custom template saved). | `[VERIFIED: code + live]` | Mail-relay/HTML-injection risk. Fold template reading into `handle-new-lead` via a shared `_lib`, escape substitutions, and retire/lock `auto-reply-lead` (require trusted caller). |
| F6 | `stale-lead-checker` has no auth check of its own (relies on platform `verify_jwt` = default true, which accepts the anon JWT) and sends its "digest" **every run** (i.e. every 6 h) whenever stale leads exist. It emails only `LEAD_ALERT_EMAIL`. | `[VERIFIED: code]` | Add service-key/admin check; limit digest to once per day; use the recipients list. |
| F7 | Newsletter sign-ups are rows in `leads`: `lead_source='other'`, `name='Newsletter Subscriber'`, `message="Signed up for 'Design Decoded' newsletter."`, `source` null (`useNewsletter.ts`). Welcome popup = `lead_source='welcome_popup'`, `source='Welcome-Popup'`. | `[VERIFIED: code + live]` (7 of 12 live leads are welcome-popup) | D-02 exclusion needs a reliable marker: set `source:'Newsletter'` in `useNewsletter` going forward and exclude both that and the legacy fingerprint. |
| F8 | Secrets present live (names only): `RESEND_API_KEY, LEAD_ALERT_EMAIL, TELEGRAM_BOT_TOKEN, WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SECRET_KEYS ...`. **Absent:** `TELEGRAM_CHAT_ID`, `LEAD_WEBHOOK_SECRET`, `APP_BASE_URL`, `WHATSAPP_NUMBER`. `vault.secrets` is empty. Extensions installed: `pg_net, pg_cron, supabase_vault, http`. | `[VERIFIED: live]` | `handle-new-lead` checks `LEAD_WEBHOOK_SECRET` but `notify-telegram` checks `WEBHOOK_SECRET`: unify on one name. `WEBHOOK_SECRET` is dated 2026-09-11 = the leaked one; rotate it. |
| F9 | `projects` and `services` already have `seo_title`/`seo_description` (all NULL; 3 projects, 10 services). `asset_usages` roles in use: blog/cover (9), project/cover (3), service/icon (8), archetype/hero (1). | `[VERIFIED: live]` | D-11 text needs UI + public read only. Share image = new `asset_usages` role (`social`, per ADR 0002), no schema change. |
| F10 | Crawler OG middleware is already broken for blog and projects: it selects `projects.cover_image` and `blog_posts.cover_image(_url)`, which don't exist -> PostgREST 42703 -> falls back to `DEFAULT_OG`. Static routes use the hardcoded `STATIC_OG_MAP`, not the CMS `*.seo` blocks. | `[VERIFIED: live REST calls + code]` | CMS share image/noindex would not reach WhatsApp/Facebook scrapers unless the middleware is fixed and made CMS-aware. |
| F11 | `site_settings` is anon-SELECT-able as rows, but column privileges for anon are false on `telegram_chat_ids`, `report_recipients`, `security_config`, `integrations` (anon REST returns 401 permission denied on those columns). UPDATE is allowed for `is_admin_or_editor` (editors included). `workspace_commitment_revisions` has SELECT/INSERT policies only (no UPDATE/DELETE: ledger rows are immutable from the client); INSERT is allowed for `is_crm_viewer()` (viewers too). | `[VERIFIED: live]` | New recipient columns are private by default (verify). Editors can currently turn off 2FA enforcement or add themselves as alert recipient: restrict writes of security/recipient columns to super_admin. |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| TOTP enrol/challenge/verify | API / Backend (`apps/web/api/auth/mfa.ts`, Vercel) | Browser (forms only) | Only the server can hold the AAL1 token (HTTP-only) and call GoTrue; the browser client has no session by design |
| "2FA required" enforcement (hard) | Database (restrictive RLS on `aal` claim via helper) | API (login withholds cookie), Edge fns (`verifyAdmin` aal check) | Anon key + password grant are public, so only DB/edge checks can't be bypassed |
| Idle logout + warning | Browser (AdminLayout hook) | API (`/api/auth/logout` revokes) | Inactivity is a UI-event concept; revocation is server-side |
| 2FA reset for locked-out user | Edge Function (`manage-user` `reset-mfa`, super_admin only) | Operator SQL (sole super admin) | Needs service role / GoTrue admin API |
| New-lead fan-out (email, auto-reply, Telegram) | Database trigger -> Edge Functions | pg_cron sweep (retry) | Fires on any insert path (client insert, `submit-estimate`, workspace function) |
| Secrets for DB->function calls | Database (Supabase Vault) | Edge secrets (matching value) | Removes hardcoded token from function body |
| Recipient lists (email, Telegram) | Database (`site_settings`, private columns) | Admin UI (super_admin write) | Same pattern as `report_recipients` |
| Per-page / per-item SEO | Browser (Helmet) | Edge middleware for crawlers | Social scrapers do not run JS |
| Menus, footer links, form wording | CMS blocks (`site_content`) rendered in browser | — | Existing draft/publish/history infrastructure |
| Lock-decision data capture | Browser (assembles from lead + decision events) | Database (`workspace_commitment_revisions`) | Data already client-visible to the admin |

## Standard Stack

No new npm packages are recommended; everything below is already in the repo. `[VERIFIED: codebase]`

| Library / Service | Version | Purpose | Why |
|---|---|---|---|
| `@supabase/supabase-js` | ^2.112.2 (apps/web) | GoTrue client on server handlers (`api/auth/*`) | Already used by login/refresh; for MFA call GoTrue REST directly with `fetch` (needs a bearer, not a client session) |
| GoTrue MFA REST (`/factors`, `/challenge`, `/verify`, admin `DELETE /admin/users/{id}/factors/{fid}`) | hosted | TOTP | `[CITED: github.com/supabase/auth handlers-mfa.md via Context7 /supabase/auth]` |
| Supabase Vault (`vault.create_secret`, `vault.decrypted_secrets`) | installed | Secrets for trigger + cron | Already used in runbooks; extension present `[VERIFIED: pg_extension]` |
| `pg_net` + `pg_cron` | installed | Async HTTP from DB, schedules | present `[VERIFIED: pg_extension]` |
| Resend (REST) | existing `RESEND_API_KEY` | Email | already used by all four functions |
| Vitest 3-style suites in `apps/web/src/test` | existing | Unit/contract tests | `siteContent.test.ts`, `lead-scoring-parity.test.ts` are the patterns to copy |
| Playwright | existing | E2E | `e2e/` + `playwright.config.ts` |

**TOTP QR:** GoTrue's enroll response already contains `totp.qr_code` (SVG data URI), `totp.secret`, `totp.uri`. Render with `<img src={qr_code}>`; do not add a QR library. `[CITED: Context7 /supabase/auth]`

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|---|---|---|
| Server-side MFA endpoint | `supabase.auth.mfa.*` in browser | Impossible without client session; would require reintroducing session persistence (forbidden) |
| Vault `service_role_key` for cron | Dedicated `cron_secret` + `verify_jwt=false` | Least privilege, but more moving parts; follow the existing runbook (service key in Vault) and keep one pattern |
| GoTrue inactivity timeout | Client idle hook | GoTrue session inactivity/time-box is reported as Pro-plan `[LOW: single secondary source; official page lists inactivity timeouts as configurable but not the plan]`; client hook works on any plan and gives the warning UX D-09 needs |

## Package Legitimacy Audit

No external packages are added by this phase. slopcheck not run. Table intentionally empty.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---|---|---|---|---|---|---|
| (none) | — | — | — | — | — | — |

**Packages removed due to [SLOP]:** none. **Packages flagged [SUS]:** none.

## Architecture Patterns

### System Architecture Diagram

```
 PUBLIC FORMS (contact / popup / newsletter / estimator / quiz / workspace)
        | anon insert (RLS)            | edge fn (service role) submit-estimate, submit-workspace-commitment
        v                              v
                 public.leads  --AFTER INSERT--> on_lead_insert_webhook_notify (existing trigger, ONE)
                                                  handle_lead_webhook_notify()  [replaced body]
                                                   | reads Vault 'lead_webhook_secret' (missing => WARNING, skip, never block insert)
                          +------------------------+---------------------------+
                          | net.http_post #1 (own BEGIN..EXCEPTION)             | net.http_post #2 (own BEGIN..EXCEPTION)
                          v                                                     v
                 notify-telegram (verify_jwt=false)                    handle-new-lead (verify_jwt=false)
                  reads site_settings.telegram_chat_ids                   claim internal_notified_at  -> Resend -> lead_activities
                  -> sendMessage per chat id (allSettled)                 claim auto_reply_sent_at    -> (skip newsletter / no email)
                                                                          template: integrations.email_templates.auto_reply_lead
                                                                          recipients: LEAD_ALERT_EMAIL + site_settings.lead_alert_recipients
 pg_cron 'lead-notify-sweep' (every 10-15 min) --Vault service key--> handle-new-lead for leads (after go-live) with internal_notified_at IS NULL
 pg_cron 'stale-lead-checker-every-6h' / 'weekly-report-email-every-monday' / 'sync-posthog-reporting-daily'
        --Authorization: Bearer <vault service_role_key>--> edge functions (service key check in code)

 ADMIN SIGN-IN (2FA)
 /admin/auth form --POST /api/auth/login--> signInWithPassword (aal1)
     |-- factors verified OR enforce_2fa(true, read w/ service key) --> NO access_token cookie; set mfa_pending cookie (aal1 access token, 10 min, path=/api/auth/mfa, httpOnly, SameSite=Strict)
     |       response: { mfa: 'challenge' | 'enroll', factorId? }
     v
 AdminAuth view 'mfa-challenge' / 'mfa-enroll' --POST /api/auth/mfa {action: enroll|verify}--> GoTrue /factors, /challenge, /verify
     verify OK (aal2 tokens) --> Set-Cookie access_token + refresh_token (as today) ; clear mfa_pending ; return role
     v
 /admin/* (middleware verifyAuth unchanged) ; /api/supabase/* proxy unchanged ; refresh route keeps aal2 (verify in test)
 BACKSTOP: restrictive RLS  USING (public.admin_mfa_satisfied())   [inert while enforce_2fa=false]
           edge verifyAdmin: if enforce_2fa and JWT aal != 'aal2' => 403

 IDLE LOGOUT: AdminLayout -> useIdleLogout(minutes from security_config) -> warning dialog (T-2min, countdown) -> signOut() -> /admin/auth?reason=idle

 CMS: Site Content editor -> save_site_content_draft/publish (super_admin RPC) -> site_content (published JSON, public read)
      public pages: useSiteContent(key) -> Helmet (title, description, og:image, robots) ; Navbar/Footer read site.menu / site.footer_links
      crawler: middleware.ts resolveOg -> (new) fetch site_content seo block / projects+services seo_* + asset_usages social|cover -> inject OG + robots
```

### Recommended Project Structure (additions)
```
apps/web/api/auth/mfa.ts                       # single Vercel fn, body.action = enroll|challenge|verify|unenroll|status
apps/web/api/_lib/mfa.ts                       # GoTrue REST helpers + aal decode (pure, unit-testable)
apps/web/src/components/auth/mfa/              # MfaEnrollForm, MfaChallengeForm (used inside AdminAuth views)
apps/web/src/hooks/useIdleLogout.ts            # + IdleWarningDialog in components/admin/shared
apps/web/src/content/registry.ts|pageBlocks.ts # add fields/blocks (site.menu, site.footer_links, form.* blocks)
supabase/functions/_lib/leadNotify.ts          # PURE: isNewsletterLead, parseRecipients, parseChatIds, renderTemplate (vitest-testable)
supabase/functions/_lib/leadEmail.ts           # template resolve + Resend send
supabase/migrations/2026101400000X_*.sql       # one file per concern, applied singly (see Rollout)
docs/runbooks/phase-40-rollout.md              # operator checklist (ordered production writes)
```

### Pattern 1: Server-side MFA with a narrowly scoped pending cookie
**What:** `login.ts` stops issuing the full cookie pair when a second factor is required. It sets only `mfa_pending` (AAL1 access token, 10 min, `Path=/api/auth/mfa`, `HttpOnly`, `SameSite=Strict`, `Secure` in prod). `api/auth/mfa.ts` reads that cookie (never `access_token`) and calls GoTrue.
**When:** every login where the user has a verified TOTP factor, or `enforce_2fa` is true (factor missing -> enrol view).
**Why this shape:** the proxy (`middleware.ts`) and `/api/auth/me` only read `access_token`, so an AAL1 token in a different cookie scope is unusable against `/api/supabase/*` and `/admin/*`. No client-side session, so `arch:supabase-auth` stays green.
```typescript
// Source: GoTrue REST per Context7 /supabase/auth (handlers-mfa.md); cookie helpers per apps/web/api/auth/login.ts
// api/_lib/mfa.ts  (illustrative; redact tokens in logs)
const gotrue = (path: string, token: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    ...init,
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

export async function enrollTotp(aal1Token: string) {
  // factor_type=totp, friendly_name unique per user (409-ish 422 mfa_factor_name_conflict otherwise)
  const r = await gotrue("/factors", aal1Token, { method: "POST", body: JSON.stringify({ factor_type: "totp", friendly_name: `Authenticator ${Date.now()}`, issuer: "Cross Angle Admin" }) });
  return r.json(); // { id, totp: { qr_code, secret, uri } }
}
export async function verifyTotp(aal1Token: string, factorId: string, code: string) {
  const ch = await (await gotrue(`/factors/${factorId}/challenge`, aal1Token, { method: "POST" })).json(); // { id }
  const v = await gotrue(`/factors/${factorId}/verify`, aal1Token, { method: "POST", body: JSON.stringify({ challenge_id: ch.id, code }) });
  return v; // 200 => { access_token (aal2), refresh_token (rotated), expires_in, user }
}
```
`getUser` on the AAL1 token returns `user.factors[]` (id, factor_type, status) so the login handler can detect "has verified factor" without the service key `[ASSUMED: GoTrue user object includes factors; confirm in the first integration test]`.

### Pattern 2: Hard enforcement via a self-gating RLS helper
```sql
-- Inert while enforce_2fa is false or caller has no admin role. Restrictive => applies on top of existing permissive policies.
create or replace function public.admin_mfa_satisfied() returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when not coalesce((select (security_config->>'enforce_2fa')::boolean from public.site_settings limit 1), false) then true
    when not exists (select 1 from public.user_roles where user_id = (select auth.uid())) then true   -- visitors/anon sessions unaffected
    else coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
  end;
$$;
-- then, per sensitive table (leads, lead_activities, user_roles, site_settings, site_content_drafts, audit_logs ...):
-- create policy mfa_required_<t> on public.<t> as restrictive to authenticated using ((select public.admin_mfa_satisfied()));
```
Restrictive-policy syntax and `auth.jwt()->>'aal'` check `[CITED: supabase.com/docs/guides/auth/auth-mfa via Context7]`. Apply table by table; test with a user JWT at aal1 vs aal2. Do NOT apply until all 6 admin logins are enrolled (otherwise their already-issued aal1 cookies from before the deploy hit RLS walls).

### Pattern 3: Claim-then-send idempotency (pipeline)
```typescript
// Source: pattern; columns from migration below. Claim FIRST so concurrent/retried calls cannot double-send.
const { data: claimed } = await supabase.from("leads")
  .update({ auto_reply_sent_at: new Date().toISOString() })
  .eq("id", lead.id).is("auto_reply_sent_at", null).select("id");
if (!claimed?.length) return skip("already-sent");
try { await sendResend(...); await logActivity("auto_reply_sent", ...); }
catch (e) { await supabase.from("leads").update({ auto_reply_sent_at: null }).eq("id", lead.id); await logActivity("auto_reply_failed", ...); }
```
Same for `internal_notified_at`. pg_net is fire-and-forget with no retry, so the sweep cron covers missed deliveries.

### Pattern 4: Add an SEO field to every page block (CMS)
Add `{ name: "ogImage", label: "Share image", type: "url", help: ... }` and `{ name: "noindex", label: "Hide this page from Google", type: "boolean" }` to `PAGE_SEO_FIELDS` and to the bespoke `home.seo` and `LEGAL_FIELDS`; extend `PageSeo`/`HomeSeo`/`LegalDocument` types; add `ogImage: ""`, `noindex: false` to each block's `defaults`. `normalizeField` already defaults `boolean` -> false and text -> "", so already-published rows normalise safely (no data migration). `isSafeAddress` already validates `url` fields. There is precedent for a raw image URL inside a block (`home.featured.imageUrl`), so `url` is consistent with the existing CMS even though ADR 0002 forbids raw URLs on *entity rows* (blocks are not entity rows; document this). A media-picker field type is an optional upgrade, not required.

### Anti-Patterns to Avoid
- **`supabase.auth.mfa.*` in the browser** (no session -> `AuthSessionMissingError`; fixing it means persisting sessions; forbidden).
- **Issuing the normal cookie pair at AAL1 and gating only in React** (a password-only attacker can call GoTrue directly with the public anon key and then PostgREST with that JWT).
- **Restrictive RLS without the self-gating helper** (instant lockout of all admins; also breaks visitors if not scoped to role holders).
- **A second source of truth for nav/footer** (D-13: remove `nav_links`/`footer_columns` from settings types and form defaults, not just stop reading them).
- **Passing client-supplied text into email HTML** (escape every substitution).
- **Running `supabase db push`** (ADR 0003).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| TOTP generation/validation, QR | custom RFC 6238 | GoTrue `/factors` + `/verify`; render returned `qr_code` | Replay/skew windows, rate limits, factor state all server-side |
| Secret storage for trigger/cron | hardcoded bearer, `ALTER DATABASE SET app.*` | Supabase Vault | Hardcoded token is the incident being fixed |
| Draft/publish/history for menus & wording | new tables | existing `site_content` blocks + RPCs | Already built (once F1 is resolved) |
| Recipient list UI | new component style | copy `ReportRecipientsManager` | Established pattern; same validation |
| Email rate/idempotency | in-memory flags | `*_at` column claim (UPDATE ... WHERE ... IS NULL) | Survives retries and concurrency |
| Idle detection | `setTimeout` only | last-activity timestamp in `localStorage` + `visibilitychange` re-check | Background tabs throttle timers; sleep/hibernate otherwise defeats the timeout |
| Scheduling | external cron | `pg_cron` + `net.http_post` with Vault key | Already installed |

**Key insight:** every "feature" here already has 80% of its machinery in the repo; the work is wiring, truthfulness and proof. The risk is production state drift (F1-F4), not missing libraries.

## Runtime State Inventory

(Phase includes a rename-like change: replace hardcoded token/chat id and retire `nav_links`/`footer_columns`, and a legacy table rename.)

| Category | Items Found | Action Required |
|---|---|---|
| Stored data | Legacy `public.site_content` (0 rows, unused). `site_settings.nav_links`/`footer_columns` = `[]`. `workspace_commitment_revisions`: 22 rows (see D-15). `site_settings.telegram_chat_ids = ["1228126069"]`, `report_recipients` = 1 address, `security_config` as F2. | Rename legacy table (migration). Drop/ignore nav_links/footer_columns after blocks ship (data migration none: empty). No data migration for chat ids (already seeded). |
| Live service config | Edge functions deployed: `notify-telegram` (v21), `weekly-report-email`, `auto-reply-lead`, `score-lead`, `sync-posthog-reporting`, `send-lead-email`/`submit-discovery-lead` (no source). Not deployed: `handle-new-lead`, `stale-lead-checker`, `auto-score-lead`, `retry-webhooks`. Cron: only `sync-posthog-reporting-daily` (401 nightly; last 200 seen 2026-10-13 02:53 was a different call). | Deploy `handle-new-lead`, `stale-lead-checker`; redeploy `notify-telegram`, `weekly-report-email`; verify `config.toml` `verify_jwt` for each. |
| OS-registered state | None (no OS task schedulers involved). Verified: cron lives in Postgres. | None |
| Secrets / env vars | Vault empty. Edge secrets per F8. `app.supabase_url`, `app.service_role_key`, `app.supabase_service_role_key` DB settings all unset. | Create Vault `lead_webhook_secret`, `service_role_key`; set edge `WEBHOOK_SECRET` (rotate) and make `handle-new-lead` accept it; set `APP_BASE_URL`, `WHATSAPP_NUMBER`; remove reliance on `app.*` settings. |
| Build artifacts / installed packages | `src/integrations/supabase/types.ts` is generated and lacks new columns. | Regenerate with `--linked` after migrations (never `--local`). |

## Common Pitfalls

### Pitfall 1: The CMS migration "succeeds" but creates nothing (F1)
**What goes wrong:** `CREATE TABLE IF NOT EXISTS public.site_content (key ...)` is a no-op against the legacy table; the RPCs then error on `key`; admin Site Content breaks while checklist says "OK".
**How to avoid:** First migration step: `ALTER TABLE public.site_content RENAME TO site_content_legacy` guarded by `information_schema.columns` check for `section_key` (rename carries policies/constraints; rename PK/policy names or drop legacy policies to avoid name clashes with `pub_read_site_content`). Then create the new tables. Verify with `select column_name from information_schema.columns where table_name='site_content'` returning `key,value,published_at,published_by`, and anon REST `site_content?select=key` returning 200.
**Warning signs:** 42703 "column site_content.key does not exist".

### Pitfall 2: Enabling real 2FA while the flag is already `true` (F2)
Deploy order: code deploy gives users the enrol-on-login path; set `enforce_2fa=false` only if a safety valve is wanted. Verify the super admin can complete enrolment on production **before** anyone else logs out. Keep two super admins enrolled so each can reset the other. Never apply the RLS backstop before all 6 are enrolled.

### Pitfall 3: Deploying the lead functions without the schema fixes (F3, F4)
`handle-new-lead` would 500 on `select budget_value_inr`. Add columns first (`budget_value_inr bigint`, `auto_reply_sent_at`, `auto_reply_template`, `internal_notified_at`; `loss_reason` as `text`, because `loss_reason_enum` does not exist, or drop it from the report select). Remove the CRM-task block from `handle-new-lead`. `budget_value_inr` is never populated by any current insert path (confirm with grep of `submit-estimate`); the hot-lead tier therefore never fires; either derive from `estimated_max` or accept standard tier (flag as Open Question).

### Pitfall 4: Backfill spam
When the sweep and the new columns arrive, 12 historic leads have `internal_notified_at IS NULL`. Do **not** backfill timestamps (falsifies the audit trail); instead the sweep and any manual replay use a go-live cutoff (`created_at > '<deploy timestamp>'`) passed in the cron SQL.

### Pitfall 5: Telegram regression
The Telegram path works today (status 200 observed). Keep `notify-telegram` as its own call from the trigger; do not route Telegram through `handle-new-lead`. Change only: bearer from Vault, chat IDs from `site_settings.telegram_chat_ids` (validate `^-?\d+$` or `^@\w+$`, cap 10, `Promise.allSettled`, one bad ID must not fail the rest; fallback to `TELEGRAM_CHAT_ID` env only if the list is empty; no hardcoded literal). `posthog-to-telegram` has the same hardcoded fallback; fix together.

### Pitfall 6: Digest every 6 hours
`stale-lead-checker` runs every 6 h but must email once a day: gate on a persisted marker (e.g. `site_settings.integrations.stale_digest_last_sent` or a `lead_activities`-style system row) or only send in the run whose UTC hour equals a configured hour.

### Pitfall 7: Secret mismatch breaks Telegram during rotation
`WEBHOOK_SECRET` (edge) and Vault `lead_webhook_secret` must match; run runbook steps 1-3 in one sitting; the new function body must `RAISE WARNING` and `RETURN NEW` on any failure so inserts never block. Check `net._http_response` status quickly (pg_net keeps responses only briefly) `[ASSUMED: ~6 h retention default]`.

### Pitfall 8: Idle timer in background tabs
Use `Date.now() - lastActivity` re-evaluated on `visibilitychange`/`focus` and every 15 s tick; share activity across tabs (`localStorage` `admin_last_activity` + `storage` event) so editing in tab A doesn't log out tab B. Activity = user input events only (not React Query polling). Warn at `timeout - min(2 min, 20%)`, dialog with live countdown, "Stay signed in" resets, expiry calls `useAuth().signOut()` then navigates with `?reason=idle`. Honest limit to document: this is a browser-side control (closing the tab doesn't revoke; refresh cookie lasts 30 days). Do not claim server-side enforcement.

### Pitfall 9: Crawler vs JS SEO
Helmet changes are invisible to WhatsApp/Facebook scrapers; Googlebot does run JS but `noindex` set late is weaker than HTML-level. Make `middleware.ts` read the published `*.seo` block and per-item `seo_*` + share image, and also inject `<meta name="robots" content="noindex">` for bots when set. Note middleware injects tags *in addition to* any in the shell; `index.html` has no OG/robots tags today (only `<title>`), so no duplicates.

### Pitfall 10: Per-role editing of security settings
`is_admin_or_editor` may UPDATE any `site_settings` column. Add a BEFORE UPDATE trigger (or column-level privileges) so only `super_admin` can change `security_config`, `telegram_chat_ids`, `lead_alert_recipients`, `report_recipients`. Otherwise an editor can switch 2FA off or add an outside alert recipient. `[VERIFIED policy; recommended mitigation is design, MEDIUM]`

### Pitfall 11: Existing Security page reads
`AdminUserAccessSecurity.tsx` / `SecurityTab.tsx` call `supabase.auth.getUser()` with no client session: supabase-js returns `AuthSessionMissingError` (`GoTrueClient._getUser`), so the displayed email is probably blank today `[VERIFIED in node_modules source; behaviour in browser MEDIUM, confirm hands-on]`. Use `useAuth().user` instead when touching that file for D-07/D-10.

## Code Examples

### Replacement trigger function (two independent calls, Vault, never blocks insert)
```sql
-- Source: adapted from docs/runbooks/rotate-lead-webhook-secret.md (token never appears in file)
create or replace function public.handle_lead_webhook_notify()
returns trigger language plpgsql security definer set search_path = '' as $$
declare secret text; payload jsonb;
begin
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'lead_webhook_secret' limit 1;
  if secret is null then raise warning 'lead_webhook_secret missing; skipping lead notifications'; return new; end if;
  payload := jsonb_build_object('type','INSERT','table','leads','schema','public','record', row_to_json(new));
  begin
    perform net.http_post(url := 'https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/notify-telegram',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||secret), body := payload);
  exception when others then raise warning 'notify-telegram enqueue failed: %', sqlerrm; end;
  begin
    perform net.http_post(url := 'https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/handle-new-lead',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||secret), body := payload);
  exception when others then raise warning 'handle-new-lead enqueue failed: %', sqlerrm; end;
  return new;
end; $$;
```
The existing trigger object stays; only the function is replaced. (Today's function has no exception handling: a pg_net error would currently fail the lead insert.)

### Cron with Vault (matches runbook section 2)
```sql
select cron.schedule('stale-lead-checker-every-6h', '0 */6 * * *', $$
  select net.http_post(
    url := 'https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/stale-lead-checker',
    headers := jsonb_build_object('Content-Type','application/json',
      'Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='service_role_key')),
    body := '{}'::jsonb);
$$);
-- weekly: '0 6 * * 1' -> weekly-report-email. Check net._http_response status_code, not cron.job_run_details.
```
Use the legacy JWT `SUPABASE_SERVICE_ROLE_KEY` value (functions compare `token === serviceKey`; deployed functions have `verify_jwt:true` which needs a JWT-format key; new `sb_secret_` keys would fail the gateway) `[ASSUMED: project still validates legacy JWT keys; edge secret SUPABASE_SERVICE_ROLE_KEY exists]`.

### Lock-decision with real data (D-15)
Assemble in a hook/service (not the page): `decision_genome` = latest client-submitted revision's `decision_genome` for the lead (public `LeadGatePhase` writes the full signals) merged with `{ discovery_archetype, discovery_confidence, discovery_priorities, discovery_lifestyle, discovery_sensory, discovery_contradictions }` from the `leads` row; `project_snapshot` = `{ budget, estimated_min, estimated_max, area, city, city_tier, property_type, project_type, start_timing, estimate_breakdown }` from the lead row; `narrative_brief` = text rendered from `generateDesignerBrief(lead)` (null if no archetype -> then refuse to lock with a plain message, or fall back to the client's own brief); `workspace_state` = `{ room, sessionId, decisions: [session decision_events payloads (recommendationId, decision, reason, snapshot confidence)] }`. For analytics, send only what is real: `selectedEvidence` = recommendation ids with a decision this session, `evidenceAvailable` = strategy+risk count, `designerConfidence` has no source: omit/null (do not fabricate); `dqi*` fields keep their versioning but not invented scores. Surface errors with the toast hook (`catch` -> destructive toast; button re-enabled). Gate the button when there is nothing real to lock.

## State of the Art

| Old | Current | Impact |
|---|---|---|
| `app.*` DB settings for cron auth | Vault secret read inside the cron SQL | The `app.*` settings are unset today; this is why the nightly job 401s |
| Hardcoded bearer in trigger | Vault + exception-safe trigger | D-06 |
| supabase-js MFA in browser | Server-side GoTrue REST in cookie architectures | Required by this repo's auth model |

**Deprecated here:** `AdminMediaOld`, `AdminUsers` (unused; out of scope); `site_settings.is_2fa_enforced`/`session_timeout` legacy columns (superseded by `security_config`; leave in place, stop referencing).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | TOTP MFA is enabled on the hosted project (enroll returns 200, not 422 `mfa_totp_enroll_not_enabled`) | Pattern 1 | Enrol screen fails; fix = enable in dashboard Auth settings. Verify with one real enrol call on first integration test |
| A2 | A refreshed session keeps `aal2` (refresh token belongs to the AAL2-upgraded session) | Pattern 1 | After 1 h, users fall back to aal1 -> RLS backstop locks them out. Docs do not state it directly; test: decode `aal` claim after `/api/auth/refresh` |
| A3 | GoTrue user object from the AAL1 token carries `factors[]` with `status` | Pattern 1 | Login can't detect enrolled users without service key; fallback = admin API `GET /admin/users/{id}/factors` |
| A4 | Resend sender domain `crossangleinterior.com` is verified for `hello@` | Pipeline | Emails rejected; first real test will reveal. Ask owner |
| A5 | pg_net response rows are retained only briefly (~hours) | Pitfall 7 | Test evidence disappears; capture immediately |
| A6 | Legacy JWT service key still accepted by function gateway (vs only new sb_secret keys) | Cron | Cron 401s; test with one manual `net.http_post` before scheduling |
| A7 | Vercel plan permits the extra function file (currently 5 in `api/auth`, +1 = 6) | MFA | Deploy failure on a 12-function Hobby limit only if more files are added; keep to one `mfa.ts` |
| A8 | Internal email alert should also go out for newsletter sign-ups (as Telegram already does today) | Pipeline | Owner may prefer to skip; cheap flag in `handle-new-lead` |
| A9 | GoTrue time-box/inactivity timeouts are Pro-plan only | Alternatives | Only affects the "server-side idle" option, which is not recommended anyway |

## Open Questions

1. **Hot-lead tier / `budget_value_inr`:** nothing populates it. Derive from `estimated_max` (INR) at insert or in `handle-new-lead`, or drop the high-value template tier? Recommendation: derive in `handle-new-lead` (`estimated_max ?? parse budget`), keep column nullable.
2. **Send internal alert for newsletter sign-ups?** Recommendation: yes, subject prefixed "Newsletter sign-up" (consistent with Telegram). Needs owner nod (A8).
3. **Email template subject:** Email Templates screen has body only; keep fixed subject or add a subject field to `integrations.email_templates`? Recommendation: add `auto_reply_subject` (optional, default current text) - small UI change.
4. **Treat 22 workspace rows (D-15):** see below; planner/owner confirm.
5. **Sole-super-admin recovery:** two super admins exist today; confirm both will enrol, and who holds the break-glass SQL.

### D-15 existing rows (read-only query result)
22 rows across 2 leads' worth of threads: 8 locked. 7 are the exact placeholder payload (`decision_genome={"nodes":12,"strategy":"Generated"}`, `project_snapshot={"budget":15000,"constraints":"Tight"}`, brief "Locked decision for UAT 005", 2026-07-07). 1 locked row is a test (client-fc001-...@example.com, brief about a 2 BHK). The other 14 are genuine-shape public submissions (estimator `{area,city,budget}` / quiz genome) plus one `OI-001 verification` test row. **Recommendation:** leave all rows untouched (the table has no UPDATE/DELETE policy, so the ledger is deliberately append-only) and flag in the UI by signature: genome has `nodes===12 && strategy==='Generated'` -> "Sample data (placeholder)" badge, excluded from DQI/analytics. Zero production writes needed. Offer operator SQL to hard-delete only if the owner wants it gone.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node | build/tests | yes | 24.18 | — |
| Supabase CLI (`npx supabase`) linked | read-only live checks, migrations, secrets, deploy | yes | 2.120.0 | Dashboard SQL editor |
| Deno | local edge-function runs | no | — | Keep logic in pure `_lib` TS modules tested with Vitest; deploy via CLI (bundles remotely) |
| curl (local) | manual REST probes | flaky (libcurl error 43 on this shell) | — | Node `fetch` script |
| pg_net / pg_cron / supabase_vault / http extensions | pipeline | yes (live) | — | — |
| Resend account + verified sender | emails | unknown | — | blocks D-05 proof until confirmed (A4) |
| Telegram bot token | Telegram | secret exists | — | — |
| Test inbox for customer email | proof of D-02 | needed | — | owner-provided address |

**Missing, blocking:** none verified; Resend domain status (A4) is the unknown. **Operator-only (production writes, cannot be done by an executor agent under the current read-only rule):** every migration, `vault.create_secret`, `cron.schedule`, `secrets set`, `functions deploy`, test-lead insert/cleanup, flipping `enforce_2fa`, applying RLS backstop.

## Operator Rollout (ordered production writes)

1. Migration A (single file, additive): rename legacy `site_content`; create site-content objects (from `20261013000000_site_content.sql`); add `leads.budget_value_inr bigint, auto_reply_sent_at, auto_reply_template, internal_notified_at, loss_reason text`; add `site_settings.lead_alert_recipients jsonb not null default '[]'`; super-admin-only guard trigger on sensitive `site_settings` columns. Then `migration repair`; `notify pgrst, 'reload schema'`; regenerate types `--linked`.
2. Vault: `lead_webhook_secret` (new random), `service_role_key`. Edge: `secrets set WEBHOOK_SECRET=<same new value>`, `APP_BASE_URL`, `WHATSAPP_NUMBER`. (Runbook steps 1-3 in one sitting.)
3. Deploy: `notify-telegram`, `handle-new-lead`, `stale-lead-checker`, `weekly-report-email`, `auto-reply-lead` (locked), `integration-status`, `manage-user`.
4. Migration B: replace `handle_lead_webhook_notify()`.
5. Proof: one real test lead (fake name, owner-controlled email) -> Telegram arrives, internal email arrives, customer reply arrives, `lead_activities` has `auto_reply_sent` + `internal_notification_sent`, `net._http_response` 200s; submit a newsletter signup -> internal alert only, no customer reply. Clean up test leads (operator).
6. Only then: fix `sync-posthog-reporting-daily` per runbook section 2 (+ backfill), schedule `stale-lead-checker` and `weekly-report-email`, add the sweep job.
7. App deploy with MFA; all 6 logins enrol; verify `aal` after refresh; then (optional, separate) Migration C: RLS backstop policies.

## Validation Architecture

### Test Framework
| Property | Value |
|---|---|
| Framework | Vitest (apps/web) + Playwright (repo root) |
| Config file | `apps/web/vitest.config.ts`, `playwright.config.ts` |
| Quick run command | `npm run test --workspace=web -- <file>` |
| Full suite command | `npm run test --workspace=web` ; `npm run typecheck` ; `npm run lint` ; `npm run arch:supabase-auth --workspace=web` ; `npm run arch:check --workspace=web` |

### Phase Requirements -> Test Map
| ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| D-01 | Recipient parsing: env default + list, dedupe, invalid dropped | unit (pure `_lib/leadNotify.ts`) | `vitest run src/test/lead-notify.test.ts` | Wave 0 |
| D-02 | Newsletter classification (new `source` marker + legacy fingerprint) excluded; others with email included | unit | same file | Wave 0 |
| D-02 | Template render escapes name/service; `{{lead.*}}` substitution | unit | same file | Wave 0 |
| D-03 | Chat-id list validation/cap, no hardcoded literal left | unit + grep test | `vitest run src/test/lead-notify.test.ts` ; contract test greps functions for `1228126069` | Wave 0 |
| D-04 | Digest once/day logic; auth check on stale-lead-checker | unit | `vitest run src/test/stale-digest.test.ts` | Wave 0 |
| D-05 | Real submission produces both `lead_activities` rows | manual-assisted e2e (operator) + read-only SQL | `npx supabase db query --linked "select activity_type from lead_activities where lead_id='<id>'"` | manual (prod write by operator) |
| D-05 | Claim-then-send idempotency (second call no-ops) | unit with fake client | `vitest run src/test/lead-notify.test.ts` | Wave 0 |
| D-06 | No bearer literal in any repo SQL/TS; function body in prod has no `Bearer ey...`/hex literal | grep contract test + read-only `pg_get_functiondef ~` check | `vitest run src/test/no-hardcoded-secrets.test.ts` | Wave 0 |
| D-07 | login withholds cookie when factor/enforce; verify sets aal2 cookies; pending cookie scope/flags | unit (mock fetch) | `vitest run src/test/auth/mfa-login.test.ts` | Wave 0 (pattern: `src/test/auth/login-response.test.ts`) |
| D-07 | aal2 survives `/api/auth/refresh` | manual-assisted (decode claim) once | script via Node | manual |
| D-07 | RLS backstop: aal1 JWT denied, aal2 allowed, inert when flag false | SQL via `db query --linked` with `set local request.jwt.claims` | read-only simulations | manual/operator |
| D-07 | Recovery: `manage-user reset-mfa` super_admin only, audit logged | unit on handler logic + manual | `vitest run src/test/auth/mfa-reset.test.ts` | Wave 0 |
| D-08 | Every role (viewer/editor/admin/super_admin) is challenged | unit table-driven | mfa-login test | Wave 0 |
| D-09 | Idle hook: warns at T-2m, logs out at T, resets on input, cross-tab, tab-sleep | unit with fake timers | `vitest run src/test/useIdleLogout.test.ts` | Wave 0 |
| D-10 | No string "will be required to set up" / "Inactive users will be logged out" while inactive | contract grep test | `vitest run src/test/security-copy-truthful.test.ts` | Wave 0 |
| D-11 | Per-item SEO fallback chain (seo_* -> name/summary -> cover); middleware OG for project/service/blog | unit on pure resolver + Playwright meta check | `vitest run src/test/seo-resolve.test.ts` | Wave 0 |
| D-12 | Every `*.seo` block has `ogImage`+`noindex`; defaults validate; normalisation fills old rows | unit (extend `siteContent.test.ts`) | `vitest run src/test/siteContent.test.ts` | exists, extend |
| D-12 | Helmet emits `robots noindex` + `og:image` when set | component test / Playwright | `npx playwright test e2e/seo-blocks.spec.ts` | Wave 0 |
| D-13 | Default menu/footer blocks reproduce today's links exactly; unsafe hrefs rejected | unit snapshot | `vitest run src/test/siteContent.test.ts` | extend |
| D-14 | Form wording blocks default to current strings; forms render override | unit + Playwright (`contact-form-flow.spec.ts` extended) | `npx playwright test e2e/contact-form-flow.spec.ts` | exists, extend |
| D-15 | Lock builds payload from real lead + events; no placeholder literals; error toast on failure; sample-row signature detection | unit (pure builder) + grep test for `nodes: 12` | `vitest run src/test/workspace-lock.test.ts` | Wave 0 |
| All | Layering/auth invariants stay green | existing | `npm run arch:supabase-auth --workspace=web`, `npm run arch:fitness --workspace=web` | exists |

### Sampling Rate
- **Per task commit:** the single new/changed Vitest file + `npm run typecheck`.
- **Per wave merge:** `npm run test --workspace=web`, `arch:supabase-auth`, `arch:check`, `npm run lint`.
- **Phase gate:** full suite green, plus the operator proof evidence in a checked-in `40-VERIFICATION` note (lead id, activity rows, HTTP statuses, AAL decode result) before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `supabase/functions/_lib/leadNotify.ts` (pure) + `src/test/lead-notify.test.ts`
- [ ] `apps/web/api/_lib/mfa.ts` + `src/test/auth/mfa-login.test.ts`, `mfa-reset.test.ts`
- [ ] `src/test/useIdleLogout.test.ts`, `security-copy-truthful.test.ts`, `no-hardcoded-secrets.test.ts`, `seo-resolve.test.ts`, `workspace-lock.test.ts`, `stale-digest.test.ts`
- [ ] Playwright global setup (`e2e/setup/admin-auth.ts`) logs in with a password only; once 2FA is enforced it will stall at the challenge. Decide: dedicated e2e account exempted via a documented flag, or TOTP secret in CI env (`PLAYWRIGHT_ADMIN_TOTP_SECRET`) with a tiny RFC 6238 helper in the setup file (test-only code). Recommendation: TOTP secret in CI env.
- [ ] No Deno locally: edge logic must live in pure modules importable by Vitest (pattern: `lead-scoring-parity.test.ts`).

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | yes | GoTrue TOTP (server-side), rate limit via existing `checkAuthRateLimit` on mfa verify, pending cookie `HttpOnly/SameSite=Strict/Secure`, 10-min TTL |
| V3 Session Management | yes | aal2 cookies replace pending; global logout already revokes (`scope=global`); idle logout (browser) + 24 h remember-me TTL retained |
| V4 Access Control | yes | RoleGuard unchanged; restrictive RLS on `aal`; super_admin-only writes to security/recipient columns; `manage-user reset-mfa` super_admin only; `auto-reply-lead` locked to trusted callers |
| V5 Input Validation | yes | Escape all email-HTML substitutions; validate chat ids and recipient emails (regex + caps); `isSafeAddress` for CMS hrefs/images |
| V6 Cryptography | yes | Never hand-roll TOTP; secrets in Vault; use constant-time compare for webhook secret in `handle-new-lead` |

### Known Threat Patterns
| Pattern | STRIDE | Mitigation |
|---|---|---|
| Password-only attacker uses public anon key against GoTrue/PostgREST directly | Elevation | RLS `aal` backstop + edge `verifyAdmin` aal check (UI gating is not enough) |
| Leaked hardcoded Telegram bearer (existing) | Spoofing | Rotate, Vault, retire old token (runbook step 5) |
| Open mail relay via `auto-reply-lead` | Spoofing/Abuse | Require trusted caller; recipient from DB lead row, not request body |
| HTML injection in customer email via `lead.name` | Tampering | `escapeHtml` on every substitution |
| Editor disables 2FA / adds alert recipient | Elevation | Restrict those columns to super_admin |
| Replay of pending cookie | Spoofing | Short TTL, narrow Path, single-purpose; clear on success |
| Stale-lead-checker invoked with public anon JWT (email spam) | DoS/Abuse | In-code service-key/admin check |
| Lockout of all admins | DoS (self) | enrol-on-login, two super admins, `reset-mfa`, break-glass SQL runbook, RLS backstop only after enrolment |
| Cron key exposure | Info disclosure | Vault; no `app.*` GUC; no key in repo |

## Sources

### Primary (HIGH)
- Live production, read-only (`npx supabase db query --linked`, `secrets list` names only, `functions list`, anon REST): schema facts F1-F11, cron, triggers, policies, extensions, role counts.
- Codebase: `apps/web/api/auth/*.ts`, `apps/web/middleware.ts`, `vite.config.ts` (vercelApiPlugin), `client.ts`, `AuthProvider.tsx`, `AdminAuth.tsx`, `AdminUserAccessSecurity.tsx`, `supabase/functions/{handle-new-lead,auto-reply-lead,notify-telegram,stale-lead-checker,weekly-report-email,manage-user,_lib/security}`, `content/*`, `AdminLeadWorkspace.tsx`, `services/workspace-commitments.ts`, `LeadGatePhase.tsx`, migrations `20260408000001`, `20260516100000`, `20261013000000`, `20260911000002`.
- Context7 `/supabase/auth` (handlers-mfa.md, endpoints.md): enroll/challenge/verify/unenroll/admin DELETE factor, error codes, verify returns aal2 access + rotated refresh.
- Context7 `/websites/supabase_guides` (auth-mfa): restrictive RLS policy on `auth.jwt()->>'aal'`.
- `node_modules/@supabase/auth-js/src/GoTrueClient.ts` (`_getUser` -> `AuthSessionMissingError`).
- https://supabase.com/docs/guides/auth/auth-mfa/totp and /auth-mfa (flow, AAL semantics).

### Secondary (MEDIUM)
- WebSearch on session inactivity/time-box plan gating (single Japanese secondary source; official sessions page lists inactivity timeouts as configurable).

### Tertiary (LOW)
- pg_net response retention (~hours), Vercel function-count limits, hosted MFA default enablement: flagged as assumptions.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH (nothing new; all verified present)
- Live schema/pipeline findings: HIGH (direct reads)
- MFA architecture: MEDIUM-HIGH (REST contract cited; aal-after-refresh and `factors[]` on user object need one integration test)
- CMS/SEO: HIGH for code paths, MEDIUM for crawler behaviour
- Pitfalls: HIGH

**Research date:** 2026-10-14
**Valid until:** 2026-11-13 (production state drifts as the operator applies changes; re-run the read-only checks in F1-F4 immediately before planning Wave 0)

## RESEARCH COMPLETE

**Main risks**
1. Site Content migration is a silent no-op because of a legacy `site_content` table (F1); fix first or D-12/13/14 and the "first use" checklist are fiction.
2. Production already has `enforce_2fa=true` with zero enrolled factors (F2); rollout must be enrol-on-login, with RLS backstop deferred until all 6 admin logins enrol.
3. Three lead functions select non-existent live columns and one writes to a non-matching `crm_tasks` shape (F3, F4); deploying as-is returns 500s.
4. UI-only 2FA is bypassable via the public anon key; the real control is the `aal` RLS backstop plus edge checks.
5. `auto-reply-lead` is an unauthenticated mail relay; `stale-lead-checker` is unauthenticated and digests every 6 h.
6. All production writes (migrations, Vault, cron, deploys, test leads, enforce flag, RLS) are operator actions and must follow the ordered rollout.

**Recommended approach per area**
- **2FA (D-07..D-10):** one Vercel function `api/auth/mfa.ts` calling GoTrue REST with a 10-minute, path-scoped `mfa_pending` cookie; set real `access_token`/`refresh_token` only from the AAL2 verify response; login withholds the cookie when a factor exists or `enforce_2fa` is true; AdminAuth gets enrol/challenge views; `manage-user` gains `reset-mfa`; restrictive RLS via inert-until-enforced `admin_mfa_satisfied()` applied only after everyone enrols; idle logout is a `useIdleLogout` hook in AdminLayout (timestamp-based, cross-tab, 2-minute warning); rewrite or remove the two false toasts.
- **Pipeline (D-01..D-06):** keep the single trigger, replace its function (two exception-wrapped `net.http_post` calls, Vault secret); `handle-new-lead` fixed (drop CRM task, shared template `_lib`, recipients list, newsletter exclusion, claim-then-send) and deployed; `notify-telegram` reads `telegram_chat_ids` (validated, allSettled, no literal); new `lead_alert_recipients` column; Vault-based cron for stale/weekly/posthog plus a sweep; schedule reminders only after the proof step.
- **CMS (D-11..D-14):** add `ogImage`+`noindex` to `PAGE_SEO_FIELDS`/home/legal; `site.menu`, `site.footer_links` and form-wording blocks with today's strings as defaults; projects/services use existing `seo_title`/`seo_description` plus an `asset_usages` `social` role for the share image; fix and make `middleware.ts` OG/robots CMS-aware (blog/project queries are broken today).
- **Workspace lock (D-15):** pure payload builder from the lead row, latest client genome revision, session decision events and `generateDesignerBrief`; no fabricated confidence; error toast; leave the 22 rows untouched and badge the placeholder signature as sample data.
- **Validation:** pure `_lib` modules with Vitest for logic, grep contract tests for secrets/false copy/placeholders, extended `siteContent.test.ts`, Playwright meta checks, operator-run proof of `lead_activities` rows and aal2-after-refresh, and a TOTP-capable Playwright login setup.

File: `E:/main/.planning/phases/40-admin-panel-remediation/40-RESEARCH.md`

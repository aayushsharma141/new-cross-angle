# Deploy checklist — Site Content CMS, admin accuracy, integration status

Written and tested locally. Read-only checks against production were run on 2026-10-14
(results below). **No production write has been made yet.**
Project ref: `iuuivmwqodefdrrrewol`.

## Findings from the live read-only checks (2026-10-14)

| Check | Result | Meaning |
|---|---|---|
| `cron.job` | One job: `sync-posthog-reporting-daily` (02:00 UTC). No stale-lead-checker, no weekly-report job | The `20260409…crm_automation` and `20260516…weekly_report_cron` migrations were never applied to production |
| Cron HTTP responses | The 02:00 call returned **401** | The job sends `Bearer ` + `current_setting('app.service_role_key')`, and that setting is **not set**, so every nightly sync is rejected |
| `analytics_reporting_daily` | Newest row **2026-05-15** | Blog, Discovery and Traffic reports have had no new data for ~5 months |
| DB settings `app.service_role_key`, `app.supabase_url`, `app.supabase_service_role_key` | All unset | Anything reading them (cron jobs, the lead webhook triggers) cannot authenticate |
| Triggers on `leads` | Only `on_lead_insert_webhook_notify` and `update_inquiries_updated_at` | The `auto-score-lead` trigger is **not installed** |
| Lead scores | 12 leads; the 1 estimator lead scored 63, the other 11 score **0** | Only the estimator path scores leads; everything else stays 0 |

`cron` "succeeded" status only means the SQL ran, not that the HTTP call was accepted. Check
`net._http_response` for the real status code.

## 1. Migration to apply

Apply **only** `supabase/migrations/20261013000000_site_content.sql`. It runs in one
transaction. Production already has an unrelated, empty legacy `public.site_content`
(`section_key`, `title`, `content` …, from the 2026-01 dump, unused by the app); the migration
renames it to `site_content_legacy` (with its constraints) and then creates the new tables. It
fails loudly, and changes nothing, if the resulting tables do not have the expected columns.
Tested on in-memory Postgres: legacy present, fresh database, applied twice, and an unexpected
table shape (rolls back).

Do **not** use `supabase db push`: it would also try to apply every older migration the
remote history does not list (this repo's migrations are a partial changelog; see ADR 0003).
Apply the single file and record it:

```bash
npx supabase db query --linked -f supabase/migrations/20261013000000_site_content.sql
npx supabase migration repair --linked --status applied 20261013000000
```

Rollback if needed (drops the new objects, then puts the legacy table back):

```sql
begin;
drop function if exists public.save_site_content_draft(text, jsonb), public.discard_site_content_draft(text),
  public.publish_site_content(text), public.revert_site_content(text, uuid), public.reset_site_content(text);
drop table if exists public.site_content_versions, public.site_content_drafts, public.site_content;
alter table if exists public.site_content_legacy rename to site_content;
alter table public.site_content rename constraint site_content_legacy_pkey to site_content_pkey;
alter table public.site_content rename constraint site_content_legacy_section_key_key to site_content_section_key_key;
alter table public.site_content rename constraint site_content_legacy_updated_by_fkey to site_content_updated_by_fkey;
commit;
```

**Confirm** (a row count alone is not enough: the old table also has 0 rows):

```sql
select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
where table_schema = 'public' and table_name = 'site_content';
-- expected: key,value,published_at,published_by
select to_regclass('public.site_content_legacy');  -- expected: site_content_legacy
```

Then sign in as a super admin, save and publish one Site Content block, and confirm the public
page shows it. An anonymous request for `site_content_drafts` must return nothing.

The earlier PostHog-schedule migration was removed from this PR: a job with that name already
exists, and replacing it with a different settings name would have broken it further.

## 2. Fix the nightly PostHog sync (needs the service-role key)

The job is scheduled but unauthorised. Give it a key it can read, without putting the key in
this repo. Preferred: Supabase Vault.

```sql
select vault.create_secret('<SERVICE_ROLE_KEY — paste here, never commit>', 'service_role_key');

select cron.unschedule('sync-posthog-reporting-daily');
select cron.schedule('sync-posthog-reporting-daily', '30 1 * * *', $$
  select net.http_post(
    url := 'https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/sync-posthog-reporting',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb);
$$);
```

The function only syncs "yesterday" by default. To fill the gap since May, call it with
`?date=YYYY-MM-DD` once per missing day (it supports backfills).

**Confirm:** next morning `select status_code from net._http_response order by created desc limit 3;`
shows 200, and `select max(date) from analytics_reporting_daily;` is yesterday.

## 3. Edge functions to deploy

```bash
npx supabase functions deploy integration-status
npx supabase functions deploy sitemap
npx supabase functions deploy score-lead
npx supabase functions deploy auto-score-lead
npx supabase functions deploy notify-telegram
npx supabase functions deploy posthog-to-telegram
```

Also deploy `score-lead` and `auto-score-lead` now that they share one formula (section 5).

## 4. Secrets

Open **Admin → Settings → Integrations → Server credentials** and press **Re-check**. Set
anything marked Required and Not set (`npx supabase secrets set NAME=value`). Set
`TELEGRAM_CHAT_ID` to the intended chat; once the panel shows it Set, the hardcoded fallback
chat id can be removed from `notify-telegram` and `posthog-to-telegram`.

## 5. Lead scoring (decided: auto-score-lead's formula)

The formula now lives once, in `supabase/functions/_lib/leadScoring.ts` (version `v1`, stored
in `leads.score_details`). `auto-score-lead` and `score-lead` import it, and the browser
mirror is pinned to it by `lead-scoring-parity.test.ts`. New leads inserted from the site are
scored at insert time instead of sitting at 0.

After deploying `score-lead` (it is safe now), re-score the existing leads once:

```bash
# needs a user JWT or the service key; score-lead is verify_jwt = true
curl -X POST https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/score-lead   -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"recalculateAll": true}'
```

Still open: `submit-estimate` scores estimator leads with its own admin-weighted formula
(`scoring_weights` in the estimator config). Moving it to the shared formula would retire
that admin setting, so it has been left as is pending a decision. The `auto-score-lead`
database trigger is also not installed (it needs the same working service-key setup as
section 2); until it is, scores update at insert and on a manual `recalculateAll`.

## 6. Other live checks still open

```sql
select status, count(*), max(created_at) from webhook_failures group by status;   -- SVC-01
select pg_get_functiondef('public.get_total_media_bytes'::regproc);               -- SVC-02
select public.get_total_media_bytes();
select count(*), coalesce(sum(size_bytes), 0) from media_files;                   -- compare with the line above
```

PostHog project timezone (CRM-11): PostHog → Project settings → Timezone.

## 7. First use of the CMS

1. Sign in as a **super admin**.
2. Admin → Site Content (`/admin/cms/site-content`). Change one line, **Save draft**, **Publish**.
3. Open the preview link, confirm the change and the history entry; restore the old version.

Public pages render the original text until something is published.

## 8. Not scheduled in production (decision needed)

`stale-lead-checker` (every 6 h) and `weekly-report-email` (Mondays) have no cron job. Both
send email to real recipients, so schedule them deliberately, after the key problem in
section 2 is solved (they authenticate the same way).

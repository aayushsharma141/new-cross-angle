# Deploy checklist — Site Content CMS, admin accuracy, integration status

Everything below is written and tested locally but **not applied to production**.
Work top to bottom. Each step says how to confirm it worked.
Project ref: `iuuivmwqodefdrrrewol`.

Production is the schema source of truth (ADR 0003), so back up before step 1:
Dashboard → Database → Backups, or `supabase db dump --linked -f backup-before-cms.sql`.

## 1. Database migrations (apply in this order)

| # | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/20261013000000_site_content.sql` | Site Content CMS tables, history, and the super-admin-only save/publish functions |
| 2 | `supabase/migrations/20261013010000_schedule_posthog_reporting_sync.sql` | Daily 01:30 UTC PostHog sync job |

**Before #2:** Dashboard → Database → Cron. If a job already calls
`sync-posthog-reporting` under a different name, delete it or skip #2, otherwise the sync runs twice.

**Before #2 also:** the cron jobs read two database settings. Run in the SQL editor:

```sql
select current_setting('app.supabase_url', true) as url,
       (current_setting('app.supabase_service_role_key', true) is not null) as has_key;
```

If `url` is null or `has_key` is false, the existing weekly-report and stale-lead jobs
are not working either. Set both before relying on any cron job.

Apply: `supabase db push --linked` (review the diff it prints first).

**Confirm #1:** in the SQL editor, `select count(*) from site_content;` returns 0 without error,
and as an anonymous user `select * from site_content_drafts;` returns nothing.

## 2. Edge functions to deploy

```bash
supabase functions deploy integration-status
supabase functions deploy score-lead
supabase functions deploy sitemap
supabase functions deploy notify-telegram
supabase functions deploy posthog-to-telegram
```

`integration-status`, `score-lead` and `sitemap` have real changes. The two Telegram
functions only gained a log warning (no behaviour change).

`config.toml` sets `verify_jwt = true` for `integration-status`; deploying with the CLI
applies it.

## 3. Secrets

Open **Admin → Settings → Integrations → Server credentials** and press **Re-check**.
Anything marked **Required** and **Not set** should be set:

```bash
supabase secrets set NAME=value
```

Pay particular attention to `TELEGRAM_CHAT_ID`: while it is unset, alerts go to a chat id
hardcoded in the code. Once it is set (and the panel shows it Set), the fallback can be removed.

## 4. Live checks the code cannot answer

Run in the SQL editor and note the results.

```sql
-- SVC-01: is anything ever writing failed Telegram deliveries?
select status, count(*), max(created_at) from webhook_failures group by status;

-- SVC-02: what does the media-size function actually sum?
select pg_get_functiondef('public.get_total_media_bytes'::regproc);
select public.get_total_media_bytes();
select count(*), coalesce(sum(size_bytes), 0) from media_files;  -- compare with the line above
```

- `webhook_failures` empty forever, with Telegram in use, means nothing writes to it. The
  Telegram card on Service Integrations will read 0 regardless of real delivery health.
- If `get_total_media_bytes()` does not match the `media_files` total, the storage figure in
  the admin is wrong; the function needs updating to read `media_files`.

PostHog project timezone (CRM-11): PostHog → Project settings → Timezone. If it is not
Asia/Kolkata, the "Peak Traffic Hours" chart is shifted.

## 5. First use of the CMS

1. Sign in as a **super admin** (editors and plain admins cannot see it).
2. Admin → Site Content. Pick any block, change one line, **Save draft**, then **Publish**.
3. Open the preview link and confirm the change; confirm the history list shows the previous version.
4. Edit the same block back, or use history to restore.

Public pages render the original text until something is published, so nothing changes
for visitors by applying the migration alone.

## 6. Known open items (need a decision, not a deploy)

- **Lead scoring (CRM-05):** `score-lead` and `auto-score-lead` use different formulas and
  write the same `leads.score` column. Pick one as authoritative, then add a version stamp.
- **Storage quota:** 20 GB is a constant in `hooks/useHubStats.ts`. Making it a setting needs a column.
- **Telegram fallback:** remove the hardcoded chat id after step 3 shows `TELEGRAM_CHAT_ID` Set.
- **Pre-existing, unrelated:** `arch:check` fails on `BulkActionToolbar.tsx` importing the
  Supabase client directly; two network tests fail without live Supabase.

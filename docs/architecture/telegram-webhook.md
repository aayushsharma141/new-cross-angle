# Telegram Webhook Architecture

## Overview

Telegram lead notifications are delivered via a **pg_net trigger → notify-telegram Edge Function** chain. This replaced the previous broken plaintext-GUC trigger as of `20260911000001`.

## Flow

```
Anonymous contact form submission
  ↓
CTAContact.tsx → submitLead()
  ↓
INSERT into public.leads (RLS: anon INSERT allowed, return=minimal)
  ↓
on_lead_insert_webhook_notify (AFTER INSERT trigger)
  ↓
handle_lead_webhook_notify() — pg_net HTTP POST
  ↓
notify-telegram Edge Function
  ↓
Telegram chat 1228126069
```

## Authentication

The trigger function authenticates to `notify-telegram` using a dedicated `WEBHOOK_SECRET`:

- Stored **in the trigger function body** in Postgres (visible to Postgres superusers; not in git)  
- Stored **in Supabase Edge Function secrets** as `WEBHOOK_SECRET`  
- **NOT** stored in `.env`, git, or frontend code

`notify-telegram` checks `Deno.env.get("WEBHOOK_SECRET")` in `isTrustedCaller()` and treats a matching Bearer token as a trusted caller — equivalent to service-role access.

## Current State

| Component | Status |
|-----------|--------|
| Old trigger `on_lead_insert_telegram_notify` | Dropped (migration `20260911000001`) |
| Old function `handle_new_lead_telegram_notify()` | Dropped |
| New trigger `on_lead_insert_webhook_notify` | Live in production |
| New function `handle_lead_webhook_notify()` | Live — secret embedded in function body |
| `WEBHOOK_SECRET` Edge Function secret | Set via `supabase secrets set --env-file` |
| `notify-telegram` function | Deployed with `WEBHOOK_SECRET` support |

## Temporary Frontend Fallback

`CTAContact.tsx` currently calls `leadService.notifyTelegram({ id })` as a fallback (commit `753ef7a4`). This will be removed **after** the DB trigger is verified to produce exactly 1 Telegram notification for a fresh real contact submission.

## Rotation Procedure

When the `WEBHOOK_SECRET` needs to be rotated:

1. Generate a new 64-char hex secret locally (never paste in chat or commit to git):
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 
   ```

2. Write it to a temp env file:
   ```
   node -e "require('fs').writeFileSync('/tmp/whs.env','WEBHOOK_SECRET=<NEW_SECRET>\n')"
   ```

3. Update Edge Function secret:
   ```
   SUPABASE_ACCESS_TOKEN=<pat> npx supabase secrets set --env-file /tmp/whs.env
   ```

4. Update the live trigger function body via Supabase SQL API (see `docs/internal` for script).

5. Redeploy notify-telegram:
   ```
   SUPABASE_ACCESS_TOKEN=<pat> npx supabase functions deploy notify-telegram
   ```

6. Delete the temp env file.

7. Verify with one fresh lead submission.

## What NOT to Do

- ❌ Do not `ALTER DATABASE postgres SET "app.webhook_secret" = ...` (plaintext GUC)
- ❌ Do not put `WEBHOOK_SECRET` in `.env` or any frontend-accessible config
- ❌ Do not commit the actual secret value to git in any migration file
- ❌ Do not use the project-wide `service_role` JWT as the webhook auth token

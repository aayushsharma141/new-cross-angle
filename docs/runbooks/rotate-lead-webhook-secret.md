# Rotate the lead webhook secret (and stop hardcoding it)

**Why:** the production function `public.handle_lead_webhook_notify()` (trigger
`on_lead_insert_webhook_notify` on `leads`) has the `notify-telegram` bearer token written into
its body. Anyone who can read function definitions in the database sees it, and it appeared in a
Claude Code session transcript on 2026-10-14.

**What the token allows:** `notify-telegram` treats a request carrying it as a trusted caller
(`isTrustedCaller`), so its payload is used as-is. A holder can make your bot post fabricated lead
notifications to the Telegram chat. It does not read or change lead data.

**Do not apply this blindly.** If the trigger sends the wrong token, lead notifications stop
(lead inserts still succeed). Do the steps in order and test at the end.

## 1. Generate a new secret and set it on the edge function

```bash
# 32 random bytes, hex
openssl rand -hex 32
npx supabase secrets set WEBHOOK_SECRET=<new value>
```

Until step 3, new leads will fail to notify (the trigger still sends the old token).
Do steps 1–3 in one sitting.

## 2. Store it in Supabase Vault (not in the function body)

```sql
select vault.create_secret('<new value>', 'lead_webhook_secret');
```

## 3. Replace the trigger function so it reads from Vault

```sql
create or replace function public.handle_lead_webhook_notify()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret text;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets where name = 'lead_webhook_secret' limit 1;

  if secret is null then
    -- Never block a lead insert because notification is misconfigured.
    raise warning 'lead_webhook_secret missing from vault; skipping Telegram notification';
    return new;
  end if;

  perform net.http_post(
    url := 'https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/notify-telegram',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || secret
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'record', row_to_json(new),
      'schema', 'public'
    )
  );
  return new;
end;
$$;
```

## 4. Test

Submit a test lead from the site (or insert one in the SQL editor with a clearly fake name) and
confirm the Telegram message arrives. Then check the HTTP result:

```sql
select status_code, created from net._http_response order by created desc limit 3;
```

200 means it worked; 401 means the Vault value and the `WEBHOOK_SECRET` edge secret differ.

## 5. Clean up

Delete the test lead. Confirm the old token no longer works:
`curl -X POST .../functions/v1/notify-telegram -H "Authorization: Bearer <old token>"` should now
be treated as untrusted (400 "A valid lead id is required").

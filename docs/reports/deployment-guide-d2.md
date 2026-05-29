# Deployment Guide — d2.crossangleinterior.com on Vercel

**Date:** 2026-05-12
**Project:** Cross Angle Interior — Full-Stack Vite/React + Supabase
**Target:** `https://d2.crossangleinterior.com/`
**DNS host:** Hostinger (hPanel)

---

## Pre-flight checklist (already confirmed ✅)

| Item | State |
| --- | --- |
| Vercel CLI 50.44.0 installed | ✅ |
| `.vercel/project.json` linked to `prj_qG2qG37EV59sHCyvtGa6EyzYitWX` | ✅ |
| Live Supabase project `iuuivmwqodefdrrrewol` healthy | ✅ |
| `apps/web/vercel.json` sitemap rewrite fixed (was pointing to dead project) | ✅ |
| `apps/web/.env.local` has all keys | ✅ |

---

## Step 1 — Re-link Vercel project with a fresh token

The current token is **personal-scoped only** and cannot access the team project. You need to generate a new token with team access.

### 1a. Generate a new Vercel token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name: `CrossAngle Deploy`
4. Scope: **Full Account** (not "No scope")
5. Expiration: 1 year
6. Copy the token — you will use it in Step 1b

### 1b. Re-link the project

Open a terminal in `c:\Users\aayus\Desktop\main` and run:

```powershell
# Remove stale link
Remove-Item -Recurse -Force .vercel

# Link fresh — CLI will ask you to pick the team and project
vercel link --token=<YOUR_NEW_TOKEN>
# When prompted:
#   Set up "main"? → Yes
#   Which scope? → crossangledigital-ops (team)
#   Link to existing project? → Yes
#   Project name: main
```

Verify it worked:

```powershell
vercel project ls --token=<YOUR_NEW_TOKEN>
# Should list "main" project
```

---

## Step 2 — Configure environment variables in Vercel

These must be set in the **Vercel dashboard** before deploying.

Go to: [vercel.com/crossangledigital-ops/main/settings/environment-variables](https://vercel.com/crossangledigital-ops/main/settings/environment-variables)

Add all of the following for **Production** environment:

| Variable | Value | Where to find |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://<PROJECT_REF>.supabase.co` | Supabase → Project Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `<SUPABASE_ANON_KEY>` | Same |
| `VITE_SUPABASE_PROJECT_ID` | `<PROJECT_REF>` | Same |
| `VITE_POSTHOG_KEY` | `<POSTHOG_PROJECT_API_KEY>` | PostHog → Project → API Keys |
| `VITE_SENTRY_DSN` | `<SENTRY_DSN_URL>` | Sentry → Project → Client Keys |
| `VITE_SENTRY_ENV` | `production` | Literal value |

Optional (enables Sentry source-map uploads — minified stack traces → real file:line):

| Variable | Value |
| --- | --- |
| `SENTRY_AUTH_TOKEN` | Create at `sentry.io → Settings → Auth Tokens` (scopes: `project:write`, `releases:write`, `org:read`) |
| `SENTRY_ORG` | Your org slug (visible in your Sentry URL) |
| `SENTRY_PROJECT` | Your project slug |

> ⚠️ Do NOT set `VITE_SUPABASE_SERVICE_ROLE_KEY` in Vercel — service role keys must never be exposed in frontend builds.

---

## Step 3 — Configure Vercel build settings (one-time, in dashboard)

Go to: Vercel Dashboard → Project `main` → Settings → General

Set:

| Setting | Value |
| --- | --- |
| **Framework Preset** | Vite |
| **Root Directory** | `apps/web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` (root, npm workspaces handles sub-packages) |
| **Node.js Version** | 20.x |

> The `Root Directory = apps/web` is critical. It tells Vercel to treat `apps/web` as the project root,
> so `vite.config.ts`, `vercel.json`, and `package.json` in that folder are used.

---

## Step 4 — Deploy to Vercel

```powershell
# From the monorepo root
cd c:\Users\aayus\Desktop\main

# Deploy to production
vercel --prod --token=<YOUR_NEW_TOKEN>
```

Vercel will:

1. Install dependencies using root `package.json` (npm workspaces)
2. Run `npm run build` inside `apps/web`
3. Upload `apps/web/dist` as the deployment
4. Apply `apps/web/vercel.json` rewrites and headers
5. Return a deployment URL like `main-abc123.vercel.app`

Verify the deployment URL works before touching DNS.

---

## Step 5 — Add d2.crossangleinterior.com to Vercel

Once the deployment is healthy, add the custom domain:

```powershell
vercel domains add d2.crossangleinterior.com --token=<YOUR_NEW_TOKEN>
```

Or via dashboard: Project → Settings → Domains → Add `d2.crossangleinterior.com`

Vercel will show you one of these DNS values to add:

| Type | Vercel gives you |
| --- | --- |
| **CNAME** (preferred for subdomain) | `cname.vercel-dns.com` |
| **A record** (fallback) | `76.76.21.21` |

---

## Step 6 — Add DNS record in Hostinger

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Click on your domain `crossangleinterior.com`
3. Go to **DNS / Nameservers → DNS Records**
4. Add a new record:

```
Type:  CNAME
Name:  d2
Value: cname.vercel-dns.com
TTL:   3600
```

5. Save. DNS propagation takes **2–30 minutes** (typically under 5 min on Hostinger).

Verify propagation:

```powershell
[System.Net.Dns]::GetHostAddresses("d2.crossangleinterior.com")
# Should resolve to Vercel IPs (76.76.21.x range)
```

---

## Step 7 — Verify SSL and live state

Once DNS propagates, Vercel auto-provisions a Let's Encrypt SSL certificate. Run:

```powershell
$ErrorActionPreference = "SilentlyContinue"
$r = Invoke-WebRequest -Uri "https://d2.crossangleinterior.com/" -TimeoutSec 20 -UseBasicParsing
Write-Host "HTTP: $($r.StatusCode)"
Write-Host "Server: $($r.Headers["Server"])"
Write-Host "x-vercel-id: $($r.Headers["x-vercel-id"])"
$r.Content.Substring(0,300)
```

Expected:

```
HTTP: 200
Server: Vercel
x-vercel-id: iad1::...
<!doctype html><html lang="en">...Crossangle Interior | Premium Interior Design Studio...
```

---

## Step 8 — Update BetterStack monitors

Once live, update monitoring to track the new production URL:

```powershell
$token = "<BETTERSTACK_API_TOKEN>"  # Retrieve from BetterStack dashboard → API tokens
$headers = @{ "Authorization" = "Bearer $token" }

# Create new monitor for d2 production
$body = @{
    monitor_type = "status"
    url          = "https://d2.crossangleinterior.com/"
    pronounceable_name = "CrossAngle d2 Production"
    check_frequency = 60
    request_timeout = 15
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://uptime.betterstack.com/api/v2/monitors" `
    -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## Step 9 — Update Sentry production configuration

After deploy, send a test event to confirm Sentry is receiving production errors:

```javascript
// Paste in browser DevTools console on d2.crossangleinterior.com
Sentry.captureMessage("d2 production deploy verified", "info");
```

Check it appears at: `sentry.io → Issues` within 30 seconds.

---

## Post-launch checks

| Check | Command / URL |
| --- | --- |
| Site loads | `https://d2.crossangleinterior.com/` |
| React SPA routing (deep link) | `https://d2.crossangleinterior.com/about` |
| Sitemap | `https://d2.crossangleinterior.com/sitemap.xml` |
| PostHog proxy | `https://d2.crossangleinterior.com/ingest/decide?v=3` |
| Supabase auth | Try signup/login flow |
| Admin panel | `https://d2.crossangleinterior.com/admin` |
| Sentry errors | Check sentry.io dashboard |
| BetterStack | All monitors green |

---

## What was pre-fixed before deployment

| File | Change |
| --- | --- |
| `apps/web/vercel.json` | Sitemap rewrite updated to use live Supabase project ID |
| `apps/web/.env.local` | `VITE_SENTRY_DSN` and `VITE_SENTRY_ENV=development` configured |
| `supabase/config.toml` | Project ID aligned to live project |
| `supabase/functions/health` | Deployed with `verify_jwt = false` |

---

## Domain strategy summary

| Domain | Host | Stack | Purpose |
| --- | --- | --- | --- |
| `crossangleinterior.com` | Hostinger / WordPress | WordPress | Main marketing site (keep running) |
| `demo.crossangleinterior.com` | Hostinger / LiteSpeed | Vite (old v1 build) | Old demo — leave as-is |
| `d2.crossangleinterior.com` | **Vercel** | **Vite + Supabase** | New full build — this deployment |

> When ready to go fully live on the root domain, update the CNAME/A record for
> `crossangleinterior.com` to point to Vercel instead of Hostinger. That is a separate step
> and will replace the WordPress site.

---

*Guide generated: 2026-05-12 | Based on live audit of Hostinger DNS, Vercel project, and Supabase state*

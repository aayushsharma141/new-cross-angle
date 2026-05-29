# Security Audit — CrossAngle Interior Platform

**Date:** 2026-05-16  
**Score: 4.5/10 (Vulnerable)**  
**Verdict:** Moderate-to-High Risk. While the application implements strong rate limiting, frontend headers, and input validation, it has a catastrophic backend vulnerability: **17 critical tables have Row Level Security (RLS) disabled**, exposing sensitive lead details, user comments, system webhooks, and analytics events to anonymous read/write access via the public anon key.

---

## Security Posture Summary

| Category | Status | Notes |
|----------|--------|-------|
| Authentication (JWT/Session) | ✅ Strong | Server-validated, auto-refresh |
| Authorization (RLS/RBAC) | 🔴 Catastrophic | 17 tables (views, comments, webhooks) have RLS disabled |
| Input Validation | ✅ Good | Zod + server-side checks |
| XSS Protection | ✅ Good | DOMPurify, no unsafe innerHTML |
| CSRF Protection | ⚠️ Adequate | Token-based auth inherently resistant |
| Secrets Management | 🔴 Issue | Plaintext test creds in .env.local |
| Rate Limiting | ✅ Excellent | KV-backed, per-endpoint, persistent |
| SQL Injection | ✅ Safe | Parameterized via Supabase client |
| Security Headers (Frontend) | ✅ Excellent | CSP, HSTS, X-Frame-Options active |
| Dependency Vulnerabilities | ✅ Managed | Dependabot daily scans |
| Data Exposure | 🔴 Critical | Webhook failures, analytics, and comments fully exposed |

---

## 🔴 Critical (Fix Today)

### 1. Security Headers on Frontend (✅ Resolved)
`dist/_headers` and `public/_headers` have been fully configured with an enterprise-grade Content Security Policy (CSP), strict HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.

**Deployed Configuration (`apps/web/public/_headers` & `apps/web/dist/_headers`):**
```
/*
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co https://*.posthog.com https://*.imagekit.io https://*.sentry.io; img-src 'self' data: https://*.imagekit.io https://*.supabase.co https://*.googleusercontent.com https://avatars.githubusercontent.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' data:; media-src 'self' https://*.imagekit.io https://*.supabase.co; frame-src 'self' https://*.supabase.co https://*.posthog.com https://maps.google.com https://*.youtube.com https://www.youtube-nocookie.com;
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 2. Row Level Security (RLS) Disabled on 17 Tables (🔴 Catastrophic)
A live database audit revealed that Row Level Security (RLS) is completely disabled on 17 tables. This allows any user with the public `anon` API key to bypass all access restrictions, read sensitive technical/user data, insert spam or malicious entries, or delete database contents.

#### Vulnerable Tables Breakdown:
1. **Analytics Tables:** `public.analytics_events` and `public.analytics_events_default`.
   - *Why it occurred:* RLS was likely bypassed to permit fast client-side event ingestion, rather than drafting clean, restricted write-only RLS policies.
   - *Risk:* Anyone can read raw event streams or flood the analytics pipeline, corrupting business metrics.
2. **Comment Table:** `public.comments`.
   - *Why it occurred:* Initial setup neglected RLS configuration during comments feature development.
   - *Risk:* Unauthorized read/write/delete of client remarks, allowing spam injection or defacement.
3. **Partitioned Project View Tables:** `public.project_views` and its monthly partitions (`project_views_2026_02` through `project_views_2026_12`, and `project_views_2027_01`).
   - *Why it occurred:* When monthly partition tables were dynamically or manually created, RLS was not enabled on the child partitions. Parental RLS does not automatically propagate to partitions in PostgreSQL unless explicitly altered.
   - *Risk:* View counters can be manipulated or deleted, destroying tracking integrity.
4. **Webhook Failure Logs:** `public.webhook_failures`.
   - *Why it occurred:* Overlooked database housekeeping table during initial deploy.
   - *Risk:* Webhook payloads containing API endpoints, auth tokens, system schemas, and user data are readable by the public.

#### Remediation SQL:
> [!CAUTION]
> Enabling RLS without associated policies blocks all public access. The user must review their app logic to ensure proper policies are created for each table (e.g. read-only for comments/views, write-only for analytics) before deploying.

```sql
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_02 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_03 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_04 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_05 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_07 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_08 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_09 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_11 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2026_12 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views_2027_01 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events_default ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_failures ENABLE ROW LEVEL SECURITY;
```

### 3. Plaintext Test Credentials in `.env.local`
Root `.env.local` contains admin email/password for Playwright tests. If this matches production credentials, it's a full compromise vector.

**Fix:** Rotate password immediately. Move test creds to CI secrets only.

---

## 🟠 High Risk (Fix This Week)

### 3. AdminLayout Only Checks Auth, Not Role
Any authenticated user (even without admin role) can access the admin layout shell.

**Fix:**
```tsx
const { isAuthenticated, role } = useAdminAuth();
if (!isAuthenticated) return <Navigate to="/admin/auth" replace />;
if (!role) return <Navigate to="/" replace />;
```

### 4. Role Cached in localStorage for 30 Minutes
Revoked users retain UI access for up to 30 min. Technically savvy users could edit localStorage.

**Fix:** Reduce TTL to 5 minutes. Use `sessionStorage` instead. Backend RLS still enforces, so this is UI-only risk.

---

## 🟡 Medium Risk (Next Sprint)

| # | Issue | Fix |
|---|-------|-----|
| 5 | Public endpoints accept arbitrary `raw_data` JSON | Add 10KB size limit |
| 6 | No password complexity beyond length ≥ 8 | Add uppercase + number + special char requirement |
| 7 | Token refresh never re-validates role | Re-fetch role on TOKEN_REFRESHED event |
| 8 | No account lockout after failed logins | Add progressive delay or lockout after 5 failures |
| 9 | `dangerouslySetInnerHTML` in JSON-LD scripts | Escape `</script>` sequences |

---

## ✅ What's Already Excellent

- **Rate limiting** — Deno KV-backed, survives cold starts, per-IP per-endpoint
- **Server-side pricing** — Estimates computed server-side, defeating client manipulation
- **CORS** — Origin allowlist (not wildcard `*`)
- **RLS partially configured** — Correctly configured on central schema elements (`leads`, `blogs`, `portfolio`), but critically missing on analytics, partitions, comments, and webhook tables
- **Idempotency** — Duplicate submission prevention via KV with 24h TTL
- **Webhook signatures** — HMAC-SHA256 signed outbound
- **Parameterized queries** — All via Supabase client
- **JWT validation** — Edge Functions use `getUser(token)` (server-verified)
- **Search path pinning** — All Postgres functions pin `search_path = 'public'`
- **DOMPurify** — Blog content sanitized before render
- **Dependabot** — Daily vulnerability scanning

---

## Priority Remediation Roadmap

1. **TODAY - CRITICAL:** Apply RLS Remediation SQL and craft granular access policies for comments, analytics, and partitioned views.
2. **Today:** Add security headers to hosting config
3. **Today:** Rotate exposed admin password
4. **This week:** Add role check to AdminLayout
5. **This week:** Reduce role cache TTL to 5 min
6. **Next sprint:** Implement CSP with proper directives
7. **Next sprint:** Add password complexity requirements
8. **Backlog:** Implement raw_data size limits in Edge Functions

# 06 Security Audit: CrossAngle Interior (OWASP Top 10)

**Auditor:** Antigravity Elite Protocol  
**Tier Assignment:** Professional Production-Level

---

## 1. OWASP Top 10 Assessment

### A01:2021 — Broken Access Control

| Vector | Status | Evidence |
| :--- | :--- | :--- |
| RLS (Row-Level Security) | ✅ | Dedicated migrations: `rls_leads.sql`, `rls_estimate_leads.sql`, `rls_public_tables.sql`, `rls_cms_rbac_tighten.sql`, `enable_rls_unprotected_tables.sql`, `security_advisor_remediation.sql` |
| RBAC enforcement | ✅ | `rbac.ts` with 3-tier role model (`super_admin`, `admin`, `viewer`), `RoleGuard` component, `AuthGuard` component |
| Admin route protection | ✅ | `AdminAuth`, `AdminLayout` with role-gated access |
| Edge function auth | ✅ | `verifyAuth()` and `verifyAdmin()` in `_lib/security.ts` |
| Client-side role caching | ⚠️ | Roles cached in `localStorage` with 30-min TTL — a user's role could show stale permissions for up to 30 minutes after revocation |

**Finding:** Access control is well-implemented. The only concern is the localStorage role cache potentially allowing stale access after role revocation. Server-side RLS mitigates actual data access risk.

### A02:2021 — Cryptographic Failures

| Vector | Status |
| :--- | :--- |
| Passwords | ✅ Handled by Supabase Auth (bcrypt) — not managed in application code |
| JWT tokens | ✅ Supabase-issued, RS256-signed |
| Service role keys | ✅ Server-side only (`Deno.env.get`), never exposed to client |
| HTTPS enforcement | ⚠️ Not verified — depends on hosting provider configuration |

### A03:2021 — Injection

| Vector | Status | Evidence |
| :--- | :--- | :--- |
| SQL Injection | ✅ | All queries use Supabase SDK (parameterized queries via PostgREST) |
| XSS | ✅ | `dangerouslySetInnerHTML` used in `BlogDetailPage.tsx` **with** `DOMPurify.sanitize()` — properly mitigated |
| XSS (CSS injection) | ⚠️ | `TactileJourney.tsx` uses `dangerouslySetInnerHTML` for a `<style>` tag — low risk but should use CSS-in-JS |
| NoSQL Injection | N/A | PostgreSQL only |

### A04:2021 — Insecure Design

| Vector | Status | Detail |
| :--- | :--- | :--- |
| Business logic on client | ❌ | Lead scoring in `LeadService.ts` can be manipulated by modifying client-side code |
| Rate limiting | ✅ | Deno KV-backed persistent rate limiter on public endpoints |
| Input validation | ⚠️ | Server-side validation is minimal (email format check, name presence) — no Zod/Joi schema validation |

### A05:2021 — Security Misconfiguration

| Vector | Status | Evidence |
| :--- | :--- | :--- |
| CORS policy | ✅ | Origin allowlist-based, never wildcard on credentialed routes |
| Debug endpoints | ⚠️ | `inspect-schema` edge function exposes database structure |
| Error messages | ✅ | Generic error messages in responses; detailed errors only in server logs |
| PostHog misconfiguration | ⚠️ | 401/404 errors indicate invalid API key — analytics data is being lost |

### A06:2021 — Vulnerable & Outdated Components

| Component | Version | Status |
| :--- | :--- | :--- |
| React | 18.3 | ✅ Current |
| Supabase SDK | 2.45.4 (edge), 2.x (client) | ✅ Current |
| Vite | 5.4.21 | ✅ Current |
| DOMPurify | (used) | ✅ Active XSS protection |

### A07:2021 — Identification & Authentication Failures

| Vector | Status |
| :--- | :--- |
| Session management | ✅ Supabase Auth with `persistSession`, `autoRefreshToken` |
| Token refresh handling | ✅ Custom logic prevents role drops on `TOKEN_REFRESHED` events |
| Brute force protection | ✅ Rate limiting on public endpoints |
| Password policy | ✅ Delegated to Supabase Auth defaults |

### A08:2021 — Software & Data Integrity Failures

| Vector | Status |
| :--- | :--- |
| Webhook integrity | ❌ No HMAC signature on outbound Make.com webhooks |
| Audit logging | ✅ `audit_logs` table with triggers |
| Supply chain | ⚠️ No `npm audit` or Dependabot visible in CI configuration |

### A09:2021 — Security Logging & Monitoring Failures

| Vector | Status |
| :--- | :--- |
| Application logging (client) | ✅ Sentry (`@sentry/react@^10.43.0`) with `browserTracingIntegration` + `replayIntegration` — lazy-loaded after "Accept All" consent via `CookieConsentProvider.tsx` |
| Application logging (edge functions) | ⚠️ `console.log`/`console.error` only — Sentry Deno SDK not integrated in edge functions |
| Security event alerts | ❌ No Sentry alert rules configured; no alerting for rate-limit breaches or failed auth attempts |
| Audit trail | ✅ Database `audit_logs` table with GIN indexes for queryability |

### A10:2021 — Server-Side Request Forgery (SSRF)

| Vector | Status |
| :--- | :--- |
| Outbound requests | ✅ Only to known endpoints (Make.com webhook, Supabase) |
| User-controlled URLs | ✅ No user input used to construct server-side fetch URLs |

## 2. CSRF Protection

- ❌ **No CSRF tokens.** The application relies on Supabase JWT in `Authorization` headers (not cookies), which provides implicit CSRF protection for API calls. However, any cookie-based auth flows would be vulnerable.
- ✅ CORS origin checking adds defense-in-depth.

## 3. Cookie Consent & Privacy

- ✅ `CookieConsentBanner` and `CookieConsentProvider` implemented.
- ✅ Two-tier consent model: "STRICT ONLY" and "ACCEPT ALL".
- ⚠️ PostHog analytics loads regardless of consent state (needs verification).

## 4. Security Score Summary

| Category | Score | Rating |
| :--- | :--- | :--- |
| Access Control | 8/10 | Strong |
| Authentication | 9/10 | Excellent |
| Injection Prevention | 9/10 | Excellent |
| Configuration | 6/10 | Needs attention |
| Monitoring | 4/10 | Weak |
| **Overall** | **7.2/10** | **Good** |

## 5. Recommendations

1. **Gate `inspect-schema`** behind `verifyAdmin()` or remove from production deployment.
2. **Add HMAC webhook signatures** for Make.com outbound calls.
3. **Implement structured logging** (e.g., Pino/Winston equivalent for Deno) with severity levels.
4. **Add Dependabot / `npm audit`** to CI pipeline for supply chain monitoring.
5. **Validate consent before loading PostHog** — ensure analytics scripts respect the "STRICT ONLY" preference.

---
*Finding 06: Security Audit Report (OWASP Top 10) Finalized.*

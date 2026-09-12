/**
 * auth-lifecycle-smoke.spec.ts — live GoTrue round-trip for Security Patches 1 & 2.
 *
 * These are the three flows the auth review left open (F-03, F-05, F-06). They run
 * against the REAL Supabase project (there is no staging project — ADR 0003), so
 * every prerequisite is explicit and the test skips, not fails, when one is missing.
 *
 *   npx playwright test e2e/auth-lifecycle-smoke.spec.ts --project=chromium
 *
 * Required for every flow (in .env.local, never in chat or source):
 *   PLAYWRIGHT_ADMIN_EMAIL, PLAYWRIGHT_ADMIN_PASSWORD
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY   (read from apps/web/.env.local)
 *
 * Session refresh (F-05) additionally needs a Vercel deployment URL, because the
 * 401→refresh→retry lives in middleware.ts (Edge) and not in the Vite dev proxy:
 *   PLAYWRIGHT_BASE_URL=https://<preview>.vercel.app
 * If the deployment has Vercel Deployment Protection on (preview SSO), set the
 * project's "Protection Bypass for Automation" secret and the harness sends it:
 *   VERCEL_AUTOMATION_BYPASS_SECRET=<from Vercel → Settings → Deployment Protection>
 *
 * Recovery (F-03) additionally needs a throwaway account and the emailed link:
 *   SMOKE_RECOVERY_EMAIL         — a test user, never a real admin
 *   SMOKE_RECOVERY_LINK          — paste the link from the reset email (run once
 *                                  without it to trigger the email, then again with it)
 *   SMOKE_RECOVERY_NEW_PASSWORD  — the password the test sets (≥ 8 chars)
 *
 * Logout (F-06) revokes EVERY session for PLAYWRIGHT_ADMIN_EMAIL (scope=global),
 * including any browser you are currently logged into.
 */
import { test, expect, request as pwRequest, type APIRequestContext } from '@playwright/test';
import { config as dotenv } from 'dotenv';
import path from 'node:path';

dotenv({ path: path.resolve('.env.local') });
dotenv({ path: path.resolve('apps/web/.env.local') });

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8080';
const EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;
const IS_LOCAL = /localhost|127\.0\.0\.1/.test(BASE);
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/** Request context that can pass Vercel Deployment Protection when a bypass secret is set. */
function newCtx() {
  return pwRequest.newContext({
    extraHTTPHeaders: BYPASS ? { 'x-vercel-protection-bypass': BYPASS, 'x-vercel-set-bypass-cookie': 'true' } : {},
  });
}

test.use({ storageState: undefined });

function cookieValue(setCookies: string[], name: string): string | null {
  for (const c of setCookies) {
    const m = c.match(new RegExp(`^${name}=([^;]*)`));
    if (m && m[1]) return m[1];
  }
  return null;
}

async function login() {
  const loginCtx = await newCtx();
  const res = await loginCtx.post(`${BASE}/api/auth/login`, { data: { email: EMAIL, password: PASSWORD } });
  expect(res.status(), 'login should succeed').toBe(200);
  const setCookies = res.headersArray().filter((h) => h.name.toLowerCase() === 'set-cookie').map((h) => h.value);
  const access = cookieValue(setCookies, 'access_token');
  const refresh = cookieValue(setCookies, 'refresh_token');
  expect(access, 'access_token cookie issued').toBeTruthy();
  expect(refresh, 'refresh_token cookie issued').toBeTruthy();
  const body = await res.json();
  expect(body.session, 'F-02: login body must not carry a session').toBeUndefined();
  expect(body.access_token).toBeUndefined();
  await loginCtx.dispose();
  return { access: access as string, refresh: refresh as string };
}

/** Call GoTrue directly with a bearer token, bypassing the proxy, to observe revocation. */
async function gotrueUser(ctx: APIRequestContext, token: string) {
  return ctx.get(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON as string, Authorization: `Bearer ${token}` } });
}

test.describe('Auth lifecycle smoke (live GoTrue)', () => {
  test.beforeAll(() => {
    test.skip(!EMAIL || !PASSWORD, 'PLAYWRIGHT_ADMIN_EMAIL / PLAYWRIGHT_ADMIN_PASSWORD not set');
    test.skip(!SUPABASE_URL || !ANON, 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set');
  });

  test('F-05 session: invalid access cookie + valid refresh cookie → proxy refreshes and retries once', async () => {
    const ctx = await newCtx();
    const { refresh } = await login();

    // Simulate expiry without waiting: a syntactically valid but unsigned JWT.
    const bogus = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjB9.invalid';
    const res = await ctx.get(`${BASE}/api/supabase/rest/v1/user_roles?select=role&limit=1`, {
      headers: { cookie: `access_token=${bogus}; refresh_token=${refresh}`, apikey: ANON as string },
    });
    expect(res.status(), 'retried request succeeds after refresh').toBe(200);
    const cookies = (await ctx.storageState()).cookies;
    console.log('[F-05] ctx.cookies:', cookies);
    const newAccess = cookies.find(c => c.name === 'access_token')?.value;
    expect(newAccess, 'a fresh access_token cookie is issued on the retried response').toBeTruthy();
    expect(newAccess).not.toBe(bogus);

    // Failed refresh must fail closed and clear cookies.
    const badCtx = await newCtx();
    const bad = await badCtx.get(`${BASE}/api/supabase/rest/v1/user_roles?select=role&limit=1`, {
      headers: { cookie: `access_token=${bogus}; refresh_token=not-a-real-token`, apikey: ANON as string },
    });
    console.log('[F-05] bad.status():', bad.status());
    console.log('[F-05] bad.headers():', bad.headers());
    console.log('[F-05] bad.body():', await bad.text());
    expect(bad.status()).toBe(401);
    await ctx.post(`${BASE}/api/auth/logout`, { headers: { cookie: `access_token=${newAccess}` } });
    await ctx.dispose();
  });

  test('F-06 logout: global revocation rejects the old access and refresh tokens', async () => {
    const ctx = await newCtx();
    const { access, refresh } = await login();
    expect((await gotrueUser(ctx, access)).status(), 'token valid before logout').toBe(200);

    const out = await ctx.post(`${BASE}/api/auth/logout`, { headers: { cookie: `access_token=${access}; refresh_token=${refresh}` } });
    expect(out.status()).toBe(204);
    const cleared = out.headersArray().filter((h) => h.name.toLowerCase() === 'set-cookie').map((h) => h.value);
    expect(cleared.some((c) => /^access_token=;.*Max-Age=0/i.test(c)), 'access cookie cleared').toBe(true);

    expect([401, 403]).toContain((await gotrueUser(ctx, access)).status());
    const reuse = await ctx.post(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      headers: { apikey: ANON as string, 'Content-Type': 'application/json' },
      data: { refresh_token: refresh },
    });
    expect([400, 401]).toContain(reuse.status());
    await ctx.dispose();
  });

  test('F-03 recovery: real link → password update → global sign-out → tokens not reusable', async () => {
    const rEmail = process.env.SMOKE_RECOVERY_EMAIL;
    const rLink = process.env.SMOKE_RECOVERY_LINK;
    const rPass = process.env.SMOKE_RECOVERY_NEW_PASSWORD;
    test.skip(!rEmail, 'SMOKE_RECOVERY_EMAIL not set (use a throwaway account, never a real admin)');
    test.skip(rEmail === EMAIL, 'Refusing to reset the primary admin account');
    const ctx = await newCtx();

    if (!rLink) {
      const res = await ctx.post(`${SUPABASE_URL}/auth/v1/recover`, {
        headers: { apikey: ANON as string, 'Content-Type': 'application/json' },
        data: { email: rEmail, options: { redirect_to: `${BASE}/admin/auth` } },
      });
      expect(res.status()).toBe(200);
      test.skip(true, 'Reset email requested. Re-run with SMOKE_RECOVERY_LINK=<link from the email> and SMOKE_RECOVERY_NEW_PASSWORD');
      return;
    }
    test.skip(!rPass || rPass.length < 8, 'SMOKE_RECOVERY_NEW_PASSWORD must be ≥ 8 chars');

    const frag = new URL(rLink).hash.replace(/^#/, '');
    const params = new URLSearchParams(frag);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    expect(params.get('type'), 'implicit-flow recovery link').toBe('recovery');
    expect(accessToken && refreshToken, 'link carries both tokens').toBeTruthy();

    const ok = await ctx.post(`${BASE}/api/auth/recover`, {
      data: { access_token: accessToken, refresh_token: refreshToken, type: 'recovery', password: rPass },
    });
    expect(ok.status(), 'password updated').toBe(200);

    const replay = await ctx.post(`${BASE}/api/auth/recover`, {
      data: { access_token: accessToken, refresh_token: refreshToken, type: 'recovery', password: `${rPass}x` },
    });
    expect(replay.status(), 'recovery tokens are single-use').toBe(400);
    expect([401, 403]).toContain((await gotrueUser(ctx, accessToken as string)).status());

    const relogin = await ctx.post(`${BASE}/api/auth/login`, { data: { email: rEmail, password: rPass } });
    expect(relogin.status(), 'new password logs in').toBe(200);
    await ctx.dispose();
  });
});

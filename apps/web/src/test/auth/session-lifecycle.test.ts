import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import refreshHandler from '../../../api/auth/refresh';
import logoutHandler from '../../../api/auth/logout';
import loginHandler from '../../../api/auth/login';

// Mock Supabase client
const mockRefreshSession = vi.fn();
const mockSignInWithPassword = vi.fn();

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        refreshSession: (...args: unknown[]) => mockRefreshSession(...args),
        signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null,
            }),
          })),
        })),
      })),
    })),
  };
});

function createMockReqRes(options: {
  method?: string;
  cookies?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}) {
  let statusCode = 200;
  let jsonPayload: Record<string, unknown> | null = null;
  let isEnded = false;
  const setHeaders: Record<string, unknown> = {};

  const headers = {
    ...(options.cookies ? { cookie: options.cookies } : {}),
    ...(options.headers || {}),
  };

  const req = {
    method: options.method || 'POST',
    body: options.body || {},
    headers,
  } as unknown as VercelRequest;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: Record<string, unknown>) {
      jsonPayload = payload;
      return this;
    },
    setHeader(name: string, value: unknown) {
      setHeaders[name] = value;
      return this;
    },
    end() {
      isEnded = true;
      return this;
    },
  } as unknown as VercelResponse;

  return {
    req,
    res,
    getStatus: () => statusCode,
    getJson: () => jsonPayload,
    getHeaders: () => setHeaders,
    isEnded: () => isEnded,
  };
}

describe('F-05: Auto-refresh & Session Lifecycle Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Token Lifetime & Cookie Configuration Alignment', () => {
    it('login handler aligns access_token maxAge with JWT expires_in and scopes refresh_token to /api', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'admin-user-1', email: 'admin@crossangle.in' },
          session: {
            access_token: 'valid-access-jwt-token',
            refresh_token: 'valid-refresh-token-xyz',
            expires_in: 3600, // 1 hour JWT lifetime
          },
        },
        error: null,
      });

      const { req, res, getStatus, getHeaders } = createMockReqRes({
        method: 'POST',
        body: { email: 'admin@crossangle.in', password: 'SecretPassword123!' },
      });

      await loginHandler(req, res);

      expect(getStatus()).toBe(200);
      const cookies = getHeaders()['Set-Cookie'] as string[];
      expect(cookies).toBeDefined();

      // Access token cookie has Max-Age=3600 aligned with expires_in
      expect(cookies[0]).toContain('access_token=valid-access-jwt-token');
      expect(cookies[0]).toContain('Max-Age=3600');
      expect(cookies[0]).toContain('Path=/');
      expect(cookies[0]).toContain('HttpOnly');

      // Refresh token cookie scoped to /api
      expect(cookies[1]).toContain('refresh_token=valid-refresh-token-xyz');
      expect(cookies[1]).toContain('Path=/api');
      expect(cookies[1]).toContain('HttpOnly');
    });
  });

  describe('2. /api/auth/refresh Handler Contract', () => {
    it('successfully refreshes session using refresh_token cookie, re-issuing HttpOnly cookies with aligned maxAge', async () => {
      mockRefreshSession.mockResolvedValue({
        data: {
          user: { id: 'admin-user-1', email: 'admin@crossangle.in' },
          session: {
            access_token: 'new-refreshed-access-token-999',
            refresh_token: 'new-rotated-refresh-token-888',
            expires_in: 3600,
          },
        },
        error: null,
      });

      const { req, res, getStatus, getJson, getHeaders } = createMockReqRes({
        method: 'POST',
        cookies: 'refresh_token=valid-incoming-refresh-token',
      });

      await refreshHandler(req, res);

      expect(getStatus()).toBe(200);
      expect(mockRefreshSession).toHaveBeenCalledWith({
        refresh_token: 'valid-incoming-refresh-token',
      });

      // Assert no tokens in JSON body
      const json = getJson() as Record<string, unknown>;
      expect(json.user).toBeDefined();
      expect(json.access_token).toBeUndefined();
      expect(json.refresh_token).toBeUndefined();
      expect(json.session).toBeUndefined();

      // Assert re-issued cookies
      const cookies = getHeaders()['Set-Cookie'] as string[];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('access_token=new-refreshed-access-token-999');
      expect(cookies[0]).toContain('Max-Age=3600');
      expect(cookies[0]).toContain('HttpOnly');
      expect(cookies[1]).toContain('refresh_token=new-rotated-refresh-token-888');
      expect(cookies[1]).toContain('Path=/api');
      expect(cookies[1]).toContain('HttpOnly');
    });

    it('returns 401 when no refresh token is found in request cookies', async () => {
      const { req, res, getStatus, getJson } = createMockReqRes({
        method: 'POST',
        cookies: 'other_cookie=value',
      });

      await refreshHandler(req, res);

      expect(getStatus()).toBe(401);
      expect(getJson()?.error).toBe('No refresh token found');
      expect(mockRefreshSession).not.toHaveBeenCalled();
    });

    it('clears both cookies and returns 401 with no retry when refresh token is invalid or expired', async () => {
      mockRefreshSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Invalid Refresh Token: Already used or expired'),
      });

      const { req, res, getStatus, getJson, getHeaders } = createMockReqRes({
        method: 'POST',
        cookies: 'refresh_token=expired-or-revoked-refresh-token',
      });

      await refreshHandler(req, res);

      expect(getStatus()).toBe(401);
      expect(getJson()?.error).toBe('Session expired or invalid');

      // Assert cookies are cleared with Max-Age=0
      const cookies = getHeaders()['Set-Cookie'] as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('access_token=') && c.includes('Max-Age=0'))).toBe(true);
      expect(cookies.some((c) => c.includes('refresh_token=') && c.includes('Max-Age=0'))).toBe(true);
    });
  });

  describe('3. /api/supabase Proxy & Client 401 Auto-Refresh Contract', () => {
    it('verifies middleware.ts implements 401 -> refresh -> retry once in /api/supabase proxy', () => {
      const middlewareFile = path.resolve(__dirname, '../../../middleware.ts');
      const content = fs.readFileSync(middlewareFile, 'utf-8');

      // 1. Checks that /api/supabase proxy handles 401
      expect(content).toMatch(/if\s*\(\s*response\.status\s*===\s*401\s*\)/);

      // 2. Extracts refresh_token from incoming cookies
      expect(content).toMatch(/cookieHeader\.match\(\/refresh_token=\(\[\^;\]\+\)\/\)/);

      // 3. Calls GoTrue token refresh endpoint
      expect(content).toMatch(/\/auth\/v1\/token\?grant_type=refresh_token/);

      // 4. Updates Authorization header and retries targetUrl once
      expect(content).toMatch(/proxyHeaders\.set\("Authorization",\s*`Bearer \$\{newAccessToken\}`\)/);

      // 5. Retries once only without a loop
      const occurrences = (content.match(/await fetch\(targetUrl/g) || []).length;
      expect(occurrences).toBe(2); // Initial fetch + exactly 1 retry inside if (response.status === 401)

      // 6. Clears cookies when refresh fails (Max-Age=0)
      expect(content).toMatch(/access_token=;\s*Path=\/;\s*Max-Age=0/);
    });

    it('verifies client.ts authedFetch wrapper intercepts 401 and retries once only', () => {
      const clientFile = path.resolve(__dirname, '../../integrations/supabase/client.ts');
      const content = fs.readFileSync(clientFile, 'utf-8');

      // 1. Checks 401 status on /api/supabase requests
      expect(content).toMatch(/res\.status\s*===\s*401/);
      expect(content).toMatch(/\/api\/supabase/);

      // 2. Calls /api/auth/refresh
      expect(content).toMatch(/fetch\("\/api\/auth\/refresh",\s*\{\s*method:\s*"POST"\s*\}\)/);

      // 3. Retries once only using _isRetry flag (prevents loop)
      expect(content).toMatch(/_isRetry:\s*true/);
      expect(content).toMatch(/!\s*\(init[^)]*\)\?._isRetry/);
    });
  });
});

describe('F-06: Direct GoTrue Global Logout & Cookie Clearance', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_SUPABASE_URL = 'https://mock-project.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'mock-anon-key-123';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('revokes server-side session globally via GoTrue using authenticated access token', async () => {
    let capturedUrl = '';
    let capturedOptions: RequestInit | undefined;

    global.fetch = vi.fn().mockImplementation((url: string, options: RequestInit) => {
      capturedUrl = url;
      capturedOptions = options;
      return Promise.resolve(new Response(null, { status: 204 }));
    });

    const { req, res, getStatus, getHeaders, isEnded } = createMockReqRes({
      method: 'POST',
      cookies: 'access_token=valid-user-access-token-123',
    });

    await logoutHandler(req, res);

    expect(getStatus()).toBe(204);
    expect(isEnded()).toBe(true);

    // Assert direct GoTrue logout call with scope=global
    expect(capturedUrl).toBe('https://mock-project.supabase.co/auth/v1/logout?scope=global');
    expect(capturedOptions?.method).toBe('POST');
    expect((capturedOptions?.headers as Record<string, string>)?.Authorization).toBe(
      'Bearer valid-user-access-token-123'
    );
    expect((capturedOptions?.headers as Record<string, string>)?.apikey).toBe('mock-anon-key-123');

    // Assert both cookies cleared across all paths
    const cookies = getHeaders()['Set-Cookie'] as string[];
    expect(cookies).toBeDefined();
    expect(cookies.length).toBe(3);
    expect(cookies.some((c) => c.includes('access_token=') && c.includes('Max-Age=0'))).toBe(true);
    expect(cookies.some((c) => c.includes('refresh_token=') && c.includes('Path=/api') && c.includes('Max-Age=0'))).toBe(true);
  });

  it('remains idempotent when access token is missing or expired, still clearing cookies', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline or token expired'));

    const { req, res, getStatus, getHeaders } = createMockReqRes({
      method: 'POST',
      cookies: 'access_token=expired-jwt-token-456',
    });

    await logoutHandler(req, res);

    expect(getStatus()).toBe(204);

    // Cookies are STILL cleared even when GoTrue call throws
    const cookies = getHeaders()['Set-Cookie'] as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('access_token=') && c.includes('Max-Age=0'))).toBe(true);
    expect(cookies.some((c) => c.includes('refresh_token=') && c.includes('Max-Age=0'))).toBe(true);
  });

  it('returns 405 on non-POST requests', async () => {
    const { req, res, getStatus, getJson } = createMockReqRes({
      method: 'GET',
    });

    await logoutHandler(req, res);

    expect(getStatus()).toBe(405);
    expect(getJson()?.error).toBe('Method not allowed');
  });

  it('verifies that no tokens are stored in localStorage or sessionStorage in AuthProvider', () => {
    const authProviderFile = path.resolve(__dirname, '../../components/auth/AuthProvider.tsx');
    const content = fs.readFileSync(authProviderFile, 'utf-8');

    // AuthProvider must never write session or tokens to browser storage
    expect(content).not.toMatch(/localStorage\.setItem\([^)]*access_token/i);
    expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*access_token/i);
    expect(content).not.toMatch(/localStorage\.setItem\([^)]*refresh_token/i);
    expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*refresh_token/i);
    expect(content).not.toMatch(/localStorage\.setItem\([^)]*session/i);
  });
});

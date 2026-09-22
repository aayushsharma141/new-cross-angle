import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isSameOriginRequest } from '../../../api/_lib/security';
import loginHandler from '../../../api/auth/login';
import logoutHandler from '../../../api/auth/logout';
import refreshHandler from '../../../api/auth/refresh';
import recoverHandler from '../../../api/auth/recover';

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'admin@crossangle.in' }, session: { access_token: 'a', refresh_token: 'r', expires_in: 3600 } },
          error: null,
        }),
        refreshSession: vi.fn().mockResolvedValue({
          data: { user: { id: 'u1' }, session: { access_token: 'a', refresh_token: 'r', expires_in: 3600 } },
          error: null,
        }),
      },
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }) })) })) })),
      rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
    })),
  };
});

function mockRes() {
  let statusCode = 200;
  let json: Record<string, unknown> | null = null;
  const res = {
    status(code: number) { statusCode = code; return this; },
    json(payload: Record<string, unknown>) { json = payload; return this; },
    setHeader() { return this; },
    end() { return this; },
  } as unknown as VercelResponse;
  return { res, getStatus: () => statusCode, getJson: () => json };
}

describe('F-08: verified-origin CSRF defense', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('isSameOriginRequest', () => {
    it('accepts a matching Origin against Host (production)', () => {
      const req = { headers: { origin: 'https://crossangleinterior.com', host: 'crossangleinterior.com', 'x-forwarded-proto': 'https' } } as unknown as VercelRequest;
      expect(isSameOriginRequest(req)).toBe(true);
    });

    it('accepts a matching Origin against a Vercel preview Host, no allow-list needed', () => {
      const req = { headers: { origin: 'https://main-hb0kh7gni.vercel.app', host: 'main-hb0kh7gni.vercel.app', 'x-forwarded-proto': 'https' } } as unknown as VercelRequest;
      expect(isSameOriginRequest(req)).toBe(true);
    });

    it('accepts localhost dev with no x-forwarded-proto (defaults to http)', () => {
      const req = { headers: { origin: 'http://localhost:8080', host: 'localhost:8080' } } as unknown as VercelRequest;
      expect(isSameOriginRequest(req)).toBe(true);
    });

    it('rejects a foreign Origin', () => {
      const req = { headers: { origin: 'https://evil.example', host: 'crossangleinterior.com', 'x-forwarded-proto': 'https' } } as unknown as VercelRequest;
      expect(isSameOriginRequest(req)).toBe(false);
    });

    it('rejects when Origin is absent and Referer is foreign', () => {
      const req = { headers: { referer: 'https://evil.example/attack.html', host: 'crossangleinterior.com', 'x-forwarded-proto': 'https' } } as unknown as VercelRequest;
      expect(isSameOriginRequest(req)).toBe(false);
    });

    it('falls back to a matching Referer when Origin is absent', () => {
      const req = { headers: { referer: 'https://crossangleinterior.com/admin/auth', host: 'crossangleinterior.com', 'x-forwarded-proto': 'https' } } as unknown as VercelRequest;
      expect(isSameOriginRequest(req)).toBe(true);
    });

    it('rejects when both Origin and Referer are absent', () => {
      const req = { headers: { host: 'crossangleinterior.com', 'x-forwarded-proto': 'https' } } as unknown as VercelRequest;
      expect(isSameOriginRequest(req)).toBe(false);
    });

    it('rejects when Host itself is absent', () => {
      const req = { headers: { origin: 'https://crossangleinterior.com' } } as unknown as VercelRequest;
      expect(isSameOriginRequest(req)).toBe(false);
    });
  });

  describe('handler integration — forged Origin is rejected with 403 before any auth state changes', () => {
    const forged = { origin: 'https://evil.example', host: 'crossangleinterior.com', 'x-forwarded-proto': 'https' };

    it('login', async () => {
      const { res, getStatus, getJson } = mockRes();
      const req = { method: 'POST', headers: forged, body: { email: 'a@b.com', password: 'x' } } as unknown as VercelRequest;
      await loginHandler(req, res);
      expect(getStatus()).toBe(403);
      expect(getJson()?.error).toBe('Invalid request origin');
    });

    it('logout', async () => {
      const { res, getStatus, getJson } = mockRes();
      const req = { method: 'POST', headers: { ...forged, cookie: 'access_token=t' } } as unknown as VercelRequest;
      await logoutHandler(req, res);
      expect(getStatus()).toBe(403);
      expect(getJson()?.error).toBe('Invalid request origin');
    });

    it('refresh', async () => {
      const { res, getStatus, getJson } = mockRes();
      const req = { method: 'POST', headers: { ...forged, cookie: 'refresh_token=t' } } as unknown as VercelRequest;
      await refreshHandler(req, res);
      expect(getStatus()).toBe(403);
      expect(getJson()?.error).toBe('Invalid request origin');
    });

    it('recover', async () => {
      const { res, getStatus, getJson } = mockRes();
      const req = { method: 'POST', headers: forged, body: { code: 'c', password: 'longenoughpassword' } } as unknown as VercelRequest;
      await recoverHandler(req, res);
      expect(getStatus()).toBe(403);
      expect(getJson()?.error).toBe('Invalid request origin');
    });
  });
});

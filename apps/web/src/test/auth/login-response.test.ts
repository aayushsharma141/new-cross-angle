import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import loginHandler from '../../../api/auth/login';

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'admin-uuid-456', email: 'admin@crossangle.in' },
            session: {
              access_token: 'secret-jwt-access-token-xyz',
              refresh_token: 'secret-jwt-refresh-token-abc',
            },
          },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { role: 'super_admin' },
              error: null,
            }),
          })),
        })),
      })),
    })),
  };
});

describe('F-02: Login Response Token Exclusion Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successful login response returns user and role but NEITHER access_token, refresh_token, nor session', async () => {
    let capturedStatusCode = 0;
    let capturedJsonPayload: Record<string, unknown> | null = null;
    const capturedHeaders: Record<string, unknown> = {};

    const req = {
      method: 'POST',
      body: {
        email: 'admin@crossangle.in',
        password: 'ValidPassword123!',
      },
    } as unknown as VercelRequest;

    const res = {
      status(code: number) {
        capturedStatusCode = code;
        return this;
      },
      json(payload: Record<string, unknown>) {
        capturedJsonPayload = payload;
        return this;
      },
      setHeader(name: string, value: unknown) {
        capturedHeaders[name] = value;
        return this;
      },
    } as unknown as VercelResponse;

    await loginHandler(req, res);

    // 1. Response status is 200
    expect(capturedStatusCode).toBe(200);

    // 2. Contains required user data
    expect(capturedJsonPayload).toBeDefined();
    interface LoginPayload {
      user?: { email?: string };
      role?: string;
      message?: string;
      session?: unknown;
      access_token?: unknown;
      refresh_token?: unknown;
    }
    const payload = capturedJsonPayload as LoginPayload;
    expect(payload.user).toBeDefined();
    expect(payload.user?.email).toBe('admin@crossangle.in');
    expect(payload.role).toBe('super_admin');
    expect(payload.message).toBe('Logged in successfully');

    // 3. MUST NOT contain session or token-shaped data in JSON
    expect(payload.session).toBeUndefined();
    expect(payload.access_token).toBeUndefined();
    expect(payload.refresh_token).toBeUndefined();

    const rawJson = JSON.stringify(capturedJsonPayload);
    expect(rawJson).not.toContain('secret-jwt-access-token-xyz');
    expect(rawJson).not.toContain('secret-jwt-refresh-token-abc');
    expect(rawJson).not.toContain('access_token');
    expect(rawJson).not.toContain('refresh_token');

    // 4. HTTP-only cookies MUST be preserved
    expect(capturedHeaders['Set-Cookie']).toBeDefined();
    const cookies = capturedHeaders['Set-Cookie'] as string[];
    expect(cookies.length).toBe(2);
    expect(cookies[0]).toContain('access_token=secret-jwt-access-token-xyz');
    expect(cookies[0]).toContain('HttpOnly');
    expect(cookies[1]).toContain('refresh_token=secret-jwt-refresh-token-abc');
    expect(cookies[1]).toContain('HttpOnly');
  });
});

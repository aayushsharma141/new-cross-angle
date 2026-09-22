import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import loginHandler from '../../../api/auth/login';

const mockRpc = vi.fn();
const mockSignInWithPassword = vi.fn();

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: { signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args) },
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }) })) })) })),
      rpc: (...args: unknown[]) => mockRpc(...args),
    })),
  };
});

function req(overrides: Partial<VercelRequest> = {}) {
  return {
    method: 'POST',
    headers: { origin: 'http://localhost:8080', host: 'localhost:8080', 'x-forwarded-for': '203.0.113.7' },
    body: { email: 'admin@crossangle.in', password: 'wrong-password' },
    ...overrides,
  } as unknown as VercelRequest;
}

function mockRes() {
  let statusCode = 200;
  let json: Record<string, unknown> | null = null;
  const headers: Record<string, unknown> = {};
  const res = {
    status(code: number) { statusCode = code; return this; },
    json(payload: Record<string, unknown>) { json = payload; return this; },
    setHeader(name: string, value: unknown) { headers[name] = value; return this; },
  } as unknown as VercelResponse;
  return { res, getStatus: () => statusCode, getJson: () => json, getHeaders: () => headers };
}

describe('F-07: rate limiting on /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ data: null, error: { message: 'Invalid login credentials' } });
  });

  it('allows the attempt through to Supabase when the RPC says allowed', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    const { res, getStatus } = mockRes();

    await loginHandler(req(), res);

    expect(mockRpc).toHaveBeenCalledWith('check_and_record_auth_attempt', expect.objectContaining({ p_identifier: 'email:admin@crossangle.in' }));
    expect(mockRpc).toHaveBeenCalledWith('check_and_record_auth_attempt', expect.objectContaining({ p_identifier: 'ip:203.0.113.7' }));
    expect(mockSignInWithPassword).toHaveBeenCalled();
    expect(getStatus()).toBe(401); // bad credentials — but the RPC gate let it through
  });

  it('returns 429 with Retry-After and never calls Supabase when the RPC says blocked', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    const { res, getStatus, getJson, getHeaders } = mockRes();

    await loginHandler(req(), res);

    expect(getStatus()).toBe(429);
    expect(getJson()?.error).toBe('Too many attempts. Please try again later.');
    expect(getHeaders()['Retry-After']).toBe('900');
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('blocks when only the IP identifier trips, even if the email identifier is fine', async () => {
    mockRpc.mockImplementation((_fn: string, args: { p_identifier: string }) =>
      Promise.resolve({ data: !args.p_identifier.startsWith('ip:'), error: null })
    );
    const { res, getStatus } = mockRes();

    await loginHandler(req(), res);

    expect(getStatus()).toBe(429);
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('normalizes email case so "Admin@X" and "admin@x" share one counter', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    const { res } = mockRes();

    await loginHandler(req({ body: { email: 'Admin@Crossangle.in', password: 'x' } } as Partial<VercelRequest>), res);

    expect(mockRpc).toHaveBeenCalledWith('check_and_record_auth_attempt', expect.objectContaining({ p_identifier: 'email:admin@crossangle.in' }));
  });

  it('fails OPEN (does not block login) when the RPC call errors — e.g. migration not applied yet', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'function does not exist' } });
    const { res, getStatus } = mockRes();

    await loginHandler(req(), res);

    expect(mockSignInWithPassword).toHaveBeenCalled();
    expect(getStatus()).toBe(401); // reached Supabase; not a 429 or 500 from the rate limiter
  });

  it('fails OPEN when the RPC call throws', async () => {
    mockRpc.mockRejectedValue(new Error('network error'));
    const { res, getStatus } = mockRes();

    await loginHandler(req(), res);

    expect(mockSignInWithPassword).toHaveBeenCalled();
    expect(getStatus()).toBe(401);
  });
});

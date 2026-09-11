import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import recoverHandler from '../../../api/auth/recover';

// Mock Supabase client creation
const mockExchangeCodeForSession = vi.fn();
const mockVerifyOtp = vi.fn();
const mockSetSession = vi.fn();
const mockUpdateUser = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
        verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
        setSession: (...args: unknown[]) => mockSetSession(...args),
        updateUser: (...args: unknown[]) => mockUpdateUser(...args),
        signOut: (...args: unknown[]) => mockSignOut(...args),
      },
    })),
  };
});

function createMockReqRes(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  let statusCode = 0;
  let jsonPayload: Record<string, unknown> | null = null;
  const setHeaders: Record<string, unknown> = {};

  const req = {
    method: 'POST',
    body,
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
  } as unknown as VercelResponse;

  return { req, res, getStatus: () => statusCode, getJson: () => jsonPayload, getHeaders: () => setHeaders };
}

describe('F-03: Secure Password Recovery Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valid recovery code exchanges session, updates password, and globally revokes recovery session', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: 'ephemeral-recovery-token', user: { id: 'user-a-id' } } },
      error: null,
    });
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: 'user-a-id' } },
      error: null,
    });
    mockSignOut.mockResolvedValue({ error: null });

    const { req, res, getStatus, getJson } = createMockReqRes({
      code: 'valid-pkce-recovery-code-123',
      password: 'NewSecurePassword123!',
    });

    await recoverHandler(req, res);

    expect(getStatus()).toBe(200);
    expect(getJson()).toEqual({ message: 'Password updated successfully' });

    // Verify PKCE code exchange was invoked with the code
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-pkce-recovery-code-123');

    // Verify password update was invoked
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewSecurePassword123!' });

    // Verify global sign out of the recovery session
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'global' });
  });

  it('expired or invalid recovery code returns 400 without leaking account details', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: new Error('Token has expired or is invalid'),
    });

    const { req, res, getStatus, getJson } = createMockReqRes({
      code: 'expired-recovery-code-999',
      password: 'NewSecurePassword123!',
    });

    await recoverHandler(req, res);

    expect(getStatus()).toBe(400);
    expect(getJson()?.error).toBe('Invalid or expired recovery code');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('prevents code reuse by rejecting already-consumed codes', async () => {
    // First invocation: code valid
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: { session: { access_token: 'recovery-token-once' } },
      error: null,
    });
    mockUpdateUser.mockResolvedValueOnce({ data: {}, error: null });

    const call1 = createMockReqRes({
      code: 'single-use-code-xyz',
      password: 'FirstNewPassword123!',
    });
    await recoverHandler(call1.req, call1.res);
    expect(call1.getStatus()).toBe(200);

    // Second invocation with the same code: GoTrue returns error (code already exchanged)
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('Code has already been used'),
    });

    const call2 = createMockReqRes({
      code: 'single-use-code-xyz',
      password: 'SecondNewPassword123!',
    });
    await recoverHandler(call2.req, call2.res);
    expect(call2.getStatus()).toBe(400);
    expect(call2.getJson()?.error).toBe('Invalid or expired recovery code');
  });

  it('session isolation: active admin cookie is NOT consumed as recovery session when recovering for another user', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: 'user-a-recovery-token', user: { id: 'user-a-id' } } },
      error: null,
    });
    mockUpdateUser.mockResolvedValue({ data: {}, error: null });

    // Simulate User B currently logged in with HTTP-only cookies in headers
    const headers = {
      cookie: 'access_token=user-b-admin-jwt-token; refresh_token=user-b-refresh-token',
    };

    const { req, res, getStatus } = createMockReqRes(
      {
        code: 'user-a-recovery-code',
        password: 'UserANewPassword123!',
      },
      headers,
    );

    await recoverHandler(req, res);

    expect(getStatus()).toBe(200);

    // Assert that recovery exclusively used user-a's code, not user-b's cookie
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('user-a-recovery-code');
    // Ensure updateUser was executed on the client authenticated by code exchange
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'UserANewPassword123!' });
  });

  it('rejects short passwords (< 8 characters) with controlled 400', async () => {
    const { req, res, getStatus, getJson } = createMockReqRes({
      code: 'some-code',
      password: 'short',
    });

    await recoverHandler(req, res);

    expect(getStatus()).toBe(400);
    expect(getJson()?.error).toBe('Password must be at least 8 characters long');
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('verifies that no recovery tokens or codes are stored in localStorage or sessionStorage in AdminAuth', () => {
    const adminAuthFile = path.resolve(__dirname, '../../pages/admin/AdminAuth.tsx');
    const content = fs.readFileSync(adminAuthFile, 'utf-8');

    // Ensure recovery tokens/codes are not saved to localStorage or sessionStorage
    expect(content).not.toMatch(/localStorage\.setItem\([^)]*recover/i);
    expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*recover/i);
    expect(content).not.toMatch(/localStorage\.setItem\([^)]*code/i);
    expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*code/i);
    expect(content).not.toMatch(/localStorage\.setItem\([^)]*token_hash/i);
    expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*token_hash/i);
  });
});

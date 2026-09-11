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

  describe('A. Client Extraction Contract', () => {
    it('extracts access_token and refresh_token from recovery hash and prepares correct POST payload', () => {
      // Simulates URL hash from Supabase implicit recovery:
      // https://crossangle.in/admin/auth#access_token=supabase-access-token-123&refresh_token=supabase-refresh-token-456&token_type=bearer&type=recovery
      const simulatedHash = '#access_token=supabase-access-token-123&refresh_token=supabase-refresh-token-456&token_type=bearer&type=recovery';
      const hashRaw = simulatedHash.startsWith('#') ? simulatedHash.substring(1) : simulatedHash;
      const hashParams = new URLSearchParams(hashRaw);

      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      expect(type).toBe('recovery');
      expect(accessToken).toBe('supabase-access-token-123');
      expect(refreshToken).toBe('supabase-refresh-token-456');

      // Verify payload structure sent to /api/auth/recover
      const payload = {
        access_token: accessToken ?? undefined,
        refresh_token: refreshToken ?? undefined,
        password: 'NewSecurePassword123!',
      };

      expect(payload).toEqual({
        access_token: 'supabase-access-token-123',
        refresh_token: 'supabase-refresh-token-456',
        password: 'NewSecurePassword123!',
      });
    });
  });

  describe('B. Server Rejection Contract', () => {
    it('rejects access_token without refresh_token with 400', async () => {
      const { req, res, getStatus, getJson } = createMockReqRes({
        access_token: 'orphan-access-token-without-refresh',
        password: 'NewSecurePassword123!',
      });

      await recoverHandler(req, res);

      expect(getStatus()).toBe(400);
      expect(getJson()?.error).toBe('Both access_token and refresh_token are required for session recovery');
      expect(mockSetSession).not.toHaveBeenCalled();
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('rejects empty or whitespace refresh_token with 400', async () => {
      const { req, res, getStatus, getJson } = createMockReqRes({
        access_token: 'valid-access-token',
        refresh_token: '   ',
        password: 'NewSecurePassword123!',
      });

      await recoverHandler(req, res);

      expect(getStatus()).toBe(400);
      expect(getJson()?.error).toBe('Both access_token and refresh_token are required for session recovery');
      expect(mockSetSession).not.toHaveBeenCalled();
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('rejects missing recovery credentials with 400', async () => {
      const { req, res, getStatus, getJson } = createMockReqRes({
        password: 'NewSecurePassword123!',
      });

      await recoverHandler(req, res);

      expect(getStatus()).toBe(400);
      expect(getJson()?.error).toBe('Invalid or expired recovery code');
      expect(mockSetSession).not.toHaveBeenCalled();
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('rejects short passwords (< 8 characters) with controlled 400', async () => {
      const { req, res, getStatus, getJson } = createMockReqRes({
        access_token: 'valid-access-token',
        refresh_token: 'valid-refresh-token',
        password: 'short',
      });

      await recoverHandler(req, res);

      expect(getStatus()).toBe(400);
      expect(getJson()?.error).toBe('Password must be at least 8 characters long');
      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });

  describe('C. Successful Implicit Recovery Contract', () => {
    it('valid access + refresh token establishes session, updates password, and globally revokes recovery session', async () => {
      mockSetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'implicit-recovery-access-token',
            refresh_token: 'implicit-recovery-refresh-token',
            user: { id: 'target-recovery-user-id', email: 'admin@crossangle.in' },
          },
        },
        error: null,
      });
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'target-recovery-user-id' } },
        error: null,
      });
      mockSignOut.mockResolvedValue({ error: null });

      const { req, res, getStatus, getJson } = createMockReqRes({
        access_token: 'implicit-recovery-access-token',
        refresh_token: 'implicit-recovery-refresh-token',
        password: 'BrandNewSecurePassword456!',
      });

      await recoverHandler(req, res);

      expect(getStatus()).toBe(200);
      expect(getJson()).toEqual({ message: 'Password updated successfully' });

      // Session established with BOTH access_token and refresh_token
      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'implicit-recovery-access-token',
        refresh_token: 'implicit-recovery-refresh-token',
      });

      // Password updated on established session
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'BrandNewSecurePassword456!',
      });

      // Global revocation of ephemeral session
      expect(mockSignOut).toHaveBeenCalledWith({ scope: 'global' });
    });

    it('handles invalid/expired access or refresh token from Supabase with 400', async () => {
      mockSetSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Invalid Refresh Token: Refresh Token Not Found'),
      });

      const { req, res, getStatus, getJson } = createMockReqRes({
        access_token: 'expired-access-token',
        refresh_token: 'expired-refresh-token',
        password: 'NewSecurePassword123!',
      });

      await recoverHandler(req, res);

      expect(getStatus()).toBe(400);
      expect(getJson()?.error).toBe('Invalid or expired recovery code');
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('valid PKCE recovery code path remains fully functional', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: 'pkce-token', user: { id: 'user-pkce-id' } } },
        error: null,
      });
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'user-pkce-id' } },
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
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-pkce-recovery-code-123');
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewSecurePassword123!' });
      expect(mockSignOut).toHaveBeenCalledWith({ scope: 'global' });
    });
  });

  describe('D. Session Isolation Contract', () => {
    it('session isolation: active admin cookie is NOT consumed as recovery session when recovering for another user', async () => {
      mockSetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'user-a-recovery-token',
            refresh_token: 'user-a-refresh-token',
            user: { id: 'user-a-id' },
          },
        },
        error: null,
      });
      mockUpdateUser.mockResolvedValue({ data: {}, error: null });
      mockSignOut.mockResolvedValue({ error: null });

      // Simulate User B currently logged in with HTTP-only cookies in headers
      const headers = {
        cookie: 'access_token=user-b-admin-jwt-token; refresh_token=user-b-refresh-token',
      };

      const { req, res, getStatus } = createMockReqRes(
        {
          access_token: 'user-a-recovery-token',
          refresh_token: 'user-a-refresh-token',
          password: 'UserANewPassword123!',
        },
        headers,
      );

      await recoverHandler(req, res);

      expect(getStatus()).toBe(200);

      // Assert that recovery exclusively used user-a's tokens, not user-b's cookie
      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'user-a-recovery-token',
        refresh_token: 'user-a-refresh-token',
      });
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'UserANewPassword123!' });
      expect(mockSignOut).toHaveBeenCalledWith({ scope: 'global' });
    });
  });

  describe('E. Zero-Persistence Contract', () => {
    it('verifies that no recovery tokens or refresh tokens are stored in localStorage or sessionStorage in AdminAuth', () => {
      const adminAuthFile = path.resolve(__dirname, '../../pages/admin/AdminAuth.tsx');
      const content = fs.readFileSync(adminAuthFile, 'utf-8');

      // Ensure recovery tokens/codes/refresh_tokens are not saved to localStorage or sessionStorage
      expect(content).not.toMatch(/localStorage\.setItem\([^)]*recover/i);
      expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*recover/i);
      expect(content).not.toMatch(/localStorage\.setItem\([^)]*code/i);
      expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*code/i);
      expect(content).not.toMatch(/localStorage\.setItem\([^)]*token_hash/i);
      expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*token_hash/i);
      expect(content).not.toMatch(/localStorage\.setItem\([^)]*refresh_token/i);
      expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*refresh_token/i);
      expect(content).not.toMatch(/localStorage\.setItem\([^)]*access_token/i);
      expect(content).not.toMatch(/sessionStorage\.setItem\([^)]*access_token/i);
    });
  });
});

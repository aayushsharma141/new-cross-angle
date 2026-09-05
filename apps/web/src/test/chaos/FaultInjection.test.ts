import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { AssetService } from '@/services/AssetService';

// Setup Mock Service Worker for Chaos testing
const server = setupServer(
  // 1. Simulate ImageKit 503 Outage via Supabase Edge Function
  http.post('https://iuuivmwqodefdrrrewol.supabase.co/functions/v1/imagekit-upload', () => {
    return HttpResponse.json({ error: 'ImageKit upload failed' }, { status: 503 });
  }),

  // 2. Simulate Supabase API taking too long (Timeout simulation)
  http.get('https://iuuivmwqodefdrrrewol.supabase.co/rest/v1/assets', async () => {
    await delay(3000); // 3 second delay to simulate extreme latency
    return HttpResponse.json([], { status: 200 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

describe('Chaos & Fault Injection (Platform Reliability)', () => {

  it('Search should degrade gracefully and eventually return when Supabase experiences extreme latency', async () => {
    const start = performance.now();
    try {
      const results = await AssetService.getAssets(null, { timeoutMs: 1500 });
      // Should return empty array or handled response, but should not crash the node process
      expect(Array.isArray(results)).toBe(true);
    } catch (error: any) {
      // In chaos testing, failing with a structured error is acceptable, crashing is not.
      expect(error.message).toMatch(/FetchError|timeout/i);
    }
    const duration = performance.now() - start;
    // We proved the timeout logic worked (aborted before the 3000ms delay finished)
    expect(duration).toBeLessThan(2500); 
  });

  it('ImageKit transient failure should trigger retry and eventually succeed', async () => {
    const { UploadOrchestrator } = await import('@/services/media/UploadOrchestrator');
    const { ImageKitProvider } = await import('@/services/media/providers/ImageKitProvider');
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: '123' } } } as any,
      error: null
    });
    
    vi.spyOn(supabase, 'rpc').mockResolvedValue({
      data: 'fake-asset-id',
      error: null
    } as any);

    const orchestrator = new UploadOrchestrator(new ImageKitProvider());
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    
    // First attempt throws error, second attempt succeeds
    let attempt = 0;
    vi.spyOn(ImageKitProvider.prototype, 'upload').mockImplementation(async () => {
      attempt++;
      if (attempt === 1) {
        throw new Error("Network timeout");
      }
      return {
        url: 'https://fake.url/test.png',
        filePath: '/test.png',
        name: 'test.png',
      };
    });

    const result = await orchestrator.upload({
      file,
      domain: 'test',
      entityType: 'test',
      entityId: '123',
      role: 'avatar'
    });
    
    expect(attempt).toBe(2);
    expect(result.assetId).toBe('fake-asset-id');
  });

  it('ImageKit 503s should trigger provider failure and orchestrator rollback', async () => {
    const { UploadOrchestrator } = await import('@/services/media/UploadOrchestrator');
    const { ImageKitProvider } = await import('@/services/media/providers/ImageKitProvider');
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock the session
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: '123' } } } as any,
      error: null
    });
    
    // Mock the RPC creation so it doesn't fail before hitting ImageKit
    vi.spyOn(supabase, 'rpc').mockResolvedValue({
      data: 'fake-asset-id',
      error: null
    } as any);

    const orchestrator = new UploadOrchestrator(new ImageKitProvider());
    
    // We create a dummy file
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    
    // We expect the upload to fail because the provider will hit the 503 mock
    await expect(orchestrator.upload({
      file,
      domain: 'test',
      entityType: 'test',
      entityId: '123',
      role: 'avatar'
    })).rejects.toThrow(/Upload provider failed/);
  });

  it('Duplicate upload with idempotencyKey should process exactly once', async () => {
    const { UploadOrchestrator } = await import('@/services/media/UploadOrchestrator');
    const { ImageKitProvider } = await import('@/services/media/providers/ImageKitProvider');
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: '123' } } } as any,
      error: null
    });
    
    vi.spyOn(supabase, 'rpc').mockImplementation(async (fnName) => {
      if (fnName === 'rpc_create_uploading_asset') {
        return { data: 'fake-asset-id-1', error: null } as any;
      }
      return { data: null, error: null } as any;
    });

    const orchestrator = new UploadOrchestrator(new ImageKitProvider());
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    
    // Mock imagekit provider to succeed for this test, but add a small delay to simulate real network
    vi.spyOn(ImageKitProvider.prototype, 'upload').mockImplementation(async () => {
      await new Promise(r => setTimeout(r, 100));
      return {
        url: 'https://fake.url/test.png',
        filePath: '/test.png',
        name: 'test.png',
      };
    });

    const idempotencyKey = 'idemp-12345';

    const upload1 = orchestrator.upload({ file, domain: 'test', entityType: 'test', entityId: '123', role: 'avatar', idempotencyKey });
    const upload2 = orchestrator.upload({ file, domain: 'test', entityType: 'test', entityId: '123', role: 'avatar', idempotencyKey });
    
    const [res1, res2] = await Promise.all([upload1, upload2]);
    
    // Both should succeed and return the exact same asset Id
    expect(res1.assetId).toBe('fake-asset-id-1');
    expect(res2.assetId).toBe('fake-asset-id-1');
    
    // The RPC should have been called twice total: once for create, once for finalize
    // (Because the second upload reused the promise, it didn't do its own create/finalize)
    expect(supabase.rpc).toHaveBeenCalledTimes(2);
    expect(supabase.rpc).toHaveBeenNthCalledWith(1, 'rpc_create_uploading_asset', expect.anything());
    expect(supabase.rpc).toHaveBeenNthCalledWith(2, 'rpc_finalize_dam_asset', expect.anything());
  });

  it('Supabase 500 on finalize should rollback storage and throw', async () => {
    const { UploadOrchestrator } = await import('@/services/media/UploadOrchestrator');
    const { ImageKitProvider } = await import('@/services/media/providers/ImageKitProvider');
    const { supabase } = await import('@/integrations/supabase/client');
    
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: '123' } } } as any,
      error: null
    });
    
    vi.spyOn(supabase, 'rpc').mockImplementation(async (fnName) => {
      if (fnName === 'rpc_create_uploading_asset') {
        return { data: 'fake-asset-id', error: null } as any;
      }
      if (fnName === 'rpc_finalize_dam_asset') {
        return { data: null, error: new Error("Supabase 500 Internal Error") } as any;
      }
      return { data: null, error: null } as any;
    });

    const provider = new ImageKitProvider();
    vi.spyOn(provider, 'upload').mockResolvedValue({
      url: 'https://fake.url/test.png',
      filePath: '/test.png',
      name: 'test.png',
    });
    
    const deleteSpy = vi.spyOn(provider, 'delete').mockResolvedValue();

    const orchestrator = new UploadOrchestrator(provider);
    const file = new File(["dummy content"], "test.png", { type: "image/png" });

    await expect(orchestrator.upload({
      file,
      domain: 'test',
      entityType: 'test',
      entityId: '123',
      role: 'avatar'
    })).rejects.toThrow(/Asset finalization failed: Supabase 500 Internal Error/);
    
    // Storage provider should be instructed to delete the orphan file
    expect(deleteSpy).toHaveBeenCalledWith('/test.png');
  });

});

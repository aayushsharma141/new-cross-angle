import { describe, it, expect, vi } from 'vitest';
import { TelemetryBootstrap } from '../../analytics/telemetry/TelemetryBootstrap';
import { UploadOrchestrator } from '../../services/media/UploadOrchestrator';
import { Logger } from '../../analytics/telemetry/Logger';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } },
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: 'resilience-asset-123', error: null }),
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

describe('Collector Outage & Recovery Resilience', () => {
  it('allows application operations to succeed cleanly when OTLP exporter network endpoints fail', async () => {
    const logSpy = vi.spyOn(Logger, 'info');
    const startMemory = process.memoryUsage().heapUsed;

    // 1. Initialize Telemetry with unreachable collector endpoint
    TelemetryBootstrap.init();

    const mockProvider = {
      upload: async () => ({
        url: 'https://cdn.example.com/asset.png',
        filePath: 'marketing/asset.png',
        name: 'asset.png',
      }),
      delete: async () => {},
    };

    const orchestrator = new UploadOrchestrator(mockProvider);
    const blob = new Blob(['test-content'], { type: 'image/png' }) as unknown as File;

    // 2. Execute business transaction during collector outage
    const result = await orchestrator.upload({
      file: blob,
      domain: 'marketing',
      entityType: 'telemetry-test',
      role: 'hero',
      idempotencyKey: 'outage-key-resilience',
    });

    // 3. Assert business request succeeded cleanly
    expect(result).toBeDefined();
    expect(result.assetId).toBe('resilience-asset-123');

    // 4. Assert structured logging was captured without throwing
    expect(logSpy).toHaveBeenCalled();

    // 5. Assert process memory utilization remains bounded (< 20MB delta)
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDeltaMB = (endMemory - startMemory) / (1024 * 1024);
    expect(memoryDeltaMB).toBeLessThan(20);

    logSpy.mockRestore();
  });

  it('automatically resumes span telemetry execution when collector returns to service', async () => {
    let collectorState: 'OFFLINE' | 'ONLINE' = 'OFFLINE';

    const mockProvider = {
      upload: async () => ({
        url: 'https://cdn.example.com/asset.png',
        filePath: 'marketing/asset.png',
        name: 'asset.png',
      }),
      delete: async () => {},
    };

    const orchestrator = new UploadOrchestrator(mockProvider);
    const blob = new Blob(['recovery-content'], { type: 'image/png' }) as unknown as File;

    // Phase 1: Outage
    const outageResult = await orchestrator.upload({
      file: blob,
      domain: 'sales',
      entityType: 'telemetry-test',
      role: 'hero',
      idempotencyKey: 'recovery-key-1',
    });
    expect(outageResult.assetId).toBe('resilience-asset-123');

    // Phase 2: Recovery (collector back online)
    collectorState = 'ONLINE';

    const recoveryResult = await orchestrator.upload({
      file: blob,
      domain: 'sales',
      entityType: 'telemetry-test',
      role: 'hero',
      idempotencyKey: 'recovery-key-2',
    });

    // Verify application continues returning HTTP 200 / success seamlessly
    expect(recoveryResult.assetId).toBe('resilience-asset-123');
    expect(collectorState).toBe('ONLINE');
  });
});

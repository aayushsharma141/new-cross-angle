import { UploadOrchestrator } from "../../services/media/UploadOrchestrator";
import { PipelineCoordinator, type DomainPolicy } from "../../services/media/PipelineCoordinator";
import type { StorageProvider } from "../../services/media/StorageGateway";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";

interface TierAHarnessConfig {
  iterations: number;
  concurrency: number;
}

function getGitMetadata() {
  try {
    const gitSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    const gitBranch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    return { gitSha, gitBranch };
  } catch {
    return { gitSha: "unknown-commit", gitBranch: "unknown" };
  }
}

export async function runTierAHarness(config: TierAHarnessConfig = { iterations: 500, concurrency: 25 }) {
  console.log(`[Tier A Dev Harness] Starting benchmark: ${config.iterations} uploads @ concurrency ${config.concurrency}...`);
  
  const startHeap = process.memoryUsage().heapUsed;

  const dummyProvider: StorageProvider = {
    upload: async (params: { fileName: string; fileData: string; folder: string }) => {
      return {
        url: `https://dummy.storage/${params.fileName}`,
        filePath: `/${params.folder}/${params.fileName}`,
        name: params.fileName,
      };
    },
    delete: async (_filePath: string) => {},
  };

  const orchestrator = new UploadOrchestrator(dummyProvider);
  const coordinator = new PipelineCoordinator();
  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;

  const executeBatch = async (batchSize: number) => {
    const promises = Array.from({ length: batchSize }).map(async (_, idx) => {
      try {
        const domainStr = ["Marketing", "Legal", "Media"][idx % 3] as DomainPolicy;
        const idempotencyKey = `tier-a-key-${Date.now()}-${idx}-${Math.random()}`;
        const mockFile = new Blob(["tier-a-benchmark-data"], { type: "image/png" }) as unknown as File;

        const uploadResult = await orchestrator.upload({
          file: mockFile,
          title: `benchmark-${idx}.png`,
          domain: domainStr,
          entityType: "asset",
          role: "primary",
          idempotencyKey,
        });

        const assetId = uploadResult.assetId || `asset-${idx}`;
        coordinator.startPipeline(assetId, domainStr);
        await coordinator.handleEvent(assetId, "StorageVerified");
        await coordinator.handleEvent(assetId, "VirusPassed");
        await coordinator.handleEvent(assetId, "ThumbnailReady");

        const state = coordinator.getState(assetId);
        if (state?.status === "ready" || state?.status === "processing") {
          successCount++;
        } else {
          failureCount++;
        }
      } catch {
        failureCount++;
      }
    });

    await Promise.all(promises);
  };

  const batchSize = config.concurrency;
  const numBatches = Math.ceil(config.iterations / batchSize);

  for (let b = 0; b < numBatches; b++) {
    await executeBatch(Math.min(batchSize, config.iterations - b * batchSize));
  }

  const durationMs = Date.now() - startTime;
  const numOps = successCount + failureCount;
  const opsPerSec = (numOps / (durationMs / 1000)).toFixed(2);
  const avgMsPerOp = (durationMs / numOps).toFixed(2);

  const endHeap = process.memoryUsage().heapUsed;
  const heapDeltaMB = ((endHeap - startHeap) / (1024 * 1024)).toFixed(2);

  console.log(`[Tier A Dev Harness] Completed in ${durationMs}ms`);
  console.log(`[Tier A Dev Harness] Total: ${numOps} | Success: ${successCount} | Failures: ${failureCount}`);
  console.log(`[Tier A Dev Harness] Latency: ~${avgMsPerOp}ms/op | Throughput: ${opsPerSec} ops/sec`);
  console.log(`[Tier A Dev Harness] Memory: Heap delta ${heapDeltaMB} MB`);

  // Tier A Developer Performance Assertions
  if (parseFloat(avgMsPerOp) > 10) {
    console.warn(`⚠️ PERFORMANCE WARNING: Avg latency per op (${avgMsPerOp}ms) exceeded 10ms threshold.`);
  }

  if (parseFloat(heapDeltaMB) > 50) {
    throw new Error(`💥 MEMORY LEAK DETECTED: Heap growth (${heapDeltaMB} MB) exceeded 50MB limit.`);
  }

  const { gitSha, gitBranch } = getGitMetadata();

  // Write Evidence Artifact conforming to Evidence Schema v1.0
  const evidenceArtifact = {
    schemaVersion: "1.0",
    evidenceId: `EV-TIERA-${Date.now()}`,
    generator: "antigravity-tier-a-harness@1.0",
    timestamp: new Date().toISOString(),
    status: failureCount === 0 ? "PASSED" : "FAILED",
    provenance: {
      gitSha,
      gitBranch,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,
      hostname: os.hostname(),
    },
    results: {
      benchmark: {
        iterations: config.iterations,
        concurrency: config.concurrency,
        durationMs,
        opsPerSec: parseFloat(opsPerSec),
        avgMsPerOp: parseFloat(avgMsPerOp),
        heapDeltaMB: parseFloat(heapDeltaMB),
        successCount,
        failureCount,
      },
    },
  };

  try {
    const evidenceDir = path.resolve(process.cwd(), "../../docs/evidence");
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    const evidencePath = path.join(evidenceDir, "tier-a-latest.json");
    fs.writeFileSync(evidencePath, JSON.stringify(evidenceArtifact, null, 2));
    console.log(`📄 Evidence artifact (Schema v1.0) written to ${evidencePath}`);
  } catch (err) {
    console.warn("⚠️ Could not write evidence artifact:", err);
  }

  return { durationMs, successCount, failureCount, opsPerSec, heapDeltaMB, evidenceArtifact };
}

// Allow direct CLI execution via vite-node
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes("tier-a-harness")) {
  runTierAHarness({ iterations: 500, concurrency: 25 }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

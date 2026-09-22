import { createServer } from "http";
import { UploadOrchestrator } from "../../services/media/UploadOrchestrator";
import { PipelineCoordinator } from "../../services/media/PipelineCoordinator";

import { TelemetryBootstrap } from "../../analytics/telemetry/TelemetryBootstrap";

// Initialize OTEL before doing anything else
TelemetryBootstrap.init();



const dummyProvider = {
  upload: async (params: { fileName: string; folder: string }) => {
    // Simulate network delay for upload
    await new Promise(r => setTimeout(r, 150));
    return {
      url: "https://dummy.imagekit.io/file.jpg",
      filePath: `${params.folder}/${Date.now()}-${params.fileName}`,
      name: params.fileName
    };
  },
  async delete(_filePath: string) {
    /* no-op: the load harness never writes real storage */
  }
};

const orchestrator = new UploadOrchestrator(dummyProvider);
const pipelines = new Map<string, PipelineCoordinator>();

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    const domain = req.headers["x-tenant"] as string || "default-tenant";
    
    try {
      const result = await orchestrator.upload({
        file: new File([Buffer.from("dummy")], "test.jpg", { type: "image/jpeg" }),
        domain,
        entityType: "load-test",
        role: "hero",
        idempotencyKey: req.headers["x-idempotency-key"] as string
      });

      // Start a pipeline for this upload
      const coordinator = new PipelineCoordinator();
      coordinator.startPipeline(result.assetId, "Marketing");
      pipelines.set(result.assetId, coordinator);

      // Simulate webhook callbacks asynchronously
      setTimeout(() => {
        void coordinator.handleEvent(result.assetId, "StorageVerified");
        void coordinator.handleEvent(result.assetId, "VirusPassed");
        void coordinator.handleEvent(result.assetId, "ThumbnailReady");
      }, 50);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err: unknown) {
      res.writeHead(500);
      res.end(err instanceof Error ? err.message : "Unknown error");
    }
  } else if (req.method === "GET" && req.url?.startsWith("/pipeline/")) {
    const assetId = req.url.split("/").pop()!;
    const pipeline = pipelines.get(assetId);
    
    if (!pipeline) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    const state = pipeline.getState(assetId);
    res.end(JSON.stringify(state ? { ...state, completedEvents: [...state.completedEvents] } : null));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Load test server listening on port ${PORT}`);
});

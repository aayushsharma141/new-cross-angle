import { createServer } from "http";
import { UploadOrchestrator } from "../../services/media/UploadOrchestrator";
import { PipelineCoordinator } from "../../services/media/PipelineCoordinator";
import { trace } from "@opentelemetry/api";
import { TelemetryBootstrap } from "../../analytics/telemetry/TelemetryBootstrap";

// Initialize OTEL before doing anything else
TelemetryBootstrap.init();

const tracer = trace.getTracer("load-test-server");

const dummyProvider = {
  upload: async (file: Buffer, options: any) => {
    // Simulate network delay for upload
    await new Promise(r => setTimeout(r, 150));
    return {
      assetId: `asset-${Date.now()}-${Math.random()}`,
      url: "https://dummy.imagekit.io/file.jpg",
      provider: "imagekit" as const
    };
  }
};

const orchestrator = new UploadOrchestrator(dummyProvider);
const pipelines = new Map<string, PipelineCoordinator>();

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    const domain = req.headers["x-tenant"] as string || "default-tenant";
    
    try {
      const result = await orchestrator.upload({
        file: Buffer.from("dummy"),
        filename: "test.jpg",
        contentType: "image/jpeg",
        domain,
        idempotencyKey: req.headers["x-idempotency-key"] as string
      });

      // Start a pipeline for this upload
      const coordinator = new PipelineCoordinator(result.assetId, domain);
      pipelines.set(result.assetId, coordinator);

      // Simulate webhook callbacks asynchronously
      setTimeout(() => {
        coordinator.processEvent("StorageVerified");
        coordinator.processEvent("VirusPassed");
        coordinator.processEvent("ThumbnailReady");
      }, 50);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err: any) {
      res.writeHead(500);
      res.end(err.message);
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
    res.end(JSON.stringify(pipeline.getState()));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Load test server listening on port ${PORT}`);
});

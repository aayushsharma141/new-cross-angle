import { trace } from "@opentelemetry/api";
import { Logger } from "../../analytics/telemetry/Logger";
import { TelemetryMetrics } from "../../analytics/telemetry/Metrics";

const tracer = trace.getTracer("PipelineCoordinator");

/**
 * PipelineCoordinator.ts
 *
 * Simulates a data-driven DAG coordinator that governs state transitions for
 * uploaded assets based on domain policy.
 */

export type AssetStatus = "uploading" | "processing" | "ready" | "ready_degraded" | "failed" | "archived";
export type EventType = "StorageVerified" | "VirusPassed" | "ThumbnailReady" | "MetadataExtracted" | "SearchIndexed";
export type DomainPolicy = "Marketing" | "Legal" | "Media";

export interface PipelineState {
  assetId: string;
  domain: DomainPolicy;
  status: AssetStatus;
  completedEvents: Set<EventType>;
  isProcessing: boolean;
  startTimeMs: number;
}

export class PipelineCoordinator {
  // DAG definition per domain: which events are REQUIRED before transitioning to READY
  private readonly policies: Record<DomainPolicy, EventType[]> = {
    Marketing: ["StorageVerified", "VirusPassed", "ThumbnailReady"],
    Legal: ["StorageVerified", "VirusPassed", "ThumbnailReady", "MetadataExtracted"],
    Media: ["StorageVerified", "VirusPassed", "ThumbnailReady", "MetadataExtracted", "SearchIndexed"],
  };

  // In a real app, this would be a database or Redis cache
  private stateStore = new Map<string, PipelineState>();

  /**
   * Initializes a new pipeline state for an asset.
   */
  startPipeline(assetId: string, domain: DomainPolicy) {
    this.stateStore.set(assetId, {
      assetId,
      domain,
      status: "processing",
      completedEvents: new Set<EventType>(),
      isProcessing: false, // Prevents concurrent transitions
      startTimeMs: performance.now(),
    });
  }

  /**
   * Returns the current state of an asset's pipeline.
   */
  getState(assetId: string): PipelineState | undefined {
    return this.stateStore.get(assetId);
  }

  /**
   * Handles an incoming event (e.g. from a worker or webhook).
   * Supports out-of-order events and deduplication.
   */
  async handleEvent(assetId: string, event: EventType, simulateLatencyMs = 0): Promise<void> {
    const state = this.stateStore.get(assetId);
    if (!state) throw new Error("Asset not found in pipeline");

    // Idempotency: Ignore duplicate events
    if (state.completedEvents.has(event)) {
      Logger.info(`[Coordinator] Deduplicated event: ${event} for ${assetId}`);
      return;
    }

    // Add event to completed list
    state.completedEvents.add(event);
    
    if (simulateLatencyMs > 0) {
        await new Promise(r => setTimeout(r, simulateLatencyMs));
    }

    this.evaluateState(assetId);
  }
  
  /**
   * Allows failure injection to simulate worker failures (e.g. Search Index failed).
   * Transitions state to ready_degraded if core requirements are met but non-critical ones fail.
   */
  reportWorkerFailure(assetId: string, failedEvent: EventType) {
      const state = this.stateStore.get(assetId);
      if (!state) return;
      
      const required = this.policies[state.domain];
      
      // If the failed event is MetadataExtracted or SearchIndexed, but the core ones are done, we degrade.
      // Assuming Storage, Virus, Thumbnail are CORE for everyone.
      const core: EventType[] = ["StorageVerified", "VirusPassed", "ThumbnailReady"];
      const hasCore = core.every(e => state.completedEvents.has(e));
      
      const metricLabels = { tenant: state.domain, failed_event: failedEvent };
      if (hasCore && required.includes(failedEvent)) {
          if (state.status !== "ready_degraded") {
              state.status = "ready_degraded";
              TelemetryMetrics.pipelineReadyDegradedTotal.add(1, metricLabels);
          }
      } else {
          if (state.status !== "failed") {
              state.status = "failed";
              TelemetryMetrics.pipelineFailedTotal.add(1, metricLabels);
          }
      }
  }

  /**
   * Evaluates the pipeline DAG to determine if we can transition to READY.
   */
  private evaluateState(assetId: string) {
    const state = this.stateStore.get(assetId);
    if (!state) return;

    if (state.status === "ready") return; // Already reached terminal state

    const requiredEvents = this.policies[state.domain];
    const hasAllRequired = requiredEvents.every((e) => state.completedEvents.has(e));

    if (hasAllRequired) {
      state.status = "ready";
      const metricLabels = { tenant: state.domain };
      TelemetryMetrics.pipelineReadyTotal.add(1, metricLabels);
      
      const durationSeconds = (performance.now() - state.startTimeMs) / 1000;
      TelemetryMetrics.pipelineDurationSeconds.record(durationSeconds, metricLabels);

      // Create a span to represent the pipeline completion
      tracer.startActiveSpan("dam.pipeline", (span) => {
        span.setAttribute("tenant", state.domain);
        span.setAttribute("pipeline.duration_sec", durationSeconds);
        span.setAttribute("pipeline.status", "ready");
        span.end();
      });
    }
  }
}

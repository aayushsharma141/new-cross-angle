import { metrics, Meter } from '@opentelemetry/api';

export class TelemetryMetrics {
  private static meter: Meter = metrics.getMeter('dam-metrics', '1.0.0');

  // Upload Metrics
  static readonly uploadRequestsTotal = this.meter.createCounter('dam_upload_requests_total', {
    description: 'Total number of upload requests',
  });
  
  static readonly uploadDurationSeconds = this.meter.createHistogram('dam_upload_duration_seconds', {
    description: 'Duration of upload operations in seconds',
  });

  static readonly uploadFailuresTotal = this.meter.createCounter('dam_upload_failures_total', {
    description: 'Total number of failed upload requests',
  });

  // Search Metrics
  static readonly searchRequestsTotal = this.meter.createCounter('dam_search_requests_total', {
    description: 'Total number of search requests',
  });

  static readonly searchLatencySeconds = this.meter.createHistogram('dam_search_latency_seconds', {
    description: 'Latency of search operations in seconds',
  });

  static readonly searchErrorsTotal = this.meter.createCounter('dam_search_errors_total', {
    description: 'Total number of failed search requests',
  });

  // Pipeline Metrics
  static readonly pipelineDurationSeconds = this.meter.createHistogram('dam_pipeline_duration_seconds', {
    description: 'Duration for an asset pipeline to reach ready state in seconds',
  });

  static readonly pipelineReadyTotal = this.meter.createCounter('dam_pipeline_ready_total', {
    description: 'Total number of pipelines reaching READY state',
  });

  static readonly pipelineReadyDegradedTotal = this.meter.createCounter('dam_pipeline_ready_degraded_total', {
    description: 'Total number of pipelines reaching READY_DEGRADED state',
  });

  static readonly pipelineFailedTotal = this.meter.createCounter('dam_pipeline_failed_total', {
    description: 'Total number of failed pipeline executions',
  });

  // Worker Metrics
  static readonly workerDurationSeconds = this.meter.createHistogram('dam_worker_duration_seconds', {
    description: 'Duration of worker execution in seconds',
  });

  static readonly workerRetryTotal = this.meter.createCounter('dam_worker_retry_total', {
    description: 'Total number of worker retries',
  });

  static readonly workerDlqTotal = this.meter.createCounter('dam_worker_dlq_total', {
    description: 'Total number of events sent to the DLQ',
  });

  // Resilience KPIs
  static readonly rollbackTotal = this.meter.createCounter('dam_resilience_rollback_total', {
    description: 'Total number of provider rollbacks executed during upload failure',
  });

  static readonly retryTotal = this.meter.createCounter('dam_resilience_retry_total', {
    description: 'Total number of retries attempted across operations',
  });

  static readonly duplicateEventTotal = this.meter.createCounter('dam_resilience_duplicate_event_total', {
    description: 'Total number of duplicate pipeline events deduplicated',
  });

  static readonly dlqTotal = this.meter.createCounter('dam_resilience_dlq_total', {
    description: 'Total number of unhandled events routed to DLQ',
  });

  static readonly replayTotal = this.meter.createCounter('dam_resilience_replay_total', {
    description: 'Total number of event replays processed',
  });
}

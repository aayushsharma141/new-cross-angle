import { TelemetryBootstrap } from './telemetry/TelemetryBootstrap';

/**
 * Starts browser tracing only when VITE_OTLP_ENDPOINT names a collector.
 * Without it the exporter would fall back to http://localhost:4318, which in a
 * visitor's browser is their own machine, and in development fires a failed
 * request per span when no local collector is running. To trace locally, set
 * VITE_OTLP_ENDPOINT=http://localhost:4318/v1/traces in .env.local.
 */
export function initTracing() {
  if (!import.meta.env.VITE_OTLP_ENDPOINT) return;
  TelemetryBootstrap.init();
}

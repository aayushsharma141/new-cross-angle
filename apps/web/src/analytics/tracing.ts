import { TelemetryBootstrap } from './telemetry/TelemetryBootstrap';

/**
 * Starts browser tracing. In production it only runs when VITE_OTLP_ENDPOINT
 * points at a real collector; without it the exporter would default to
 * http://localhost:4318, which on a visitor's browser is their own machine and
 * produces a failed request on every page load.
 */
export function initTracing() {
  if (import.meta.env.PROD && !import.meta.env.VITE_OTLP_ENDPOINT) return;
  TelemetryBootstrap.init();
}

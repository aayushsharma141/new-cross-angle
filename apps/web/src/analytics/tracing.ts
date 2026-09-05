import { TelemetryBootstrap } from './telemetry/TelemetryBootstrap';

export function initTracing() {
  TelemetryBootstrap.init();
}

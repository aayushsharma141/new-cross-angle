import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { TelemetryConfig } from './TelemetryConfig';

export class TelemetryExporterFactory {
  static createProcessors(): SpanProcessor[] {
    const processors: SpanProcessor[] = [];
    // In Track B, we route all traces through the local OTLP Collector
    // instead of dumping to the console, enabling full local observability.
    const exporter = new OTLPTraceExporter({
      url: TelemetryConfig.otlpEndpoint,
    });
    processors.push(new BatchSpanProcessor(exporter));
    
    return processors;
  }
}

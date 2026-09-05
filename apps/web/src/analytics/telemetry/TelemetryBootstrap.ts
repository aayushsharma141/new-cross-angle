import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { TelemetryConfig } from './TelemetryConfig';
import { TelemetryExporterFactory } from './TelemetryExporterFactory';

export class TelemetryBootstrap {
  static init() {
    const spanProcessors = TelemetryExporterFactory.createProcessors();

    const provider = new WebTracerProvider({
      spanProcessors,
    });

    provider.register({
      contextManager: new ZoneContextManager(),
    });

    const instrumentations = [];
    
    if (typeof window !== 'undefined') {
      instrumentations.push(new DocumentLoadInstrumentation());
    }
    
    instrumentations.push(
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: TelemetryConfig.propagateCorsUrls,
      })
    );

    registerInstrumentations({ instrumentations });
  }
}

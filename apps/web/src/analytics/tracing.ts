import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';

export function initTracing() {
  const provider = new WebTracerProvider();

  if (import.meta.env.PROD) {
    // Production: Export to an OTLP endpoint (Jaeger/Tempo/Honeycomb)
    const exporter = new OTLPTraceExporter({
      url: import.meta.env.VITE_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    });
    // @ts-expect-error Types in WebTracerProvider don't always expose addSpanProcessor despite it inheriting from BasicTracerProvider
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  } else {
    // Development: Export spans to console
    // @ts-expect-error Types in WebTracerProvider don't always expose addSpanProcessor despite it inheriting from BasicTracerProvider
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [
          new RegExp('^http://localhost:8080/'),
          new RegExp('^https://iuuivmwqodefdrrrewol\\.supabase\\.co/')
        ],
      }),
    ],
  });
}


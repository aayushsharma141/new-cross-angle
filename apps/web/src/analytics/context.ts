/**
 * Formalized Context Definitions
 * 
 * TraceId: Managed by OpenTelemetry. Tracks the execution of a single request across system boundaries.
 * CorrelationId: Identifies a broader business operation (e.g., a "User Onboarding" saga).
 * CausationId: Identifies the specific event that caused this operation to trigger (Event Chain).
 */
export const ContextKeys = {
  TRACE_ID: 'x-trace-id',
  CORRELATION_ID: 'x-correlation-id',
  CAUSATION_ID: 'x-causation-id',
};

export interface BusinessContext {
  correlationId?: string;
  causationId?: string;
}

export function injectBusinessContext(headers: Headers, context: BusinessContext) {
  if (context.correlationId) {
    headers.set(ContextKeys.CORRELATION_ID, context.correlationId);
  }
  if (context.causationId) {
    headers.set(ContextKeys.CAUSATION_ID, context.causationId);
  }
  return headers;
}

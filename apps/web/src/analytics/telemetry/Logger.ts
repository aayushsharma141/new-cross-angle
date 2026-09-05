import { trace } from "@opentelemetry/api";

export class Logger {
  private static formatMessage(level: string, message: string, data?: unknown) {
    const activeSpan = trace.getActiveSpan();
    const spanContext = activeSpan?.spanContext();

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
      trace_id: spanContext?.traceId,
      span_id: spanContext?.spanId,
      trace_flags: spanContext?.traceFlags,
    };

    return JSON.stringify(logEntry);
  }

  static info(message: string, data?: unknown) {
    console.info(this.formatMessage("INFO", message, data));
  }

  static warn(message: string, data?: unknown) {
    console.warn(this.formatMessage("WARN", message, data));
  }

  static error(message: string, data?: unknown) {
    console.error(this.formatMessage("ERROR", message, data));
  }
}

import React, { Component, ReactNode } from "react";
import { Button } from "../ui/primitives/button";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { captureException } from "@/lib/sentry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  routeName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`RouteErrorBoundary caught an error on route [${this.props.routeName ?? "unknown"}]:`, error, errorInfo);
    
    // Explicit Sentry reporting using our decoupled Sentry utility
    try {
      captureException(error, {
        tags: {
          area: "route-error-boundary",
          route: this.props.routeName ?? "unspecified",
        },
        contexts: {
          react: {
            componentStack: errorInfo.componentStack ?? "",
          },
        },
      });
    } catch (e) {
      console.warn("Failed to log error to Sentry:", e);
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-full flex items-center justify-center p-6 sm:p-8 min-h-[400px] bg-admin-card/40 backdrop-blur-xl border border-admin-border/60 rounded-2xl relative overflow-hidden"
          >
            {/* Atmospheric subtle radial background glow */}
            <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-gradient-to-br from-[hsl(var(--admin-danger))]/5 to-transparent blur-3xl" />
            <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br from-[hsl(var(--admin-primary))]/5 to-transparent blur-3xl" />

            <div className="max-w-md w-full text-center space-y-6 z-10">
              <div className="flex justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="p-4 bg-[hsl(var(--admin-danger-muted))] rounded-full border border-[hsl(var(--admin-danger))]/20"
                >
                  <AlertTriangle className="h-10 w-10 text-[hsl(var(--admin-danger))]" />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-[hsl(var(--admin-text))] tracking-wide">
                  Module Encountered an Issue
                </h3>
                <p className="text-[hsl(var(--admin-text-muted))] text-sm max-w-sm mx-auto">
                  The {this.props.routeName ? `"${this.props.routeName}" ` : ""}component failed to load properly. Don't worry, the rest of the workspace is safe and running normally.
                </p>
              </div>

              {this.state.error && (
                <div className="p-4 bg-admin-surface/70 backdrop-blur-md rounded-xl border border-admin-border/50 text-left transition-all duration-300 hover:border-admin-border max-h-[140px] overflow-y-auto">
                  <p className="text-[11px] text-[hsl(var(--admin-text-subtle))] font-mono break-all leading-relaxed select-all">
                    <span className="text-[hsl(var(--admin-danger))] font-bold mr-1">Error:</span>
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2 group">
                      <summary className="text-[9px] uppercase tracking-wider text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] cursor-pointer outline-none select-none">
                        Show Stack Trace
                      </summary>
                      <pre className="mt-1.5 p-2 bg-black/40 rounded border border-admin-border/30 text-[9px] text-zinc-500 font-mono overflow-x-auto whitespace-pre-wrap leading-normal">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center items-center">
                <Button 
                  onClick={this.handleRetry}
                  className="gap-2 bg-[hsl(var(--admin-primary))] text-black font-semibold hover:bg-[hsl(var(--admin-primary))]/90 border-transparent transition-all shadow-[0_0_15px_hsl(var(--admin-primary)/0.2)] px-5"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Module
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleGoBack}
                  className="gap-2 bg-admin-surface border-admin-border text-admin-text hover:bg-admin-surface-hover hover:text-admin-text transition-all px-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </div>
          </motion.div>
        )
      );
    }

    // Force React to completely re-render children when retryCount increases by using a unique key
    return (
      <AnimatePresence mode="wait">
        <React.Fragment key={this.state.retryCount}>
          {this.props.children}
        </React.Fragment>
      </AnimatePresence>
    );
  }
}

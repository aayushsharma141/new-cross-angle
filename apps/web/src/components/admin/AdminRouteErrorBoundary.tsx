import React from 'react';
import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Route-level error boundary for admin pages.
 * Catches crashes in individual admin modules without killing the entire layout.
 */
export class AdminRouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AdminRouteError]", error, info.componentStack);
  }

  handleRetry = () => this.setState({ hasError: false, error: undefined });

  handleBack = () => {
    window.location.href = "/admin";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="flex justify-center">
            <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-[hsl(var(--admin-text))]">
            This module encountered an error
          </h2>
          <p className="text-sm text-[hsl(var(--admin-muted))]">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="sm" onClick={this.handleRetry} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
            <Button size="sm" variant="outline" onClick={this.handleBack} className="gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

import { Component, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-serif text-white">Something went wrong</h1>
                <p className="text-zinc-400">
                  We're sorry, but something unexpected happened. Please try reloading the page.
                </p>
              </div>

              {this.state.error && (
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-left">
                  <p className="text-xs text-zinc-500 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleReload}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="gap-2"
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

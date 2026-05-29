import React from "react";

interface State { hasError: boolean; }

export class QuizErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error: Error) {
    console.error("[QuizErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-[#faf8f5]/60 text-lg">Something went wrong with the quiz.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-6 py-3 bg-[#c9a96e] text-black text-sm font-medium rounded"
          >
            Restart Quiz
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

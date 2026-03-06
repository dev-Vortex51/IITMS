"use client";

import { Component, ReactNode } from "react";
import { ErrorGlobalState } from "@/components/design-system";

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

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorGlobalState
          title="Something went wrong"
          message={this.state.error?.message || "An unexpected error occurred"}
          onRetry={this.handleReset}
          onGoHome={() => {
            window.location.href = "/";
          }}
          retryLabel="Reload"
          homeLabel="Return to Home"
        />
      );
    }

    return this.props.children;
  }
}

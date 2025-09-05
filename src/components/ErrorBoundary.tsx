import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  // Update state when an error is thrown
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // If a custom fallback UI was provided, show it
      if (fallback) {
        return fallback;
      }

      // Otherwise, show the default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="rounded-lg bg-white p-8 text-center shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Oops! Something went wrong
            </h2>
            <p className="mb-4 text-gray-600">
              The voice assistant encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Refresh Page
            </button>
            {error && (
              <p className="mt-4 text-sm text-red-500">
                Error: {error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
export { ErrorBoundary };

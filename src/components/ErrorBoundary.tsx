
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}
interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="rounded-lg bg-white p-8 text-center shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Oops! Something went wrong</h2>
            <p className="mb-4 text-gray-600">
              The voice assistant encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <p className="mt-4 text-sm text-red-500">
                Error: {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }


    return this.props.children;
  }
}

export { ErrorBoundary };
export default ErrorBoundary;

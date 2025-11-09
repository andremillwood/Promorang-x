import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { errorReportingService } from '@/react-app/services/errorReportingService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: Record<string, unknown>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  isReporting: boolean;
  reportSubmitted: boolean;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isReporting: false,
      reportSubmitted: false,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    const { onError, context } = this.props;

    // Report error
    errorReportingService.reportError(
      error,
      { ...context, componentStack: errorInfo.componentStack },
      errorInfo.componentStack
    );

    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReportError = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    this.setState({ isReporting: true });
    try {
      await errorReportingService.reportError(
        error,
        { 
          userReported: true, 
          componentStack: errorInfo?.componentStack,
          location: window.location.href,
          timestamp: new Date().toISOString()
        },
        errorInfo?.componentStack
      );
      this.setState({ reportSubmitted: true });
    } catch (err) {
      console.error('Failed to submit error report:', err);
    } finally {
      this.setState({ isReporting: false });
    }
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails, isReporting, reportSubmitted } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            We're sorry, but an unexpected error occurred. Our team has been notified.
          </p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            
            {!reportSubmitted && (
              <button
                onClick={this.handleReportError}
                disabled={isReporting}
                className={`px-4 py-2 ${
                  isReporting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-md transition-colors`}
              >
                {isReporting ? 'Sending...' : 'Report Error'}
              </button>
            )}
            
            <button
              onClick={this.toggleDetails}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDetails && error && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md overflow-auto max-h-64">
              <h3 className="font-medium text-gray-800 mb-2">Error Details:</h3>
              <pre className="text-sm text-red-600 whitespace-pre-wrap">
                {error.toString()}
              </pre>
              {errorInfo?.componentStack && (
                <>
                  <h4 className="font-medium text-gray-800 mt-4 mb-2">Component Stack:</h4>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          )}
          
          {reportSubmitted && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
              Thank you for reporting this issue. Our team has been notified.
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default EnhancedErrorBoundary;

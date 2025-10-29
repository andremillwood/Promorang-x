import { Component, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Component error:", error);
    console.error("Error info:", errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#e53e3e', marginBottom: '20px' }}>⚠️ Something went wrong</h2>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <strong>Error:</strong> {this.state.error?.message}
            </div>

            {this.state.error?.stack && (
              <div style={{ marginBottom: '20px' }}>
                <strong>Stack Trace:</strong>
                <pre style={{
                  backgroundColor: '#f7fafc',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  textAlign: 'left'
                }}>
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <strong>Component Stack:</strong>
              <pre style={{
                backgroundColor: '#f7fafc',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px',
                textAlign: 'left'
              }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Refresh Page
              </button>
            </div>

            <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
              Check the browser console for additional details.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ASCII-Gen] Root error boundary caught error:', error);
    console.error('[ASCII-Gen] Error message:', error.message);
    console.error('[ASCII-Gen] Error stack:', error.stack);
    console.error('[ASCII-Gen] Component stack:', info.componentStack);
    this.setState({ errorInfo: info });
  }

  handleRetry = () => {
    console.log('[ASCII-Gen] Retrying after root error...');
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1117',
          color: '#e6edf3',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#8b949e', marginBottom: '1rem', maxWidth: '500px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          {this.state.errorInfo?.componentStack && (
            <details style={{ marginBottom: '1rem', maxWidth: '600px', width: '100%' }}>
              <summary style={{ color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem' }}>
                Show error details
              </summary>
              <pre style={{
                color: '#8b949e',
                fontSize: '0.7rem',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '200px',
                background: '#161b22',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '0.5rem',
              }}>
                {this.state.error?.stack}
                {'\n\nComponent Stack:'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.6rem 1.2rem',
                background: '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.6rem 1.2rem',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

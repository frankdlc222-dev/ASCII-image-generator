import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  feature: string;
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Lightweight error boundary for individual features.
 * Shows an inline error message instead of crashing the whole app.
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ASCII-Gen] Feature "${this.props.feature}" failed:`, error);
    console.error('[ASCII-Gen] Component stack:', info.componentStack);
  }

  handleRetry = () => {
    console.log(`[ASCII-Gen] Retrying feature "${this.props.feature}"...`);
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if ('fallback' in this.props && this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '1rem',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          color: '#8b949e',
          fontSize: '0.85rem',
          margin: '0.5rem 0',
        }}>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong style={{ color: '#f85149' }}>{this.props.feature}</strong> encountered an error:{' '}
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.3rem 0.8rem',
              background: '#238636',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

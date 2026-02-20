import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from './ui/Button';

const APP_BASE_URL = import.meta.env.BASE_URL || '/';
const CHUNK_RETRY_KEY = 'devpulse:chunk-reload-attempted';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);

    const message = error?.message || '';
    const isChunkLoadError =
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed');

    // GitHub Pages users may keep an old index.html that references removed chunk hashes.
    // One hard reload usually resolves this by fetching the latest entrypoint.
    if (isChunkLoadError) {
      const attempted = sessionStorage.getItem(CHUNK_RETRY_KEY);
      if (!attempted) {
        sessionStorage.setItem(CHUNK_RETRY_KEY, '1');
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    sessionStorage.removeItem(CHUNK_RETRY_KEY);
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    sessionStorage.removeItem(CHUNK_RETRY_KEY);
    this.setState({ hasError: false, error: null });
    window.location.href = APP_BASE_URL;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-sm text-muted-foreground">
                This tool encountered an unexpected error. You can try again or go back to the
                dashboard.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-muted/50 rounded-lg p-4 text-xs">
                <summary className="cursor-pointer text-muted-foreground font-medium mb-2">
                  Error details
                </summary>
                <pre className="overflow-auto whitespace-pre-wrap text-destructive/80 font-mono">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="gap-2"
                aria-label="Go to dashboard"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Dashboard
              </Button>
              <Button onClick={this.handleReset} className="gap-2" aria-label="Try again">
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-red-950/50 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
              <p className="text-slate-400 text-sm">
                An unexpected error occurred while rendering this page.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-left overflow-x-auto max-h-32 text-xs font-mono text-slate-400">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-655 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-150 shadow-lg shadow-indigo-600/20 pointer-events-auto cursor-pointer"
                style={{ backgroundColor: '#4f46e5' }}
              >
                <RotateCcw className="w-4 h-4" />
                Retry Page
              </button>
              <a
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-150"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

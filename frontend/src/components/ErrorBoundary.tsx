import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error in Voyage AI:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] dark:bg-zinc-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-2xl flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#2D2D2D] dark:text-zinc-100 tracking-tight">
                Something unexpected happened
              </h2>
              <p className="text-sm text-[#7D7A74] dark:text-zinc-400">
                We encountered a temporary rendering issue. Don't worry, your saved itineraries are safe in storage.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#FAF9F6] dark:bg-zinc-950 p-3 rounded-xl border border-[#E5E2D9] dark:border-zinc-800/80 text-left">
                <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                  {this.state.error.message || "Unknown error"}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload App
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#FAF9F6] dark:bg-zinc-800 border border-[#E5E2D9] dark:border-zinc-700 text-[#2D2D2D] dark:text-zinc-200 font-bold rounded-xl text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

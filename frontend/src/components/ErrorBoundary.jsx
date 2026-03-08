import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 -left-32 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          </div>

          <div className="text-center relative z-10 max-w-md">
            {/* Error Icon */}
            <div className="w-20 h-20 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertTriangle size={40} className="text-red-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Something Went Wrong
            </h1>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              An unexpected error occurred. This has been logged and we'll look into it.
              Try refreshing the page or going back to the dashboard.
            </p>

            {/* Error details (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-slate-900/80 border border-slate-700 rounded-xl text-left">
                <p className="text-xs font-mono text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300"
              >
                <RefreshCw size={18} />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 text-slate-300 font-semibold text-sm border border-slate-700 hover:bg-slate-700 transition-all duration-300"
              >
                <Home size={18} />
                Go to Dashboard
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

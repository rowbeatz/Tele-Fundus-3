import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };
  
  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-medical-bg flex items-center justify-center p-6">
          <div className="bg-medical-surface max-w-lg w-full rounded-[2.5rem] border border-medical-error/20 p-12 text-center shadow-xl shadow-medical-error/5">
            <div className="w-24 h-24 bg-medical-error/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={48} className="text-medical-error" />
            </div>
            <h1 className="text-3xl font-bold text-medical-text font-display mb-4">
              System Error
            </h1>
            <p className="text-medical-text-muted font-medium mb-8">
              An unexpected error occurred in the application. Our team has been notified.
            </p>
            
            {this.state.error && (
              <div className="bg-medical-bg border border-medical-border rounded-2xl p-4 mb-8 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-medical-error break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-medical-primary/20 flex items-center justify-center gap-3 w-full"
            >
              <RefreshCw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

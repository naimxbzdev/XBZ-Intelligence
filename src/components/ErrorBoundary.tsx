import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('XBZ Intelligence Uncaught UI Exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      // Clear potentially corrupt search state
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e172a] to-[#070b14] border border-cyan-500/30 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white">
              অ্যাপ্লিকেশনে সাময়িক সমস্যা হয়েছে
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। নিচের বাটনে ক্লিক করে পেজটি পুনরায় লোড করুন।
            </p>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>রিলোড করুন</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>হোমপেজ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

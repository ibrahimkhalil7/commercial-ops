import React from 'react';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unexpected application error.' };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-xl w-full bg-white shadow rounded-lg p-6 border border-red-100">
            <h1 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-700 mb-3">
              The app hit a runtime error instead of rendering a blank page.
            </p>
            <p className="text-xs text-gray-600 font-mono bg-gray-50 border border-gray-200 rounded p-2 break-all">
              {this.state.errorMessage}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Open browser DevTools console for the full stack trace.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

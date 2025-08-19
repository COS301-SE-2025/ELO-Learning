'use client';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#FF6E99] mb-4">
                Something went wrong
              </h2>
              <p className="mb-6">
                We're sorry, but something unexpected happened. Please try
                refreshing the page.
              </p>
              <div className="space-y-3 gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="main-button"
                >
                  Refresh Page
                </button>
                <div className="h-3"></div>
                <button
                  onClick={() => (window.location.href = '/dashboard')}
                  className="secondary-button"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

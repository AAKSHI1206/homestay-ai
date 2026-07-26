import { Component } from "react";
import { Button } from "./ui";

/**
 * ErrorBoundary
 * ─────────────
 * React Error Boundary that catches render errors and shows a
 * user-friendly fallback UI instead of a blank page.
 *
 * Wraps the entire app in App.jsx.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <span className="text-6xl" aria-hidden="true">
            ⚠️
          </span>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="max-w-md text-stone-500 dark:text-stone-400">
            An unexpected error occurred. Please try refreshing the page or
            going back to the homepage.
          </p>
          {this.state.error && (
            <details className="max-w-md rounded-lg border border-stone-200 bg-stone-50 p-3 text-left text-xs text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
              <summary className="cursor-pointer font-medium">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()}>
              Refresh page
            </Button>
            <Button variant="outline" onClick={this.handleReset}>
              Go to homepage
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, { hasError: boolean; error: Error | null }> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center flex-col p-4">
          <h1 className="text-2xl font-bold text-destructive text-center">Something went wrong.</h1>
          <p className="text-muted-foreground text-center">Please try refreshing the page.</p>
          {this.state.error && (
            <pre className="mt-4 p-4 bg-muted rounded-md text-sm text-destructive-foreground overflow-auto w-full max-w-2xl">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
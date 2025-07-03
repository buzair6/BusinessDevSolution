import React, { ErrorInfo } from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state!: Readonly<State>;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          padding: '2rem',
          backgroundColor: '#fff3f3',
          color: '#ff0000',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Application Error</h1>
          <p style={{ marginBottom: '1rem' }}>Something went wrong while rendering the application.</p>
          <details style={{ 
            backgroundColor: '#ffe5e5', 
            border: '1px solid #ffbaba', 
            borderRadius: '4px', 
            padding: '1rem', 
            width: '100%',
            maxWidth: '800px',
            textAlign: 'left'
          }}>
            <summary>Error Details</summary>
            <pre style={{
              marginTop: '1rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: '#d32f2f',
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
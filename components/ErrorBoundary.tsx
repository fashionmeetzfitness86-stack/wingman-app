import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
  errorStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: '',
    errorStack: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message, errorStack: error.stack || '' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white', zIndex: 9999, position: 'relative' }}>
          <h1>Something went wrong.</h1>
          <h2>{this.state.errorMsg}</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>{this.state.errorStack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

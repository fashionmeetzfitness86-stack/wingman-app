import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[WINGMAN] Render error:', error, info);
    this.setState({ info });
  }

  handleReset = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('wingman_'));
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const { error, info } = this.state;
    return (
      <div style={{ minHeight: '100vh', padding: 24, background: '#121212', color: '#F9FAFB', fontFamily: 'Inter, sans-serif', overflow: 'auto' }}>
        <h1 style={{ color: '#EC4899', fontSize: 24, marginBottom: 12 }}>WINGMAN crashed on render</h1>
        <p style={{ color: '#9CA3AF', marginBottom: 16 }}>
          Likely cause: old data in localStorage doesn't match the new code. Click the reset button, then reload.
        </p>
        <button
          onClick={this.handleReset}
          style={{ background: '#EC4899', color: '#fff', border: 0, padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginBottom: 24 }}
        >
          Reset local data & reload
        </button>
        <h2 style={{ color: '#FBBF24', fontSize: 16, marginTop: 16 }}>Error</h2>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#DC2626', background: '#1C1C1E', padding: 12, borderRadius: 8 }}>
          {error.name}: {error.message}
        </pre>
        {error.stack && (
          <>
            <h2 style={{ color: '#FBBF24', fontSize: 16, marginTop: 16 }}>Stack</h2>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#F9FAFB', background: '#1C1C1E', padding: 12, borderRadius: 8, fontSize: 12 }}>
              {error.stack}
            </pre>
          </>
        )}
        {info?.componentStack && (
          <>
            <h2 style={{ color: '#FBBF24', fontSize: 16, marginTop: 16 }}>Component stack</h2>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#F9FAFB', background: '#1C1C1E', padding: 12, borderRadius: 8, fontSize: 12 }}>
              {info.componentStack}
            </pre>
          </>
        )}
      </div>
    );
  }
}

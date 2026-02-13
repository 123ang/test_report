import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '600px',
          margin: '2rem auto',
          fontFamily: 'system-ui, sans-serif',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px'
        }}>
          <h1 style={{ color: '#b91c1c', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#991b1b', marginBottom: '0.5rem' }}>
            <strong>{error?.message || 'Unknown error'}</strong>
          </p>
          {error?.stack && (
            <pre style={{
              fontSize: '12px',
              overflow: 'auto',
              padding: '1rem',
              background: '#fff',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              marginTop: '1rem'
            }}>
              {error.stack}
            </pre>
          )}
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>
            Try clearing localStorage for this site (F12 → Application → Local Storage → Clear) and refresh.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

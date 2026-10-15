import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Catch any global errors and show on screen if render fails
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root && (!root.innerHTML || root.innerHTML.trim() === '')) {
    root.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; background: #fff1f2; color: #991b1b; min-height: 100vh;">
        <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Application Error Detected</h2>
        <pre style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #fecaca; white-space: pre-wrap;">${event.message} at ${event.filename}:${event.lineno}</pre>
      </div>
    `;
  }
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', background: '#fff1f2', color: '#991b1b', minHeight: '100vh' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Rendering Error</h2>
          <pre style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

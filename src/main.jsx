import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

function hideSplash() {
  try {
    const el = document.getElementById('luna-splash');
    if (!el) return;
    el.classList.add('is-hidden');
    window.setTimeout(() => {
      try {
        el.remove();
      } catch {
        // ignore
      }
    }, 260);
  } catch {
    // ignore
  }
}

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but there was an error loading the page. Please try refreshing or contact us for help.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600"
              >
                Refresh Page
              </button>
              <div className="text-sm text-gray-500">
                <p>Need immediate help?</p>
                <p><strong>Call: 07123 456 789</strong></p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {import.meta.env.DEV ? (
      <App />
    ) : (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )}
  </React.StrictMode>,
);

// Hide branded splash after first paint
hideSplash();

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { STORAGE_KEY } from '../store/persistence';

interface State { failed: boolean }

/** Last line of defence: if rendering ever throws, offer a way back instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard crashed:', error, info.componentStack);
  }

  private reset = () => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="fatal" role="alert">
        <h1>Something went wrong</h1>
        <p>The dashboard hit an unexpected error. Resetting the saved layout usually fixes it.</p>
        <button type="button" className="btn btn--primary" onClick={this.reset}>Reset and reload</button>
      </div>
    );
  }
}

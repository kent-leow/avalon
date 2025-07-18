/**
 * Game Engine Error Boundary Component
 * 
 * Catches and handles game-specific errors with recovery options
 * to maintain game stability.
 */

'use client';

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import type { ErrorBoundaryProps } from '~/types/game-engine';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Game Engine Error Boundary Component
 * 
 * Provides error recovery mechanisms for game engine failures.
 */
export class GameEngineErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Engine Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
    
    // Report error to parent
    this.props.onError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  /**
   * Retry rendering the component
   */
  retry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.error('Maximum retry attempts reached');
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    console.log(`Retrying... Attempt ${this.state.retryCount + 1}/${this.maxRetries}`);
  };

  /**
   * Auto-retry with delay
   */
  autoRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.retryTimeout = setTimeout(() => {
      this.retry();
    }, 2000); // 2 second delay
  };

  /**
   * Reset error state completely
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  /**
   * Render error recovery UI
   */
  renderErrorUI() {
    const { error, errorInfo, retryCount } = this.state;
    const canRetry = retryCount < this.maxRetries;
    
    // Use custom fallback if provided
    if (this.props.fallback) {
      const FallbackComponent = this.props.fallback;
      return (
        <FallbackComponent 
          error={error!} 
          retry={this.retry}
        />
      );
    }

    // Default error UI
    return (
      <div 
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: '#0a0a0f' }}
        data-testid="error-boundary-fallback"
      >
        <div 
          className="max-w-md rounded-lg p-8 text-center"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          {/* Error Icon */}
          <div className="text-6xl mb-4">⚠️</div>
          
          {/* Error Title */}
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: '#ef4444' }}
          >
            Game Engine Error
          </h2>
          
          {/* Error Message */}
          <p 
            className="text-lg mb-6"
            style={{ color: '#f8f9fa' }}
          >
            Something went wrong with the game engine.
          </p>
          
          {/* Error Details */}
          <div 
            className="text-left p-4 rounded-lg mb-6"
            style={{ backgroundColor: '#252547' }}
          >
            <h3 
              className="text-sm font-semibold mb-2"
              style={{ color: '#f8f9fa' }}
            >
              Error Details:
            </h3>
            <p 
              className="text-xs font-mono break-all"
              style={{ color: '#9ca3af' }}
              data-testid="error-message"
            >
              {error?.message || 'Unknown error'}
            </p>
            {errorInfo && (
              <details className="mt-2">
                <summary 
                  className="text-xs cursor-pointer"
                  style={{ color: '#9ca3af' }}
                >
                  Stack Trace
                </summary>
                <pre 
                  className="text-xs mt-2 overflow-auto max-h-32"
                  style={{ color: '#9ca3af' }}
                  data-testid="error-stack"
                >
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          {/* Retry Information */}
          {canRetry && (
            <div 
              className="text-sm mb-6"
              style={{ color: '#9ca3af' }}
            >
              Retry attempts: {retryCount}/{this.maxRetries}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            {canRetry && (
              <>
                <button
                  onClick={this.retry}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                  data-testid="retry-button"
                >
                  Retry Now
                </button>
                
                <button
                  onClick={this.autoRetry}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                  data-testid="auto-retry-button"
                >
                  Auto-Retry (2s)
                </button>
              </>
            )}
            
            <button
              onClick={this.resetError}
              className="w-full px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#3d3d7a', color: '#ffffff' }}
              data-testid="reset-button"
            >
              Reset Game Engine
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              data-testid="reload-button"
            >
              Reload Page
            </button>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 text-xs" style={{ color: '#9ca3af' }}>
            <p>
              If this error persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

export default GameEngineErrorBoundary;

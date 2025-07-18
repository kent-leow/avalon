/**
 * Invalid Phase Handler Component
 * 
 * Handles invalid phase states and provides recovery options
 * with user-friendly error messages and navigation fallbacks.
 */

'use client';

import { useEffect, useState } from 'react';
import type { InvalidPhaseHandlerProps } from '~/types/dynamic-phase-router';
import type { GamePhase } from '~/types/game-state';
import { formatPhaseDisplayName, createPhaseRouterError } from '~/lib/phase-router-utils';

/**
 * Invalid Phase Handler Component
 * 
 * Provides graceful error handling for invalid phase states
 * with recovery options and user guidance.
 */
export function InvalidPhaseHandler({
  phase,
  error,
  validPhases,
  onRetry,
  onNavigateToPhase,
  onReset,
  autoRecovery = true,
  autoRecoveryDelay = 3000,
}: InvalidPhaseHandlerProps) {
  const [isAutoRecovering, setIsAutoRecovering] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoRecoveryDelay);

  /**
   * Handle auto-recovery
   */
  useEffect(() => {
    if (!autoRecovery || !onRetry) return;

    setIsAutoRecovering(true);
    setTimeRemaining(autoRecoveryDelay);

    const interval = setInterval(() => {
      setTimeRemaining((prev: number) => {
        if (prev <= 1000) {
          clearInterval(interval);
          setIsAutoRecovering(false);
          onRetry();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRecovery, autoRecoveryDelay, onRetry]);

  /**
   * Get error message
   */
  const getErrorMessage = () => {
    if (error?.message) {
      return error.message;
    }
    
    if (phase) {
      return `Invalid phase: ${formatPhaseDisplayName(phase)}`;
    }
    
    return 'Invalid phase encountered';
  };

  /**
   * Get error details
   */
  const getErrorDetails = () => {
    const details = [];
    
    if (phase) {
      details.push(`Current phase: ${formatPhaseDisplayName(phase)}`);
    }
    
    if (validPhases && validPhases.length > 0) {
      details.push(`Valid phases: ${validPhases.map(p => formatPhaseDisplayName(p)).join(', ')}`);
    }
    
    if (error?.code) {
      details.push(`Error code: ${error.code}`);
    }
    
    return details;
  };

  /**
   * Handle manual retry
   */
  const handleRetry = () => {
    setIsAutoRecovering(false);
    onRetry?.();
  };

  /**
   * Handle navigation to specific phase
   */
  const handleNavigateToPhase = (targetPhase: GamePhase) => {
    setIsAutoRecovering(false);
    onNavigateToPhase?.(targetPhase);
  };

  /**
   * Handle reset
   */
  const handleReset = () => {
    setIsAutoRecovering(false);
    onReset?.();
  };

  /**
   * Handle cancel auto-recovery
   */
  const handleCancelAutoRecovery = () => {
    setIsAutoRecovering(false);
    setTimeRemaining(0);
  };

  /**
   * Get suggested phases for recovery
   */
  const getSuggestedPhases = (): GamePhase[] => {
    if (!validPhases || validPhases.length === 0) {
      return ['lobby', 'waiting', 'game-setup'] as GamePhase[];
    }
    
    return validPhases.slice(0, 3); // Show up to 3 suggested phases
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(4px)',
      }}
      data-testid="invalid-phase-handler"
      data-phase={phase}
    >
      <div
        className="max-w-lg w-full mx-4 p-8 rounded-2xl"
        style={{
          backgroundColor: '#1a1a2e',
          border: '1px solid #ef4444',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        data-testid="invalid-phase-content"
      >
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: '#ef4444' }}
          >
            <span className="text-2xl text-white">⚠️</span>
          </div>
          
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: '#f8f9fa' }}
            data-testid="error-title"
          >
            Invalid Game Phase
          </h2>
        </div>

        {/* Error Message */}
        <div
          className="mb-6 p-4 rounded-lg"
          style={{ backgroundColor: '#252547', border: '1px solid #ef4444' }}
          data-testid="error-message"
        >
          <p className="text-sm font-medium mb-2" style={{ color: '#ef4444' }}>
            {getErrorMessage()}
          </p>
          
          <div className="text-xs space-y-1" style={{ color: '#9ca3af' }}>
            {getErrorDetails().map((detail, index) => (
              <div key={index} data-testid={`error-detail-${index}`}>
                {detail}
              </div>
            ))}
          </div>
        </div>

        {/* Auto-recovery Status */}
        {isAutoRecovering && onRetry && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ backgroundColor: '#252547', border: '1px solid #f59e0b' }}
            data-testid="auto-recovery-status"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>
                Auto-recovery in progress...
              </span>
              <button
                onClick={handleCancelAutoRecovery}
                className="text-xs hover:underline"
                style={{ color: '#9ca3af' }}
                data-testid="cancel-auto-recovery"
              >
                Cancel
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <div
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{
                    backgroundColor: '#f59e0b',
                    width: `${((autoRecoveryDelay - timeRemaining) / autoRecoveryDelay) * 100}%`,
                  }}
                  data-testid="auto-recovery-progress"
                />
              </div>
              <span className="text-xs" style={{ color: '#9ca3af' }} data-testid="auto-recovery-time">
                {Math.ceil(timeRemaining / 1000)}s
              </span>
            </div>
          </div>
        )}

        {/* Recovery Options */}
        <div className="space-y-4">
          {/* Manual Retry */}
          {onRetry && (
            <button
              onClick={handleRetry}
              className="w-full px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#10b981', color: '#ffffff' }}
              data-testid="retry-button"
            >
              {isAutoRecovering ? 'Retry Now' : 'Retry'}
            </button>
          )}

          {/* Navigation Options */}
          {onNavigateToPhase && getSuggestedPhases().length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: '#f8f9fa' }}>
                Navigate to:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {getSuggestedPhases().map((suggestedPhase) => (
                  <button
                    key={suggestedPhase}
                    onClick={() => handleNavigateToPhase(suggestedPhase)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#3d3d7a', color: '#ffffff' }}
                    data-testid={`navigate-to-${suggestedPhase}`}
                  >
                    {formatPhaseDisplayName(suggestedPhase)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset Option */}
          {onReset && (
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
              data-testid="reset-button"
            >
              Reset Game
            </button>
          )}
        </div>

        {/* Help Text */}
        <div
          className="mt-6 p-3 rounded-lg text-xs text-center"
          style={{ backgroundColor: '#252547', color: '#9ca3af' }}
          data-testid="help-text"
        >
          <p>
            This error occurs when the game enters an invalid state. 
            Use the options above to recover or contact support if the problem persists.
          </p>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary
              className="text-xs cursor-pointer hover:underline"
              style={{ color: '#6b7280' }}
            >
              Debug Information
            </summary>
            <div
              className="mt-2 p-2 rounded text-xs font-mono"
              style={{ backgroundColor: '#0f0f0f', color: '#9ca3af' }}
              data-testid="debug-info"
            >
              <pre>{JSON.stringify({ phase, error, validPhases }, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default InvalidPhaseHandler;

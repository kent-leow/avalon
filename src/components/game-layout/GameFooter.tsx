'use client';

import React from 'react';
import type { GamePhase } from '~/types/game-state';
import type { GameFooterProps } from '~/types/game-layout';
import { useGameLayout } from '~/context/GameLayoutContext';
import { getFooterClasses, createMockPhaseActions } from '~/lib/game-layout-utils';

/**
 * Game Footer
 * 
 * Bottom action bar with phase-specific actions and controls.
 */

export function GameFooter({
  currentPhase,
  actions,
  onAction,
  isLoading = false,
  className = ''
}: GameFooterProps) {
  const { layout } = useGameLayout();
  
  // Use layout state if not provided via props
  const phase = currentPhase || layout.currentPhase;
  
  // Use mock data if not provided
  const phaseActions = actions || createMockPhaseActions(phase);
  
  const footerClasses = getFooterClasses(layout);

  const handleAction = (action: typeof phaseActions[0]) => {
    if (onAction) {
      onAction(action);
    } else {
      action.onClick();
    }
  };

  const getActionButtonClasses = (type: string): string => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (type) {
      case 'primary':
        return `${baseClasses} bg-[#f39c12] hover:bg-[#e67e22] text-[#0a0a0f]`;
      case 'secondary':
        return `${baseClasses} bg-[#3d3d7a] hover:bg-[#4a4a8a] text-[#e5e7eb]`;
      case 'success':
        return `${baseClasses} bg-[#27ae60] hover:bg-[#229954] text-[#0a0a0f]`;
      case 'danger':
        return `${baseClasses} bg-[#e74c3c] hover:bg-[#c0392b] text-[#0a0a0f]`;
      default:
        return `${baseClasses} bg-[#3d3d7a] hover:bg-[#4a4a8a] text-[#e5e7eb]`;
    }
  };

  const renderActionButton = (action: typeof phaseActions[0]) => {
    const buttonClasses = getActionButtonClasses(action.type);
    const isDisabled = action.disabled || isLoading;
    
    return (
      <button
        key={action.id}
        onClick={() => handleAction(action)}
        disabled={isDisabled}
        className={buttonClasses}
        aria-label={action.label}
      >
        {action.loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {action.icon && !action.loading && (
          <span className="mr-2">{action.icon}</span>
        )}
        {action.label}
        {action.shortcut && (
          <span className="ml-2 text-xs opacity-70">
            {action.shortcut}
          </span>
        )}
      </button>
    );
  };

  // Don't render footer if no actions
  if (!phaseActions.length) {
    return null;
  }

  return (
    <footer className={`${footerClasses} ${className}`}>
      <div className="flex items-center justify-between w-full">
        {/* Left section - Status or info */}
        <div className="flex items-center space-x-4">
          {isLoading && (
            <div className="flex items-center space-x-2 text-[#9ca3af]">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-3">
          {layout.isMobile ? (
            // Mobile: Stack actions vertically if more than 2
            <div className={`flex ${phaseActions.length > 2 ? 'flex-col space-y-2' : 'space-x-3'}`}>
              {phaseActions.map(renderActionButton)}
            </div>
          ) : (
            // Desktop: Horizontal layout
            <div className="flex space-x-3">
              {phaseActions.map(renderActionButton)}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

// Export default for easier importing
export default GameFooter;

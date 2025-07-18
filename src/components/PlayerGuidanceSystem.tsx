'use client';

import { type ReactNode, type FC } from 'react';
import { type GameState, type GamePhase } from '~/types/game-state';
import { type Role } from '~/types/roles';
import {
  type GuidanceInteraction,
  type GuidanceConfig,
  type GuidanceLevel,
  type GuidancePreferences,
} from '~/types/player-guidance';
import { usePlayerGuidance } from '~/hooks/usePlayerGuidance';
import { ActionIndicator } from './ActionIndicator';
import { GameplayTooltip } from './GameplayTooltip';
import { StrategyHint } from './StrategyHint';
import { ActionPreview } from './ActionPreview';
import { GuidanceOverlay } from './GuidanceOverlay';

export interface PlayerGuidanceSystemProps {
  gameState?: GameState;
  playerId: string;
  playerRole?: Role;
  children?: ReactNode;
  onInteraction?: (interaction: GuidanceInteraction) => void;
  config?: Partial<GuidanceConfig>;
  className?: string;
}

export const PlayerGuidanceSystem: FC<PlayerGuidanceSystemProps> = ({
  gameState,
  playerId,
  playerRole,
  children,
  onInteraction,
  config,
  className = '',
}) => {
  const {
    guidanceState,
    availableActions,
    recommendations,
    currentTooltip,
    currentActionPreview,
    showTooltip,
    hideTooltip,
    showActionPreview,
    hideActionPreview,
    dismissHint,
    startGuidanceFlow,
    completeStep,
    updatePreferences,
    toggleGuidance,
    needsGuidance,
    getContextualHelp,
    config: guidanceConfig,
  } = usePlayerGuidance({
    gameState,
    playerId,
    playerRole,
    onInteraction,
  });

  // Don't render if guidance is disabled
  if (!guidanceState.isGuidanceActive) {
    return <>{children}</>;
  }

  // Handle guidance overlay display
  const showGuidanceOverlay = guidanceState.currentGuidanceFlow && 
    guidanceState.preferences.level === 'beginner';

  return (
    <div className={`relative ${className}`}>
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Action indicators for available actions */}
      {availableActions.map((action) => (
        <ActionIndicator
          key={action.id}
          action={action}
          visible={guidanceState.preferences.showActionIndicators}
          onHover={() => showActionPreview(action)}
          onLeave={() => hideActionPreview()}
          onClick={() => {
            if (onInteraction) {
              onInteraction({
                id: `action-${action.id}-${Date.now()}`,
                type: 'action_taken',
                playerId,
                timestamp: Date.now(),
                content: `Action taken: ${action.label}`,
                details: { actionId: action.id },
              });
            }
          }}
        />
      ))}

      {/* Active strategy hints */}
      {guidanceState.activeHints.map((hint) => (
        <StrategyHint
          key={hint.id}
          hint={hint}
          visible={true}
          onDismiss={() => dismissHint(hint.id)}
          onInteraction={(type: string) => {
            if (onInteraction) {
              onInteraction({
                id: `hint-${hint.id}-${Date.now()}`,
                type: type as any,
                playerId,
                timestamp: Date.now(),
                content: `Hint interaction: ${type}`,
                details: { hintId: hint.id },
              });
            }
          }}
        />
      ))}

      {/* Contextual tooltip */}
      {currentTooltip && (
        <GameplayTooltip
          content={currentTooltip}
          visible={true}
          onClose={hideTooltip}
          onInteraction={(type: string) => {
            if (onInteraction) {
              onInteraction({
                id: `tooltip-${currentTooltip.id}-${Date.now()}`,
                type: type as any,
                playerId,
                timestamp: Date.now(),
                content: `Tooltip interaction: ${type}`,
                details: { tooltipId: currentTooltip.id },
              });
            }
          }}
        />
      )}

      {/* Action preview modal */}
      {currentActionPreview && (
        <ActionPreview
          preview={currentActionPreview}
          visible={true}
          onClose={hideActionPreview}
          onConfirm={() => {
            hideActionPreview();
            if (onInteraction) {
              onInteraction({
                id: `preview-${currentActionPreview.action.id}-${Date.now()}`,
                type: 'action_taken',
                playerId,
                timestamp: Date.now(),
                details: { actionId: currentActionPreview.action.id },
                content: `Action taken: ${currentActionPreview.action.label}`,
              });
            }
          }}
          onInteraction={(type: string) => {
            if (onInteraction) {
              onInteraction({
                id: `preview-${currentActionPreview.action.id}-${Date.now()}`,
                type: type as any,
                playerId,
                timestamp: Date.now(),
                content: `Action preview interaction: ${type}`,
                details: { actionId: currentActionPreview.action.id },
              });
            }
          }}
        />
      )}

      {/* Guidance overlay for complex flows */}
      {showGuidanceOverlay && (
        <GuidanceOverlay
          flowId={guidanceState.currentGuidanceFlow!}
          currentStep={guidanceState.completedSteps.length}
          visible={true}
          onStepComplete={completeStep}
          onClose={() => {
            // Complete the current flow
            if (guidanceState.currentGuidanceFlow) {
              if (onInteraction) {
                onInteraction({
                  id: `flow-${guidanceState.currentGuidanceFlow}-${Date.now()}`,
                  type: 'guidance_completed',
                  playerId,
                  timestamp: Date.now(),
                  content: `Guidance flow completed: ${guidanceState.currentGuidanceFlow}`,
                  details: { flowId: guidanceState.currentGuidanceFlow },
                });
              }
            }
          }}
          onInteraction={(type: string, stepId?: string) => {
            if (onInteraction) {
              onInteraction({
                id: `overlay-${stepId}-${Date.now()}`,
                type: type as any,
                playerId,
                timestamp: Date.now(),
                content: `Overlay interaction: ${type}`,
                details: { stepId },
              });
            }
          }}
        />
      )}

      {/* Floating guidance controls */}
      {guidanceState.preferences.level !== 'advanced' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex flex-col gap-2">
            {/* Quick guidance toggle */}
            <button
              onClick={toggleGuidance}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title={guidanceState.isGuidanceActive ? 'Disable Guidance' : 'Enable Guidance'}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {guidanceState.isGuidanceActive ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </button>

            {/* Guidance level indicator */}
            <div className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg text-xs font-semibold">
              {guidanceState.preferences.level.charAt(0).toUpperCase()}
            </div>

            {/* Available recommendations count */}
            {recommendations.length > 0 && (
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full shadow-lg text-xs font-semibold">
                {recommendations.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-80 text-white p-2 rounded text-xs max-w-xs">
          <div>Guidance: {guidanceState.isGuidanceActive ? 'ON' : 'OFF'}</div>
          <div>Level: {guidanceState.preferences.level}</div>
          <div>Phase: {gameState?.phase || 'unknown'}</div>
          <div>Actions: {availableActions.length}</div>
          <div>Hints: {guidanceState.activeHints.length}</div>
          <div>Recommendations: {recommendations.length}</div>
          {guidanceState.currentGuidanceFlow && (
            <div>Flow: {guidanceState.currentGuidanceFlow}</div>
          )}
        </div>
      )}
    </div>
  );
};

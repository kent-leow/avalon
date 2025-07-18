'use client';

import { useCallback, useEffect, useState } from 'react';
import { type GameState, type GamePhase } from '~/types/game-state';
import { type Role } from '~/types/roles';
import {
  type GuidanceInteraction,
  type StrategyHint,
  type GameAction,
  type GuidanceRecommendation,
  type GuidancePreferences,
  type GuidanceLevel,
  type ActionPreview,
  type TooltipContent,
  type GuidanceStep,
} from '~/types/player-guidance';
import { usePlayerGuidanceContext, useGuidanceActions } from '~/context/PlayerGuidanceContext';
import {
  validateGuidanceLevel,
  shouldShowTooltip,
  shouldShowStrategyHint,
  shouldShowActionPreview,
  getAvailableActions,
  getGuidanceRecommendations,
  adaptGuidanceLevel,
  trackGuidanceInteraction,
  createMockGuidanceInteraction,
  createMockStrategyHint,
  createMockActionPreview,
} from '~/lib/player-guidance-utils';
import { TOOLTIP_CONTENT, STRATEGY_HINTS, GUIDANCE_FLOWS } from '~/data/guidance-content';

interface UsePlayerGuidanceProps {
  gameState?: GameState;
  playerId: string;
  playerRole?: Role;
  onInteraction?: (interaction: GuidanceInteraction) => void;
}

export const usePlayerGuidance = ({
  gameState,
  playerId,
  playerRole,
  onInteraction,
}: UsePlayerGuidanceProps) => {
  const { state, config } = usePlayerGuidanceContext();
  const actions = useGuidanceActions();
  
  const [availableActions, setAvailableActions] = useState<GameAction[]>([]);
  const [recommendations, setRecommendations] = useState<GuidanceRecommendation[]>([]);
  const [currentTooltip, setCurrentTooltip] = useState<TooltipContent | null>(null);
  const [currentActionPreview, setCurrentActionPreview] = useState<ActionPreview | null>(null);

  // Update available actions when game state changes
  useEffect(() => {
    if (gameState) {
      const actions = getAvailableActions(gameState, playerId, playerRole);
      setAvailableActions(actions);
    } else {
      // Mock actions for testing
      setAvailableActions([
        {
          id: 'mock-action-1',
          type: 'vote',
          label: 'Mock Vote',
          description: 'Mock voting action',
          available: true,
          requirements: [],
          consequences: ['Mock consequence'],
        },
      ]);
    }
  }, [gameState, playerId, playerRole]);

  // Update recommendations when game state or preferences change
  useEffect(() => {
    if (gameState) {
      const newRecommendations = getGuidanceRecommendations(
        gameState,
        playerId,
        playerRole,
        state.preferences
      );
      setRecommendations(newRecommendations);
    } else {
      // Mock recommendations for testing
      setRecommendations([
        {
          id: 'mock-rec-1',
          type: 'action',
          title: 'Mock Recommendation',
          content: 'This is a mock recommendation for testing.',
          priority: 1,
        },
      ]);
    }
  }, [gameState, playerId, playerRole, state.preferences]);

  // Auto-show tooltips based on context
  useEffect(() => {
    if (!gameState || !shouldShowTooltip(state.preferences, { phase: gameState.phase, playerRole })) {
      return;
    }

    const phaseTooltipKey = `${gameState.phase}-overview`;
    const tooltipContent = TOOLTIP_CONTENT[phaseTooltipKey];
    if (tooltipContent) {
      const timer = setTimeout(() => {
        setCurrentTooltip(tooltipContent);
        actions.showTooltip(phaseTooltipKey);
      }, config.tooltipDelay);

      return () => clearTimeout(timer);
    }
  }, [gameState, state.preferences, config.tooltipDelay, actions, playerRole]);

  // Auto-show strategy hints based on context
  useEffect(() => {
    if (!gameState) return;

    const relevantHints = STRATEGY_HINTS.filter(hint => 
      shouldShowStrategyHint(state.preferences, hint, gameState)
    );

    relevantHints.forEach(hint => {
      // Don't show hints that are already active
      if (!state.activeHints.some(activeHint => activeHint.id === hint.id)) {
        actions.addHint(hint);
      }
    });
  }, [gameState, state.preferences, state.activeHints, actions]);

  // Adaptive guidance level adjustment
  useEffect(() => {
    if (config.adaptiveGuidance && state.interactionHistory.length > 0) {
      const adaptedLevel = adaptGuidanceLevel(
        state.preferences.level,
        state.interactionHistory,
        config
      );
      
      if (adaptedLevel !== state.preferences.level) {
        actions.setPreferences({ level: adaptedLevel });
      }
    }
  }, [state.interactionHistory, state.preferences.level, config, actions]);

  // Track interaction wrapper
  const trackInteraction = useCallback((interaction: GuidanceInteraction) => {
    actions.trackInteraction(interaction);
    trackGuidanceInteraction(interaction, config);
    onInteraction?.(interaction);
  }, [actions, config, onInteraction]);

  // Show tooltip for specific element
  const showTooltip = useCallback((elementId: string, customContent?: TooltipContent) => {
    const content = customContent || TOOLTIP_CONTENT[elementId];
    if (content) {
      setCurrentTooltip(content);
      actions.showTooltip(elementId);
      
      trackInteraction(createMockGuidanceInteraction(
        'tooltip_viewed',
        playerId,
        `Viewed tooltip: ${elementId}`
      ));
    }
  }, [actions, playerId, trackInteraction]);

  // Hide current tooltip
  const hideTooltip = useCallback(() => {
    setCurrentTooltip(null);
    actions.hideTooltip();
  }, [actions]);

  // Show action preview
  const showActionPreview = useCallback((action: GameAction) => {
    if (gameState && shouldShowActionPreview(action, state.preferences, gameState)) {
      const preview = createMockActionPreview(action.id);
      setCurrentActionPreview(preview);
      
      trackInteraction(createMockGuidanceInteraction(
        'action_previewed',
        playerId,
        `Previewed action: ${action.id}`
      ));
    }
  }, [gameState, state.preferences, playerId, trackInteraction]);

  // Hide action preview
  const hideActionPreview = useCallback(() => {
    setCurrentActionPreview(null);
  }, []);

  // Dismiss hint
  const dismissHint = useCallback((hintId: string) => {
    actions.removeHint(hintId);
    
    trackInteraction(createMockGuidanceInteraction(
      'hint_dismissed',
      playerId,
      `Dismissed hint: ${hintId}`
    ));
  }, [actions, playerId, trackInteraction]);

  // Start guidance flow
  const startGuidanceFlow = useCallback((flowId: string) => {
    const flow = GUIDANCE_FLOWS[flowId];
    if (flow) {
      actions.setGuidanceFlow(flowId);
      actions.updateProgress(flowId, 0);
      
      trackInteraction(createMockGuidanceInteraction(
        'guidance_completed',
        playerId,
        `Started guidance flow: ${flowId}`
      ));
    }
  }, [actions, playerId, trackInteraction]);

  // Complete guidance step
  const completeStep = useCallback((stepId: string) => {
    actions.completeStep(stepId);
    
    if (state.currentGuidanceFlow) {
      const flow = GUIDANCE_FLOWS[state.currentGuidanceFlow];
      if (flow) {
        const completedCount = state.completedSteps.length + 1;
        const progress = completedCount / flow.length;
        actions.updateProgress(state.currentGuidanceFlow, progress);
        
        if (progress >= 1) {
          trackInteraction(createMockGuidanceInteraction(
            'guidance_completed',
            playerId,
            `Completed guidance flow: ${state.currentGuidanceFlow}`
          ));
        }
      }
    }
  }, [actions, state.currentGuidanceFlow, state.completedSteps, playerId, trackInteraction]);

  // Update guidance preferences
  const updatePreferences = useCallback((newPreferences: Partial<GuidancePreferences>) => {
    const validatedPreferences = { ...newPreferences };
    
    if (newPreferences.level) {
      validatedPreferences.level = validateGuidanceLevel(newPreferences.level);
    }
    
    actions.setPreferences(validatedPreferences);
  }, [actions]);

  // Toggle guidance system
  const toggleGuidance = useCallback(() => {
    actions.setGuidanceActive(!state.isGuidanceActive);
  }, [actions, state.isGuidanceActive]);

  // Get current guidance flow steps
  const getCurrentFlowSteps = useCallback((): GuidanceStep[] => {
    if (!state.currentGuidanceFlow) return [];
    return GUIDANCE_FLOWS[state.currentGuidanceFlow] || [];
  }, [state.currentGuidanceFlow]);

  // Get current step in flow
  const getCurrentStep = useCallback((): GuidanceStep | null => {
    const steps = getCurrentFlowSteps();
    const nextStepIndex = state.completedSteps.length;
    return steps[nextStepIndex] || null;
  }, [getCurrentFlowSteps, state.completedSteps]);

  // Check if guidance is needed for current context
  const needsGuidance = useCallback((context: { phase?: GamePhase; firstTime?: boolean }): boolean => {
    if (!state.isGuidanceActive) return false;
    
    if (context.firstTime) return true;
    
    if (state.preferences.level === 'beginner') return true;
    
    if (context.phase === 'roleReveal' || context.phase === 'assassinAttempt') {
      return state.preferences.level !== 'advanced';
    }
    
    return false;
  }, [state.isGuidanceActive, state.preferences.level]);

  // Get contextual help for element
  const getContextualHelp = useCallback((elementId: string): TooltipContent | null => {
    return TOOLTIP_CONTENT[elementId] || null;
  }, []);

  return {
    // State
    guidanceState: state,
    availableActions,
    recommendations,
    currentTooltip,
    currentActionPreview,
    
    // Actions
    showTooltip,
    hideTooltip,
    showActionPreview,
    hideActionPreview,
    dismissHint,
    startGuidanceFlow,
    completeStep,
    updatePreferences,
    toggleGuidance,
    
    // Utilities
    getCurrentFlowSteps,
    getCurrentStep,
    needsGuidance,
    getContextualHelp,
    
    // Configuration
    config,
  };
};

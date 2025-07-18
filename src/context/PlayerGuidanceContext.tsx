'use client';

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import {
  type GuidanceState,
  type GuidancePreferences,
  type GuidanceInteraction,
  type StrategyHint,
  type GuidanceConfig,
  DEFAULT_GUIDANCE_PREFERENCES,
  DEFAULT_GUIDANCE_CONFIG,
} from '~/types/player-guidance';
import { createGuidanceState, mergeGuidancePreferences } from '~/lib/player-guidance-utils';

interface PlayerGuidanceContextType {
  state: GuidanceState;
  dispatch: React.Dispatch<GuidanceAction>;
  config: GuidanceConfig;
}

export type GuidanceAction =
  | { type: 'SET_PREFERENCES'; payload: Partial<GuidancePreferences> }
  | { type: 'SET_ACTIVE_TOOLTIP'; payload: string | null }
  | { type: 'ADD_HINT'; payload: StrategyHint }
  | { type: 'REMOVE_HINT'; payload: string }
  | { type: 'CLEAR_HINTS' }
  | { type: 'ADD_INTERACTION'; payload: GuidanceInteraction }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'SET_GUIDANCE_FLOW'; payload: string | null }
  | { type: 'SET_GUIDANCE_ACTIVE'; payload: boolean }
  | { type: 'UPDATE_PROGRESS'; payload: { flow: string; progress: number } }
  | { type: 'RESET_GUIDANCE' };

const guidanceReducer = (state: GuidanceState, action: GuidanceAction): GuidanceState => {
  switch (action.type) {
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: mergeGuidancePreferences(action.payload, state.preferences),
      };
    
    case 'SET_ACTIVE_TOOLTIP':
      return {
        ...state,
        activeTooltip: action.payload,
      };
    
    case 'ADD_HINT':
      // Prevent duplicate hints
      if (state.activeHints.some(hint => hint.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        activeHints: [...state.activeHints, action.payload],
      };
    
    case 'REMOVE_HINT':
      return {
        ...state,
        activeHints: state.activeHints.filter(hint => hint.id !== action.payload),
      };
    
    case 'CLEAR_HINTS':
      return {
        ...state,
        activeHints: [],
      };
    
    case 'ADD_INTERACTION':
      return {
        ...state,
        interactionHistory: [...state.interactionHistory, action.payload],
      };
    
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
      };
    
    case 'SET_GUIDANCE_FLOW':
      return {
        ...state,
        currentGuidanceFlow: action.payload,
      };
    
    case 'SET_GUIDANCE_ACTIVE':
      return {
        ...state,
        isGuidanceActive: action.payload,
      };
    
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        guidanceProgress: {
          ...state.guidanceProgress,
          [action.payload.flow]: action.payload.progress,
        },
      };
    
    case 'RESET_GUIDANCE':
      return createGuidanceState(state.preferences);
    
    default:
      return state;
  }
};

const PlayerGuidanceContext = createContext<PlayerGuidanceContextType | undefined>(undefined);

interface PlayerGuidanceProviderProps {
  children: ReactNode;
  initialPreferences?: Partial<GuidancePreferences>;
  config?: Partial<GuidanceConfig>;
}

export const PlayerGuidanceProvider: React.FC<PlayerGuidanceProviderProps> = ({
  children,
  initialPreferences = {},
  config = {},
}) => {
  const mergedPreferences = mergeGuidancePreferences(initialPreferences, DEFAULT_GUIDANCE_PREFERENCES);
  const mergedConfig = { ...DEFAULT_GUIDANCE_CONFIG, ...config };
  
  const [state, dispatch] = useReducer(
    guidanceReducer,
    createGuidanceState(mergedPreferences)
  );

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('avalon-guidance-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences) as Partial<GuidancePreferences>;
        dispatch({ type: 'SET_PREFERENCES', payload: parsed });
      } catch (error) {
        console.warn('Failed to parse saved guidance preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('avalon-guidance-preferences', JSON.stringify(state.preferences));
  }, [state.preferences]);

  // Auto-dismiss hints after duration
  useEffect(() => {
    if (state.activeHints.length === 0) return;

    const timers = state.activeHints.map(hint => {
      const duration = mergedConfig.hintDuration;
      if (duration <= 0) return null; // Persistent hints

      return setTimeout(() => {
        dispatch({ type: 'REMOVE_HINT', payload: hint.id });
      }, duration);
    });

    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [state.activeHints, mergedConfig.hintDuration]);

  // Enforce max simultaneous hints
  useEffect(() => {
    if (state.activeHints.length > mergedConfig.maxSimultaneousHints) {
      const hintsToRemove = state.activeHints.slice(0, state.activeHints.length - mergedConfig.maxSimultaneousHints);
      hintsToRemove.forEach(hint => {
        dispatch({ type: 'REMOVE_HINT', payload: hint.id });
      });
    }
  }, [state.activeHints, mergedConfig.maxSimultaneousHints]);

  const value: PlayerGuidanceContextType = {
    state,
    dispatch,
    config: mergedConfig,
  };

  return (
    <PlayerGuidanceContext.Provider value={value}>
      {children}
    </PlayerGuidanceContext.Provider>
  );
};

export const usePlayerGuidanceContext = (): PlayerGuidanceContextType => {
  const context = useContext(PlayerGuidanceContext);
  if (!context) {
    throw new Error('usePlayerGuidanceContext must be used within a PlayerGuidanceProvider');
  }
  return context;
};

// Helper hook for common guidance operations
export const useGuidanceActions = () => {
  const { dispatch } = usePlayerGuidanceContext();

  const setPreferences = (preferences: Partial<GuidancePreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preferences });
  };

  const showTooltip = (tooltipId: string) => {
    dispatch({ type: 'SET_ACTIVE_TOOLTIP', payload: tooltipId });
  };

  const hideTooltip = () => {
    dispatch({ type: 'SET_ACTIVE_TOOLTIP', payload: null });
  };

  const addHint = (hint: StrategyHint) => {
    dispatch({ type: 'ADD_HINT', payload: hint });
  };

  const removeHint = (hintId: string) => {
    dispatch({ type: 'REMOVE_HINT', payload: hintId });
  };

  const clearAllHints = () => {
    dispatch({ type: 'CLEAR_HINTS' });
  };

  const trackInteraction = (interaction: GuidanceInteraction) => {
    dispatch({ type: 'ADD_INTERACTION', payload: interaction });
  };

  const completeStep = (stepId: string) => {
    dispatch({ type: 'COMPLETE_STEP', payload: stepId });
  };

  const setGuidanceFlow = (flowId: string | null) => {
    dispatch({ type: 'SET_GUIDANCE_FLOW', payload: flowId });
  };

  const setGuidanceActive = (active: boolean) => {
    dispatch({ type: 'SET_GUIDANCE_ACTIVE', payload: active });
  };

  const updateProgress = (flow: string, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { flow, progress } });
  };

  const resetGuidance = () => {
    dispatch({ type: 'RESET_GUIDANCE' });
  };

  return {
    setPreferences,
    showTooltip,
    hideTooltip,
    addHint,
    removeHint,
    clearAllHints,
    trackInteraction,
    completeStep,
    setGuidanceFlow,
    setGuidanceActive,
    updateProgress,
    resetGuidance,
  };
};

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { GamePhase } from '~/types/game-state';
import type { 
  LayoutState, 
  LayoutMode, 
  LayoutPreferences, 
  GameLayoutContextValue 
} from '~/types/game-layout';
import { 
  createInitialLayoutState,
  updateLayoutForScreenSize,
  getPhaseLayoutConfig,
  validateLayoutState,
  loadLayoutPreferences,
  saveLayoutPreferences,
  debounce
} from '~/lib/game-layout-utils';

/**
 * Game Layout Context
 * 
 * Provides centralized layout state management for the game interface,
 * handling responsive design, sidebar state, and layout preferences.
 */

// Layout actions
type LayoutAction = 
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_LAYOUT_MODE'; payload: LayoutMode }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'UPDATE_SCREEN_SIZE'; payload: { width: number; height: number } }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<LayoutPreferences> }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'UPDATE_LAYOUT'; payload: Partial<LayoutState> }
  | { type: 'RESET_LAYOUT' };

// Layout reducer
function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload
      };
    
    case 'SET_LAYOUT_MODE':
      return {
        ...state,
        layoutMode: action.payload,
        // Auto-close sidebar on mobile
        sidebarOpen: action.payload === 'mobile' ? false : state.sidebarOpen
      };
    
    case 'SET_PHASE':
      const phaseConfig = getPhaseLayoutConfig(action.payload);
      return {
        ...state,
        currentPhase: action.payload,
        ...phaseConfig
      };
    
    case 'UPDATE_SCREEN_SIZE':
      return updateLayoutForScreenSize(state, action.payload.width, action.payload.height);
    
    case 'UPDATE_PREFERENCES':
      const updatedPreferences = { ...state.preferences, ...action.payload };
      return {
        ...state,
        preferences: updatedPreferences
      };
    
    case 'SET_FULLSCREEN':
      return {
        ...state,
        isFullscreen: action.payload
      };
    
    case 'UPDATE_LAYOUT':
      const updatedState = { ...state, ...action.payload };
      return validateLayoutState(updatedState) ? updatedState : state;
    
    case 'RESET_LAYOUT':
      return createInitialLayoutState(state.currentPhase);
    
    default:
      return state;
  }
}

// Context
const GameLayoutContext = createContext<GameLayoutContextValue | undefined>(undefined);

// Provider props
interface GameLayoutProviderProps {
  children: React.ReactNode;
  initialPhase?: GamePhase;
  initialLayout?: Partial<LayoutState>;
}

// Provider component
export function GameLayoutProvider({ 
  children, 
  initialPhase = 'lobby',
  initialLayout = {}
}: GameLayoutProviderProps) {
  // Load preferences from localStorage
  const loadedPreferences = loadLayoutPreferences();
  
  // Create initial state
  const initialState = createInitialLayoutState(initialPhase, {
    preferences: loadedPreferences,
    ...initialLayout
  });
  
  const [layout, dispatch] = useReducer(layoutReducer, initialState);

  // Handle screen resize
  const handleResize = useCallback(() => {
    if (typeof window !== 'undefined') {
      dispatch({
        type: 'UPDATE_SCREEN_SIZE',
        payload: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    }
  }, []);

  // Debounced resize handler
  const debouncedResize = useCallback(
    debounce(handleResize, 250),
    [handleResize]
  );

  // Set up resize listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedResize);
      window.addEventListener('orientationchange', debouncedResize);
      
      return () => {
        window.removeEventListener('resize', debouncedResize);
        window.removeEventListener('orientationchange', debouncedResize);
      };
    }
  }, [debouncedResize]);

  // Save preferences when they change
  useEffect(() => {
    saveLayoutPreferences(layout.preferences);
  }, [layout.preferences]);

  // Context value
  const contextValue: GameLayoutContextValue = {
    layout,
    
    updateLayout: useCallback((updates: Partial<LayoutState>) => {
      dispatch({ type: 'UPDATE_LAYOUT', payload: updates });
    }, []),
    
    toggleSidebar: useCallback(() => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, []),
    
    setLayoutMode: useCallback((mode: LayoutMode) => {
      dispatch({ type: 'SET_LAYOUT_MODE', payload: mode });
    }, []),
    
    updatePreferences: useCallback((preferences: Partial<LayoutPreferences>) => {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    }, []),
    
    resetLayout: useCallback(() => {
      dispatch({ type: 'RESET_LAYOUT' });
    }, [])
  };

  return (
    <GameLayoutContext.Provider value={contextValue}>
      {children}
    </GameLayoutContext.Provider>
  );
}

// Hook to use layout context
export function useGameLayout(): GameLayoutContextValue {
  const context = useContext(GameLayoutContext);
  if (context === undefined) {
    throw new Error('useGameLayout must be used within a GameLayoutProvider');
  }
  return context;
}

// Hook to use layout state only
export function useLayoutState(): LayoutState {
  const { layout } = useGameLayout();
  return layout;
}

// Hook to use layout actions only
export function useLayoutActions() {
  const { updateLayout, toggleSidebar, setLayoutMode, updatePreferences, resetLayout } = useGameLayout();
  return {
    updateLayout,
    toggleSidebar,
    setLayoutMode,
    updatePreferences,
    resetLayout
  };
}

// Hook for responsive behavior
export function useResponsiveLayout() {
  const { layout } = useGameLayout();
  
  return {
    isMobile: layout.isMobile,
    isTablet: layout.layoutMode === 'tablet',
    isDesktop: layout.layoutMode === 'desktop',
    screenSize: layout.screenSize,
    orientation: layout.orientation,
    sidebarOpen: layout.sidebarOpen,
    isFullscreen: layout.isFullscreen
  };
}

// Hook for layout preferences
export function useLayoutPreferences() {
  const { layout, updatePreferences } = useGameLayout();
  
  return {
    preferences: layout.preferences,
    updatePreferences
  };
}

// Export context for advanced usage
export { GameLayoutContext };

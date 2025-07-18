'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { 
  UnifiedGameState, 
  StateConflict, 
  OptimisticUpdate, 
  GameStateError,
  SyncStatus,
  UseUnifiedGameStateReturn
} from '~/types/unified-game-state';

/**
 * Unified Game State Context
 * 
 * Provides centralized state management for all game features
 * with real-time synchronization and conflict resolution.
 */

interface UnifiedGameStateContextType {
  state: UnifiedGameState | null;
  isLoading: boolean;
  error: GameStateError | null;
  syncStatus: SyncStatus;
  conflicts: StateConflict[];
  pendingUpdates: OptimisticUpdate[];
  dispatch: (action: GameStateAction) => void;
}

// State management actions
export type GameStateAction =
  | { type: 'SET_STATE'; payload: UnifiedGameState }
  | { type: 'UPDATE_STATE'; payload: Partial<UnifiedGameState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: GameStateError | null }
  | { type: 'SET_SYNC_STATUS'; payload: SyncStatus }
  | { type: 'ADD_CONFLICT'; payload: StateConflict }
  | { type: 'REMOVE_CONFLICT'; payload: string }
  | { type: 'ADD_OPTIMISTIC_UPDATE'; payload: OptimisticUpdate }
  | { type: 'REMOVE_OPTIMISTIC_UPDATE'; payload: string }
  | { type: 'UPDATE_OPTIMISTIC_UPDATE'; payload: { id: string; update: Partial<OptimisticUpdate> } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: UnifiedGameStateContextType = {
  state: null,
  isLoading: false,
  error: null,
  syncStatus: 'out_of_sync',
  conflicts: [],
  pendingUpdates: [],
  dispatch: () => {}
};

// Context creation
const UnifiedGameStateContext = createContext<UnifiedGameStateContextType>(initialState);

// State reducer
function gameStateReducer(
  state: UnifiedGameStateContextType,
  action: GameStateAction
): UnifiedGameStateContextType {
  switch (action.type) {
    case 'SET_STATE':
      return {
        ...state,
        state: action.payload,
        isLoading: false,
        error: null
      };
      
    case 'UPDATE_STATE':
      if (!state.state) return state;
      return {
        ...state,
        state: {
          ...state.state,
          ...action.payload,
          timestamp: Date.now(),
          version: state.state.version + 1
        }
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload
      };
      
    case 'ADD_CONFLICT':
      return {
        ...state,
        conflicts: [...state.conflicts, action.payload]
      };
      
    case 'REMOVE_CONFLICT':
      return {
        ...state,
        conflicts: state.conflicts.filter(conflict => conflict.id !== action.payload)
      };
      
    case 'ADD_OPTIMISTIC_UPDATE':
      return {
        ...state,
        pendingUpdates: [...state.pendingUpdates, action.payload]
      };
      
    case 'REMOVE_OPTIMISTIC_UPDATE':
      return {
        ...state,
        pendingUpdates: state.pendingUpdates.filter(update => update.id !== action.payload)
      };
      
    case 'UPDATE_OPTIMISTIC_UPDATE':
      return {
        ...state,
        pendingUpdates: state.pendingUpdates.map(update =>
          update.id === action.payload.id
            ? { ...update, ...action.payload.update }
            : update
        )
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
      
    case 'RESET_STATE':
      return {
        ...initialState,
        dispatch: state.dispatch
      };
      
    default:
      return state;
  }
}

// Context provider props
interface UnifiedGameStateProviderProps {
  children: ReactNode;
  roomCode: string;
  playerId: string;
  initialState?: UnifiedGameState;
}

// Context provider component
export function UnifiedGameStateProvider({
  children,
  roomCode,
  playerId,
  initialState
}: UnifiedGameStateProviderProps) {
  const [state, dispatch] = useReducer(gameStateReducer, {
    ...initialState,
    state: initialState || null,
    isLoading: false,
    error: null,
    syncStatus: 'out_of_sync' as SyncStatus,
    conflicts: [],
    pendingUpdates: [],
    dispatch: () => {}
  });

  // Initialize state with provided initial state
  useEffect(() => {
    if (initialState) {
      dispatch({ type: 'SET_STATE', payload: initialState });
    }
  }, [initialState]);

  // Provide context value
  const contextValue: UnifiedGameStateContextType = {
    ...state,
    dispatch
  };

  return (
    <UnifiedGameStateContext.Provider value={contextValue}>
      {children}
    </UnifiedGameStateContext.Provider>
  );
}

// Custom hook for accessing context
export function useUnifiedGameStateContext(): UnifiedGameStateContextType {
  const context = useContext(UnifiedGameStateContext);
  if (!context) {
    throw new Error('useUnifiedGameStateContext must be used within a UnifiedGameStateProvider');
  }
  return context;
}

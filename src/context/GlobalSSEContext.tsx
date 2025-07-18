'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { api } from '~/trpc/react';
import type { RealTimeEvent } from '~/types/real-time-sync';

/**
 * Global SSE Context
 * 
 * Provides centralized SSE subscription management for real-time updates.
 * This ensures only one SSE connection per room instead of multiple connections
 * from different components.
 */

interface RoomState {
  room: any;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface ConnectionState {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  isConnected: boolean;
  retryCount?: number;
  lastError?: string;
}

interface RoomSubscription {
  roomCode: string;
  playerId: string;
  playerName: string;
  subscribers: Set<string>; // Component IDs that subscribed to this room
  state: RoomState;
  connectionState: ConnectionState;
}

interface GlobalSSEContextType {
  // State
  subscriptions: Map<string, RoomSubscription>;
  
  // Actions
  subscribeToRoom: (roomCode: string, playerId: string, playerName: string, subscriberId: string) => void;
  unsubscribeFromRoom: (roomCode: string, subscriberId: string) => void;
  
  // Getters
  getRoomState: (roomCode: string) => RoomState | null;
  getConnectionState: (roomCode: string) => ConnectionState | null;
  
  // Real-time actions
  sendEvent: (roomCode: string, eventType: string, payload: any) => Promise<void>;
}

// State management actions
type GlobalSSEAction =
  | { type: 'ADD_SUBSCRIPTION'; payload: { roomCode: string; playerId: string; playerName: string; subscriberId: string } }
  | { type: 'REMOVE_SUBSCRIPTION'; payload: { roomCode: string; subscriberId: string } }
  | { type: 'UPDATE_ROOM_STATE'; payload: { roomCode: string; state: Partial<RoomState> } }
  | { type: 'UPDATE_CONNECTION_STATE'; payload: { roomCode: string; connectionState: Partial<ConnectionState> } }
  | { type: 'REMOVE_ROOM'; payload: { roomCode: string } };

// Initial state
const initialState: { subscriptions: Map<string, RoomSubscription> } = {
  subscriptions: new Map(),
};

// Context creation
const GlobalSSEContext = createContext<GlobalSSEContextType | null>(null);

// State reducer
function globalSSEReducer(
  state: { subscriptions: Map<string, RoomSubscription> },
  action: GlobalSSEAction
): { subscriptions: Map<string, RoomSubscription> } {
  const newSubscriptions = new Map(state.subscriptions);
  
  switch (action.type) {
    case 'ADD_SUBSCRIPTION': {
      const { roomCode, playerId, playerName, subscriberId } = action.payload;
      
      if (newSubscriptions.has(roomCode)) {
        const existing = newSubscriptions.get(roomCode)!;
        existing.subscribers.add(subscriberId);
        newSubscriptions.set(roomCode, existing);
      } else {
        newSubscriptions.set(roomCode, {
          roomCode,
          playerId,
          playerName,
          subscribers: new Set([subscriberId]),
          state: {
            room: null,
            isLoading: true,
            error: null,
            lastUpdated: null,
          },
          connectionState: {
            status: 'disconnected',
            isConnected: false,
          },
        });
      }
      
      return { subscriptions: newSubscriptions };
    }
    
    case 'REMOVE_SUBSCRIPTION': {
      const { roomCode, subscriberId } = action.payload;
      
      if (newSubscriptions.has(roomCode)) {
        const existing = newSubscriptions.get(roomCode)!;
        existing.subscribers.delete(subscriberId);
        
        if (existing.subscribers.size === 0) {
          newSubscriptions.delete(roomCode);
        } else {
          newSubscriptions.set(roomCode, existing);
        }
      }
      
      return { subscriptions: newSubscriptions };
    }
    
    case 'UPDATE_ROOM_STATE': {
      const { roomCode, state: stateUpdate } = action.payload;
      
      if (newSubscriptions.has(roomCode)) {
        const existing = newSubscriptions.get(roomCode)!;
        newSubscriptions.set(roomCode, {
          ...existing,
          state: {
            ...existing.state,
            ...stateUpdate,
          },
        });
      }
      
      return { subscriptions: newSubscriptions };
    }
    
    case 'UPDATE_CONNECTION_STATE': {
      const { roomCode, connectionState } = action.payload;
      
      if (newSubscriptions.has(roomCode)) {
        const existing = newSubscriptions.get(roomCode)!;
        newSubscriptions.set(roomCode, {
          ...existing,
          connectionState: {
            ...existing.connectionState,
            ...connectionState,
          },
        });
      }
      
      return { subscriptions: newSubscriptions };
    }
    
    case 'REMOVE_ROOM': {
      const { roomCode } = action.payload;
      newSubscriptions.delete(roomCode);
      return { subscriptions: newSubscriptions };
    }
    
    default:
      return state;
  }
}

// Individual subscription component for each room
function RoomSubscription({ roomCode, playerId, playerName, onEvent, onError }: {
  roomCode: string;
  playerId: string;
  playerName: string;
  onEvent: (event: RealTimeEvent) => void;
  onError: (error: any) => void;
}) {
  // tRPC subscription
  api.subscriptions.subscribeToRoom.useSubscription(
    { roomCode, playerId, playerName },
    {
      onData: onEvent,
      onError,
    }
  );
  
  return null;
}

// Context provider component
export function GlobalSSEProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalSSEReducer, initialState);
  
  // tRPC mutations for sending events
  const updateReadyMutation = api.room.updatePlayerReady.useMutation();
  const submitVoteMutation = api.room.submitVote.useMutation();
  const submitMissionTeamMutation = api.room.submitMissionTeam.useMutation();
  const submitMissionVoteMutation = api.room.submitMissionVote.useMutation();
  
  // Event handler for real-time events
  const handleRealtimeEvent = useCallback((roomCode: string, event: RealTimeEvent) => {
    console.log(`[Global SSE] Received event for room ${roomCode}:`, event.type, event.payload);
    
    switch (event.type) {
      case 'room_state_sync':
        dispatch({
          type: 'UPDATE_ROOM_STATE',
          payload: {
            roomCode,
            state: {
              room: event.payload.room,
              isLoading: false,
              error: null,
              lastUpdated: new Date(),
            },
          },
        });
        
        // Update connection state to connected
        dispatch({
          type: 'UPDATE_CONNECTION_STATE',
          payload: {
            roomCode,
            connectionState: { status: 'connected', isConnected: true },
          },
        });
        break;
      
      case 'player_joined':
        dispatch({
          type: 'UPDATE_ROOM_STATE',
          payload: {
            roomCode,
            state: {
              room: state.subscriptions.get(roomCode)?.state.room ? {
                ...state.subscriptions.get(roomCode)!.state.room,
                players: [
                  ...state.subscriptions.get(roomCode)!.state.room.players.filter((p: any) => p.id !== event.payload.playerId),
                  {
                    id: event.payload.playerId,
                    name: event.payload.playerName,
                    isOnline: true,
                  },
                ],
              } : null,
              lastUpdated: new Date(),
            },
          },
        });
        break;
      
      case 'player_left':
        dispatch({
          type: 'UPDATE_ROOM_STATE',
          payload: {
            roomCode,
            state: {
              room: state.subscriptions.get(roomCode)?.state.room ? {
                ...state.subscriptions.get(roomCode)!.state.room,
                players: state.subscriptions.get(roomCode)!.state.room.players.filter((p: any) => p.id !== event.payload.playerId),
              } : null,
              lastUpdated: new Date(),
            },
          },
        });
        break;
      
      case 'player_ready_changed':
        dispatch({
          type: 'UPDATE_ROOM_STATE',
          payload: {
            roomCode,
            state: {
              room: state.subscriptions.get(roomCode)?.state.room ? {
                ...state.subscriptions.get(roomCode)!.state.room,
                players: state.subscriptions.get(roomCode)!.state.room.players.map((p: any) =>
                  p.id === event.payload.playerId ? { ...p, isReady: event.payload.isReady } : p
                ),
              } : null,
              lastUpdated: new Date(),
            },
          },
        });
        break;
      
      case 'game_phase_changed':
        dispatch({
          type: 'UPDATE_ROOM_STATE',
          payload: {
            roomCode,
            state: {
              room: state.subscriptions.get(roomCode)?.state.room ? {
                ...state.subscriptions.get(roomCode)!.state.room,
                phase: event.payload.newPhase,
                gameState: event.payload.gameState,
              } : null,
              lastUpdated: new Date(),
            },
          },
        });
        break;
      
      case 'player_connected':
      case 'player_disconnected':
        dispatch({
          type: 'UPDATE_ROOM_STATE',
          payload: {
            roomCode,
            state: {
              room: state.subscriptions.get(roomCode)?.state.room ? {
                ...state.subscriptions.get(roomCode)!.state.room,
                players: state.subscriptions.get(roomCode)!.state.room.players.map((p: any) =>
                  p.id === event.payload.playerId 
                    ? { ...p, isOnline: event.type === 'player_connected' }
                    : p
                ),
              } : null,
              lastUpdated: new Date(),
            },
          },
        });
        break;
      
      case 'host_transfer':
        dispatch({
          type: 'UPDATE_ROOM_STATE',
          payload: {
            roomCode,
            state: {
              room: state.subscriptions.get(roomCode)?.state.room ? {
                ...state.subscriptions.get(roomCode)!.state.room,
                hostId: event.payload.newHostId,
                players: state.subscriptions.get(roomCode)!.state.room.players.map((p: any) => ({
                  ...p,
                  isHost: p.id === event.payload.newHostId,
                })),
              } : null,
              lastUpdated: new Date(),
            },
          },
        });
        break;
      
      default:
        console.log(`[Global SSE] Unhandled event type: ${event.type}`);
    }
  }, [state.subscriptions]);
  
  // Handle subscription errors
  const handleSubscriptionError = useCallback((roomCode: string, error: any) => {
    console.error(`[Global SSE] Subscription error for room ${roomCode}:`, error);
    
    dispatch({
      type: 'UPDATE_CONNECTION_STATE',
      payload: {
        roomCode,
        connectionState: { 
          status: 'error', 
          isConnected: false, 
          lastError: error.message 
        },
      },
    });
    
    dispatch({
      type: 'UPDATE_ROOM_STATE',
      payload: {
        roomCode,
        state: { 
          error: error.message, 
          isLoading: false 
        },
      },
    });
  }, []);
  
  // Context actions
  const subscribeToRoom = useCallback((roomCode: string, playerId: string, playerName: string, subscriberId: string) => {
    console.log(`[Global SSE] Adding subscriber ${subscriberId} to room ${roomCode}`);
    dispatch({
      type: 'ADD_SUBSCRIPTION',
      payload: { roomCode, playerId, playerName, subscriberId },
    });
  }, []);
  
  const unsubscribeFromRoom = useCallback((roomCode: string, subscriberId: string) => {
    console.log(`[Global SSE] Removing subscriber ${subscriberId} from room ${roomCode}`);
    dispatch({
      type: 'REMOVE_SUBSCRIPTION',
      payload: { roomCode, subscriberId },
    });
  }, []);
  
  const getRoomState = useCallback((roomCode: string): RoomState | null => {
    return state.subscriptions.get(roomCode)?.state || null;
  }, [state.subscriptions]);
  
  const getConnectionState = useCallback((roomCode: string): ConnectionState | null => {
    return state.subscriptions.get(roomCode)?.connectionState || null;
  }, [state.subscriptions]);
  
  const sendEvent = useCallback(async (roomCode: string, eventType: string, payload: any) => {
    const subscription = state.subscriptions.get(roomCode);
    if (!subscription) {
      throw new Error(`No subscription found for room ${roomCode}`);
    }
    
    try {
      // Map event types to appropriate mutations
      switch (eventType) {
        case 'player_ready_changed':
          await updateReadyMutation.mutateAsync({
            playerId: subscription.playerId,
            isReady: payload.isReady,
          });
          break;
        case 'vote_cast':
          await submitVoteMutation.mutateAsync({
            roomId: subscription.state.room?.id || '',
            playerId: subscription.playerId,
            choice: payload.choice,
          });
          break;
        case 'mission_team_selected':
          await submitMissionTeamMutation.mutateAsync({
            roomId: subscription.state.room?.id || '',
            playerId: subscription.playerId,
            teamIds: payload.selectedPlayers,
          });
          break;
        case 'mission_vote_cast':
          await submitMissionVoteMutation.mutateAsync({
            roomId: subscription.state.room?.id || '',
            playerId: subscription.playerId,
            vote: payload.choice,
          });
          break;
        default:
          console.warn(`[Global SSE] Unknown event type: ${eventType}`);
      }
    } catch (error) {
      console.error(`[Global SSE] Failed to send event ${eventType} to room ${roomCode}:`, error);
      throw error;
    }
  }, [state.subscriptions, updateReadyMutation, submitVoteMutation, submitMissionTeamMutation, submitMissionVoteMutation]);
  
  const contextValue: GlobalSSEContextType = {
    subscriptions: state.subscriptions,
    subscribeToRoom,
    unsubscribeFromRoom,
    getRoomState,
    getConnectionState,
    sendEvent,
  };
  
  return (
    <GlobalSSEContext.Provider value={contextValue}>
      {children}
      {/* Render subscription components for each active room */}
      {Array.from(state.subscriptions.entries()).map(([roomCode, subscription]) => (
        <RoomSubscription
          key={roomCode}
          roomCode={roomCode}
          playerId={subscription.playerId}
          playerName={subscription.playerName}
          onEvent={(event) => handleRealtimeEvent(roomCode, event)}
          onError={(error) => handleSubscriptionError(roomCode, error)}
        />
      ))}
    </GlobalSSEContext.Provider>
  );
}

// Custom hook for accessing the global SSE context
export function useGlobalSSE(): GlobalSSEContextType {
  const context = useContext(GlobalSSEContext);
  if (!context) {
    throw new Error('useGlobalSSE must be used within a GlobalSSEProvider');
  }
  return context;
}

// Custom hook for subscribing to a specific room
export function useRoomSSE(roomCode: string, playerId: string, playerName: string, enabled = true) {
  const { subscribeToRoom, unsubscribeFromRoom, getRoomState, getConnectionState } = useGlobalSSE();
  const subscriberId = useRef(`${roomCode}-${playerId}-${Math.random().toString(36).substr(2, 9)}`);
  
  useEffect(() => {
    if (enabled && roomCode && playerId && playerName) {
      subscribeToRoom(roomCode, playerId, playerName, subscriberId.current);
      
      return () => {
        unsubscribeFromRoom(roomCode, subscriberId.current);
      };
    }
  }, [enabled, roomCode, playerId, playerName, subscribeToRoom, unsubscribeFromRoom]);
  
  const roomState = getRoomState(roomCode);
  const connectionState = getConnectionState(roomCode);
  
  return {
    roomState: roomState || { room: null, isLoading: true, error: null, lastUpdated: null },
    connectionState: connectionState || { status: 'disconnected' as const, isConnected: false },
    isConnected: connectionState?.isConnected || false,
  };
}

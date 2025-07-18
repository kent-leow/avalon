/**
 * SSE-based Real-time Room Hook
 * Replaces WebSocket-based real-time communication with tRPC subscriptions
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '~/trpc/react';
import type { RealTimeEvent } from '~/types/real-time-sync';

interface UseRealtimeRoomOptions {
  roomCode: string;
  playerId: string;
  playerName: string;
  enabled?: boolean;
}

interface RoomState {
  room: {
    id: string;
    roomCode: string;
    phase: string;
    players: Array<{
      id: string;
      name: string;
      isHost: boolean;
      isReady: boolean;
      isOnline: boolean;
    }>;
    settings: any;
    gameState: any;
  } | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface ConnectionState {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  isConnected: boolean;
}

export function useSSERealtimeRoom(options: UseRealtimeRoomOptions) {
  const { roomCode, playerId, playerName, enabled = true } = options;
  
  const [roomState, setRoomState] = useState<RoomState>({
    room: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    isConnected: false,
  });

  const [votingState, setVotingState] = useState<any>(null);
  const [gameProgress, setGameProgress] = useState<any>(null);

  // tRPC subscription to room events
  const { data, error: subscriptionError } = api.subscriptions.subscribeToRoom.useSubscription(
    {
      roomCode,
      playerId,
      playerName,
    },
    {
      enabled,
      onData: (event: RealTimeEvent) => {
        handleRealtimeEvent(event);
      },
      onError: (error) => {
        console.error('[SSE] Subscription error:', error);
        setConnectionState({
          status: 'error',
          isConnected: false,
        });
        setRoomState(prev => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      },
    }
  );

  const handleRealtimeEvent = useCallback((event: RealTimeEvent) => {
    console.log('[SSE] Received event:', event.type, event.payload);

    switch (event.type) {
      case 'room_state_sync':
        setRoomState({
          room: event.payload.room,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
        break;

      case 'player_joined':
        setRoomState(prev => {
          if (!prev.room) return prev;
          
          const existingPlayer = prev.room.players.find(p => p.id === event.payload.playerId);
          if (existingPlayer) return prev;

          return {
            ...prev,
            room: {
              ...prev.room,
              players: [
                ...prev.room.players,
                {
                  id: event.payload.playerId,
                  name: event.payload.playerName,
                  isHost: false,
                  isReady: false,
                  isOnline: true,
                }
              ],
            },
            lastUpdated: new Date(),
          };
        });
        break;

      case 'player_left':
        setRoomState(prev => {
          if (!prev.room) return prev;
          
          return {
            ...prev,
            room: {
              ...prev.room,
              players: prev.room.players.filter(p => p.id !== event.payload.playerId),
            },
            lastUpdated: new Date(),
          };
        });
        break;

      case 'player_ready_changed':
        setRoomState(prev => {
          if (!prev.room) return prev;
          
          return {
            ...prev,
            room: {
              ...prev.room,
              players: prev.room.players.map(p => 
                p.id === event.payload.playerId 
                  ? { ...p, isReady: event.payload.isReady }
                  : p
              ),
            },
            lastUpdated: new Date(),
          };
        });
        break;

      case 'game_phase_changed':
        setRoomState(prev => {
          if (!prev.room) return prev;
          
          return {
            ...prev,
            room: {
              ...prev.room,
              phase: event.payload.phase || event.payload.newPhase,
              gameState: event.payload.gameState,
            },
            lastUpdated: new Date(),
          };
        });
        break;

      case 'voting_progress_updated':
        setVotingState((prev: any) => ({
          ...prev,
          progress: event.payload,
          lastUpdated: new Date(),
        }));
        break;

      case 'vote_cast':
        setVotingState((prev: any) => ({
          ...prev,
          votes: [...(prev?.votes || []), event.payload],
          lastUpdated: new Date(),
        }));
        break;

      case 'game_state_updated':
        setRoomState(prev => {
          if (!prev.room) return prev;
          
          return {
            ...prev,
            room: {
              ...prev.room,
              gameState: event.payload.gameState,
            },
            lastUpdated: new Date(),
          };
        });
        break;

      case 'settings_changed':
        setRoomState(prev => {
          if (!prev.room) return prev;
          
          return {
            ...prev,
            room: {
              ...prev.room,
              settings: event.payload.settings,
            },
            lastUpdated: new Date(),
          };
        });
        break;

      case 'player_connected':
      case 'player_disconnected':
        setRoomState(prev => {
          if (!prev.room) return prev;
          
          return {
            ...prev,
            room: {
              ...prev.room,
              players: prev.room.players.map(p => 
                p.id === event.payload.playerId 
                  ? { ...p, isOnline: event.type === 'player_connected' }
                  : p
              ),
            },
            lastUpdated: new Date(),
          };
        });
        break;

      default:
        console.log('[SSE] Unhandled event type:', event.type);
    }
  }, []);

  // Mutations for sending events
  const updateReadyMutation = api.room.updatePlayerReady.useMutation();
  const submitVoteMutation = api.room.submitVote.useMutation();
  const submitMissionTeamMutation = api.room.submitMissionTeam.useMutation();
  const submitMissionVoteMutation = api.room.submitMissionVote.useMutation();

  const sendEvent = useCallback(async (eventType: string, payload: any) => {
    try {
      // Map event types to appropriate mutations
      switch (eventType) {
        case 'player_ready_changed':
          await updateReadyMutation.mutateAsync({
            playerId,
            isReady: payload.isReady,
          });
          break;
        case 'vote_cast':
          await submitVoteMutation.mutateAsync({
            roomId: roomState.room?.id || '',
            playerId,
            choice: payload.choice,
          });
          break;
        case 'mission_team_selected':
          await submitMissionTeamMutation.mutateAsync({
            roomId: roomState.room?.id || '',
            playerId,
            teamIds: payload.selectedPlayers,
          });
          break;
        case 'mission_vote_cast':
          await submitMissionVoteMutation.mutateAsync({
            roomId: roomState.room?.id || '',
            playerId,
            vote: payload.choice,
          });
          break;
        default:
          console.warn(`[SSE] Unknown event type: ${eventType}`);
      }
    } catch (error) {
      console.error('[SSE] Failed to send event:', error);
    }
  }, [roomState.room?.id, playerId, updateReadyMutation, submitVoteMutation, submitMissionTeamMutation, submitMissionVoteMutation]);

  // Actions
  const updatePlayerReady = useCallback(async (isReady: boolean) => {
    await sendEvent('player_ready_changed', { playerId, isReady });
  }, [sendEvent, playerId]);

  const castVote = useCallback(async (choice: 'approve' | 'reject') => {
    await sendEvent('vote_cast', { 
      playerId, 
      choice,
      timestamp: new Date(),
    });
  }, [sendEvent, playerId]);

  const selectMissionTeam = useCallback(async (selectedPlayers: string[]) => {
    await sendEvent('mission_team_selected', { 
      playerId, 
      selectedPlayers,
      timestamp: new Date(),
    });
  }, [sendEvent, playerId]);

  // Connection control
  const connect = useCallback(() => {
    // Connection is managed by the subscription
    console.log('[SSE] Connect requested - managed by subscription');
  }, []);

  const disconnect = useCallback(() => {
    // Disconnection is managed by the subscription
    console.log('[SSE] Disconnect requested - managed by subscription');
  }, []);

  return {
    // State
    roomState,
    votingState,
    gameProgress,
    
    // Connection info
    isConnected: connectionState.isConnected,
    connectionState,
    
    // Actions
    updatePlayerReady,
    castVote,
    selectMissionTeam,
    
    // Raw event sending (for advanced usage)
    sendEvent,
    
    // Connection control
    connect,
    disconnect,
  };
}

// Simplified hook for basic room info without full real-time features
export function useBasicRoomInfo(roomCode: string) {
  const [roomData, setRoomData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fallback to API call if real-time is not available
    const fetchRoomInfo = async () => {
      try {
        const response = await fetch(`/api/trpc/room.getRoomInfo?input=${encodeURIComponent(JSON.stringify({ roomCode }))}`);
        if (!response.ok) throw new Error('Failed to fetch room info');
        
        const data = await response.json();
        setRoomData(data.result?.data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    fetchRoomInfo();
  }, [roomCode]);

  return { data: roomData, isLoading, error };
}

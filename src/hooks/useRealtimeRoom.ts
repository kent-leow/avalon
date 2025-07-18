/**
 * Enhanced Real-time Hook with WebSocket Integration
 * Replaces polling with WebSocket-based real-time communication
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRealTimeSync } from './useRealTimeSync';
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

export function useRealtimeRoom(options: UseRealtimeRoomOptions) {
  const { roomCode, playerId, playerName, enabled = true } = options;
  
  const [roomState, setRoomState] = useState<RoomState>({
    room: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const [votingState, setVotingState] = useState<any>(null);
  const [gameProgress, setGameProgress] = useState<any>(null);

  const {
    connectionState,
    isConnected,
    sendEvent,
    connect,
    disconnect,
  } = useRealTimeSync({
    roomCode,
    playerId,
    playerName,
    autoConnect: enabled,
    onEvent: handleRealtimeEvent,
    onConnectionChange: (state) => {
      console.log('[RealTime] Connection state changed:', state.status);
    },
    onError: (error) => {
      setRoomState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    },
  });

  function handleRealtimeEvent(event: RealTimeEvent) {
    console.log('[RealTime] Received event:', event.type);

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
              phase: event.payload.phase,
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

      default:
        console.log('[RealTime] Unhandled event type:', event.type);
    }
  }

  // Actions
  const updatePlayerReady = useCallback((isReady: boolean) => {
    sendEvent({
      type: 'player_ready_changed',
      payload: { playerId, isReady },
      playerId,
      roomCode,
      version: 1,
    });
  }, [sendEvent, playerId, roomCode]);

  const castVote = useCallback((choice: 'approve' | 'reject') => {
    sendEvent({
      type: 'vote_cast',
      payload: { 
        playerId, 
        choice,
        timestamp: new Date(),
      },
      playerId,
      roomCode,
      version: 1,
    });
  }, [sendEvent, playerId, roomCode]);

  const selectMissionTeam = useCallback((selectedPlayers: string[]) => {
    sendEvent({
      type: 'mission_team_selected',
      payload: { 
        playerId, 
        selectedPlayers,
        timestamp: new Date(),
      },
      playerId,
      roomCode,
      version: 1,
    });
  }, [sendEvent, playerId, roomCode]);

  // Connect/disconnect based on enabled state
  useEffect(() => {
    if (enabled && !isConnected) {
      connect();
    } else if (!enabled && isConnected) {
      disconnect();
    }
  }, [enabled, isConnected, connect, disconnect]);

  return {
    // State
    roomState,
    votingState,
    gameProgress,
    
    // Connection info
    isConnected,
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

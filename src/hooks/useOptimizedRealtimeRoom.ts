/**
 * Optimized Real-time Room Hook
 * 
 * Uses the Global SSE Context for centralized real-time subscriptions.
 * This replaces the individual SSE subscriptions with a single global subscription per room.
 */

'use client';

import { useCallback } from 'react';
import { useRoomSSE, useGlobalSSE } from '~/context/GlobalSSEContext';
import { api } from '~/trpc/react';

interface UseOptimizedRealtimeRoomOptions {
  roomCode: string;
  playerId: string; // This is the sessionId for SSE subscription
  playerName: string;
  enabled?: boolean;
}

interface VotingState {
  isVoting: boolean;
  votingData: any;
  deadline: Date | null;
}

interface GameProgress {
  currentRound: number;
  currentMission: number;
  phase: string;
  progress: any;
}

export function useOptimizedRealtimeRoom(options: UseOptimizedRealtimeRoomOptions) {
  const { roomCode, playerId, playerName, enabled = true } = options;
  
  // Use the global SSE context
  const { roomState, connectionState, isConnected } = useRoomSSE(roomCode, playerId, playerName, enabled);
  const { sendEvent } = useGlobalSSE();
  
  // tRPC mutations for sending events
  const updateReadyMutation = api.room.updatePlayerReady.useMutation();
  const submitVoteMutation = api.room.submitVote.useMutation();
  const submitMissionTeamMutation = api.room.submitMissionTeam.useMutation();
  const submitMissionVoteMutation = api.room.submitMissionVote.useMutation();
  
  // Voting state (derived from room state)
  const votingState: VotingState = {
    isVoting: roomState.room?.phase === 'voting' || false,
    votingData: roomState.room?.gameState?.currentVote || null,
    deadline: roomState.room?.gameState?.votingDeadline ? new Date(roomState.room.gameState.votingDeadline) : null,
  };
  
  // Game progress (derived from room state)
  const gameProgress: GameProgress = {
    currentRound: roomState.room?.gameState?.round || 1,
    currentMission: roomState.room?.gameState?.mission || 1,
    phase: roomState.room?.phase || 'waiting',
    progress: roomState.room?.gameState || null,
  };
  
  // Get the actual database player ID from the room state
  const currentPlayer = roomState.room?.players.find((p: any) => p.sessionId === playerId);
  const databasePlayerId = currentPlayer?.id || '';
  
  // Action handlers
  const updatePlayerReady = useCallback(async (isReady: boolean) => {
    try {
      await updateReadyMutation.mutateAsync({
        playerId: databasePlayerId,
        isReady,
      });
      console.log('[Optimized SSE] Player ready status updated:', isReady);
    } catch (error) {
      console.error('[Optimized SSE] Failed to update player ready status:', error);
      throw error;
    }
  }, [databasePlayerId, updateReadyMutation]);
  
  const castVote = useCallback(async (choice: 'approve' | 'reject') => {
    try {
      await submitVoteMutation.mutateAsync({
        roomId: roomState.room?.id || '',
        playerId: databasePlayerId,
        choice,
      });
      console.log('[Optimized SSE] Vote cast:', choice);
    } catch (error) {
      console.error('[Optimized SSE] Failed to cast vote:', error);
      throw error;
    }
  }, [roomState.room?.id, databasePlayerId, submitVoteMutation]);
  
  const selectMissionTeam = useCallback(async (selectedPlayers: string[]) => {
    try {
      await submitMissionTeamMutation.mutateAsync({
        roomId: roomState.room?.id || '',
        playerId: databasePlayerId,
        teamIds: selectedPlayers,
      });
      console.log('[Optimized SSE] Mission team selected:', selectedPlayers);
    } catch (error) {
      console.error('[Optimized SSE] Failed to select mission team:', error);
      throw error;
    }
  }, [roomState.room?.id, databasePlayerId, submitMissionTeamMutation]);
  
  const castMissionVote = useCallback(async (vote: 'success' | 'failure') => {
    try {
      await submitMissionVoteMutation.mutateAsync({
        roomId: roomState.room?.id || '',
        playerId: databasePlayerId,
        vote,
      });
      console.log('[Optimized SSE] Mission vote cast:', vote);
    } catch (error) {
      console.error('[Optimized SSE] Failed to cast mission vote:', error);
      throw error;
    }
  }, [roomState.room?.id, databasePlayerId, submitMissionVoteMutation]);
  
  // Generic event sender (for advanced usage)
  const sendRawEvent = useCallback(async (eventType: string, payload: any) => {
    try {
      await sendEvent(roomCode, eventType, payload);
      console.log('[Optimized SSE] Raw event sent:', eventType, payload);
    } catch (error) {
      console.error('[Optimized SSE] Failed to send raw event:', error);
      throw error;
    }
  }, [roomCode, sendEvent]);
  
  // Connection control (no-op as it's managed by global context)
  const connect = useCallback(() => {
    console.log('[Optimized SSE] Connect requested - managed by global context');
  }, []);
  
  const disconnect = useCallback(() => {
    console.log('[Optimized SSE] Disconnect requested - managed by global context');
  }, []);
  
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
    castMissionVote,
    
    // Raw event sending (for advanced usage)
    sendEvent: sendRawEvent,
    
    // Connection control (no-op)
    connect,
    disconnect,
  };
}

// Simplified hook for basic room info without full real-time features
export function useBasicRoomInfo(roomCode: string) {
  const { roomState, isConnected } = useRoomSSE(roomCode, '', '', false);
  
  return {
    room: roomState.room,
    isLoading: roomState.isLoading,
    error: roomState.error,
    isConnected,
  };
}

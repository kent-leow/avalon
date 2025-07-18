'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { waitForSession, verifyClientSession } from '~/lib/session-sync';
import { getSession, clearSession, extendSession } from '~/lib/session';
import { useSSERealtimeRoom } from '~/hooks/useSSERealtimeRoom';
import { api } from '~/trpc/react';
import StartGameSection from './StartGameSection';
import LobbySharing from './LobbySharing';
import PlayerManagementSection from './PlayerManagementSection';
import GameSettingsSection from './GameSettingsSection';
import type { PlayerSession } from '~/lib/session';

interface RoomLobbyClientProps {
  roomCode: string;
}

export function RoomLobbyClient({ roomCode }: RoomLobbyClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // tRPC mutation for leaving room
  const leaveRoomMutation = api.room.leaveRoom.useMutation();

  // Use real-time room hook instead of polling
  const {
    roomState,
    isConnected,
    connectionState,
    updatePlayerReady,
  } = useSSERealtimeRoom({
    roomCode,
    playerId: session?.id || '',
    playerName: session?.name || '',
    enabled: !!session && sessionChecked && !timeoutReached,
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if session exists in localStorage
        let currentSession = getSession();
        
        if (!currentSession) {
          // Try to wait for session to be created
          currentSession = await waitForSession(3000);
          
          if (!currentSession) {
            console.log('No session found after waiting, redirecting to home page');
            clearSession(); // Clear any stale session data
            router.push('/');
            return;
          }
        }
        
        // Check if session is for this room
        if (currentSession.roomCode !== roomCode) {
          console.log('Session room mismatch, clearing session and redirecting to join page');
          clearSession(); // Clear the mismatched session
          router.push(`/room/${roomCode}`);
          return;
        }
        
        // Try to verify session with server, but don't block if it fails
        try {
          const isValid = await verifyClientSession(roomCode);
          if (!isValid) {
            console.log('Server session verification failed, but proceeding with client session');
            // Continue with client session - the server might be out of sync
            // This is a fallback to prevent blocking legitimate users
          }
        } catch (error) {
          console.log('Server session verification error, proceeding with client session:', error);
          // Continue with client session
        }
        
        console.log('Using session for lobby access:', currentSession);
        
        setSession(currentSession);
        setSessionChecked(true);
      } catch (error) {
        console.error('Session check failed:', error);
        // Still proceed if we have a local session
        const localSession = getSession();
        if (localSession && localSession.roomCode === roomCode) {
          setSession(localSession);
          setSessionChecked(true);
        } else {
          console.log('No valid session found, clearing session and redirecting to room join page');
          clearSession(); // Clear any stale session data
          router.push(`/room/${roomCode}`);
        }
      }
    };

    checkSession();
  }, [roomCode, router]);

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (sessionChecked) {
      const timeoutId = setTimeout(() => {
        if (!roomState.room && roomState.isLoading) {
          console.log('Room loading timeout reached, likely room does not exist');
          setTimeoutReached(true);
          clearSession();
          router.push('/');
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeoutId);
    }
  }, [sessionChecked, roomState.room, roomState.isLoading, router]);

  // Handle real-time connection errors
  useEffect(() => {
    if (sessionChecked && !isConnected && connectionState.status === 'error') {
      console.log('Real-time connection failed permanently, room likely does not exist');
      
      // If we're getting consistent connection errors and no room data, 
      // the room probably doesn't exist - clear session and redirect
      if (!roomState.room && roomState.error) {
        console.log('Room connection failed with no room data, clearing session and redirecting to home');
        clearSession();
        router.push('/');
        return;
      }
      
      console.log('Real-time connection failed, falling back to API');
      // Could implement fallback polling here if needed
    }
  }, [sessionChecked, isConnected, connectionState.status, roomState.room, roomState.error, router]);

  // Handle subscription errors more aggressively
  useEffect(() => {
    if (sessionChecked && roomState.error) {
      const errorMessage = roomState.error.toLowerCase();
      
      // Check for room not found errors
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        console.log('Room not found error detected, clearing session and redirecting to home');
        clearSession();
        router.push('/');
        return;
      }
      
      // Check for other fatal errors
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        console.log('Room session invalid/expired, clearing session and redirecting to home');
        clearSession();
        router.push('/');
        return;
      }
    }
  }, [sessionChecked, roomState.error, router]);

  // Extend session on successful real-time updates
  useEffect(() => {
    if (roomState.room && !roomState.isLoading) {
      extendSession();
    }
  }, [roomState.room, roomState.isLoading]);

  // Check if current player is host
  const isHost = session && roomState.room?.players?.find((p: any) => p.name === session.name)?.isHost;

  // Additional session validation - check if session belongs to this room
  useEffect(() => {
    if (session && roomState.room) {
      // Check if the session is for this room
      const playerInRoom = roomState.room.players.find((p: any) => p.name === session.name);
      
      if (!playerInRoom) {
        console.log('Session player not found in room, checking if this is a new room...');
        // For newly created rooms, the host might not appear immediately
        // Only redirect if this persists for more than 5 seconds
        const checkTimer = setTimeout(() => {
          const retryPlayerInRoom = roomState.room?.players.find((p: any) => p.name === session.name);
          if (!retryPlayerInRoom) {
            console.log('Session player still not found after extended wait, redirecting to join');
            clearSession();
            router.push(`/room/${roomCode}`);
          }
        }, 5000); // Wait 5 seconds for real-time sync
        
        return () => clearTimeout(checkTimer);
      }
    }
  }, [session, roomState.room, roomCode, router]);

  if (!sessionChecked || (roomState.isLoading && !timeoutReached)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading room...</div>
          {connectionState.status === 'reconnecting' && (
            <div className="text-slate-300 text-sm mt-2">Connecting to real-time updates...</div>
          )}
          {connectionState.status === 'error' && (
            <div className="text-red-400 text-sm mt-2">Connection failed. Retrying...</div>
          )}
        </div>
      </div>
    );
  }

  if (roomState.error || !roomState.room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            {roomState.error ? 'Error loading room' : 'Room not found'}
          </div>
          {roomState.error && (
            <div className="text-red-400 text-sm mb-4 max-w-md">
              {roomState.error}
            </div>
          )}
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/room/${roomCode}`)}
              className="bg-[#3d3d7a] hover:bg-[#4a4a96] text-white px-6 py-2 rounded-lg transition-colors mr-2"
            >
              Try Join Room
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLeaveRoom = async () => {
    try {
      // Only proceed if we have session and room data
      if (!session || !roomState.room) {
        console.log('No session or room data, just clearing session and redirecting');
        clearSession();
        router.push('/');
        return;
      }

      // Find the current player in the room to get their database ID
      const currentPlayer = roomState.room.players.find((p: any) => p.name === session.name);
      if (!currentPlayer) {
        console.log('Current player not found in room, just clearing session and redirecting');
        clearSession();
        router.push('/');
        return;
      }

      // Call the leaveRoom mutation to remove player from database
      await leaveRoomMutation.mutateAsync({
        roomId: roomState.room.id,
        playerId: currentPlayer.id, // Use the database player ID, not session ID
      });

      console.log('Successfully left room, player removed from database');
    } catch (error) {
      console.error('Error leaving room:', error);
      // Continue with cleanup even if the API call fails
    }
    
    try {
      // Clear server session
      await fetch('/api/clear-session', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error clearing server session:', error);
    }
    
    // Clear client session
    clearSession();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
              Room Lobby
            </h1>
            <div className="flex items-center justify-center gap-4">
              <p className="text-lg text-slate-100 opacity-90">
                Room Code: <span className="font-mono text-2xl">{roomCode}</span>
              </p>
              {isHost && (
                <div className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Host
                </div>
              )}
              {/* Connection indicator */}
              <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${
                isConnected 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-yellow-400'
                } ${isConnected ? 'animate-pulse' : ''}`}></div>
                {isConnected ? 'Live' : 'Reconnecting'}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Top Row - Players and Game Start */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Players Section */}
              <div>
                <PlayerManagementSection
                  roomId={roomState.room.id}
                  roomCode={roomCode}
                  players={roomState.room.players.map(p => ({
                    ...p,
                    joinedAt: new Date(),
                    roomId: roomState.room!.id,
                  }))}
                  isHost={isHost ?? false}
                />
              </div>
              
              {/* Game Start Section */}
              <div>
                <StartGameSection
                  roomId={roomState.room.id}
                  roomCode={roomCode}
                />
              </div>
            </div>
            
            {/* Bottom Row - Game Settings (Full Width) */}
            <div>
              <GameSettingsSection
                roomId={roomState.room.id}
                currentSettings={roomState.room.settings}
                isHost={isHost ?? false}
              />
            </div>
          </div>

          {/* Sharing Section */}
          <div className="mt-8">
            <LobbySharing roomCode={roomCode} />
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => router.push(`/room/${roomCode}`)}
              className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Back to Join
            </button>
            <button
              onClick={handleLeaveRoom}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

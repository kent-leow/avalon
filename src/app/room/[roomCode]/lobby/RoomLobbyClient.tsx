'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { waitForSession, verifyClientSession } from '~/lib/session-sync';
import { getSession, clearSession, extendSession } from '~/lib/session';
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if session exists in localStorage
        let currentSession = getSession();
        
        if (!currentSession) {
          // Try to wait for session to be created
          currentSession = await waitForSession(3000);
          
          if (!currentSession) {
            console.log('No session found after waiting, redirecting to join page');
            router.push(`/room/${roomCode}`);
            return;
          }
        }
        
        // Check if session is for this room
        if (currentSession.roomCode !== roomCode) {
          console.log('Session room mismatch, redirecting to join page');
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
          router.push(`/room/${roomCode}`);
        }
      }
    };

    checkSession();
  }, [roomCode, router]);

  const { data: roomData, isLoading, error } = api.room.getRoomInfo.useQuery(
    { roomCode },
    { 
      enabled: !!roomCode && sessionChecked,
      refetchInterval: 2000, // Poll every 2 seconds for real-time updates
      retry: 3, // Retry failed requests
      retryDelay: 1000, // Wait 1 second between retries
    }
  );

  // Extend session on successful data fetch
  useEffect(() => {
    if (roomData && !isLoading) {
      extendSession();
    }
  }, [roomData, isLoading]);

  // Check if current player is host
  const isHost = session && roomData?.players?.find((p: any) => p.name === session.name)?.isHost;

  // Additional session validation - check if session belongs to this room
  useEffect(() => {
    if (session && roomData) {
      // Check if the session is for this room
      const playerInRoom = roomData.players.find((p: any) => p.name === session.name);
      
      if (!playerInRoom) {
        console.log('Session player not found in room, checking if this is a new room...');
        // For newly created rooms, the host might not appear immediately
        // Only redirect if this persists for more than 5 seconds
        const checkTimer = setTimeout(() => {
          const retryPlayerInRoom = roomData.players.find((p: any) => p.name === session.name);
          if (!retryPlayerInRoom) {
            console.log('Session player still not found after extended wait, redirecting to join');
            router.push(`/room/${roomCode}`);
          }
        }, 5000); // Wait 5 seconds for database sync
        
        return () => clearTimeout(checkTimer);
      }
    }
  }, [session, roomData, roomCode, router]);

  if (!sessionChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading room...</div>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            {error ? 'Error loading room' : 'Room not found'}
          </div>
          {error && (
            <div className="text-red-400 text-sm mb-4 max-w-md">
              {error.message || 'Unknown error occurred'}
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
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Players Section */}
            <div className="xl:col-span-1">
              <PlayerManagementSection
                roomId={roomData.id}
                roomCode={roomCode}
                players={roomData.players}
                isHost={isHost}
              />
            </div>
            
            {/* Game Settings Section */}
            <div className="xl:col-span-1">
              <GameSettingsSection
                roomId={roomData.id}
                currentSettings={roomData.settings}
                isHost={isHost}
              />
            </div>
            
            {/* Game Start Section */}
            <div className="xl:col-span-1">
              <StartGameSection
                roomId={roomData.id}
                roomCode={roomCode}
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

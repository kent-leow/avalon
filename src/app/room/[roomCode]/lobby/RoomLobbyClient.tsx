'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { getSession } from '~/lib/session';
import StartGameSection from './StartGameSection';
import LobbySharing from './LobbySharing';
import type { PlayerSession } from '~/lib/session';

interface RoomLobbyClientProps {
  roomCode: string;
}

export function RoomLobbyClient({ roomCode }: RoomLobbyClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const currentSession = getSession();
      
      if (!currentSession) {
        // Give a longer delay to allow session to be created, especially for hosts
        setTimeout(() => {
          const retrySession = getSession();
          
          if (!retrySession) {
            // Instead of redirecting immediately, try one more time with a longer delay
            setTimeout(() => {
              const finalRetrySession = getSession();
              
              if (!finalRetrySession) {
                // Only redirect if we're absolutely sure there's no session
                console.log('No session found after multiple retries, redirecting to join page');
                router.push(`/room/${roomCode}`);
                return;
              }
              setSession(finalRetrySession);
              setSessionChecked(true);
            }, 500);
            return;
          }
          setSession(retrySession);
          setSessionChecked(true);
        }, 200);
        return;
      }
      setSession(currentSession);
      setSessionChecked(true);
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

  // Check if current player is host
  const isHost = session && roomData?.players?.find((p: any) => p.name === session.name)?.isHost;

  // Additional session validation - check if session belongs to this room
  useEffect(() => {
    if (session && roomData) {
      // Check if the session is for this room
      const playerInRoom = roomData.players.find((p: any) => p.name === session.name);
      
      if (!playerInRoom) {
        console.log('Session player not found in room, will retry or redirect');
        // Give some time for database to sync, especially for newly created rooms
        setTimeout(() => {
          const retryPlayerInRoom = roomData.players.find((p: any) => p.name === session.name);
          if (!retryPlayerInRoom) {
            console.log('Session player still not found after retry, redirecting to join');
            // Player not in room, redirect to join
            router.push(`/room/${roomCode}`);
          }
        }, 2000); // Wait 2 seconds for database sync
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Sharing Section */}
            <LobbySharing roomCode={roomCode} />
            
            {/* Game Start Section */}
            <StartGameSection
              roomId={roomData.id}
              roomCode={roomCode}
            />
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
              onClick={() => router.push('/')}
              className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

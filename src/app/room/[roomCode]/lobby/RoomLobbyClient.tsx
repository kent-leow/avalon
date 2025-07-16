'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { getSession } from '~/lib/session';
import type { PlayerSession } from '~/lib/session';

interface RoomLobbyClientProps {
  roomCode: string;
}

export function RoomLobbyClient({ roomCode }: RoomLobbyClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<PlayerSession | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      // Redirect back to join form if no session
      router.push(`/room/${roomCode}`);
      return;
    }
    setSession(currentSession);
  }, [roomCode, router]);

  const { data: roomData, isLoading, error } = api.room.getRoomInfo.useQuery(
    { roomCode },
    { 
      enabled: !!roomCode,
      refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    }
  );

  // Check if current player is host
  const isHost = session && roomData?.players?.find((p: any) => p.name === session.name)?.isHost;

  if (isLoading) {
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
          <div className="text-red-500 text-xl mb-4">Room not found</div>
          <button
            onClick={() => router.push('/')}
            className="bg-[#3d3d7a] hover:bg-[#4a4a96] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
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
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] rounded-2xl p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
                  Game Setup
                </h2>
                <p className="text-slate-300 text-lg">
                  Get ready to start your Avalon adventure
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Players List */}
                <div className="bg-[#252547] backdrop-blur-sm rounded-xl p-6 border border-[#2d2d5f]/30">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
                      Players ({roomData.players?.length || 0})
                    </h3>
                    <div className="text-sm text-slate-300">
                      Ready for game
                    </div>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {roomData.players?.map((player: any) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-[#2d2d5f]/50 border-[#2d2d5f]/30 transition-all duration-200"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d3d7a] to-[#4a4a96] flex items-center justify-center relative">
                          <span className="text-white font-medium text-sm">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                          {player.isHost && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#f59e0b] rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-white tracking-wide">
                            {player.name}
                            {player.isHost && (
                              <span className="ml-2 text-xs font-medium text-[#f59e0b]">
                                Host
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <div className="flex items-center gap-2 text-[#22c55e]">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium">Ready</span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-slate-400">
                        <p className="text-sm">No players yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Game Requirements */}
                <div className="bg-[#252547] backdrop-blur-sm rounded-xl p-6 border border-[#2d2d5f]/30">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
                      Game Requirements
                    </h3>
                    <div className="h-2 bg-[#0f0f23] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] transition-all duration-300 ease-out"
                        style={{
                          width: `${(roomData.players?.length || 0) >= 5 ? 100 : ((roomData.players?.length || 0) / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      (roomData.players?.length || 0) >= 5
                        ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]'
                        : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'
                    }`}>
                      <div className="flex-shrink-0">
                        {(roomData.players?.length || 0) >= 5 ? (
                          <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Minimum Players</div>
                        <div className="text-sm opacity-75">
                          {roomData.players?.length || 0} of 5 players minimum
                        </div>
                      </div>
                      <div className="text-xs font-medium px-2 py-1 bg-current/10 rounded">
                        Required
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Game Button */}
              <div className="mt-8 text-center">
                {isHost ? (
                  <button
                    onClick={() => alert('Game start functionality coming soon!')}
                    disabled={(roomData.players?.length || 0) < 5}
                    className={`
                      relative px-8 py-3 text-xl font-bold tracking-wide rounded-xl
                      transition-all duration-200 ease-out
                      ${
                        (roomData.players?.length || 0) >= 5
                          ? 'bg-gradient-to-r from-[#3d3d7a] to-[#4a4a96] hover:from-[#4a4a96] hover:to-[#5a5ab2] text-white shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95'
                          : 'bg-gray-500 opacity-50 cursor-not-allowed text-gray-300'
                      }
                    `}
                  >
                    Start Game
                  </button>
                ) : (
                  <div className="text-slate-400 text-sm">
                    Waiting for host to start the game...
                  </div>
                )}
              </div>
            </div>
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

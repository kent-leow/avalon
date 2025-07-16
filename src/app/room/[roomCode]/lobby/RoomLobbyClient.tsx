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

  const { data: roomData, isLoading } = api.room.getRoomInfo.useQuery(
    { roomCode },
    { enabled: !!roomCode }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-white text-xl">Loading room...</div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] flex items-center justify-center">
        <div className="text-red-500 text-xl">Room not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#252547] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 shadow-xl">
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
                Room Lobby
              </h1>
              <p className="text-lg text-slate-100 opacity-90">
                Room Code: <span className="font-mono text-2xl">{roomCode}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Players List */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">Players</h2>
                <div className="bg-[#1a1a2e] rounded-xl p-4">
                  <div className="space-y-2">
                    {roomData.players?.map((player: any) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-[#252547] rounded-lg"
                      >
                        <span className="text-white">{player.name}</span>
                        {player.isHost && (
                          <span className="text-yellow-400 text-sm">Host</span>
                        )}
                      </div>
                    )) || (
                      <div className="text-slate-400 text-center py-4">
                        No players yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Game Settings */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">Game Settings</h2>
                <div className="bg-[#1a1a2e] rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Max Players:</span>
                      <span className="text-white">{roomData.maxPlayers || 10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Current Players:</span>
                      <span className="text-white">{roomData.playerCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Game State:</span>
                      <span className="text-white capitalize">{roomData.gameState?.phase || 'lobby'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/room/${roomCode}`)}
                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Back to Join
              </button>
              {session && roomData.players?.find((p: any) => p.name === session.name)?.isHost && (
                <button
                  className="bg-gradient-to-r from-[#3d3d7a] to-[#4a4a96] hover:from-[#4a4a96] hover:to-[#5a5ab2] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  disabled={!roomData.players || roomData.players.length < 5}
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

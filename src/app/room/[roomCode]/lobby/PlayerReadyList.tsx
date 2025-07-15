"use client";

import { type PlayerReadyStatus } from "~/types/game-state";

interface PlayerReadyListProps {
  players: PlayerReadyStatus[];
  hostId: string;
  className?: string;
}

export default function PlayerReadyList({
  players,
  hostId,
  className = "",
}: PlayerReadyListProps) {
  return (
    <div 
      className={`bg-[#252547] backdrop-blur-sm rounded-xl p-6 border border-[#2d2d5f]/30 ${className}`}
      data-testid="player-ready-list"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
          Players ({players.length})
        </h3>
        <div className="text-sm text-slate-300">
          {players.filter(p => p.isReady).length} of {players.length} ready
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.playerId}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
              player.isReady
                ? 'bg-[#22c55e]/10 border-[#22c55e]/30'
                : 'bg-[#2d2d5f]/50 border-[#2d2d5f]/30'
            }`}
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
              {player.isReady ? (
                <div className="flex items-center gap-2 text-[#22c55e]">
                  <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#f59e0b]">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">Waiting</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#2d2d5f]/50 flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <p className="text-sm">No players yet</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { type MissionPlayer } from "~/types/mission";

interface SelectedTeamDisplayProps {
  selectedPlayers: MissionPlayer[];
  onPlayerRemove: (playerId: string) => void;
  className?: string;
}

export default function SelectedTeamDisplay({
  selectedPlayers,
  onPlayerRemove,
  className = "",
}: SelectedTeamDisplayProps) {
  if (selectedPlayers.length === 0) {
    return (
      <div className={`bg-[#1a1a2e]/60 backdrop-blur-xl rounded-xl p-6 border border-slate-600/30 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-slate-400 text-2xl">👥</span>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Team Selected</h3>
          <p className="text-sm text-slate-400">
            Select players from the grid above to form your mission team
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a1a2e]/90 backdrop-blur-xl rounded-xl p-6 border border-slate-600/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{selectedPlayers.length}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Selected Team</h3>
            <p className="text-slate-300 text-sm">
              {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} chosen
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-400">Active</span>
        </div>
      </div>

      {/* Team Members */}
      <div className="space-y-3">
        {selectedPlayers.map((player, index) => (
          <div
            key={player.id}
            className="group relative bg-[#252547]/80 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30 hover:border-purple-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Selection Order */}
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                
                {/* Player Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Online Status */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#252547] ${
                    player.isOnline ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                
                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{player.name}</span>
                    {player.isLeader && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">👑</span>
                        <span className="text-purple-400 text-xs font-medium">Leader</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    {player.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => onPlayerRemove(player.id)}
                className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                data-testid={`remove-player-${player.id}`}
              >
                <span className="text-red-400 text-sm">✕</span>
              </button>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Composition Summary */}
      <div className="mt-6 pt-4 border-t border-slate-600/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">Online: {selectedPlayers.filter(p => p.isOnline).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-slate-300">Offline: {selectedPlayers.filter(p => !p.isOnline).length}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-slate-300">Total: {selectedPlayers.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

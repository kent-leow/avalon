"use client";

import { type MissionPlayer } from "~/types/mission";

interface PlayerSelectionGridProps {
  players: MissionPlayer[];
  selectedPlayerIds: string[];
  onPlayerToggle: (playerId: string) => void;
  maxSelections: number;
  disabled?: boolean;
  className?: string;
}

export default function PlayerSelectionGrid({
  players,
  selectedPlayerIds,
  onPlayerToggle,
  maxSelections,
  disabled = false,
  className = "",
}: PlayerSelectionGridProps) {
  const canSelectMore = selectedPlayerIds.length < maxSelections;

  const handlePlayerClick = (playerId: string) => {
    if (disabled) return;
    
    const isSelected = selectedPlayerIds.includes(playerId);
    
    // Can always deselect, but can only select if under limit
    if (isSelected || canSelectMore) {
      onPlayerToggle(playerId);
    }
  };

  const getPlayerCardStyles = (player: MissionPlayer) => {
    const isSelected = selectedPlayerIds.includes(player.id);
    const isLeader = player.isLeader;
    const canSelect = isSelected || canSelectMore;
    
    let baseStyles = "relative group cursor-pointer transition-all duration-300 ease-out rounded-xl p-4 border-2 ";
    
    if (disabled) {
      baseStyles += "cursor-not-allowed opacity-50 ";
    } else if (!canSelect) {
      baseStyles += "cursor-not-allowed opacity-60 ";
    }
    
    if (isSelected) {
      baseStyles += "bg-[#3d3d7a]/80 border-purple-500/80 ring-4 ring-purple-500/30 transform scale-105 shadow-2xl ";
    } else if (isLeader) {
      baseStyles += "bg-[#252547]/80 border-purple-500/50 shadow-lg ";
    } else {
      baseStyles += "bg-[#252547]/60 border-slate-600/30 ";
    }
    
    if (!disabled && canSelect) {
      baseStyles += "hover:transform hover:scale-110 hover:shadow-2xl ";
    }
    
    return baseStyles;
  };

  const getSelectionBadge = (player: MissionPlayer) => {
    const isSelected = selectedPlayerIds.includes(player.id);
    const selectionIndex = selectedPlayerIds.indexOf(player.id);
    
    if (!isSelected) return null;
    
    return (
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg animate-pulse">
        {selectionIndex + 1}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Select Team Members</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-400">
            {selectedPlayerIds.length} / {maxSelections} selected
          </div>
          <div className={`w-3 h-3 rounded-full ${
            selectedPlayerIds.length === maxSelections ? 'bg-green-500' : 'bg-purple-500 animate-pulse'
          }`}></div>
        </div>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            onClick={() => handlePlayerClick(player.id)}
            className={getPlayerCardStyles(player)}
            data-testid={`player-card-${player.id}`}
          >
            {/* Selection Badge */}
            {getSelectionBadge(player)}
            
            {/* Leader Crown */}
            {player.isLeader && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">👑</span>
                </div>
              </div>
            )}
            
            {/* Player Avatar */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Online Status */}
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#252547] ${
                  player.isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
              </div>
              
              {/* Player Name */}
              <div className="text-center">
                <div className="text-white font-medium text-sm tracking-wide">
                  {player.name}
                </div>
                {player.isLeader && (
                  <div className="text-purple-400 text-xs font-medium">
                    Leader
                  </div>
                )}
              </div>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Selection Hints */}
      <div className="mt-6 text-center">
        {selectedPlayerIds.length === 0 && (
          <p className="text-slate-400 text-sm">
            Click on players to select them for this mission
          </p>
        )}
        {selectedPlayerIds.length > 0 && selectedPlayerIds.length < maxSelections && (
          <p className="text-purple-400 text-sm">
            Select {maxSelections - selectedPlayerIds.length} more player{maxSelections - selectedPlayerIds.length !== 1 ? 's' : ''}
          </p>
        )}
        {selectedPlayerIds.length === maxSelections && (
          <p className="text-green-400 text-sm font-medium">
            ✓ Team selection complete
          </p>
        )}
      </div>
    </div>
  );
}

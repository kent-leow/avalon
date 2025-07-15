"use client";

import { useState } from "react";
import { type Mission, type MissionPlayer } from "~/types/mission";
import { validateTeamSelection } from "~/lib/mission-rules";
import MissionRequirements from "./MissionRequirements";
import PlayerSelectionGrid from "./PlayerSelectionGrid";
import SelectedTeamDisplay from "./SelectedTeamDisplay";
import SubmitTeamButton from "./SubmitTeamButton";

interface MissionTeamSelectorProps {
  roomId: string;
  playerId: string;
  isLeader: boolean;
  mission: Mission;
  players: MissionPlayer[];
  onTeamSubmit: (teamIds: string[]) => void;
  className?: string;
}

export default function MissionTeamSelector({
  roomId,
  playerId,
  isLeader,
  mission,
  players,
  onTeamSubmit,
  className = "",
}: MissionTeamSelectorProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate validation state
  const validation = validateTeamSelection(
    selectedPlayerIds,
    mission.requiredPlayers,
    players.map(p => p.id)
  );

  const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => {
      const isSelected = prev.includes(playerId);
      
      if (isSelected) {
        // Remove player
        return prev.filter(id => id !== playerId);
      } else {
        // Add player
        return [...prev, playerId];
      }
    });
  };

  const handlePlayerRemove = (playerId: string) => {
    setSelectedPlayerIds(prev => prev.filter(id => id !== playerId));
  };

  const handleSubmit = async () => {
    if (!validation.isValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await onTeamSubmit(selectedPlayerIds);
    } catch (error) {
      console.error("Failed to submit team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not leader, show read-only view
  if (!isLeader) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] relative overflow-hidden ${className}`}>
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
              Mission Team Selection
            </h1>
            <p className="text-slate-300 text-lg">
              Waiting for the leader to select the team
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <MissionRequirements
              mission={mission}
              selectedCount={0}
              requiredCount={mission.requiredPlayers}
            />
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-full">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-purple-400 font-medium">
                {players.find(p => p.isLeader)?.name || 'Leader'} is selecting the team
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] relative overflow-hidden ${className}`}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-pink-500 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-green-500 rounded-full animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
            Select Your Team
          </h1>
          <p className="text-slate-300 text-lg">
            Choose players for this strategic mission
          </p>
        </div>

        {/* Mission Requirements */}
        <div className="max-w-2xl mx-auto mb-8">
          <MissionRequirements
            mission={mission}
            selectedCount={selectedPlayerIds.length}
            requiredCount={mission.requiredPlayers}
          />
        </div>

        {/* Validation Errors */}
        {validation.errors.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 font-medium">Selection Issues</span>
              </div>
              <ul className="space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-300 flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Validation Warnings */}
        {validation.warnings.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-amber-400 font-medium">Selection Hints</span>
              </div>
              <ul className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-amber-300 flex items-center gap-2">
                    <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Selection Grid */}
          <div className="lg:col-span-2">
            <PlayerSelectionGrid
              players={players}
              selectedPlayerIds={selectedPlayerIds}
              onPlayerToggle={handlePlayerToggle}
              maxSelections={mission.requiredPlayers}
              disabled={isSubmitting}
            />
          </div>

          {/* Selected Team Display */}
          <div className="lg:col-span-1">
            <SelectedTeamDisplay
              selectedPlayers={selectedPlayers}
              onPlayerRemove={handlePlayerRemove}
              className="mb-6"
            />

            {/* Submit Button */}
            <SubmitTeamButton
              onSubmit={handleSubmit}
              disabled={!validation.isValid}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

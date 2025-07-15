"use client";

import { useState } from "react";
import MissionTeamSelector from "./MissionTeamSelector";
import { mockMissionData } from "~/lib/mission-rules";
import { type MissionPlayer } from "~/types/mission";

export default function MissionTeamSelectorDemo() {
  const [isLeader, setIsLeader] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState('1');

  const handleTeamSubmit = async (teamIds: string[]) => {
    console.log("Team submitted:", teamIds);
    const selectedPlayers = mockMissionData.players.filter(p => teamIds.includes(p.id));
    console.log("Selected players:", selectedPlayers.map(p => p.name));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Team submitted successfully!\nSelected players: ${selectedPlayers.map(p => p.name).join(', ')}`);
  };

  const handlePlayerChange = (playerId: string) => {
    setCurrentPlayerId(playerId);
    setIsLeader(playerId === '1'); // Player 1 is the leader
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547]">
      {/* Demo Controls */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-[#1a1a2e]/90 backdrop-blur-xl rounded-lg p-4 border border-slate-600/30">
          <h3 className="text-white font-semibold mb-3">Demo Controls</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Current Player</label>
              <select
                value={currentPlayerId}
                onChange={(e) => handlePlayerChange(e.target.value)}
                className="w-full bg-[#252547] border border-slate-600/30 rounded px-3 py-2 text-white text-sm"
              >
                {mockMissionData.players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name} {player.isLeader ? '(Leader)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="leader-toggle"
                checked={isLeader}
                onChange={(e) => setIsLeader(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="leader-toggle" className="text-sm text-slate-300">
                Is Leader
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Team Selector */}
      <MissionTeamSelector
        roomId="demo-room"
        playerId={currentPlayerId}
        isLeader={isLeader}
        mission={mockMissionData.mission}
        players={mockMissionData.players}
        onTeamSubmit={handleTeamSubmit}
      />

      {/* Demo Info */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-[#1a1a2e]/90 backdrop-blur-xl rounded-lg p-4 border border-slate-600/30 max-w-sm">
          <h3 className="text-white font-semibold mb-2">Demo Features</h3>
          <ul className="space-y-1 text-sm text-slate-300">
            <li>• Interactive player selection</li>
            <li>• Real-time validation</li>
            <li>• Mission requirements display</li>
            <li>• Leader vs non-leader views</li>
            <li>• Strategic visual design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

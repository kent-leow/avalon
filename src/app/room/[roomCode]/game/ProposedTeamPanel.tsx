"use client";

import { type MissionPlayer } from "~/types/mission";

interface ProposedTeamPanelProps {
  proposedTeam: MissionPlayer[];
  missionRound: number;
  requiredPlayers: number;
  leaderName: string;
}

export default function ProposedTeamPanel({
  proposedTeam,
  missionRound,
  requiredPlayers,
  leaderName,
}: ProposedTeamPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#252547]/80 to-[#1a1a2e]/80 backdrop-blur-xl border border-slate-600/30 shadow-2xl">
      {/* Spotlight effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] animate-pulse" />
      
      {/* Header */}
      <div className="relative p-6 border-b border-slate-600/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Proposed Mission Team
            </h3>
            <p className="text-slate-300 text-sm">
              Mission {missionRound} • {requiredPlayers} players required
            </p>
          </div>
          
          {/* Leader indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-75" />
              <div className="relative w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
            <span className="text-amber-300 text-sm font-medium">
              Leader: {leaderName}
            </span>
          </div>
        </div>
      </div>

      {/* Team members grid */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {proposedTeam.map((player, index) => (
            <div
              key={player.id}
              className="relative group"
            >
              {/* Player card */}
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#252547] border border-slate-600/30 p-4 hover:border-slate-500/50 transition-all duration-300">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Player avatar */}
                <div className="relative w-12 h-12 mx-auto mb-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-0.5">
                    <div className="w-full h-full bg-[#1a1a2e] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {player.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Online indicator */}
                  {player.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a1a2e] flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Player name */}
                <div className="text-center">
                  <h4 className="text-white font-medium text-sm mb-1 truncate">
                    {player.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                    <span className="text-slate-400 text-xs">
                      Player {index + 1}
                    </span>
                  </div>
                </div>

                {/* Selection indicator */}
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500/20 rounded-full border border-blue-500/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission details */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-slate-300 text-sm">
              Mission {missionRound} requires {requiredPlayers} players
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-blue-300 text-sm font-medium">
              {proposedTeam.length} Selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

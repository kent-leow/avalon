"use client";

import { type KnownPlayer } from "~/types/role-knowledge";
import { type Role } from "~/types/roles";

interface KnownPlayersGridProps {
  knownPlayers: KnownPlayer[];
  playerRole: Role;
  className?: string;
}

export default function KnownPlayersGrid({
  knownPlayers,
  playerRole,
  className = "",
}: KnownPlayersGridProps) {
  if (knownPlayers.length === 0) {
    return (
      <div className={`bg-[#252547]/80 backdrop-blur-sm rounded-xl p-6 border border-[#2d2d5f]/30 ${className}`}>
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 text-center">
          Your Knowledge
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2d2d5f]/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-slate-400 text-sm">
            You have no special knowledge about other players
          </p>
        </div>
      </div>
    );
  }

  const getKnowledgeIcon = (knownPlayer: KnownPlayer) => {
    if (knownPlayer.isAmbiguous) {
      return (
        <svg className="w-5 h-5 text-amber-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
      );
    }

    if (knownPlayer.revealedTeam === 'evil') {
      return (
        <svg className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5 text-green-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
      </svg>
    );
  };

  const getKnowledgeDescription = (knownPlayer: KnownPlayer) => {
    if (knownPlayer.isAmbiguous) {
      return "Cannot determine true alignment";
    }

    if (knownPlayer.revealedTeam === 'evil') {
      return "Servant of Mordred";
    }

    return "Servant of Arthur";
  };

  const getCardStyle = (knownPlayer: KnownPlayer) => {
    if (knownPlayer.isAmbiguous) {
      return "border-amber-500/30 bg-amber-500/10";
    }

    if (knownPlayer.revealedTeam === 'evil') {
      return "border-red-500/30 bg-red-500/10";
    }

    return "border-green-500/30 bg-green-500/10";
  };

  return (
    <div 
      className={`bg-[#252547]/80 backdrop-blur-sm rounded-xl p-6 border border-[#2d2d5f]/30 ${className}`}
      data-testid="known-players-grid"
    >
      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 text-center">
        Your Knowledge
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {knownPlayers.map((knownPlayer, index) => (
          <div
            key={knownPlayer.id}
            className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${getCardStyle(knownPlayer)}`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeIn 0.5s ease-out forwards'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Player avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d3d7a] to-[#4a4a96] flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {knownPlayer.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Player info */}
              <div className="flex-1">
                <div className="font-medium text-white tracking-wide">
                  {knownPlayer.name}
                </div>
                <div className="text-sm text-slate-300 opacity-75">
                  {getKnowledgeDescription(knownPlayer)}
                </div>
              </div>

              {/* Knowledge icon */}
              <div className="flex-shrink-0">
                {getKnowledgeIcon(knownPlayer)}
              </div>
            </div>

            {/* Confidence indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex-1 bg-[#0f0f23] rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    knownPlayer.confidence === 'certain' 
                      ? 'bg-green-500 w-full' 
                      : knownPlayer.confidence === 'suspected'
                      ? 'bg-amber-500 w-3/4'
                      : 'bg-gray-500 w-1/4'
                  }`}
                />
              </div>
              <span className="capitalize">
                {knownPlayer.confidence}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Context hint */}
      <div className="mt-4 p-3 bg-[#0f0f23] rounded-lg">
        <p className="text-sm text-slate-300 text-center">
          {knownPlayers.some(p => p.isAmbiguous) 
            ? "Some players appear ambiguous - watch their behavior carefully"
            : "This knowledge is certain based on your role"}
        </p>
      </div>
    </div>
  );
}

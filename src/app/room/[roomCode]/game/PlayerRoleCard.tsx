"use client";

import { type Role } from "~/types/roles";

interface PlayerRoleCardProps {
  role: Role;
  playerName: string;
  team: 'good' | 'evil';
  className?: string;
}

export default function PlayerRoleCard({
  role,
  playerName,
  team,
  className = "",
}: PlayerRoleCardProps) {
  const teamColors = {
    good: {
      border: 'border-green-500',
      glow: 'shadow-green-500/50',
      text: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    evil: {
      border: 'border-red-500',
      glow: 'shadow-red-500/50',
      text: 'text-red-500',
      bg: 'bg-red-500/10'
    }
  };

  const teamStyle = teamColors[team];

  return (
    <div 
      className={`relative bg-[#252547]/90 backdrop-blur-xl border-2 ${teamStyle.border} rounded-2xl p-8 transition-all duration-500 hover:scale-105 shadow-2xl ${teamStyle.glow} ${className}`}
      data-testid="player-role-card"
    >
      {/* Mystical particle effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute top-8 right-6 w-1 h-1 bg-pink-400 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-80"></div>
      </div>

      {/* Role portrait placeholder */}
      <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#3d3d7a] to-[#4a4a96] flex items-center justify-center relative ${teamStyle.glow}`}>
        <div className="text-4xl font-bold text-white text-shadow-lg">
          {role.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Team aura */}
        <div className={`absolute -inset-2 rounded-full ${teamStyle.bg} animate-pulse`}></div>
      </div>

      {/* Role name */}
      <h2 className="text-3xl font-bold text-white text-center mb-2 text-shadow-lg tracking-wide">
        {role.name}
      </h2>

      {/* Team badge */}
      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${teamStyle.bg} ${teamStyle.text} ${teamStyle.border} mb-4 mx-auto block w-fit`}>
        <div className={`w-2 h-2 rounded-full ${team === 'good' ? 'bg-green-500' : 'bg-red-500'} mr-2 animate-pulse`}></div>
        {team === 'good' ? 'Servant of Arthur' : 'Servant of Mordred'}
      </div>

      {/* Role description */}
      <p className="text-lg text-slate-100 opacity-90 text-center leading-relaxed mb-6">
        {role.description}
      </p>

      {/* Abilities */}
      {role.abilities && role.abilities.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-widest text-center">
            Abilities
          </h3>
          <div className="space-y-1">
            {role.abilities.map((ability, index) => (
              <div 
                key={index}
                className="flex items-center justify-center text-sm text-slate-200 opacity-80"
              >
                <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
                {ability}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mystical corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-purple-500/30 rounded-tl-2xl"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-purple-500/30 rounded-tr-2xl"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-purple-500/30 rounded-bl-2xl"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-purple-500/30 rounded-br-2xl"></div>
    </div>
  );
}

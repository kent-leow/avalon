'use client';

import { AVALON_CHARACTERS, type Character, type CharacterId } from '~/types/characters';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onToggle: () => void;
  hasError: boolean;
  disabled?: boolean;
  className?: string;
}

export function CharacterCard({ 
  character, 
  isSelected, 
  onToggle, 
  hasError, 
  disabled = false, 
  className = '' 
}: CharacterCardProps) {
  const getTeamColor = (team: 'good' | 'evil') => {
    return team === 'good' ? 'text-green-500' : 'text-red-500';
  };

  const getTeamGlow = (team: 'good' | 'evil') => {
    return team === 'good' ? 'shadow-green-500/20' : 'shadow-red-500/20';
  };

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 ${className}`}
      onClick={disabled ? undefined : onToggle}
      data-testid={`character-card-${character.id}`}
    >
      <div className={`
        bg-[#252547]/80 backdrop-blur-xl border-2 rounded-2xl p-4 shadow-xl
        transition-all duration-300 hover:shadow-2xl
        ${isSelected 
          ? `border-[#3d3d7a] bg-[#3d3d7a]/20 ring-4 ring-blue-500/50 transform scale-102 ${getTeamGlow(character.team)}` 
          : 'border-slate-600/30 hover:border-slate-500/50'
        }
        ${hasError ? 'border-red-500 bg-red-500/10' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:translateY(-8px) hover:scale-105'}
      `}>
        {/* Team Badge */}
        <div className={`absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold uppercase tracking-widest ${
          character.team === 'good' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {character.team === 'good' ? 'G' : 'E'}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Character Name */}
        <div className="mt-4 mb-3">
          <h3 className="text-xl font-bold text-white tracking-wide">{character.name}</h3>
          <p className={`text-xs font-bold uppercase tracking-widest ${getTeamColor(character.team)}`}>
            {character.team} Team
          </p>
        </div>

        {/* Character Description */}
        <p className="text-sm text-slate-200 opacity-90 leading-relaxed mb-3">
          {character.description}
        </p>

        {/* Character Ability */}
        <div className="border-t border-slate-600/30 pt-3">
          <p className="text-xs text-slate-300 opacity-75 uppercase tracking-wide mb-1">Ability</p>
          <p className="text-sm text-blue-400 font-medium">
            {character.ability}
          </p>
        </div>

        {/* Player Requirements */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Min: {character.minPlayers}</span>
          <span>Max: {character.maxPlayers}</span>
        </div>

        {/* Error Indicator */}
        {hasError && (
          <div className="absolute inset-0 rounded-2xl border-2 border-red-500 bg-red-500/10 flex items-center justify-center">
            <div className="bg-red-500/20 rounded-full p-2">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { type GameSettings } from '~/types/game-settings';
import { PLAYER_COUNT_CONFIGURATIONS } from '~/types/game-settings';
import { AVALON_CHARACTERS, type CharacterId } from '~/types/characters';

interface SettingsSummaryProps {
  settings: GameSettings;
  playerCount: number;
  isValid: boolean;
  className?: string;
}

export function SettingsSummary({ settings, playerCount, isValid, className = '' }: SettingsSummaryProps) {
  const config = PLAYER_COUNT_CONFIGURATIONS[playerCount as keyof typeof PLAYER_COUNT_CONFIGURATIONS];
  
  const goodCount = settings.characters.filter(id => 
    AVALON_CHARACTERS[id as CharacterId]?.team === 'good'
  ).length;
  
  const evilCount = settings.characters.filter(id => 
    AVALON_CHARACTERS[id as CharacterId]?.team === 'evil'
  ).length;

  const getStatusColor = (isCorrect: boolean) => {
    return isCorrect ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (isCorrect: boolean) => {
    return isCorrect ? (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  if (!config) {
    return (
      <div className={`bg-red-500/10 border border-red-500/30 rounded-xl p-6 ${className}`} data-testid="settings-summary">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Invalid Player Count</h3>
          <p className="text-red-300 text-sm">
            No configuration available for {playerCount} players. Please choose 5-10 players.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-xl p-6 ${className}`} data-testid="settings-summary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Configuration Summary</h3>
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
            isValid ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            {getStatusIcon(isValid)}
          </div>
        </div>

        {/* Player Count */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-200">Player Count</span>
            <span className={`font-semibold ${getStatusColor(settings.characters.length === playerCount)}`}>
              {settings.characters.length} / {playerCount}
            </span>
          </div>
          
          {/* Team Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Good Team</span>
                <span className={`font-semibold ${getStatusColor(goodCount === config.good)}`}>
                  {goodCount} / {config.good}
                </span>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 bg-slate-600 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      goodCount === config.good ? 'bg-green-500' : 
                      goodCount > config.good ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min((goodCount / config.good) * 100, 100)}%` }}
                  />
                </div>
                {goodCount > config.good && (
                  <div className="flex items-center text-xs text-red-400">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    +{goodCount - config.good}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-[#1a1a2e] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Evil Team</span>
                <span className={`font-semibold ${getStatusColor(evilCount === config.evil)}`}>
                  {evilCount} / {config.evil}
                </span>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 bg-slate-600 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      evilCount === config.evil ? 'bg-green-500' : 
                      evilCount > config.evil ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min((evilCount / config.evil) * 100, 100)}%` }}
                  />
                </div>
                {evilCount > config.evil && (
                  <div className="flex items-center text-xs text-red-400">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    +{evilCount - config.evil}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Characters */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Selected Characters</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(
              settings.characters.reduce((counts, characterId) => {
                counts[characterId] = (counts[characterId] || 0) + 1;
                return counts;
              }, {} as Record<string, number>)
            ).map(([characterId, count]) => {
              const character = AVALON_CHARACTERS[characterId as CharacterId];
              if (!character) return null;
              
              return (
                <div key={characterId} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    character.team === 'good' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-slate-200">
                    {character.name}
                    {count > 1 && (
                      <span className="ml-1 text-xs text-slate-400">×{count}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Settings */}
        <div className="border-t border-slate-600/30 pt-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Game Settings</h4>
          <div className="space-y-2 text-sm">
            {settings.timeLimit && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Time Limit</span>
                <span className="text-slate-200">{Math.floor(settings.timeLimit / 60)} minutes</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Allow Spectators</span>
              <span className={`font-medium ${settings.allowSpectators ? 'text-green-400' : 'text-slate-400'}`}>
                {settings.allowSpectators ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Auto Start</span>
              <span className={`font-medium ${settings.autoStart ? 'text-green-400' : 'text-slate-400'}`}>
                {settings.autoStart ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Status */}
        <div className={`rounded-lg p-3 ${
          isValid 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-amber-500/10 border border-amber-500/30'
        }`}>
          <div className="flex items-center space-x-2">
            {isValid ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            <span className={`text-sm font-medium ${
              isValid ? 'text-green-400' : 'text-amber-400'
            }`}>
              {isValid ? 'Ready to Start' : 'Configuration Issues'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

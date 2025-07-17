'use client';

import { useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import { GameSettingsPanel } from './GameSettingsPanel';
import { getDefaultSettings } from '~/lib/default-settings';
import type { GameSettings } from '~/types/game-settings';

interface GameSettingsSectionProps {
  roomId: string;
  currentSettings: GameSettings;
  isHost: boolean;
}

export default function GameSettingsSection({
  roomId,
  currentSettings,
  isHost,
}: GameSettingsSectionProps) {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update settings when currentSettings changes
  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleResetSettings = () => {
    const defaultSettings = getDefaultSettings(settings.playerCount);
    setSettings(defaultSettings);
  };

  const getSettingsSummary = () => {
    const characterCount = settings.characters.length;
    const playerCount = settings.playerCount;
    const timeLimit = settings.timeLimit ? `${Math.floor(settings.timeLimit / 60)}m` : 'No limit';
    
    return {
      characterCount,
      playerCount,
      timeLimit,
      autoStart: settings.autoStart,
      allowSpectators: settings.allowSpectators,
    };
  };

  const summary = getSettingsSummary();

  return (
    <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Game Settings
          </h3>
          <button
            onClick={handleToggleExpand}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title={isExpanded ? 'Collapse settings' : 'Expand settings'}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <p className="text-slate-300">
          {isHost ? 'Configure game rules and characters' : 'Current game configuration'}
        </p>
      </div>

      {/* Settings Summary */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#1a1a2e]/60 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Players</div>
            <div className="text-xl font-semibold text-white">{summary.playerCount}</div>
          </div>
          <div className="bg-[#1a1a2e]/60 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Characters</div>
            <div className="text-xl font-semibold text-white">{summary.characterCount}</div>
          </div>
        </div>

        <div className="bg-[#1a1a2e]/60 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-2">Selected Characters</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              settings.characters.reduce((counts, character) => {
                counts[character] = (counts[character] || 0) + 1;
                return counts;
              }, {} as Record<string, number>)
            ).map(([character, count]) => (
              <span
                key={character}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"
              >
                {character.charAt(0).toUpperCase() + character.slice(1)}
                {count > 1 && (
                  <span className="ml-1 text-xs text-blue-300">×{count}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#1a1a2e]/60 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Time Limit</div>
            <div className="text-lg font-semibold text-white">{summary.timeLimit}</div>
          </div>
          <div className="bg-[#1a1a2e]/60 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Options</div>
            <div className="flex flex-col space-y-1">
              {summary.autoStart && (
                <span className="text-xs text-green-400">Auto Start</span>
              )}
              {summary.allowSpectators && (
                <span className="text-xs text-blue-400">Allow Spectators</span>
              )}
              {!summary.autoStart && !summary.allowSpectators && (
                <span className="text-xs text-slate-400">No options</span>
              )}
            </div>
          </div>
        </div>

        {isHost && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleToggleExpand}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isExpanded ? 'Hide Settings' : 'Configure Settings'}
            </button>
            <button
              onClick={handleResetSettings}
              className="sm:w-auto bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
              title="Reset to default settings"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Expanded Settings Panel */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-600/30">
          <div className="w-full overflow-x-auto">
            <GameSettingsPanel
              roomId={roomId}
              currentSettings={settings}
              isHost={isHost}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

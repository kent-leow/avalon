'use client';

import { useState, useEffect } from 'react';
import { CharacterSelector } from './CharacterSelector';
import { SettingsSummary } from './SettingsSummary';
import { ValidationErrors } from './ValidationErrors';
import { validateCharacterConfiguration, isValidConfiguration } from '~/lib/character-validation';
import { getDefaultSettings } from '~/lib/default-settings';
import { api } from '~/trpc/react';
import { type GameSettings } from '~/types/game-settings';
import { type ValidationError, AVALON_CHARACTERS, type CharacterId } from '~/types/characters';

interface GameSettingsPanelProps {
  roomId: string;
  currentSettings: GameSettings;
  isHost: boolean;
  onSettingsChange: (settings: GameSettings) => void;
  disabled?: boolean;
  className?: string;
}

export function GameSettingsPanel({ 
  roomId, 
  currentSettings, 
  isHost, 
  onSettingsChange, 
  disabled = false, 
  className = '' 
}: GameSettingsPanelProps) {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [lastSavedSettings, setLastSavedSettings] = useState<GameSettings>(currentSettings);

  // Update validation when settings change
  useEffect(() => {
    const errors = validateCharacterConfiguration(settings);
    setValidationErrors(errors);
    setIsValid(isValidConfiguration(settings));
  }, [settings]);

  // Sync settings with parent component
  useEffect(() => {
    if (isHost) {
      onSettingsChange(settings);
    }
  }, [settings, isHost, onSettingsChange]);

  const updateSettingsMutation = api.room.updateSettings.useMutation({
    onSuccess: (data) => {
      setLastSavedSettings(settings);
      console.log('Settings updated successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
      // Revert to last saved settings on error
      setSettings(lastSavedSettings);
    }
  });

  // Auto-save settings when they change (debounced)
  useEffect(() => {
    if (!isHost || disabled) return;

    const timer = setTimeout(() => {
      if (JSON.stringify(settings) !== JSON.stringify(lastSavedSettings) && isValid) {
        updateSettingsMutation.mutate({
          roomId,
          settings: {
            characters: settings.characters,
            playerCount: settings.playerCount,
            allowSpectators: settings.allowSpectators,
            autoStart: settings.autoStart,
            timeLimit: settings.timeLimit,
          }
        });
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [settings, lastSavedSettings, isHost, disabled, isValid, roomId, updateSettingsMutation]);

  const handleCharacterToggle = (characterId: string) => {
    if (disabled || !isHost) return;

    const character = AVALON_CHARACTERS[characterId as CharacterId];
    if (!character) return;

    setSettings(prev => ({
      ...prev,
      characters: prev.characters.includes(characterId)
        ? prev.characters.filter(id => id !== characterId)
        : [...prev.characters, characterId]
    }));
  };

  const handleCharacterIncrement = (characterId: string) => {
    if (disabled || !isHost) return;

    const character = AVALON_CHARACTERS[characterId as CharacterId];
    if (!character?.allowMultiple) return;

    const currentCount = settings.characters.filter(id => id === characterId).length;
    const maxInstances = character.maxInstances || 1;
    
    if (currentCount < maxInstances) {
      setSettings(prev => ({
        ...prev,
        characters: [...prev.characters, characterId]
      }));
    }
  };

  const handleCharacterDecrement = (characterId: string) => {
    if (disabled || !isHost) return;

    const character = AVALON_CHARACTERS[characterId as CharacterId];
    if (!character?.allowMultiple) return;

    const currentCount = settings.characters.filter(id => id === characterId).length;
    
    if (currentCount > 1) {
      // Remove one instance
      const characters = [...settings.characters];
      const index = characters.findIndex(id => id === characterId);
      if (index > -1) {
        characters.splice(index, 1);
        setSettings(prev => ({
          ...prev,
          characters
        }));
      }
    } else if (currentCount === 1) {
      // Remove the last instance (same as toggle off)
      setSettings(prev => ({
        ...prev,
        characters: prev.characters.filter(id => id !== characterId)
      }));
    }
  };

  const handleResetToDefault = () => {
    if (disabled || !isHost) return;

    const defaultSettings = getDefaultSettings(settings.playerCount);
    setSettings(defaultSettings);
  };

  const handlePlayerCountChange = (newCount: number) => {
    if (disabled || !isHost) return;

    const defaultSettings = getDefaultSettings(newCount);
    setSettings(defaultSettings);
  };

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    if (disabled || !isHost) return;

    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isHost) {
    return (
      <div className={`space-y-8 ${className}`} data-testid="game-settings-panel">
        <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Game Settings</h2>
            <p className="text-slate-200 opacity-90">
              Only the host can modify game settings. You can view the current configuration below.
            </p>
          </div>
        </div>

        <SettingsSummary
          settings={currentSettings}
          playerCount={currentSettings.playerCount}
          isValid={isValidConfiguration(currentSettings)}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`} data-testid="game-settings-panel">
      {/* Header */}
      <div className="bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Game Settings
            </h2>
            {updateSettingsMutation.isPending && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}
          </div>
          <p className="text-lg text-slate-100 opacity-90 leading-relaxed">
            Configure your Avalon game by selecting characters and adjusting settings
          </p>
          {updateSettingsMutation.isError && (
            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              Failed to save settings. Changes will be retried automatically.
            </div>
          )}
        </div>

        {/* Player Count Selector */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-slate-200 opacity-75 uppercase tracking-wide mb-2">
            Player Count
          </label>
          <select
            value={settings.playerCount}
            onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
            disabled={disabled || updateSettingsMutation.isPending}
            className="bg-[#1a1a2e] border border-slate-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 disabled:opacity-50"
          >
            {[5, 6, 7, 8, 9, 10].map(count => (
              <option key={count} value={count}>
                {count} Players
              </option>
            ))}
          </select>
        </div>

        {/* Additional Settings */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.allowSpectators}
                onChange={(e) => handleSettingChange('allowSpectators', e.target.checked)}
                disabled={disabled || updateSettingsMutation.isPending}
                className="w-4 h-4 text-blue-500 bg-[#1a1a2e] border border-slate-600/30 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
              />
              <span className="text-slate-200">Allow Spectators</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoStart}
                onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
                disabled={disabled || updateSettingsMutation.isPending}
                className="w-4 h-4 text-blue-500 bg-[#1a1a2e] border border-slate-600/30 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
              />
              <span className="text-slate-200">Auto Start Game</span>
            </label>
          </div>
        </div>
      </div>

      {/* Character Selector */}
      <CharacterSelector
        selectedCharacters={settings.characters}
        onCharacterToggle={handleCharacterToggle}
        onCharacterIncrement={handleCharacterIncrement}
        onCharacterDecrement={handleCharacterDecrement}
        validationErrors={validationErrors}
        disabled={disabled || updateSettingsMutation.isPending}
      />

      {/* Settings Summary */}
      <SettingsSummary
        settings={settings}
        playerCount={settings.playerCount}
        isValid={isValid}
      />

      {/* Validation Errors */}
      <ValidationErrors
        errors={validationErrors}
        onResetToDefault={handleResetToDefault}
      />
    </div>
  );
}

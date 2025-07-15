import { DEFAULT_GAME_SETTINGS, type GameSettings } from '~/types/game-settings';
import { getRecommendedConfiguration } from './character-validation';

/**
 * Get default game settings for a given player count
 */
export function getDefaultSettings(playerCount: number): GameSettings {
  const recommendedCharacters = getRecommendedConfiguration(playerCount);
  
  return {
    ...DEFAULT_GAME_SETTINGS,
    characters: recommendedCharacters.length > 0 ? recommendedCharacters : DEFAULT_GAME_SETTINGS.characters,
    playerCount
  };
}

/**
 * Reset settings to default for the current player count
 */
export function resetToDefault(currentSettings: GameSettings): GameSettings {
  return getDefaultSettings(currentSettings.playerCount);
}

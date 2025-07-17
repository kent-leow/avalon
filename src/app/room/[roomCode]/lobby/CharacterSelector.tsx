'use client';

import { CharacterCard } from './CharacterCard';
import { AVALON_CHARACTERS, type ValidationError, type CharacterId, type CharacterCount, charactersToCount } from '~/types/characters';

interface CharacterSelectorProps {
  selectedCharacters: string[];
  onCharacterToggle: (character: string) => void;
  onCharacterIncrement?: (character: string) => void;
  onCharacterDecrement?: (character: string) => void;
  validationErrors: ValidationError[];
  disabled?: boolean;
  className?: string;
}

export function CharacterSelector({ 
  selectedCharacters, 
  onCharacterToggle, 
  onCharacterIncrement,
  onCharacterDecrement,
  validationErrors, 
  disabled = false, 
  className = '' 
}: CharacterSelectorProps) {
  const characters = Object.values(AVALON_CHARACTERS);
  const characterCounts = charactersToCount(selectedCharacters);

  const getCharacterError = (characterId: string): boolean => {
    return validationErrors.some(error => error.characters.includes(characterId));
  };

  const getCharacterCount = (characterId: string): number => {
    return characterCounts[characterId] || 0;
  };

  const isCharacterSelected = (characterId: string): boolean => {
    return getCharacterCount(characterId) > 0;
  };

  const groupedCharacters = {
    core: characters.filter(char => ['merlin', 'assassin', 'loyal', 'minion'].includes(char.id)),
    special: characters.filter(char => !['merlin', 'assassin', 'loyal', 'minion'].includes(char.id))
  };

  return (
    <div className={`space-y-8 ${className}`} data-testid="character-selector">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Select Characters</h3>
        <p className="text-slate-200 opacity-90">
          Choose which characters to include in your game. Some characters have dependencies and requirements.
        </p>
      </div>

      {/* Core Characters */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Core Characters
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groupedCharacters.core.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={isCharacterSelected(character.id)}
              count={getCharacterCount(character.id)}
              onToggle={() => onCharacterToggle(character.id)}
              onIncrement={onCharacterIncrement ? () => onCharacterIncrement(character.id) : undefined}
              onDecrement={onCharacterDecrement ? () => onCharacterDecrement(character.id) : undefined}
              hasError={getCharacterError(character.id)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Special Characters */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          Special Characters
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groupedCharacters.special.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={isCharacterSelected(character.id)}
              count={getCharacterCount(character.id)}
              onToggle={() => onCharacterToggle(character.id)}
              onIncrement={onCharacterIncrement ? () => onCharacterIncrement(character.id) : undefined}
              onDecrement={onCharacterDecrement ? () => onCharacterDecrement(character.id) : undefined}
              hasError={getCharacterError(character.id)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-[#1a1a2e] rounded-xl p-4 border border-slate-600/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Selected: {selectedCharacters.length}</span>
          <div className="flex items-center space-x-4">
            <span className="text-green-400">
              Good: {selectedCharacters.filter(id => AVALON_CHARACTERS[id as CharacterId]?.team === 'good').length}
            </span>
            <span className="text-red-400">
              Evil: {selectedCharacters.filter(id => AVALON_CHARACTERS[id as CharacterId]?.team === 'evil').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

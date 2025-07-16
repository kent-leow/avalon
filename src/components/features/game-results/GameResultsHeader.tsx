import React from 'react';
import type { WinCondition } from '~/types/game-results';

interface GameResultsHeaderProps {
  winningTeam: 'good' | 'evil';
  winCondition: WinCondition;
  isGoodWin: boolean;
}

export const GameResultsHeader: React.FC<GameResultsHeaderProps> = ({
  winningTeam,
  winCondition,
  isGoodWin,
}) => {
  const getWinConditionText = (condition: WinCondition): string => {
    switch (condition) {
      case 'three-missions-good':
        return 'Three missions succeeded';
      case 'three-missions-evil':
        return 'Three missions failed';
      case 'assassin-success':
        return 'Assassin eliminated Merlin';
      case 'assassin-failure':
        return 'Assassin failed to find Merlin';
      case 'five-rejections':
        return 'Five consecutive rejections';
      default:
        return 'Game completed';
    }
  };

  return (
    <div className="text-center mb-12">
      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
        isGoodWin 
          ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
          : 'bg-gradient-to-br from-red-400 to-red-600'
      }`}>
        <span className="text-4xl">
          {isGoodWin ? '⚔️' : '🗡️'}
        </span>
      </div>
      
      <h1 className={`text-6xl font-bold mb-4 ${
        isGoodWin ? 'text-blue-300' : 'text-red-300'
      }`}>
        {isGoodWin ? 'GOOD' : 'EVIL'} TRIUMPHS
      </h1>
      
      <p className="text-xl text-gray-300 mb-2">
        {getWinConditionText(winCondition)}
      </p>
      
      <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold ${
        isGoodWin 
          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
          : 'bg-red-600/20 text-red-300 border border-red-500/30'
      }`}>
        {winningTeam.toUpperCase()} TEAM VICTORY
      </div>
    </div>
  );
};

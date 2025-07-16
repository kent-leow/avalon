import React from 'react';
import type { GameResults, PlayerRole } from '~/types/game-results';
import { GameResultsHeader } from '~/components/features/game-results/GameResultsHeader';
import { GameResultsDetails } from '~/components/features/game-results/GameResultsDetails';
import { PlayerPerformanceGrid } from '~/components/features/game-results/PlayerPerformanceGrid';
import { GameResultsActions } from '~/components/features/game-results/GameResultsActions';

interface GameResultsScreenProps {
  gameResults: GameResults;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

const CHARACTER_EMOJI: Record<string, string> = {
  MERLIN: '🧙‍♂️',
  PERCIVAL: '🛡️',
  SERVANT: '⚔️',
  MORDRED: '🗡️',
  MORGANA: '🔮',
  OBERON: '👤',
  MINION: '🗡️',
  ASSASSIN: '🗡️',
};

export const GameResultsScreen: React.FC<GameResultsScreenProps> = ({
  gameResults,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const winningTeam = gameResults.outcome.winner;
  const isGoodWin = winningTeam === 'good';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <GameResultsHeader
          winningTeam={winningTeam}
          winCondition={gameResults.outcome.winCondition}
          isGoodWin={isGoodWin}
        />
        
        <div className="max-w-6xl mx-auto space-y-8">
          <GameResultsDetails
            gameResults={gameResults}
            isGoodWin={isGoodWin}
          />
          
          <PlayerPerformanceGrid
            players={gameResults.playerRoles}
            winningTeam={winningTeam}
            characterEmoji={CHARACTER_EMOJI}
          />
          
          <GameResultsActions
            onPlayAgain={onPlayAgain}
            onReturnToLobby={onReturnToLobby}
          />
        </div>
      </div>
    </div>
  );
};

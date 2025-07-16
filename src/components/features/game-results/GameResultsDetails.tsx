import React from 'react';
import type { GameResults } from '~/types/game-results';

interface GameResultsDetailsProps {
  gameResults: GameResults;
  isGoodWin: boolean;
}

export const GameResultsDetails: React.FC<GameResultsDetailsProps> = ({
  gameResults,
  isGoodWin,
}) => {
  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatMargin = (margin: string): string => {
    switch (margin) {
      case 'decisive':
        return 'Decisive Victory';
      case 'close':
        return 'Close Victory';
      case 'narrow':
        return 'Narrow Victory';
      default:
        return 'Victory';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Game Overview */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Game Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Duration:</span>
            <span className="text-white">{formatDuration(gameResults.gameSummary.duration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Rounds:</span>
            <span className="text-white">{gameResults.gameSummary.totalRounds}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Players:</span>
            <span className="text-white">{gameResults.playerRoles.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Margin:</span>
            <span className={`font-semibold ${isGoodWin ? 'text-blue-300' : 'text-red-300'}`}>
              {formatMargin(gameResults.outcome.margin)}
            </span>
          </div>
        </div>
      </div>

      {/* Mission Results */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Mission Results</h3>
        <div className="space-y-2">
          {gameResults.gameSummary.missionResults.map((mission, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-slate-400">Mission {mission.missionNumber}:</span>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  mission.outcome === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className={`text-sm font-medium ${
                  mission.outcome === 'success' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {mission.outcome === 'success' ? 'Success' : 'Failure'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Score */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Final Score</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-blue-300">Good Team:</span>
            <span className="text-white font-semibold">
              {gameResults.outcome.finalScore.goodPoints}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-300">Evil Team:</span>
            <span className="text-white font-semibold">
              {gameResults.outcome.finalScore.evilPoints}
            </span>
          </div>
          {gameResults.gameSummary.assassinAttempt && (
            <div className="pt-2 border-t border-slate-600">
              <div className="text-sm text-slate-400 mb-1">Assassin Attempt:</div>
              <div className={`text-sm font-medium ${
                gameResults.gameSummary.assassinAttempt.wasCorrect ? 'text-red-300' : 'text-blue-300'
              }`}>
                {gameResults.gameSummary.assassinAttempt.wasCorrect 
                  ? 'Successfully eliminated Merlin' 
                  : 'Failed to find Merlin'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface GameResultsActionsProps {
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const GameResultsActions: React.FC<GameResultsActionsProps> = ({
  onPlayAgain,
  onReturnToLobby,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button
        onClick={onPlayAgain}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        🎮 Play Again
      </button>
      
      <button
        onClick={onReturnToLobby}
        className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        🏠 Return to Lobby
      </button>
      
      <button
        onClick={() => {
          // Share functionality can be implemented later
          navigator.share?.({
            title: 'Avalon Game Results',
            text: 'Check out our epic Avalon game results!',
            url: window.location.href
          }).catch(() => {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
          });
        }}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        📤 Share Results
      </button>
    </div>
  );
};

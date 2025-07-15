"use client";

import { useState } from "react";

interface StartGameButtonProps {
  roomId: string;
  isHost: boolean;
  canStart: boolean;
  onStartGame: () => void;
  isStarting: boolean;
  className?: string;
}

export default function StartGameButton({
  roomId,
  isHost,
  canStart,
  onStartGame,
  isStarting,
  className = "",
}: StartGameButtonProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (!canStart || isStarting || !isHost) return;
    
    setClicked(true);
    onStartGame();
    
    // Reset clicked state after animation
    setTimeout(() => setClicked(false), 300);
  };

  if (!isHost) {
    return (
      <div 
        className={`text-center py-4 ${className}`}
        data-testid="start-game-button"
      >
        <div className="text-slate-400 text-sm">
          Waiting for host to start the game...
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`text-center ${className}`}
      data-testid="start-game-button"
    >
      <button
        onClick={handleClick}
        disabled={!canStart || isStarting}
        className={`
          relative px-8 py-3 text-xl font-bold tracking-wide rounded-xl
          transition-all duration-200 ease-out
          ${
            canStart && !isStarting
              ? 'bg-gradient-to-r from-[#3d3d7a] to-[#4a4a96] hover:from-[#4a4a96] hover:to-[#5a5ab2] text-white shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95'
              : 'bg-gray-500 opacity-50 cursor-not-allowed text-gray-300'
          }
          ${clicked ? 'animate-pulse' : ''}
          ${isStarting ? 'animate-pulse' : ''}
        `}
      >
        {isStarting ? (
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Starting Game...
          </div>
        ) : (
          'Start Game'
        )}
      </button>

      {!canStart && (
        <div className="mt-3 text-sm text-slate-400">
          Complete all requirements to start the game
        </div>
      )}
    </div>
  );
}

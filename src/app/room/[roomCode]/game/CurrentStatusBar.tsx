import type { GameProgress, GamePhase } from '~/types/game-progress';
import { formatTimeRemaining, getTimerState } from '~/lib/game-progress-utils';

interface CurrentStatusBarProps {
  progress: GameProgress;
  className?: string;
}

export default function CurrentStatusBar({ progress, className = '' }: CurrentStatusBarProps) {
  const { currentRound, totalRounds, currentPhase, currentLeader, gameTimer, playerStatuses } = progress;
  
  const leaderPlayer = playerStatuses.find(p => p.playerId === currentLeader);
  const timerState = gameTimer ? getTimerState(gameTimer) : 'normal';
  
  const getTimerColor = () => {
    switch (timerState) {
      case 'urgent': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase.status) {
      case 'active': return 'text-amber-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-[#1a1a2e]/90 backdrop-blur-sm border-b border-[#3b4171]/30 px-6 py-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left Section - Round & Phase */}
          <div className="flex items-center gap-6">
            {/* Round Number */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#1e40af] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{currentRound}</span>
              </div>
              <div>
                <div className="text-white font-semibold">Round {currentRound}</div>
                <div className="text-gray-400 text-sm">of {totalRounds}</div>
              </div>
            </div>

            {/* Phase Indicator */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                currentPhase.status === 'active' ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'
              }`} />
              <div>
                <div className={`font-semibold ${getPhaseColor()}`}>{currentPhase.name}</div>
                <div className="text-gray-500 text-sm">{currentPhase.description}</div>
              </div>
            </div>
          </div>

          {/* Center Section - Leader */}
          <div className="flex items-center gap-3">
            <div className="text-[#8b5cf6] text-lg">👑</div>
            <div className="text-center">
              <div className="text-white font-semibold">Current Leader</div>
              <div className="text-[#8b5cf6] text-sm font-medium">
                {leaderPlayer?.playerName || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Right Section - Timer */}
          {gameTimer && gameTimer.isActive && (
            <div className="flex items-center gap-3">
              <div className={`text-lg ${timerState === 'urgent' ? 'animate-pulse' : ''}`}>
                {timerState === 'urgent' ? '⚠️' : '⏰'}
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">{gameTimer.label}</div>
                <div className={`text-lg font-mono ${getTimerColor()}`}>
                  {formatTimeRemaining(gameTimer.remainingTime)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Phase Progress</span>
            <span className="text-sm text-gray-400">{currentPhase.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#3b82f6] to-[#1e40af] h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentPhase.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

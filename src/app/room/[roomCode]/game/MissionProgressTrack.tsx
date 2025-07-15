import type { MissionResult, ScoreTracker } from '~/types/game-progress';

interface MissionProgressTrackProps {
  missionResults: MissionResult[];
  scoreTracker: ScoreTracker;
  currentRound: number;
  className?: string;
}

export default function MissionProgressTrack({ 
  missionResults, 
  scoreTracker, 
  currentRound,
  className = '' 
}: MissionProgressTrackProps) {
  const { totalMissions, goodTeamWins, evilTeamWins, isGameComplete, winner } = scoreTracker;

  const getMissionIcon = (result: MissionResult | null, missionNumber: number) => {
    if (!result) {
      return missionNumber === currentRound ? '🎯' : '⚪';
    }
    return result.outcome === 'success' ? '✅' : '❌';
  };

  const getMissionColor = (result: MissionResult | null, missionNumber: number) => {
    if (!result) {
      return missionNumber === currentRound ? 'border-amber-400 bg-amber-400/10' : 'border-gray-600 bg-gray-600/10';
    }
    return result.outcome === 'success' 
      ? 'border-green-500 bg-green-500/10' 
      : 'border-red-500 bg-red-500/10';
  };

  const getMissionTextColor = (result: MissionResult | null, missionNumber: number) => {
    if (!result) {
      return missionNumber === currentRound ? 'text-amber-400' : 'text-gray-400';
    }
    return result.outcome === 'success' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className={`bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Mission Progress</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{goodTeamWins}</div>
            <div className="text-sm text-gray-400">Good</div>
          </div>
          <div className="text-gray-500 text-lg">vs</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{evilTeamWins}</div>
            <div className="text-sm text-gray-400">Evil</div>
          </div>
        </div>
      </div>

      {/* Mission Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-600" />
        <div 
          className="absolute top-8 left-8 h-0.5 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] transition-all duration-1000"
          style={{ width: `${((currentRound - 1) / (totalMissions - 1)) * 100}%` }}
        />

        {/* Mission Markers */}
        <div className="flex justify-between">
          {Array.from({ length: totalMissions }, (_, index) => {
            const missionNumber = index + 1;
            const result = missionResults.find(r => r.missionNumber === missionNumber) ?? null;
            
            return (
              <div key={missionNumber} className="flex flex-col items-center">
                {/* Mission Circle */}
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  getMissionColor(result, missionNumber)
                }`}>
                  <span className="text-2xl">
                    {getMissionIcon(result, missionNumber)}
                  </span>
                </div>

                {/* Mission Label */}
                <div className="mt-2 text-center">
                  <div className={`font-semibold ${getMissionTextColor(result, missionNumber)}`}>
                    Mission {missionNumber}
                  </div>
                  {result && (
                    <div className="text-xs text-gray-500 mt-1">
                      {result.teamMembers.length} members
                    </div>
                  )}
                </div>

                {/* Mission Details */}
                {result && (
                  <div className="mt-2 text-center">
                    <div className="text-xs text-gray-400">
                      {result.votes.success}✅ {result.votes.failure}❌
                    </div>
                    {result.failVotesRequired > 1 && (
                      <div className="text-xs text-amber-400 mt-1">
                        Needs {result.failVotesRequired} fails
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Status */}
      {isGameComplete && (
        <div className="mt-6 text-center">
          <div className={`text-2xl font-bold mb-2 ${
            winner === 'good' ? 'text-green-400' : 'text-red-400'
          }`}>
            {winner === 'good' ? '🏆 Good Team Victory!' : '👑 Evil Team Victory!'}
          </div>
          <div className="text-gray-400 text-sm">
            {scoreTracker.winCondition}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {!isGameComplete && (
        <div className="mt-6 text-center">
          <div className="text-gray-400 text-sm">
            {goodTeamWins >= 3 
              ? 'Good team needs to complete 3 missions to win!'
              : evilTeamWins >= 3
                ? 'Evil team needs to sabotage 3 missions to win!'
                : 'First to 3 mission wins claims victory!'
            }
          </div>
        </div>
      )}
    </div>
  );
}

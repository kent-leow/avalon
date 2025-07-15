import type { MissionTeamMember, VotingProgress } from '~/types/mission-execution';

interface MissionTeamStatusProps {
  teamMembers: MissionTeamMember[];
  votingProgress: VotingProgress;
  className?: string;
}

export default function MissionTeamStatus({ 
  teamMembers, 
  votingProgress, 
  className = '' 
}: MissionTeamStatusProps) {
  return (
    <div className={`bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6 ${className}`}>
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Mission Team</h3>
        <div className="text-sm text-gray-400">
          {votingProgress.votesSubmitted} / {votingProgress.totalVotes} votes
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Voting Progress</span>
          <span className="text-sm font-medium text-gray-300">{votingProgress.percentageComplete}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#3b82f6] to-[#1e40af] h-2 rounded-full transition-all duration-500"
            style={{ width: `${votingProgress.percentageComplete}%` }}
          />
        </div>
      </div>

      {/* Team Members */}
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div
            key={member.playerId}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              member.isCurrentPlayer
                ? 'bg-[#3b82f6]/20 border-[#3b82f6]/30'
                : 'bg-black/20 border-gray-600/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                member.isCurrentPlayer
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {member.playerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={`font-medium ${
                  member.isCurrentPlayer ? 'text-white' : 'text-gray-300'
                }`}>
                  {member.playerName}
                  {member.isCurrentPlayer && <span className="text-[#3b82f6] ml-1">(You)</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {member.hasVoted ? (
                <div className="flex items-center gap-1 text-green-400">
                  <span className="text-sm">✓</span>
                  <span className="text-sm font-medium">Voted</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Waiting</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion Status */}
      {votingProgress.isComplete && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-400">
            <span className="text-lg">🎯</span>
            <span className="font-semibold">All votes submitted!</span>
          </div>
          <p className="text-green-300 text-sm mt-1">
            Calculating mission results...
          </p>
        </div>
      )}

      {/* Time Remaining */}
      {votingProgress.timeRemaining && votingProgress.timeRemaining > 0 && !votingProgress.isComplete && (
        <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="text-lg">⏰</span>
            <span className="font-semibold">
              Time remaining: {Math.ceil(votingProgress.timeRemaining / 1000)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

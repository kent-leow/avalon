import type { MissionVoteOption } from '~/types/mission-execution';

interface MissionVotingInterfaceProps {
  voteOptions: MissionVoteOption[];
  onVote: (vote: 'success' | 'failure') => void;
  hasVoted: boolean;
  canVote: boolean;
  playerRole: 'good' | 'evil';
  className?: string;
}

export default function MissionVotingInterface({ 
  voteOptions, 
  onVote, 
  hasVoted, 
  canVote, 
  playerRole,
  className = '' 
}: MissionVotingInterfaceProps) {
  if (hasVoted) {
    return (
      <div className={`bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Vote Submitted</h3>
          <p className="text-gray-400">
            Waiting for other team members to vote...
          </p>
        </div>
      </div>
    );
  }

  if (!canVote) {
    return (
      <div className={`bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Mission In Progress</h3>
          <p className="text-gray-400">
            You are not on this mission team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6 ${className}`}>
      {/* Role Reminder */}
      <div className="mb-6 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
          playerRole === 'good' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          <span className="text-lg">{playerRole === 'good' ? '🛡️' : '⚔️'}</span>
          <span>Playing as {playerRole === 'good' ? 'Good' : 'Evil'}</span>
        </div>
      </div>

      {/* Vote Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white text-center mb-4">
          Cast Your Vote
        </h3>
        
        {voteOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onVote(option.value)}
            disabled={!option.available}
            className={`w-full p-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              option.style === 'success'
                ? option.available
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg shadow-green-500/25 border border-green-500/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : option.available
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/25 border border-red-500/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            } ${!option.available ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">{option.icon}</span>
              <div className="text-left">
                <div className="font-bold">{option.label}</div>
                <div className="text-sm opacity-90">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Strategic Hint */}
      <div className="mt-6 p-3 bg-black/20 border border-gray-600/30 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300 mb-2">
          <span className="text-lg">💡</span>
          <span className="font-semibold text-sm">Strategic Hint:</span>
        </div>
        <p className="text-gray-400 text-sm">
          {playerRole === 'good' 
            ? 'As a good player, you must help the mission succeed. Evil players may try to sabotage it.'
            : 'As an evil player, you can choose to succeed or fail this mission based on your strategy.'
          }
        </p>
      </div>
    </div>
  );
}

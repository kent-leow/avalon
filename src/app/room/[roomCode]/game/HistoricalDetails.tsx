import type { GameProgress, VoteHistoryEntry, PhaseHistoryEntry } from '~/types/game-progress';
import { formatTimeRemaining } from '~/lib/game-progress-utils';

interface HistoricalDetailsProps {
  gameProgress: GameProgress;
  voteHistory: VoteHistoryEntry[];
  className?: string;
}

export default function HistoricalDetails({ 
  gameProgress, 
  voteHistory,
  className = '' 
}: HistoricalDetailsProps) {
  const { phaseHistory, missionResults } = gameProgress;

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'Team Selection':
        return '🎯';
      case 'Team Voting':
        return '🗳️';
      case 'Mission Execution':
        return '⚔️';
      case 'Mission Results':
        return '📊';
      case 'Assassin Phase':
        return '🗡️';
      default:
        return '📋';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Team Selection':
        return 'text-blue-400';
      case 'Team Voting':
        return 'text-purple-400';
      case 'Mission Execution':
        return 'text-orange-400';
      case 'Mission Results':
        return 'text-green-400';
      case 'Assassin Phase':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getVoteIcon = (voteType: string, result: string) => {
    if (voteType === 'team-proposal') {
      return result === 'approved' ? '✅' : '❌';
    }
    return result === 'success' ? '✅' : '❌';
  };

  const getVoteColor = (result: string) => {
    return result === 'approved' || result === 'success' ? 'text-green-400' : 'text-red-400';
  };

  const sortedHistory = [...phaseHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const sortedVotes = [...voteHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={`bg-[#252547]/90 backdrop-blur-sm border border-[#3b4171]/30 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Game History</h3>
        <div className="text-sm text-gray-400">
          {sortedHistory.length} phases • {sortedVotes.length} votes
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3b4171]/30 mb-6">
        <button className="px-4 py-2 text-white bg-[#3b4171]/50 rounded-t-lg border-b-2 border-blue-400">
          Phase History
        </button>
        <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
          Vote History
        </button>
      </div>

      {/* Phase History Tab */}
      <div className="space-y-4">
        {sortedHistory.map((entry, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-[#1a1a3a]/50 rounded-lg">
            {/* Icon */}
            <div className="text-2xl mt-1">
              {getPhaseIcon(entry.phase)}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className={`font-semibold ${getPhaseColor(entry.phase)}`}>
                  {entry.phase}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {/* Duration */}
              <div className="text-sm text-gray-400 mb-2">
                Duration: {formatTimeRemaining(entry.duration)}
              </div>

              {/* Participants */}
              {entry.participants.length > 0 && (
                <div className="text-sm text-gray-400 mb-2">
                  Participants: {entry.participants.join(', ')}
                </div>
              )}

              {/* Outcome */}
              {entry.outcome && (
                <div className="text-sm text-gray-300">
                  Outcome: {entry.outcome}
                </div>
              )}

              {/* Details */}
              {Object.keys(entry.details).length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {Object.entries(entry.details).map(([key, value]) => (
                    <div key={key}>
                      {key}: {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {sortedHistory.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No phase history available
          </div>
        )}
      </div>

      {/* Vote History Tab (hidden by default) */}
      <div className="hidden space-y-4">
        {sortedVotes.map((vote, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-[#1a1a3a]/50 rounded-lg">
            {/* Icon */}
            <div className="text-2xl mt-1">
              {getVoteIcon(vote.voteType, vote.result)}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-white">
                  {vote.voteType === 'team-proposal' ? 'Team Proposal' : 'Mission Outcome'}
                </div>
                <div className="text-xs text-gray-500">
                  Round {vote.round} • {new Date(vote.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {/* Result */}
              <div className={`text-sm font-medium mb-2 ${getVoteColor(vote.result)}`}>
                {vote.result.charAt(0).toUpperCase() + vote.result.slice(1)}
              </div>

              {/* Proposed Team */}
              {vote.proposedTeam && (
                <div className="text-sm text-gray-400 mb-2">
                  Proposed Team: {vote.proposedTeam.join(', ')}
                </div>
              )}

              {/* Individual Votes */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {vote.votes.map((v, vIndex) => (
                  <div key={vIndex} className="flex items-center justify-between">
                    <span className="text-gray-400">{v.playerName}</span>
                    <span className={`${
                      v.vote === 'approve' || v.vote === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {v.vote === 'approve' ? '✅' : v.vote === 'reject' ? '❌' : 
                       v.vote === 'success' ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {sortedVotes.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No vote history available
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-[#1a1a3a]/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Game Statistics</div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-gray-400">Completed Missions</div>
            <div className="text-white font-semibold">
              {missionResults.filter(m => m.outcome !== 'pending').length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Total Vote Rounds</div>
            <div className="text-white font-semibold">
              {sortedVotes.length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Average Phase Duration</div>
            <div className="text-white font-semibold">
              {sortedHistory.length > 0 
                ? formatTimeRemaining(sortedHistory.reduce((sum, h) => sum + h.duration, 0) / sortedHistory.length)
                : '0s'
              }
            </div>
          </div>
          <div>
            <div className="text-gray-400">Game Duration</div>
            <div className="text-white font-semibold">
              {sortedHistory.length > 0 
                ? formatTimeRemaining(Date.now() - new Date(sortedHistory[sortedHistory.length - 1]?.timestamp ?? Date.now()).getTime())
                : '0s'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { type VotingProgress, type RejectionTracker } from "~/types/voting";

interface VotingProgressTrackerProps {
  progress: VotingProgress;
  rejectionTracker: RejectionTracker;
  timeRemaining: number;
}

export default function VotingProgressTracker({
  progress,
  rejectionTracker,
  timeRemaining,
}: VotingProgressTrackerProps) {
  const isUrgent = timeRemaining <= 10;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-[#1a1a2e]/90 backdrop-blur-xl rounded-lg border border-slate-600/30 p-4 min-w-[300px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Voting Progress</h3>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isUrgent 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {progress.votesReceived}/{progress.totalPlayers}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">Votes Collected</span>
            <span className="text-white text-sm font-medium">
              {Math.round(progress.percentage)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.percentage === 100 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Rejection tracker */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">Proposal Rejections</span>
            <span className={`text-sm font-medium ${
              rejectionTracker.isCritical 
                ? 'text-red-400' 
                : rejectionTracker.isNearLimit 
                ? 'text-amber-400' 
                : 'text-slate-300'
            }`}>
              {rejectionTracker.currentRejections}/{rejectionTracker.maxRejections}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                rejectionTracker.isCritical 
                  ? 'bg-red-500 animate-pulse' 
                  : rejectionTracker.isNearLimit 
                  ? 'bg-amber-500' 
                  : 'bg-slate-500'
              }`}
              style={{ width: `${(rejectionTracker.currentRejections / rejectionTracker.maxRejections) * 100}%` }}
            />
          </div>
          {rejectionTracker.isCritical && (
            <p className="text-red-400 text-xs mt-1 animate-pulse">
              ⚠️ Critical: Evil wins at {rejectionTracker.maxRejections} rejections!
            </p>
          )}
        </div>

        {/* Voted players */}
        <div className="mb-4">
          <h4 className="text-slate-300 text-sm mb-2">Voted ({progress.votedPlayers.length})</h4>
          <div className="flex flex-wrap gap-2">
            {progress.votedPlayers.map((player) => (
              <div key={player.id} className="flex items-center gap-2 bg-green-500/20 px-2 py-1 rounded border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-300 text-xs">{player.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining players */}
        {progress.remainingPlayers.length > 0 && (
          <div>
            <h4 className="text-slate-300 text-sm mb-2">Waiting ({progress.remainingPlayers.length})</h4>
            <div className="flex flex-wrap gap-2">
              {progress.remainingPlayers.map((player) => (
                <div key={player.id} className="flex items-center gap-2 bg-amber-500/20 px-2 py-1 rounded border border-amber-500/30">
                  <div className={`w-2 h-2 rounded-full ${
                    player.isOnline ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'
                  }`} />
                  <span className={`text-xs ${
                    player.isOnline ? 'text-amber-300' : 'text-slate-400'
                  }`}>
                    {player.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All votes collected */}
        {progress.percentage === 100 && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-green-300 text-sm font-medium">
                All votes collected! Revealing results...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { type VotingResult, type Vote } from "~/types/voting";

interface VotingResultsRevealProps {
  result: VotingResult;
  votes: Vote[];
  onContinue: () => void;
  rejectionCount: number;
}

export default function VotingResultsReveal({
  result,
  votes,
  onContinue,
  rejectionCount,
}: VotingResultsRevealProps) {
  const [countdown, setCountdown] = useState(3);
  const [showResults, setShowResults] = useState(false);
  const [animateNumbers, setAnimateNumbers] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowResults(true);
      setTimeout(() => setAnimateNumbers(true), 500);
    }
  }, [countdown]);

  const getResultMessage = () => {
    if (result.nextPhase === 'evilVictory') {
      return `Evil Team Wins! ${rejectionCount} proposals rejected.`;
    }
    
    if (result.approved) {
      return `Mission Team Approved!`;
    }
    
    return `Mission Team Rejected`;
  };

  const getResultColor = () => {
    if (result.nextPhase === 'evilVictory') {
      return 'from-red-600 to-red-800';
    }
    
    if (result.approved) {
      return 'from-green-600 to-green-800';
    }
    
    return 'from-red-600 to-red-800';
  };

  const getNextPhaseMessage = () => {
    if (result.nextPhase === 'evilVictory') {
      return 'Game Over - Evil Team Victorious';
    }
    
    if (result.approved) {
      return 'Proceeding to Mission Phase';
    }
    
    return 'Leadership passes to next player';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50">
      <div className="w-full max-w-2xl mx-4">
        {/* Countdown */}
        {countdown > 0 && (
          <div className="text-center">
            <div className="text-8xl font-bold text-white mb-4 animate-pulse">
              {countdown}
            </div>
            <p className="text-slate-300 text-xl">
              Revealing results...
            </p>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-8">
            {/* Main result */}
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 bg-gradient-to-r ${getResultColor()} bg-clip-text text-transparent`}>
                {getResultMessage()}
              </div>
              <p className="text-slate-300 text-xl">
                {getNextPhaseMessage()}
              </p>
            </div>

            {/* Vote tallies */}
            <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#252547]/80 backdrop-blur-xl rounded-xl border border-slate-600/30 p-8">
              <h3 className="text-white text-2xl font-bold text-center mb-6">
                Vote Results
              </h3>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Approve votes */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center border-4 border-green-400/50">
                    <div className={`text-4xl font-bold text-white transition-all duration-1000 ${
                      animateNumbers ? 'scale-100' : 'scale-0'
                    }`}>
                      {result.approveCount}
                    </div>
                  </div>
                  <div className="text-green-400 text-xl font-semibold mb-2">
                    APPROVE
                  </div>
                  <div className="text-slate-300 text-sm">
                    {((result.approveCount / result.totalVotes) * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Reject votes */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border-4 border-red-400/50">
                    <div className={`text-4xl font-bold text-white transition-all duration-1000 ${
                      animateNumbers ? 'scale-100' : 'scale-0'
                    }`}>
                      {result.rejectCount}
                    </div>
                  </div>
                  <div className="text-red-400 text-xl font-semibold mb-2">
                    REJECT
                  </div>
                  <div className="text-slate-300 text-sm">
                    {((result.rejectCount / result.totalVotes) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Vote breakdown */}
              <div className="mt-8 pt-6 border-t border-slate-600/30">
                <div className="text-center text-slate-300 text-sm">
                  Total Votes: {result.totalVotes} / {result.requiredVotes}
                </div>
                
                {/* Rejection counter */}
                {result.nextPhase !== 'evilVictory' && (
                  <div className="mt-4 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      rejectionCount >= 3 
                        ? 'bg-red-500/20 border border-red-500/30' 
                        : 'bg-slate-500/20 border border-slate-500/30'
                    }`}>
                      <span className="text-slate-300 text-sm">
                        Proposal Rejections: {rejectionCount}/5
                      </span>
                      {rejectionCount >= 3 && (
                        <span className="text-red-400 text-xs">
                          ⚠️ Danger Zone
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Continue button */}
            <div className="text-center">
              <button
                onClick={onContinue}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                {result.nextPhase === 'evilVictory' ? 'View Game Over' : 'Continue Game'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

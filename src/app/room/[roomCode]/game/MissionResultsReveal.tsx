import { useState, useEffect } from 'react';
import type { MissionResult, ResultAnimation } from '~/types/mission-execution';

interface MissionResultsRevealProps {
  result: MissionResult;
  onComplete: () => void;
  className?: string;
}

export default function MissionResultsReveal({ 
  result, 
  onComplete,
  className = '' 
}: MissionResultsRevealProps) {
  const [currentAnimation, setCurrentAnimation] = useState<ResultAnimation['type'] | null>(null);
  const [showVotes, setShowVotes] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [showImpact, setShowImpact] = useState(false);

  useEffect(() => {
    const runAnimations = async () => {
      for (const animation of result.animations) {
        await new Promise(resolve => setTimeout(resolve, animation.delay));
        
        setCurrentAnimation(animation.type);
        
        switch (animation.type) {
          case 'vote-reveal':
            setShowVotes(true);
            break;
          case 'calculation':
            setShowCalculation(true);
            break;
          case 'outcome':
            setShowOutcome(true);
            break;
          case 'impact':
            setShowImpact(true);
            break;
        }
        
        await new Promise(resolve => setTimeout(resolve, animation.duration));
      }
      
      setCurrentAnimation(null);
      setTimeout(onComplete, 1000);
    };

    runAnimations();
  }, [result, onComplete]);

  const getOutcomeColor = () => {
    return result.outcome === 'success' ? 'text-green-400' : 'text-red-400';
  };

  const getOutcomeGradient = () => {
    return result.outcome === 'success' 
      ? 'from-green-600 to-green-700' 
      : 'from-red-600 to-red-700';
  };

  const getOutcomeIcon = () => {
    return result.outcome === 'success' ? '⚔️' : '🗡️';
  };

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-[#1a1a2e] border border-[#3b4171]/30 rounded-lg p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Mission Results</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] mx-auto rounded-full" />
        </div>

        {/* Vote Reveal */}
        {showVotes && (
          <div className={`mb-6 p-4 rounded-lg border ${
            currentAnimation === 'vote-reveal' 
              ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/30 animate-pulse' 
              : 'bg-black/20 border-gray-600/30'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3 text-center">Vote Tally</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{result.votes.success}</div>
                <div className="text-sm text-gray-400">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{result.votes.failure}</div>
                <div className="text-sm text-gray-400">Failure</div>
              </div>
            </div>
          </div>
        )}

        {/* Calculation */}
        {showCalculation && (
          <div className={`mb-6 p-4 rounded-lg border ${
            currentAnimation === 'calculation' 
              ? 'bg-[#f59e0b]/20 border-[#f59e0b]/30 animate-pulse' 
              : 'bg-black/20 border-gray-600/30'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3 text-center">Calculation</h3>
            <div className="text-center">
              <p className="text-gray-300 mb-2">
                {result.failVotesRequired > 1 
                  ? `${result.failVotesRequired} failure votes required`
                  : '1 failure vote required'
                }
              </p>
              <p className="text-gray-300">
                {result.votes.failure} failure vote{result.votes.failure !== 1 ? 's' : ''} received
              </p>
            </div>
          </div>
        )}

        {/* Outcome */}
        {showOutcome && (
          <div className={`mb-6 p-6 rounded-lg border ${
            currentAnimation === 'outcome' 
              ? `bg-gradient-to-r ${getOutcomeGradient()} border-current animate-pulse` 
              : `bg-black/20 border-gray-600/30`
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-2">{getOutcomeIcon()}</div>
              <h3 className={`text-2xl font-bold mb-2 ${getOutcomeColor()}`}>
                Mission {result.outcome === 'success' ? 'Succeeded' : 'Failed'}!
              </h3>
              <p className="text-gray-300">
                {result.outcome === 'success' 
                  ? 'The forces of good prevail in this mission!'
                  : 'The shadows of evil have triumphed!'
                }
              </p>
            </div>
          </div>
        )}

        {/* Game Impact */}
        {showImpact && (
          <div className={`p-4 rounded-lg border ${
            currentAnimation === 'impact' 
              ? 'bg-[#3b82f6]/20 border-[#3b82f6]/30 animate-pulse' 
              : 'bg-black/20 border-gray-600/30'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3 text-center">Game Progress</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {result.gameImpact.goodTeamWins}
                </div>
                <div className="text-sm text-gray-400">Good Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {result.gameImpact.evilTeamWins}
                </div>
                <div className="text-sm text-gray-400">Evil Wins</div>
              </div>
            </div>
            
            {result.gameImpact.isGameOver && (
              <div className="text-center p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <div className="text-lg font-bold text-amber-400 mb-1">
                  {result.gameImpact.winner === 'good' ? '🏆 Good Team Victory!' : '👑 Evil Team Victory!'}
                </div>
                <p className="text-amber-300 text-sm">
                  {result.gameImpact.nextPhase === 'assassin-attempt' 
                    ? 'The Assassin gets one final chance!'
                    : 'The game is over!'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

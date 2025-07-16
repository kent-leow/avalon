/**
 * Assassin Screen Demo Component
 * 
 * Interactive demonstration of the assassin phase with mock data.
 */

'use client';

import React, { useState } from 'react';
import { AssassinScreen } from './AssassinScreen';
import { createMockAssassinAttempt } from '~/lib/assassin-attempt-utils';

export function AssassinScreenDemo() {
  const [gameComplete, setGameComplete] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [demoAttempt] = useState(() => createMockAssassinAttempt());
  
  const handleComplete = (result: any) => {
    setFinalResult(result);
    setGameComplete(true);
  };
  
  const handleRestart = () => {
    setGameComplete(false);
    setFinalResult(null);
    window.location.reload();
  };
  
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#252547] p-8 rounded-2xl border border-gray-600/30 shadow-2xl max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Demo Complete!
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className={`p-4 rounded-xl border ${
              finalResult.gameOutcome === 'evil-wins'
                ? 'bg-red-900/20 border-red-600/30'
                : 'bg-green-900/20 border-green-600/30'
            }`}>
              <h3 className={`text-xl font-semibold mb-2 ${
                finalResult.gameOutcome === 'evil-wins' ? 'text-red-400' : 'text-green-400'
              }`}>
                {finalResult.gameOutcome === 'evil-wins' ? 'Evil Wins!' : 'Good Wins!'}
              </h3>
              <p className="text-gray-300">
                {finalResult.wasCorrect 
                  ? 'The assassin successfully identified Merlin!'
                  : 'The assassin failed to identify Merlin!'
                }
              </p>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/30">
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                Decision Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Decision Time:</span>
                  <span className="text-blue-400">
                    {Math.round(finalResult.decisionDuration / 1000)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Selected:</span>
                  <span className="text-purple-400">
                    {finalResult.targetId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Outcome:</span>
                  <span className={finalResult.wasCorrect ? 'text-green-400' : 'text-red-400'}>
                    {finalResult.wasCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 border border-blue-500/50 shadow-lg shadow-blue-500/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-red-900/20 border-b border-purple-600/30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-400">
                🗡️ Assassin Phase Demo
              </h1>
              <p className="text-gray-400 mt-1">
                Interactive demonstration of the final assassination phase
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">
                Demo Mode
              </p>
              <p className="text-xs text-gray-500">
                Mock data • Educational purpose
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Demo Content */}
      <AssassinScreen
        attempt={demoAttempt}
        onComplete={handleComplete}
      />
      
      {/* Demo Footer */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-t border-gray-600/30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Demo Features:</span>
              <span className="text-blue-400">• Interactive target selection</span>
              <span className="text-green-400">• Strategic information analysis</span>
              <span className="text-purple-400">• Dramatic result reveal</span>
            </div>
            <div className="text-gray-500">
              Assassin Phase Demo v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

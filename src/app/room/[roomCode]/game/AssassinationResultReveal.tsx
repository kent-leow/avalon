/**
 * Assassination Result Reveal Component
 * 
 * Cinematic reveal sequence showing the assassination result and game conclusion.
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { AssassinResult, RevealSequence } from '~/types/assassin-attempt';
import { getCurrentRevealStage } from '~/lib/assassin-attempt-utils';

interface AssassinationResultRevealProps {
  result: AssassinResult;
  targetName: string;
  targetAvatar: string;
  onComplete: () => void;
}

export function AssassinationResultReveal({ 
  result, 
  targetName, 
  targetAvatar, 
  onComplete 
}: AssassinationResultRevealProps) {
  const [currentSequence, setCurrentSequence] = useState<RevealSequence>(result.revealSequence);
  const [showParticles, setShowParticles] = useState(false);
  
  const currentStage = getCurrentRevealStage(currentSequence);
  
  useEffect(() => {
    if (currentSequence.isComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentSequence.isComplete, onComplete]);
  
  useEffect(() => {
    setShowParticles(currentStage?.type === 'celebration');
  }, [currentStage]);
  
  const getStageContent = () => {
    if (!currentStage) return null;
    
    switch (currentStage.type) {
      case 'pause':
        return (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-600 animate-pulse">
              <span className="text-4xl">💀</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-4">
              The moment of truth...
            </h2>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        );
        
      case 'target-reveal':
        return (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center border-4 border-red-500 shadow-2xl shadow-red-500/50">
              <span className="text-5xl">{targetAvatar}</span>
            </div>
            <h2 className="text-3xl font-bold text-red-400 mb-4">
              Target: {targetName}
            </h2>
            <div className="bg-red-900/20 p-4 rounded-xl border border-red-600/30">
              <p className="text-gray-300">
                The assassin has chosen their target...
              </p>
            </div>
          </div>
        );
        
      case 'role-reveal':
        return (
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center border-4 border-purple-500 shadow-2xl shadow-purple-500/50">
                <span className="text-5xl">{targetAvatar}</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-transparent animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-purple-400 mb-4">
              {targetName} was...
            </h2>
            <div className="bg-purple-900/20 p-6 rounded-xl border border-purple-600/30">
              <h3 className="text-2xl font-bold text-purple-300 mb-2">
                {result.wasCorrect ? '👑 MERLIN' : '⚔️ LOYAL SERVANT'}
              </h3>
              <p className="text-gray-300">
                {result.wasCorrect 
                  ? 'The wise wizard who guided the forces of good'
                  : 'A brave servant of the realm, but not the one sought'
                }
              </p>
            </div>
          </div>
        );
        
      case 'outcome-reveal':
        return (
          <div className="text-center">
            <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center border-4 shadow-2xl ${
              result.gameOutcome === 'evil-wins'
                ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-500 shadow-red-500/50'
                : 'bg-gradient-to-br from-green-600 to-green-800 border-green-500 shadow-green-500/50'
            }`}>
              <span className="text-5xl">
                {result.gameOutcome === 'evil-wins' ? '👹' : '👑'}
              </span>
            </div>
            <h2 className={`text-4xl font-bold mb-4 ${
              result.gameOutcome === 'evil-wins' ? 'text-red-400' : 'text-green-400'
            }`}>
              {result.gameOutcome === 'evil-wins' ? 'EVIL WINS!' : 'GOOD WINS!'}
            </h2>
            <div className={`p-6 rounded-xl border ${
              result.gameOutcome === 'evil-wins'
                ? 'bg-red-900/20 border-red-600/30'
                : 'bg-green-900/20 border-green-600/30'
            }`}>
              <p className="text-gray-300 text-lg">
                {result.gameOutcome === 'evil-wins'
                  ? 'The assassin has successfully eliminated Merlin! The forces of evil triumph!'
                  : 'The assassin has failed to identify Merlin! The forces of good are victorious!'
                }
              </p>
            </div>
          </div>
        );
        
      case 'celebration':
        return (
          <div className="text-center">
            <div className={`w-40 h-40 mx-auto mb-6 rounded-full flex items-center justify-center border-4 shadow-2xl animate-bounce ${
              result.gameOutcome === 'evil-wins'
                ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-500 shadow-red-500/50'
                : 'bg-gradient-to-br from-green-600 to-green-800 border-green-500 shadow-green-500/50'
            }`}>
              <span className="text-6xl">
                {result.gameOutcome === 'evil-wins' ? '🎭' : '🎉'}
              </span>
            </div>
            <h2 className={`text-5xl font-bold mb-6 ${
              result.gameOutcome === 'evil-wins' ? 'text-red-400' : 'text-green-400'
            }`}>
              {result.gameOutcome === 'evil-wins' ? 'DARKNESS PREVAILS' : 'LIGHT TRIUMPHS'}
            </h2>
            <div className={`p-6 rounded-xl border ${
              result.gameOutcome === 'evil-wins'
                ? 'bg-red-900/20 border-red-600/30'
                : 'bg-green-900/20 border-green-600/30'
            }`}>
              <p className="text-gray-300 text-xl mb-4">
                {result.gameOutcome === 'evil-wins'
                  ? 'The realm falls to shadow and chaos. Evil has won through cunning and deception.'
                  : 'The realm is saved by the courage of good. Light conquers the darkness once more.'
                }
              </p>
              <p className="text-gray-400">
                Decision made in {Math.round(result.decisionDuration / 1000)} seconds
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-8 rounded-2xl border-2 border-gray-600/50 shadow-2xl max-w-lg w-full relative overflow-hidden">
        {/* Stage Content */}
        <div className="relative z-10">
          {getStageContent()}
        </div>
        
        {/* Particle Effects */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-ping ${
                  result.gameOutcome === 'evil-wins' ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Atmospheric Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 rounded-full blur-3xl ${
            result.gameOutcome === 'evil-wins' ? 'bg-red-600/20' : 'bg-green-600/20'
          }`} />
          <div className="absolute inset-0 rounded-2xl border border-gray-600/30 animate-pulse" />
        </div>
        
        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {result.revealSequence.stages.map((stage, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSequence.currentStage
                    ? 'bg-blue-500'
                    : index < currentSequence.currentStage
                    ? 'bg-gray-400'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

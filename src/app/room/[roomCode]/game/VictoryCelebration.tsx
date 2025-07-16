/**
 * Victory Celebration Component
 * 
 * Displays the final game outcome with celebratory animations and team-specific effects.
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { GameOutcome } from '~/types/game-results';
import { formatDuration } from '~/lib/game-results-utils';

interface VictoryCelebrationProps {
  outcome: GameOutcome;
  gameDuration: number;
  onComplete: () => void;
}

export function VictoryCelebration({ outcome, gameDuration, onComplete }: VictoryCelebrationProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [currentMoment, setCurrentMoment] = useState(0);
  
  useEffect(() => {
    setShowParticles(true);
    
    // Auto-advance key moments
    const interval = setInterval(() => {
      setCurrentMoment(prev => {
        if (prev < outcome.keyMoments.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 2000);
    
    // Auto-complete after showing all moments
    const timer = setTimeout(() => {
      onComplete();
    }, outcome.keyMoments.length * 2000 + 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [outcome.keyMoments.length, onComplete]);
  
  const getVictoryIcon = () => {
    return outcome.winner === 'good' ? '👑' : '🗡️';
  };
  
  const getVictoryColors = () => {
    return outcome.winner === 'good' 
      ? 'from-green-600 to-green-800 border-green-500 shadow-green-500/50'
      : 'from-red-600 to-red-800 border-red-500 shadow-red-500/50';
  };
  
  const getVictoryText = () => {
    return outcome.winner === 'good' ? 'LIGHT TRIUMPHS!' : 'DARKNESS PREVAILS!';
  };
  
  const getMarginDescription = () => {
    switch (outcome.margin) {
      case 'decisive': return 'Decisive Victory';
      case 'close': return 'Close Victory';
      case 'narrow': return 'Narrow Victory';
      default: return 'Victory';
    }
  };
  
  const getWinConditionDescription = () => {
    switch (outcome.winCondition) {
      case 'three-missions-good': return 'Three missions completed successfully';
      case 'three-missions-evil': return 'Three missions sabotaged';
      case 'assassin-success': return 'Assassin identified Merlin';
      case 'assassin-failure': return 'Assassin failed to identify Merlin';
      case 'five-rejections': return 'Five mission proposals rejected';
      default: return 'Victory achieved';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-8 rounded-2xl border-2 border-gray-600/50 shadow-2xl max-w-2xl w-full relative overflow-hidden">
        {/* Main Victory Display */}
        <div className="text-center mb-8">
          <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center border-4 shadow-2xl animate-bounce bg-gradient-to-br ${getVictoryColors()}`}>
            <span className="text-6xl">{getVictoryIcon()}</span>
          </div>
          
          <h1 className={`text-5xl font-bold mb-4 ${outcome.winner === 'good' ? 'text-green-400' : 'text-red-400'}`}>
            {getVictoryText()}
          </h1>
          
          <div className={`inline-block px-6 py-3 rounded-full border ${
            outcome.winner === 'good' 
              ? 'bg-green-900/20 border-green-600/30 text-green-300'
              : 'bg-red-900/20 border-red-600/30 text-red-300'
          }`}>
            <p className="text-lg font-semibold">
              {getMarginDescription()}
            </p>
          </div>
        </div>
        
        {/* Win Condition */}
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-600/30 mb-6">
          <h2 className="text-xl font-semibold text-gray-300 mb-3 text-center">
            Victory Condition
          </h2>
          <p className="text-gray-400 text-center mb-4">
            {getWinConditionDescription()}
          </p>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-gray-300 text-center">
              {outcome.description}
            </p>
          </div>
        </div>
        
        {/* Key Moments */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">
            Decisive Moments
          </h3>
          <div className="space-y-3">
            {outcome.keyMoments.slice(0, currentMoment + 1).map((moment, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all duration-500 ${
                  index === currentMoment
                    ? 'bg-blue-900/20 border-blue-600/30 animate-pulse'
                    : 'bg-gray-900/30 border-gray-600/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    {moment.description}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    moment.impact === 'critical' 
                      ? 'bg-red-600/20 text-red-400'
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {moment.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-600/30">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Game Duration</h4>
            <p className="text-lg font-semibold text-blue-400">
              {formatDuration(gameDuration)}
            </p>
          </div>
          <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-600/30">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Final Score</h4>
            <p className="text-lg font-semibold text-green-400">
              {outcome.finalScore.goodPoints} - {outcome.finalScore.evilPoints}
            </p>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 border border-blue-500/50 shadow-lg shadow-blue-500/20"
          >
            View Full Results
          </button>
        </div>
        
        {/* Particle Effects */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-ping ${
                  outcome.winner === 'good' ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Atmospheric Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 rounded-full blur-3xl ${
            outcome.winner === 'good' ? 'bg-green-600/20' : 'bg-red-600/20'
          }`} />
          <div className="absolute inset-0 rounded-2xl border border-gray-600/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

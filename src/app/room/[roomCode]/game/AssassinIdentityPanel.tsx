/**
 * Assassin Identity Panel Component
 * 
 * Displays the assassin's identity and power description with dramatic effects.
 */

'use client';

import React from 'react';
import type { AssassinPlayer, AssassinTimer } from '~/types/assassin-attempt';
import { formatTimeRemaining, getTimerState } from '~/lib/assassin-attempt-utils';

interface AssassinIdentityPanelProps {
  assassin: AssassinPlayer;
  timer: AssassinTimer;
}

export function AssassinIdentityPanel({ assassin, timer }: AssassinIdentityPanelProps) {
  const timerState = getTimerState(timer);
  
  const getTimerStyles = () => {
    switch (timerState) {
      case 'critical':
        return 'text-red-400 animate-pulse';
      case 'warning':
        return 'text-amber-400';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-blue-400';
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547] p-8 rounded-2xl border border-red-600/20 shadow-2xl">
      {/* Dark Glass Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-red-900/5 rounded-2xl" />
      
      <div className="relative z-10 space-y-6">
        {/* Assassin Badge */}
        <div className="flex items-center justify-center space-x-4">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center border-2 border-red-600/50">
            <span className="text-2xl">🗡️</span>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-2">
              The Assassin
            </h2>
            <p className="text-xl text-gray-300">
              {assassin.name}
            </p>
          </div>
        </div>
        
        {/* Power Description */}
        <div className="text-center space-y-4">
          <div className="bg-red-900/20 p-6 rounded-xl border border-red-600/30">
            <h3 className="text-lg font-semibold text-red-400 mb-3">
              Your Final Power
            </h3>
            <p className="text-gray-300 leading-relaxed">
              The forces of good have won three missions, but you hold the power to claim ultimate victory. 
              <span className="text-red-400 font-semibold"> Identify and eliminate Merlin</span> to secure 
              evil's triumph. Choose wisely—you have only one chance to change the fate of the realm.
            </p>
          </div>
          
          {/* Strategic Context */}
          <div className="bg-[#252547]/50 p-4 rounded-xl border border-purple-600/30">
            <h4 className="text-sm font-medium text-purple-400 mb-2">
              Strategic Context
            </h4>
            <p className="text-gray-400 text-sm">
              Good has prevailed in battle, but Merlin's identity remains hidden. 
              Use your knowledge of the game's events to identify the one who guided the forces of light.
            </p>
          </div>
        </div>
        
        {/* Decision Timer */}
        <div className="text-center">
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/30">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Time Remaining
            </h4>
            <div className={`text-2xl font-mono font-bold ${getTimerStyles()}`}>
              {formatTimeRemaining(timer.timeRemaining)}
            </div>
            
            {/* Timer Warning Messages */}
            {timerState === 'warning' && (
              <p className="text-amber-400 text-sm mt-2">
                ⚠️ Time is running short!
              </p>
            )}
            
            {timerState === 'critical' && (
              <p className="text-red-400 text-sm mt-2 animate-pulse">
                🚨 Critical time remaining!
              </p>
            )}
            
            {timerState === 'expired' && (
              <p className="text-red-600 text-sm mt-2">
                ⏰ Time has expired!
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Atmospheric Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle Glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-red-600/10 rounded-full blur-3xl" />
        
        {/* Pulsing Border */}
        <div className="absolute inset-0 rounded-2xl border border-red-600/30 animate-pulse" />
      </div>
    </div>
  );
}

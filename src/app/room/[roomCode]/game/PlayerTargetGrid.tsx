/**
 * Player Target Grid Component
 * 
 * Interactive grid allowing assassin to select their target with strategic information.
 */

'use client';

import React from 'react';
import type { AssassinTarget } from '~/types/assassin-attempt';

interface PlayerTargetGridProps {
  targets: AssassinTarget[];
  selectedTarget?: string;
  onTargetSelect: (targetId: string) => void;
  canSelect: boolean;
}

export function PlayerTargetGrid({ 
  targets, 
  selectedTarget, 
  onTargetSelect, 
  canSelect 
}: PlayerTargetGridProps) {
  const getSuspicionColor = (level: number) => {
    switch (level) {
      case 5:
        return 'border-red-500 bg-red-600/10';
      case 4:
        return 'border-orange-500 bg-orange-600/10';
      case 3:
        return 'border-yellow-500 bg-yellow-600/10';
      case 2:
        return 'border-blue-500 bg-blue-600/10';
      case 1:
        return 'border-green-500 bg-green-600/10';
      default:
        return 'border-gray-500 bg-gray-600/10';
    }
  };
  
  const getSuspicionLabel = (level: number) => {
    switch (level) {
      case 5:
        return 'Extremely Suspicious';
      case 4:
        return 'Highly Suspicious';
      case 3:
        return 'Moderately Suspicious';
      case 2:
        return 'Slightly Suspicious';
      case 1:
        return 'Low Suspicion';
      default:
        return 'Unknown';
    }
  };
  
  const getHintIcon = (type: string) => {
    switch (type) {
      case 'voting':
        return '🗳️';
      case 'team-selection':
        return '👥';
      case 'behavior':
        return '🎭';
      case 'mission-outcome':
        return '⚔️';
      default:
        return '💭';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-red-400 mb-2">
          Choose Your Target
        </h3>
        <p className="text-gray-400">
          Select the player you believe to be Merlin
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets.map((target) => (
          <div
            key={target.id}
            className={`relative bg-gradient-to-br from-[#1a1a2e] to-[#252547] p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
              selectedTarget === target.id
                ? 'border-red-500 bg-red-600/20 shadow-lg shadow-red-500/30'
                : getSuspicionColor(target.behavior.suspicionLevel)
            } ${
              canSelect 
                ? 'hover:scale-105 hover:shadow-lg hover:shadow-red-500/20' 
                : 'cursor-not-allowed opacity-50'
            }`}
            onClick={() => canSelect && onTargetSelect(target.id)}
          >
            {/* Targeting Overlay */}
            {selectedTarget === target.id && (
              <div className="absolute inset-0 rounded-xl border-2 border-red-500">
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                <div className="absolute bottom-2 left-2 text-red-400 text-sm font-semibold">
                  TARGETED
                </div>
              </div>
            )}
            
            {/* Player Avatar */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl border-2 border-gray-600">
                {target.avatar}
              </div>
            </div>
            
            {/* Player Name */}
            <h4 className="text-lg font-semibold text-white text-center mb-3">
              {target.name}
            </h4>
            
            {/* Suspicion Level */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Suspicion Level</span>
                <span className="text-sm font-semibold text-red-400">
                  {target.behavior.suspicionLevel}/5
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(target.behavior.suspicionLevel / 5) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">
                {getSuspicionLabel(target.behavior.suspicionLevel)}
              </p>
            </div>
            
            {/* Strategic Hints */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-purple-400 mb-2">
                Strategic Hints
              </h5>
              {target.hints.slice(0, 2).map((hint, index) => (
                <div key={index} className="bg-gray-900/50 p-2 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs">{getHintIcon(hint.type)}</span>
                    <span className="text-xs text-gray-400 capitalize">
                      {hint.type.replace('-', ' ')}
                    </span>
                    <div className="flex-1" />
                    <div className="flex space-x-1">
                      {Array.from({ length: hint.strength }, (_, i) => (
                        <div key={i} className="w-1 h-1 bg-amber-400 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-300">
                    {hint.description}
                  </p>
                </div>
              ))}
              
              {target.hints.length > 2 && (
                <p className="text-xs text-gray-500 text-center">
                  +{target.hints.length - 2} more hints
                </p>
              )}
            </div>
            
            {/* Behavior Summary */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-gray-400">Missions</p>
                  <p className="text-blue-400 font-semibold">
                    {target.behavior.missionParticipation.totalMissions}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Success Rate</p>
                  <p className="text-green-400 font-semibold">
                    {Math.round(target.behavior.missionParticipation.successRate * 100)}%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Hover Effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-600/0 via-transparent to-red-600/0 group-hover:from-red-600/5 group-hover:to-red-600/5 transition-all duration-300" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Selection Help */}
      {canSelect && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Click on a player to select them as your target
          </p>
        </div>
      )}
    </div>
  );
}

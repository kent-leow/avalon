/**
 * Strategic Information Panel Component
 * 
 * Displays game context and strategic analysis to help assassin identify Merlin.
 */

'use client';

import React, { useState } from 'react';
import type { StrategyInfo, GameContext } from '~/types/assassin-attempt';

interface StrategyInfoPanelProps {
  strategicInfo: StrategyInfo;
  gameContext: GameContext;
}

export function StrategyInfoPanel({ strategicInfo, gameContext }: StrategyInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'missions' | 'voting' | 'teams' | 'clues'>('missions');
  
  const tabs = [
    { id: 'missions', label: 'Mission History', icon: '⚔️' },
    { id: 'voting', label: 'Voting Patterns', icon: '🗳️' },
    { id: 'teams', label: 'Team Analysis', icon: '👥' },
    { id: 'clues', label: 'Merlin Clues', icon: '💎' },
  ] as const;
  
  const getMissionIcon = (result: 'success' | 'failure') => {
    return result === 'success' ? '✅' : '❌';
  };
  
  const getMissionColor = (result: 'success' | 'failure') => {
    return result === 'success' ? 'text-green-400' : 'text-red-400';
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-400';
    if (confidence >= 0.6) return 'text-orange-400';
    if (confidence >= 0.4) return 'text-yellow-400';
    return 'text-blue-400';
  };
  
  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#252547] p-6 rounded-xl border border-blue-600/30 shadow-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-blue-400 mb-2">
            Strategic Intelligence
          </h3>
          <p className="text-gray-400 text-sm">
            Analyze the game's events to identify Merlin
          </p>
        </div>
        
        {/* Game Context Summary */}
        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/30">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Game Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">
                {gameContext.goodWins}
              </p>
              <p className="text-xs text-gray-400">Good Wins</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-400">
                {gameContext.evilWins}
              </p>
              <p className="text-xs text-gray-400">Evil Wins</p>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'missions' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">
                Mission Timeline
              </h4>
              {strategicInfo.missionTimeline.map((mission) => (
                <div
                  key={mission.missionNumber}
                  className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      Mission {mission.missionNumber}
                    </span>
                    <span className={`text-sm font-semibold ${getMissionColor(mission.result)}`}>
                      {getMissionIcon(mission.result)} {mission.result.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {mission.keyEvents.map((event, index) => (
                      <p key={index} className="text-xs text-gray-400">
                        • {event}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'voting' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">
                Voting Behavior Analysis
              </h4>
              {strategicInfo.votingPatterns.map((pattern) => (
                <div
                  key={pattern.playerId}
                  className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      Player {pattern.playerId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(pattern.goodAlignment * 100)}% Good Alignment
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Approval Rate:</span>
                      <span className="text-blue-400">
                        {Math.round(pattern.approvalTendency * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Consistency:</span>
                      <span className="text-green-400">
                        {Math.round(pattern.consistency * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'teams' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">
                Team Composition Analysis
              </h4>
              {strategicInfo.teamCompositions.map((comp) => (
                <div
                  key={comp.missionNumber}
                  className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      Mission {comp.missionNumber}
                    </span>
                    <span className={`text-sm font-semibold ${getMissionColor(comp.outcome)}`}>
                      {getMissionIcon(comp.outcome)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">
                      {comp.goodPlayers} Good Players
                    </span>
                    <span className="text-red-400">
                      {comp.evilPlayers} Evil Players
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'clues' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">
                Merlin Identification Clues
              </h4>
              {strategicInfo.merlinClues.map((clue, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 p-3 rounded-lg border border-purple-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-400 capitalize">
                      {clue.type.replace('-', ' ')}
                    </span>
                    <span className={`text-xs font-semibold ${getConfidenceColor(clue.confidence)}`}>
                      {Math.round(clue.confidence * 100)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">
                    {clue.description}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">
                      Suspected: {clue.suspectedPlayers.join(', ')}
                    </p>
                    <div className="space-y-1">
                      {clue.evidence.map((evidence, evidenceIndex) => (
                        <p key={evidenceIndex} className="text-xs text-gray-500">
                          • {evidence}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

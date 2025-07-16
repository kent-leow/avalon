/**
 * Game Rules Demo Page
 * 
 * Interactive demonstration of the game rules system with floating button,
 * modal interface, search functionality, and contextual help.
 */

'use client';

import { useState } from 'react';
import { Settings, Users, Play, Timer, Target, Trophy } from 'lucide-react';
import GameRulesFloatingButton from '~/components/features/game-rules/GameRulesFloatingButton';
import GameRulesModal from '~/components/features/game-rules/GameRulesModal';
import type { RuleSection, HelpContextType } from '~/types/game-rules';

export default function GameRulesDemo() {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(7);
  const [selectedCharacters, setSelectedCharacters] = useState([
    'merlin', 'percival', 'loyal-servant', 'loyal-servant',
    'assassin', 'morgana', 'evil-servant'
  ]);
  const [activeContext, setActiveContext] = useState<HelpContextType>('lobby');
  const [hasNotification, setHasNotification] = useState(true);

  const gamePhases = [
    {
      id: 'lobby',
      title: 'Lobby Setup',
      description: 'Configure game settings and select characters',
      icon: Settings,
      color: 'blue'
    },
    {
      id: 'role-reveal',
      title: 'Role Reveal',
      description: 'Players learn their characters and abilities',
      icon: Users,
      color: 'purple'
    },
    {
      id: 'mission-proposal',
      title: 'Mission Proposal',
      description: 'Leader proposes team for the mission',
      icon: Target,
      color: 'yellow'
    },
    {
      id: 'voting',
      title: 'Proposal Voting',
      description: 'All players vote on the proposed team',
      icon: Play,
      color: 'green'
    },
    {
      id: 'mission-execution',
      title: 'Mission Execution',
      description: 'Selected team members vote on mission outcome',
      icon: Timer,
      color: 'red'
    },
    {
      id: 'game-results',
      title: 'Game Results',
      description: 'Final results and victory celebration',
      icon: Trophy,
      color: 'orange'
    }
  ];

  const handleOpenRules = (section?: RuleSection) => {
    setIsRulesModalOpen(true);
    setHasNotification(false);
  };

  const handleCloseRules = () => {
    setIsRulesModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Game Rules Demo</h1>
              <p className="text-gray-400 mt-1">
                Interactive demonstration of the Avalon game rules system
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {selectedPlayerCount} players • {selectedCharacters.length} characters
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Game Configuration */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Game Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player Count */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="font-medium text-white mb-3">Player Count</h3>
              <div className="flex space-x-2">
                {[5, 6, 7, 8, 9, 10].map(count => (
                  <button
                    key={count}
                    onClick={() => setSelectedPlayerCount(count)}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all duration-200
                      ${selectedPlayerCount === count
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Simulation */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="font-medium text-white mb-3">Current Game Phase</h3>
              <select
                value={activeContext}
                onChange={(e) => setActiveContext(e.target.value as HelpContextType)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {gamePhases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Game Phase Simulation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Game Phase Simulation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gamePhases.map(phase => {
              const Icon = phase.icon;
              const isActive = activeContext === phase.id;
              
              return (
                <button
                  key={phase.id}
                  onClick={() => setActiveContext(phase.id as HelpContextType)}
                  className={`
                    p-6 rounded-lg border-2 transition-all duration-200 text-left
                    ${isActive
                      ? `border-${phase.color}-500 bg-${phase.color}-900/20`
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className={`h-6 w-6 ${isActive ? `text-${phase.color}-400` : 'text-gray-400'}`} />
                    <h3 className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {phase.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">{phase.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rules Features */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Rules System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="font-medium text-white mb-3">Floating Access Button</h3>
              <p className="text-gray-300 mb-4">
                The floating rules button provides quick access to game rules from any screen.
                It shows contextual badges and notifications for phase-specific help.
              </p>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">Button visible:</span>
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Active</span>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="font-medium text-white mb-3">Comprehensive Search</h3>
              <p className="text-gray-300 mb-4">
                Search through all rules, character abilities, and game mechanics.
                Filter by section, difficulty, and content type.
              </p>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-700 rounded px-2 py-1 text-xs text-gray-300">
                  Search: "merlin abilities"
                </div>
                <div className="bg-blue-600 rounded px-2 py-1 text-xs text-white">
                  5 results
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="font-medium text-white mb-3">Interactive Content</h3>
              <p className="text-gray-300 mb-4">
                Character abilities, mission requirements, and strategic tips
                with expandable sections and visual diagrams.
              </p>
              <div className="flex items-center space-x-2">
                <div className="bg-purple-600 rounded px-2 py-1 text-xs text-white">
                  Characters
                </div>
                <div className="bg-yellow-600 rounded px-2 py-1 text-xs text-white">
                  Missions
                </div>
                <div className="bg-green-600 rounded px-2 py-1 text-xs text-white">
                  Voting
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="font-medium text-white mb-3">Contextual Help</h3>
              <p className="text-gray-300 mb-4">
                Phase-specific help and tips that appear automatically
                based on current game state and user actions.
              </p>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-700 rounded px-2 py-1 text-xs text-gray-300">
                  Current: {activeContext}
                </div>
                <div className="bg-orange-600 rounded px-2 py-1 text-xs text-white">
                  Help Available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-white">Click the floating button</h4>
                  <p className="text-sm text-gray-300">
                    The blue floating button in the bottom-right corner opens the rules modal.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-white">Search or browse</h4>
                  <p className="text-sm text-gray-300">
                    Use the search bar to find specific rules or browse by section.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-white">Explore content</h4>
                  <p className="text-sm text-gray-300">
                    Click on characters, missions, or sections to expand details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-white">Get contextual help</h4>
                  <p className="text-sm text-gray-300">
                    Context-sensitive help appears automatically during gameplay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Rules Button */}
      <GameRulesFloatingButton
        position="bottom-right"
        size="large"
        hasNotification={hasNotification}
        notificationCount={3}
        contextBadge={activeContext}
        onOpen={handleOpenRules}
      />

      {/* Rules Modal */}
      <GameRulesModal
        isOpen={isRulesModalOpen}
        onClose={handleCloseRules}
        initialSection="overview"
        playerCount={selectedPlayerCount}
        selectedCharacters={selectedCharacters}
      />
    </div>
  );
}

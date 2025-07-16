/**
 * Game Rules Content Display
 * 
 * Main content area for displaying rule sections, character information,
 * and interactive examples with navigation.
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, ExternalLink, BookOpen, Users, Target, Trophy, Lightbulb, Shield } from 'lucide-react';
import type { RuleSection, RuleContent, CharacterAbility } from '~/types/game-rules';
import { CHARACTER_ABILITIES, MISSION_REQUIREMENTS } from '~/types/game-rules';

interface GameRulesContentProps {
  activeSection: RuleSection;
  onSectionChange: (section: RuleSection) => void;
  selectedRule?: RuleContent;
  playerCount?: number;
}

export default function GameRulesContent({
  activeSection,
  onSectionChange,
  selectedRule,
  playerCount = 7
}: GameRulesContentProps) {
  const [expandedCharacter, setExpandedCharacter] = useState<string | null>(null);
  const [expandedMission, setExpandedMission] = useState<number | null>(null);

  const sectionConfig = {
    overview: {
      title: 'Game Overview',
      icon: BookOpen,
      color: 'blue'
    },
    characters: {
      title: 'Characters & Roles',
      icon: Users,
      color: 'purple'
    },
    missions: {
      title: 'Missions & Gameplay',
      icon: Target,
      color: 'yellow'
    },
    voting: {
      title: 'Voting System',
      icon: Shield,
      color: 'green'
    },
    winning: {
      title: 'Victory Conditions',
      icon: Trophy,
      color: 'red'
    },
    strategies: {
      title: 'Strategies & Tips',
      icon: Lightbulb,
      color: 'orange'
    },
    advanced: {
      title: 'Advanced Rules',
      icon: Shield,
      color: 'gray'
    }
  };

  const sections = Object.entries(sectionConfig) as [RuleSection, typeof sectionConfig[RuleSection]][];

  const renderOverviewContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4">What is Avalon?</h3>
        <p className="text-gray-300 mb-4">
          Avalon is a social deduction game where players are divided into two teams: <strong className="text-blue-400">Good</strong> and <strong className="text-red-400">Evil</strong>. 
          Good players must complete 3 out of 5 missions to win, while Evil players try to fail 3 missions or have the Assassin identify Merlin.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-900/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Good Team Objective</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Complete 3 successful missions</li>
              <li>• Keep Merlin hidden from the Assassin</li>
              <li>• Work together using limited information</li>
            </ul>
          </div>
          <div className="bg-red-900/30 rounded-lg p-4">
            <h4 className="font-semibold text-red-400 mb-2">Evil Team Objective</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Fail 3 missions</li>
              <li>• Reject 5 proposals in a row</li>
              <li>• Assassin identifies Merlin</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Game Flow</h3>
        <div className="space-y-4">
          {[
            { step: 1, title: 'Character Assignment', desc: 'Players receive secret character cards' },
            { step: 2, title: 'Mission Proposal', desc: 'Leader proposes a team for the mission' },
            { step: 3, title: 'Proposal Voting', desc: 'All players vote to approve or reject' },
            { step: 4, title: 'Mission Execution', desc: 'Selected team members vote on mission outcome' },
            { step: 5, title: 'Results & Next Round', desc: 'Mission results revealed, new leader chosen' }
          ].map((phase) => (
            <div key={phase.step} className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {phase.step}
              </div>
              <div>
                <h4 className="font-medium text-white">{phase.title}</h4>
                <p className="text-sm text-gray-400">{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCharactersContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Character Abilities</h3>
        <p className="text-gray-300">
          Each character has unique abilities and information. Understanding these roles is crucial for both good and evil players.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Good Characters */}
        <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30">
          <h4 className="text-lg font-semibold text-blue-400 mb-4">Good Characters</h4>
          <div className="space-y-3">
            {CHARACTER_ABILITIES.filter(char => 
              ['merlin', 'percival', 'loyal-servant'].includes(char.character)
            ).map((character) => (
              <div key={character.character} className="bg-gray-800/50 rounded-lg p-4">
                <button
                  onClick={() => setExpandedCharacter(
                    expandedCharacter === character.character ? null : character.character
                  )}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h5 className="font-medium text-white">{character.name}</h5>
                  {expandedCharacter === character.character ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {expandedCharacter === character.character && (
                  <div className="mt-3 space-y-3 text-sm">
                    <p className="text-gray-300">{character.description}</p>
                    
                    {character.specialAbilities.length > 0 && (
                      <div>
                        <h6 className="font-medium text-blue-400 mb-1">Special Abilities:</h6>
                        <ul className="text-gray-300 space-y-1">
                          {character.specialAbilities.map((ability, idx) => (
                            <li key={idx}>• {ability}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {character.strategicTips.length > 0 && (
                      <div>
                        <h6 className="font-medium text-green-400 mb-1">Strategic Tips:</h6>
                        <ul className="text-gray-300 space-y-1">
                          {character.strategicTips.map((tip, idx) => (
                            <li key={idx}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Evil Characters */}
        <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/30">
          <h4 className="text-lg font-semibold text-red-400 mb-4">Evil Characters</h4>
          <div className="space-y-3">
            {CHARACTER_ABILITIES.filter(char => 
              ['assassin', 'morgana', 'mordred', 'oberon', 'evil-servant'].includes(char.character)
            ).map((character) => (
              <div key={character.character} className="bg-gray-800/50 rounded-lg p-4">
                <button
                  onClick={() => setExpandedCharacter(
                    expandedCharacter === character.character ? null : character.character
                  )}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h5 className="font-medium text-white">{character.name}</h5>
                  {expandedCharacter === character.character ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {expandedCharacter === character.character && (
                  <div className="mt-3 space-y-3 text-sm">
                    <p className="text-gray-300">{character.description}</p>
                    
                    {character.specialAbilities.length > 0 && (
                      <div>
                        <h6 className="font-medium text-red-400 mb-1">Special Abilities:</h6>
                        <ul className="text-gray-300 space-y-1">
                          {character.specialAbilities.map((ability, idx) => (
                            <li key={idx}>• {ability}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {character.strategicTips.length > 0 && (
                      <div>
                        <h6 className="font-medium text-orange-400 mb-1">Strategic Tips:</h6>
                        <ul className="text-gray-300 space-y-1">
                          {character.strategicTips.map((tip, idx) => (
                            <li key={idx}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMissionsContent = () => {
    const missionReq = MISSION_REQUIREMENTS.find(req => req.playerCount === playerCount);
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg p-6 border border-yellow-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Mission Requirements</h3>
          <p className="text-gray-300 mb-4">
            Team sizes vary based on player count. Here are the requirements for {playerCount} players:
          </p>
          
          {missionReq && (
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Object.entries(missionReq.missions).map(([missionNum, teamSize]) => (
                <div key={missionNum} className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-400">Mission {missionNum}</div>
                  <div className="text-lg font-bold text-white">{teamSize}</div>
                  <div className="text-xs text-gray-500">players</div>
                </div>
              ))}
            </div>
          )}
          
          {missionReq?.twoFailRule && (
            <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30">
              <h4 className="font-semibold text-red-400 mb-2">Special Rule</h4>
              <p className="text-sm text-gray-300">
                With {playerCount} players, Mission 4 requires <strong>2 fail votes</strong> to fail instead of 1.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Mission Phases</h3>
          <div className="space-y-4">
            {[
              {
                phase: 'Team Proposal',
                description: 'The current leader selects team members for the mission',
                details: [
                  'Leader chooses exactly the required number of players',
                  'Cannot select the same team twice in a row',
                  'Should consider player voting patterns and trust levels'
                ]
              },
              {
                phase: 'Proposal Voting',
                description: 'All players vote to approve or reject the proposed team',
                details: [
                  'Simple majority needed to approve',
                  'Voting is simultaneous and public',
                  'If rejected, leadership passes to next player'
                ]
              },
              {
                phase: 'Mission Execution',
                description: 'Selected team members vote on mission outcome',
                details: [
                  'Only team members participate',
                  'Voting is secret and anonymous',
                  'Good players must vote Success',
                  'Evil players may vote Success or Fail'
                ]
              }
            ].map((phase, idx) => (
              <div key={idx} className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium text-white mb-2">{phase.phase}</h4>
                <p className="text-gray-300 mb-3">{phase.description}</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  {phase.details.map((detail, detailIdx) => (
                    <li key={detailIdx}>• {detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (selectedRule) {
      return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">{selectedRule.title}</h3>
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: selectedRule.content }} />
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return renderOverviewContent();
      case 'characters':
        return renderCharactersContent();
      case 'missions':
        return renderMissionsContent();
      default:
        return (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {sectionConfig[activeSection].title}
            </h3>
            <p className="text-gray-300">
              Content for {sectionConfig[activeSection].title} coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Navigation Sidebar */}
      <div className="w-full lg:w-64 space-y-2">
        {sections.map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeSection === key;
          
          return (
            <button
              key={key}
              onClick={() => onSectionChange(key)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                ${isActive 
                  ? `bg-${config.color}-600 text-white shadow-lg` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{config.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

/**
 * Tutorial Dashboard Component
 * 
 * Main tutorial system interface with overview, recommendations,
 * achievement tracking, and quick access to tutorials.
 */

import React, { useState, useEffect } from 'react';
import type { 
  TutorialSystem, 
  Tutorial, 
  TutorialLevel, 
  TutorialPhase,
  TutorialAchievement,
  TutorialStatistics,
  PracticeScenario
} from '~/types/tutorial-system';
import { 
  formatTutorialDuration, 
  getTutorialDifficultyColor,
  getTutorialPhaseIcon,
  generateTutorialSummary
} from '~/lib/tutorial-system-utils';

interface TutorialDashboardProps {
  tutorialSystem: TutorialSystem;
  availableTutorials: Tutorial[];
  practiceScenarios: PracticeScenario[];
  onStartTutorial: (tutorialId: string) => void;
  onStartPractice: (scenarioId: string) => void;
  onViewAchievements: () => void;
  onUpdateSettings: () => void;
}

export const TutorialDashboard: React.FC<TutorialDashboardProps> = ({
  tutorialSystem,
  availableTutorials,
  practiceScenarios,
  onStartTutorial,
  onStartPractice,
  onViewAchievements,
  onUpdateSettings
}) => {
  const [selectedLevel, setSelectedLevel] = useState<TutorialLevel | 'all'>('all');
  const [selectedPhase, setSelectedPhase] = useState<TutorialPhase | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'tutorials' | 'practice' | 'achievements'>('overview');

  // Calculate progress statistics
  const totalTutorials = availableTutorials.length;
  const completedTutorials = tutorialSystem.completedTutorials.length;
  const overallProgress = totalTutorials > 0 ? Math.round((completedTutorials / totalTutorials) * 100) : 0;
  
  // Get recommended tutorials
  const incompleteTutorials = availableTutorials.filter(
    tutorial => !tutorialSystem.completedTutorials.includes(tutorial.id)
  );
  const nextRecommended = incompleteTutorials.length > 0 ? incompleteTutorials[0] : null;

  // Filter tutorials based on search and filters
  const filteredTutorials = availableTutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || tutorial.level === selectedLevel;
    const matchesPhase = selectedPhase === 'all' || tutorial.phase === selectedPhase;
    
    return matchesSearch && matchesLevel && matchesPhase;
  });

  // Group tutorials by phase
  const tutorialsByPhase = filteredTutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.phase]) {
      acc[tutorial.phase] = [];
    }
    acc[tutorial.phase].push(tutorial);
    return acc;
  }, {} as Record<TutorialPhase, Tutorial[]>);

  const renderOverview = () => (
    <div className="overview-tab space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-item">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedTutorials} of {totalTutorials} tutorials completed
            </div>
          </div>
          
          <div className="stat-item">
            <div className="text-sm font-medium text-gray-700 mb-2">Time Spent Learning</div>
            <div className="text-2xl font-bold text-green-600">
              {formatTutorialDuration(Math.round(tutorialSystem.statistics.totalTimeSpent / 60))}
            </div>
            <div className="text-xs text-gray-500">
              Avg: {formatTutorialDuration(Math.round(tutorialSystem.statistics.averageCompletionTime / 60))} per tutorial
            </div>
          </div>
          
          <div className="stat-item">
            <div className="text-sm font-medium text-gray-700 mb-2">Achievements</div>
            <div className="text-2xl font-bold text-purple-600">
              {tutorialSystem.statistics.achievementsUnlocked}
            </div>
            <div className="text-xs text-gray-500">
              {tutorialSystem.achievements.length} total available
            </div>
          </div>
        </div>
      </div>

      {/* Next Recommended */}
      {nextRecommended && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next</h3>
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">
                {getTutorialPhaseIcon(nextRecommended.phase)}
              </span>
              <div>
                <h4 className="font-medium text-gray-900">{nextRecommended.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{nextRecommended.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {generateTutorialSummary(nextRecommended)}
                </div>
              </div>
            </div>
            <button
              onClick={() => onStartTutorial(nextRecommended.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Now
            </button>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
          <button
            onClick={onViewAchievements}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </button>
        </div>
        
        {tutorialSystem.achievements.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Complete tutorials to unlock achievements!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorialSystem.achievements.slice(0, 3).map(achievement => (
              <div
                key={achievement.id}
                className={`achievement-card p-4 rounded-lg border ${
                  achievement.unlocked 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.points} points
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTutorials = () => (
    <div className="tutorials-tab space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as TutorialLevel | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="master">Master</option>
          </select>
          
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value as TutorialPhase | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Phases</option>
            <option value="introduction">Introduction</option>
            <option value="room-creation">Room Creation</option>
            <option value="character-roles">Character Roles</option>
            <option value="mission-proposal">Mission Proposal</option>
            <option value="voting-mechanics">Voting Mechanics</option>
            <option value="mission-execution">Mission Execution</option>
            <option value="assassin-attempt">Assassin Attempt</option>
            <option value="game-results">Game Results</option>
            <option value="strategy-guide">Strategy Guide</option>
          </select>
        </div>
      </div>

      {/* Tutorial List */}
      <div className="space-y-6">
        {Object.entries(tutorialsByPhase).map(([phase, tutorials]) => (
          <div key={phase} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>{getTutorialPhaseIcon(phase as TutorialPhase)}</span>
              <span>{phase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map(tutorial => {
                const isCompleted = tutorialSystem.completedTutorials.includes(tutorial.id);
                return (
                  <div
                    key={tutorial.id}
                    className={`tutorial-card p-4 rounded-lg border transition-all ${
                      isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {tutorial.title}
                          {isCompleted && (
                            <span className="ml-2 text-green-600 text-sm">✓</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getTutorialDifficultyColor(tutorial.level) }}
                          >
                            {tutorial.level}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTutorialDuration(tutorial.estimatedDuration)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {tutorial.steps.length} steps
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Difficulty: {tutorial.difficulty}/10
                          </div>
                          <button
                            onClick={() => onStartTutorial(tutorial.id)}
                            disabled={isCompleted}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              isCompleted
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isCompleted ? 'Completed' : 'Start'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPractice = () => (
    <div className="practice-tab space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Scenarios</h3>
        <p className="text-gray-600 mb-6">
          Practice your skills with AI opponents in realistic game scenarios.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {practiceScenarios.map(scenario => (
            <div key={scenario.id} className="scenario-card p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <h4 className="font-medium text-gray-900 mb-2">{scenario.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
              
              <div className="flex items-center space-x-2 mb-3 text-xs text-gray-500">
                <span>Difficulty: {scenario.difficulty}/10</span>
                <span>•</span>
                <span>{scenario.playerCount} players</span>
                <span>•</span>
                <span>{scenario.phase}</span>
              </div>
              
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-700 mb-1">Objectives:</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {scenario.objectives.slice(0, 2).map((objective, index) => (
                    <li key={index}>• {objective}</li>
                  ))}
                  {scenario.objectives.length > 2 && (
                    <li className="text-gray-400">... and {scenario.objectives.length - 2} more</li>
                  )}
                </ul>
              </div>
              
              <button
                onClick={() => onStartPractice(scenario.id)}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Start Practice
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="achievements-tab space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutorialSystem.achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`achievement-card p-4 rounded-lg border ${
                achievement.unlocked 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      {achievement.points} points
                    </div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs text-gray-400">
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {!achievement.unlocked && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Progress: {achievement.progress}/{achievement.maxProgress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="tutorial-dashboard max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tutorial Center</h1>
            <p className="text-gray-600 mt-1">
              Master the art of Avalon with interactive tutorials and practice sessions
            </p>
          </div>
          <button
            onClick={onUpdateSettings}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'tutorials', label: 'Tutorials', icon: '📚' },
              { id: 'practice', label: 'Practice', icon: '🎯' },
              { id: 'achievements', label: 'Achievements', icon: '🏆' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tutorials' && renderTutorials()}
        {activeTab === 'practice' && renderPractice()}
        {activeTab === 'achievements' && renderAchievements()}
      </div>
    </div>
  );
};

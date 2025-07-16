/**
 * Tutorial Main Page (Simplified)
 * 
 * Simplified version that uses existing API endpoints and provides
 * basic tutorial system functionality.
 */

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import type { 
  TutorialLevel, 
  TutorialPhase, 
  CharacterTutorialType 
} from '~/types/tutorial-system';
import { TutorialDashboard } from '~/components/features/tutorial-system/TutorialDashboard';
import { TutorialStep } from '~/components/features/tutorial-system/TutorialStepSimple';
import { ContextualHelpSystem } from '~/components/features/tutorial-system/ContextualHelpSystem';

interface TutorialMainPageProps {
  playerId: string;
}

export const TutorialMainPage: React.FC<TutorialMainPageProps> = ({
  playerId
}) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'tutorial' | 'practice'>('dashboard');
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [helpEnabled, setHelpEnabled] = useState(true);

  // Use existing API endpoints
  const { data: tutorialData } = api.tutorialSystem.getAllTutorials.useQuery();
  const { data: practiceData } = api.tutorialSystem.getPracticeScenarios.useQuery({
    phase: 'mission-proposal',
    difficulty: 2
  });

  // Mock data for demonstration
  const mockTutorialSystem = {
    id: 'tutorial-system-1',
    playerId,
    currentTutorial: null,
    progress: 'not-started' as const,
    completedTutorials: [],
    achievements: [],
    settings: {
      autoPlay: false,
      showHints: true,
      skipAnimations: false,
      audioEnabled: true,
      speechEnabled: false,
      highContrastMode: false,
      fontSize: 'medium' as const,
      animationSpeed: 'normal' as const,
      hintFrequency: 'normal' as const,
      difficultyPreference: 'beginner' as TutorialLevel,
      preferredLanguage: 'en',
      accessibilityMode: false,
      metadata: {}
    },
    statistics: {
      totalTutorialsCompleted: 0,
      totalTimeSpent: 0,
      averageCompletionTime: 0,
      achievementsUnlocked: 0,
      perfectScores: 0,
      hintsUsed: 0,
      retriesAttempted: 0,
      sessionsStarted: 0,
      lastSessionDuration: 0,
      completionStreak: 0,
      improvementAreas: [],
      metadata: {}
    },
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockTutorials = tutorialData?.tutorials || [
    {
      id: 'intro-tutorial',
      title: 'Introduction to Avalon',
      description: 'Learn the basics of Avalon gameplay',
      level: 'beginner' as TutorialLevel,
      phase: 'introduction' as TutorialPhase,
      estimatedDuration: 10,
      prerequisites: [],
      steps: [
        {
          id: 'step-1',
          order: 1,
          type: 'explanation' as const,
          title: 'Welcome to Avalon',
          content: 'Avalon is a social deduction game where good fights evil.',
          instructions: 'Read about the basic concepts',
          actions: [],
          validation: {
            type: 'custom' as const,
            errorMessage: 'Please complete the step',
            timeout: 10000,
            retryAttempts: 3,
            metadata: {}
          },
          hints: [],
          feedback: [],
          duration: 30,
          isSkippable: true,
          requiredForCompletion: true,
          resources: [],
          nextStepConditions: [],
          metadata: {}
        }
      ],
      objectives: [],
      resources: [],
      tags: ['basics', 'introduction'],
      difficulty: 1,
      isOptional: false,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const mockScenarios = practiceData?.scenarios || [
    {
      id: 'basic-scenario',
      title: 'Basic Mission Proposal',
      description: 'Practice proposing a mission team',
      difficulty: 2,
      playerCount: 5,
      phase: 'mission-proposal' as TutorialPhase,
      objectives: ['Select appropriate team members', 'Justify your choices'],
      setup: {
        gameState: {},
        playerRoles: {},
        missionHistory: [],
        votingHistory: [],
        gamePhase: 'mission-proposal',
        metadata: {}
      },
      constraints: [],
      aiPlayers: [],
      successCriteria: {
        winCondition: true,
        minScore: 70,
        requiredObjectives: ['Select appropriate team members'],
        optionalObjectives: ['Justify your choices'],
        metadata: {}
      },
      metadata: {}
    }
  ];

  // Handle tutorial start
  const handleStartTutorial = (tutorialId: string) => {
    setSelectedTutorial(tutorialId);
    setCurrentView('tutorial');
  };

  // Handle practice start
  const handleStartPractice = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setCurrentView('practice');
  };

  // Handle help interaction
  const handleHelpInteraction = (helpId: string, action: 'viewed' | 'dismissed' | 'completed') => {
    console.log('Help interaction:', helpId, action);
  };

  // Handle tutorial request
  const handleRequestTutorial = (tutorialId: string) => {
    handleStartTutorial(tutorialId);
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTutorial(null);
    setSelectedScenario(null);
  };

  // Loading state
  if (!tutorialData && !practiceData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tutorial system...</p>
        </div>
      </div>
    );
  }

  // Render tutorial view
  if (currentView === 'tutorial' && selectedTutorial) {
    const tutorial = mockTutorials.find((t: any) => t.id === selectedTutorial);
    if (!tutorial || !tutorial.steps || !tutorial.steps[0]) return null;

    return (
      <div className="tutorial-view min-h-screen bg-gray-50">
        <ContextualHelpSystem
          currentPhase={tutorial.phase}
          isEnabled={helpEnabled}
          onHelpInteraction={handleHelpInteraction}
          onRequestTutorial={handleRequestTutorial}
        />
        
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">{tutorial.title}</h1>
            <button
              onClick={handleBackToDashboard}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        <div className="pt-8">
          <div className="max-w-4xl mx-auto px-4">
            <TutorialStep
              step={tutorial.steps[0]}
              tutorial={tutorial}
              isActive={true}
              onComplete={() => {
                console.log('Tutorial step completed');
                handleBackToDashboard();
              }}
              onSkip={() => {
                console.log('Tutorial step skipped');
                handleBackToDashboard();
              }}
              onHint={(hintId) => console.log('Hint requested:', hintId)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Render practice view
  if (currentView === 'practice' && selectedScenario) {
    const scenario = mockScenarios.find(s => s.id === selectedScenario);
    if (!scenario) return null;

    const mockSession = {
      id: 'practice-session-1',
      type: 'scenario' as const,
      title: scenario.title,
      description: scenario.description,
      scenario,
      participants: [],
      settings: {
        allowHints: true,
        allowUndo: true,
        allowPause: true,
        showExplanations: true,
        highlightOptimalMoves: false,
        aiDifficulty: 'medium' as const,
        autoAdvance: false,
        metadata: {}
      },
      progress: {
        currentPhase: 'mission-proposal',
        phasesCompleted: [],
        objectivesCompleted: [],
        decisionsCorrect: 0,
        decisionsTotal: 0,
        hintsUsed: 0,
        timeElapsed: 0,
        metadata: {}
      },
      results: {
        completed: false,
        success: false,
        score: 0,
        accuracy: 0,
        timeToComplete: 0,
        objectivesAchieved: [],
        mistakesMade: [],
        recommendations: [],
        nextSuggestions: [],
        performance: {
          score: 0,
          accuracy: 0,
          decisionsCorrect: 0,
          decisionsTotal: 0,
          timeToDecision: 0,
          hintsUsed: 0,
          mistakesMade: 0,
          improvementAreas: [],
          metadata: {}
        },
        metadata: {}
      },
      startedAt: new Date().toISOString(),
      metadata: {}
    };

    return (
      <div className="practice-view min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Practice Session</h1>
            <button
              onClick={handleBackToDashboard}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        <div className="pt-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{scenario.title}</h2>
              <p className="text-gray-600 mb-4">{scenario.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Objectives:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {scenario.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Difficulty: {scenario.difficulty}/10
                  </span>
                  <span className="text-sm text-gray-500">
                    Players: {scenario.playerCount}
                  </span>
                  <span className="text-sm text-gray-500">
                    Phase: {scenario.phase}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => {
                      console.log('Practice completed');
                      handleBackToDashboard();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Complete Practice
                  </button>
                  <button
                    onClick={handleBackToDashboard}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Exit Practice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render dashboard view (default)
  return (
    <div className="tutorial-main-page min-h-screen bg-gray-50">
      <ContextualHelpSystem
        isEnabled={helpEnabled}
        onHelpInteraction={handleHelpInteraction}
        onRequestTutorial={handleRequestTutorial}
      />
      
      <TutorialDashboard
        tutorialSystem={mockTutorialSystem}
        availableTutorials={mockTutorials}
        practiceScenarios={mockScenarios}
        onStartTutorial={handleStartTutorial}
        onStartPractice={handleStartPractice}
        onViewAchievements={() => console.log('View achievements')}
        onUpdateSettings={() => console.log('Update settings')}
      />
    </div>
  );
};

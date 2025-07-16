/**
 * Tutorial Main Page Component
 * 
 * Main entry point for the tutorial system with dashboard, tutorial runner,
 * and practice mode integration.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import type { 
  TutorialSystem, 
  Tutorial, 
  TutorialState, 
  PracticeScenario, 
  PracticeSession,
  TutorialPhase,
  GameState
} from '~/types/tutorial-system';
import { TutorialDashboard } from '~/components/features/tutorial-system/TutorialDashboard';
import { TutorialNavigation } from '~/components/features/tutorial-system/TutorialNavigation';
import { TutorialStep } from '~/components/features/tutorial-system/TutorialStepSimple';
import { ContextualHelpSystem } from '~/components/features/tutorial-system/ContextualHelpSystem';

interface TutorialMainPageProps {
  playerId: string;
  initialGameState?: GameState;
}

export const TutorialMainPage: React.FC<TutorialMainPageProps> = ({
  playerId,
  initialGameState
}) => {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'dashboard' | 'tutorial' | 'practice'>('dashboard');
  const [tutorialState, setTutorialState] = useState<TutorialState | null>(null);
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
  const [helpEnabled, setHelpEnabled] = useState(true);

  // API queries - using available endpoints
  const { data: tutorialData } = api.tutorialSystem.getAllTutorials.useQuery();
  const { data: practiceData } = api.tutorialSystem.getPracticeScenarios.useQuery({});
  const { data: overallProgress } = api.tutorialSystem.getOverallProgress.useQuery({
    userId: playerId,
    completedTutorials: []
  });

  // API mutations
  const startTutorialMutation = api.tutorialSystem.startTutorial.useMutation({
    onSuccess: (data) => {
      setTutorialState(data.state);
      setCurrentView('tutorial');
    }
  });

  const nextStepMutation = api.tutorialSystem.nextStep.useMutation({
    onSuccess: (data) => {
      setTutorialState(data.state);
    }
  });

  const startPracticeMutation = api.tutorialSystem.startPracticeSession.useMutation({
    onSuccess: (data) => {
      setPracticeSession(data.session);
      setCurrentView('practice');
    }
  });

  const updateSettingsMutation = api.tutorialSystem.updateTutorialSettings.useMutation();

  // Handle tutorial start
  const handleStartTutorial = useCallback((tutorialId: string) => {
    startTutorialMutation.mutate({
      tutorialId,
      context: {
        gamePhase: 'tutorial',
        playerRole: 'student',
        metadata: {}
      }
    });
  }, [startTutorialMutation]);

  // Handle tutorial step progression
  const handleStepComplete = useCallback((stepId: string, results: any) => {
    if (!tutorialState) return;
    nextStepMutation.mutate();
  }, [tutorialState, nextStepMutation]);

  // Handle tutorial completion
  const handleTutorialComplete = useCallback(() => {
    setTutorialState(null);
    setCurrentView('dashboard');
  }, []);

  // Handle practice start
  const handleStartPractice = useCallback((scenarioId: string) => {
    startPracticeMutation.mutate({
      scenarioId,
      settings: {}
    });
  }, [startPracticeMutation]);

  // Handle practice completion
  const handlePracticeComplete = useCallback(() => {
    setPracticeSession(null);
    setCurrentView('dashboard');
  }, []);

  // Handle settings update
  const handleUpdateSettings = useCallback(() => {
    updateSettingsMutation.mutate({});
  }, [updateSettingsMutation]);

  // Handle help interaction
  const handleHelpInteraction = useCallback((helpId: string, action: 'viewed' | 'dismissed' | 'completed') => {
    console.log('Help interaction:', helpId, action);
  }, []);

  // Handle achievements view
  const handleViewAchievements = useCallback(() => {
    console.log('Achievements view requested');
  }, []);

  // Handle tutorial request from help system
  const handleRequestTutorial = useCallback((tutorialId: string) => {
    handleStartTutorial(tutorialId);
  }, [handleStartTutorial]);

  // Handle tutorial exit
  const handleExitTutorial = useCallback(() => {
    setTutorialState(null);
    setCurrentView('dashboard');
  }, []);

  // Handle practice exit
  const handleExitPractice = useCallback(() => {
    setPracticeSession(null);
    setCurrentView('dashboard');
  }, []);

  // Handle back to dashboard
  const handleBackToDashboard = useCallback(() => {
    setCurrentView('dashboard');
  }, []);

  // Loading state
  if (!tutorialData || !practiceData || !overallProgress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tutorial system...</p>
        </div>
      </div>
    );
  }

  // Mock tutorial system data
  const mockTutorialSystem = {
    id: 'system-1',
    playerId,
    currentTutorial: tutorialState?.currentTutorial || null,
    progress: 'in-progress' as const,
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
      difficultyPreference: 'beginner' as const,
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
      improvementAreas: [],
      completionStreak: 0,
      metadata: {}
    },
    lastAccessedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mock navigation data
  const mockNavigation = {
    canGoBack: false,
    canGoNext: true,
    canGoForward: true,
    canSkip: true,
    canRestart: true,
    canPause: true,
    canExit: true,
    currentStepIndex: 0,
    totalSteps: 5,
    showProgress: true,
    showStepNumbers: true,
    allowJumpToStep: false,
    progressPercentage: 20,
    remainingTime: 300,
    isLastStep: false,
    metadata: {}
  };

  // Mock available tutorials
  const mockAvailableTutorials = tutorialData?.tutorials || [];
  const mockPracticeScenarios = practiceData?.scenarios || [];

  // Render tutorial view
  if (currentView === 'tutorial' && tutorialState) {
    return (
      <div className="tutorial-view min-h-screen bg-gray-50">
        <ContextualHelpSystem
          gameState={initialGameState}
          currentPhase={tutorialState.currentTutorial?.phase}
          isEnabled={helpEnabled}
          onHelpInteraction={handleHelpInteraction}
          onRequestTutorial={handleRequestTutorial}
        />
        
        <TutorialNavigation
          tutorialState={tutorialState}
          navigation={mockNavigation}
          onBack={handleBackToDashboard}
          onNext={() => {
            if (tutorialState.currentStep) {
              handleStepComplete(tutorialState.currentStep.id, {});
            }
          }}
          onSkip={() => {
            if (tutorialState.currentStep) {
              handleStepComplete(tutorialState.currentStep.id, { skipped: true });
            }
          }}
          onRestart={() => {
            if (tutorialState.currentTutorial) {
              handleStartTutorial(tutorialState.currentTutorial.id);
            }
          }}
          onExit={handleExitTutorial}
          canSkip={tutorialState.currentStep?.isSkippable ?? false}
        />
        
        <div className="pt-16 pb-8">
          <div className="max-w-4xl mx-auto px-4">
            {tutorialState.currentStep && (
              <TutorialStep
                step={tutorialState.currentStep}
                tutorial={tutorialState.currentTutorial!}
                isActive={true}
                onComplete={(results) => handleStepComplete(tutorialState.currentStep!.id, results)}
                onSkip={() => handleStepComplete(tutorialState.currentStep!.id, { skipped: true })}
                onHint={(hintId) => console.log('Hint requested:', hintId)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render practice view
  if (currentView === 'practice' && practiceSession) {
    return (
      <div className="practice-view min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Practice Session</h1>
            <button
              onClick={handleExitPractice}
              className="text-gray-500 hover:text-gray-700"
            >
              Exit Practice
            </button>
          </div>
        </div>
        
        <div className="pt-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Practice Mode - {practiceSession.scenario.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {practiceSession.scenario.description}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handlePracticeComplete}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Complete Practice
                </button>
                <button
                  onClick={handleExitPractice}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Exit Practice
                </button>
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
        gameState={initialGameState}
        isEnabled={helpEnabled}
        onHelpInteraction={handleHelpInteraction}
        onRequestTutorial={handleRequestTutorial}
      />
      
      <TutorialDashboard
        tutorialSystem={mockTutorialSystem}
        availableTutorials={mockAvailableTutorials}
        practiceScenarios={mockPracticeScenarios}
        onStartTutorial={handleStartTutorial}
        onStartPractice={handleStartPractice}
        onViewAchievements={handleViewAchievements}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};

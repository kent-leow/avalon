/**
 * Practice Mode Component
 * 
 * Interactive practice sessions with AI players, scenarios,
 * and performance tracking.
 */

import React, { useState, useEffect } from 'react';
import type { 
  PracticeSession, 
  PracticeScenario, 
  PracticeSettings,
  PracticeResults,
  PracticeParticipant,
  PracticeMistake
} from '~/types/tutorial-system';

interface PracticeModeProps {
  scenario: PracticeScenario;
  settings: PracticeSettings;
  onComplete: (results: PracticeResults) => void;
  onExit: () => void;
}

export const PracticeModeComponent: React.FC<PracticeModeProps> = ({
  scenario,
  settings,
  onComplete,
  onExit
}) => {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('setup');
  const [participants, setParticipants] = useState<PracticeParticipant[]>([]);
  const [mistakes, setMistakes] = useState<PracticeMistake[]>([]);
  const [showHints, setShowHints] = useState(settings.allowHints);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    initializePracticeSession();
  }, [scenario, settings]);

  const initializePracticeSession = () => {
    const newSession: PracticeSession = {
      id: `practice-${Date.now()}`,
      type: 'scenario',
      title: scenario.title,
      description: scenario.description,
      scenario,
      participants: createParticipants(),
      settings,
      progress: {
        currentPhase: 'setup',
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

    setSession(newSession);
    setParticipants(newSession.participants);
    setCurrentPhase('setup');
  };

  const createParticipants = (): PracticeParticipant[] => {
    const participants: PracticeParticipant[] = [];

    // Human player
    participants.push({
      id: 'human',
      name: 'You',
      role: 'pending',
      isHuman: true,
      isActive: true,
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
    });

    // AI players
    scenario.aiPlayers.forEach(ai => {
      participants.push({
        id: ai.id,
        name: ai.name,
        role: ai.role,
        isHuman: false,
        isActive: true,
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
        metadata: { aiConfig: ai }
      });
    });

    return participants;
  };

  const handleDecision = (decision: string, isCorrect: boolean) => {
    if (!session) return;

    const updatedSession = { ...session };
    updatedSession.progress.decisionsTotal++;
    if (isCorrect) {
      updatedSession.progress.decisionsCorrect++;
    } else {
      const mistake: PracticeMistake = {
        id: `mistake-${Date.now()}`,
        type: 'strategic',
        description: `Incorrect decision: ${decision}`,
        phase: currentPhase,
        impact: 'medium',
        correction: 'Consider the game state more carefully',
        preventionTip: 'Review the mission objectives before making decisions',
        metadata: {}
      };
      setMistakes(prev => [...prev, mistake]);
    }

    updatedSession.progress.timeElapsed = Date.now() - startTime;
    setSession(updatedSession);
  };

  const useHint = () => {
    if (!session || !settings.allowHints) return;

    const updatedSession = { ...session };
    updatedSession.progress.hintsUsed++;
    setSession(updatedSession);
  };

  const completeObjective = (objectiveId: string) => {
    if (!session) return;

    const updatedSession = { ...session };
    if (!updatedSession.progress.objectivesCompleted.includes(objectiveId)) {
      updatedSession.progress.objectivesCompleted.push(objectiveId);
    }
    setSession(updatedSession);
  };

  const completePhase = (phaseName: string) => {
    if (!session) return;

    const updatedSession = { ...session };
    updatedSession.progress.phasesCompleted.push(phaseName);
    
    // Check if all objectives are completed
    const allObjectivesCompleted = scenario.objectives.every(obj => 
      updatedSession.progress.objectivesCompleted.includes(obj)
    );

    if (allObjectivesCompleted) {
      completePracticeSession();
    } else {
      setCurrentPhase(getNextPhase(phaseName));
    }

    setSession(updatedSession);
  };

  const getNextPhase = (currentPhase: string): string => {
    const phases = ['setup', 'mission-proposal', 'voting', 'mission-execution', 'results'];
    const currentIndex = phases.indexOf(currentPhase);
    return phases[currentIndex + 1] || 'complete';
  };

  const completePracticeSession = () => {
    if (!session) return;

    const timeToComplete = Date.now() - startTime;
    const accuracy = session.progress.decisionsTotal > 0 
      ? (session.progress.decisionsCorrect / session.progress.decisionsTotal) * 100 
      : 0;
    
    const score = calculateScore(accuracy, timeToComplete, session.progress.hintsUsed, mistakes.length);
    
    const results: PracticeResults = {
      completed: true,
      success: score >= scenario.successCriteria.minScore,
      score,
      accuracy,
      timeToComplete,
      objectivesAchieved: session.progress.objectivesCompleted,
      mistakesMade: mistakes,
      recommendations: generateRecommendations(mistakes, accuracy),
      nextSuggestions: generateNextSuggestions(scenario.phase, accuracy),
      performance: {
        score,
        accuracy,
        decisionsCorrect: session.progress.decisionsCorrect,
        decisionsTotal: session.progress.decisionsTotal,
        timeToDecision: session.progress.decisionsTotal > 0 ? timeToComplete / session.progress.decisionsTotal : 0,
        hintsUsed: session.progress.hintsUsed,
        mistakesMade: mistakes.length,
        improvementAreas: getImprovementAreas(mistakes),
        metadata: {}
      },
      metadata: {}
    };

    onComplete(results);
  };

  const calculateScore = (accuracy: number, timeMs: number, hintsUsed: number, mistakeCount: number): number => {
    let score = accuracy; // Base score from accuracy
    
    // Time bonus (faster = better, but capped)
    const timeBonus = Math.max(0, 20 - (timeMs / 1000 / 60)); // 20 points max for under 1 minute
    score += timeBonus;
    
    // Hint penalty
    score -= hintsUsed * 2;
    
    // Mistake penalty
    score -= mistakeCount * 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const generateRecommendations = (mistakes: PracticeMistake[], accuracy: number): string[] => {
    const recommendations: string[] = [];
    
    if (accuracy < 70) {
      recommendations.push('Review the game rules and objectives');
    }
    
    if (mistakes.length > 3) {
      recommendations.push('Take more time to analyze the situation before making decisions');
    }
    
    const strategicMistakes = mistakes.filter(m => m.type === 'strategic');
    if (strategicMistakes.length > 1) {
      recommendations.push('Focus on understanding long-term strategy');
    }
    
    return recommendations;
  };

  const generateNextSuggestions = (phase: string, accuracy: number): string[] => {
    const suggestions: string[] = [];
    
    if (accuracy >= 80) {
      suggestions.push('Try a more challenging scenario');
      suggestions.push('Practice with different character roles');
    } else {
      suggestions.push('Practice this scenario again');
      suggestions.push('Review the tutorial for this phase');
    }
    
    return suggestions;
  };

  const getImprovementAreas = (mistakes: PracticeMistake[]): string[] => {
    const areas = new Set<string>();
    
    mistakes.forEach(mistake => {
      switch (mistake.type) {
        case 'strategic':
          areas.add('Strategic thinking');
          break;
        case 'tactical':
          areas.add('Tactical execution');
          break;
        case 'informational':
          areas.add('Information analysis');
          break;
        case 'timing':
          areas.add('Decision timing');
          break;
      }
    });
    
    return Array.from(areas);
  };

  const renderScenarioOverview = () => (
    <div className="practice-overview bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {scenario.title}
          </h2>
          <p className="text-gray-600 mb-4 max-w-2xl">
            {scenario.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Difficulty: {scenario.difficulty}/10</span>
            <span>•</span>
            <span>{scenario.playerCount} players</span>
            <span>•</span>
            <span>Phase: {scenario.phase}</span>
          </div>
        </div>
        
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="font-medium text-gray-900 mb-2">Objectives:</h3>
        <ul className="space-y-1">
          {scenario.objectives.map((objective, index) => (
            <li key={index} className="flex items-center space-x-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${
                session?.progress.objectivesCompleted.includes(objective) 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`} />
              <span className={
                session?.progress.objectivesCompleted.includes(objective) 
                  ? 'text-green-700 line-through' 
                  : 'text-gray-700'
              }>
                {objective}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderParticipants = () => (
    <div className="practice-participants bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="font-medium text-gray-900 mb-4">Players</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map(participant => (
          <div 
            key={participant.id}
            className={`participant-card p-3 rounded-lg border ${
              participant.isHuman 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {participant.name}
                  {participant.isHuman && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      You
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {participant.role}
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                participant.isActive ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPracticeControls = () => (
    <div className="practice-controls bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Phase:</span> {currentPhase}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Progress:</span> {session?.progress.objectivesCompleted.length || 0}/{scenario.objectives.length}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Accuracy:</span> {
              session?.progress.decisionsTotal || 0 > 0 
                ? Math.round((session?.progress.decisionsCorrect || 0) / (session?.progress.decisionsTotal || 1) * 100)
                : 0
            }%
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {settings.allowHints && (
            <button
              onClick={useHint}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              💡 Hint
            </button>
          )}
          
          {settings.allowPause && (
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
              ⏸️ Pause
            </button>
          )}
          
          <button
            onClick={onExit}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );

  const renderPracticeContent = () => {
    switch (currentPhase) {
      case 'setup':
        return (
          <div className="practice-setup bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Game Setup</h3>
            <p className="text-gray-600 mb-6">
              The game is being set up with {scenario.playerCount} players. 
              You will be assigned a role and can begin making decisions.
            </p>
            <button
              onClick={() => completePhase('setup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Practice
            </button>
          </div>
        );
      
      case 'mission-proposal':
        return (
          <div className="practice-mission-proposal bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Mission Proposal</h3>
            <p className="text-gray-600 mb-6">
              Select team members for the mission. Consider their trustworthiness and abilities.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleDecision('good-team', true);
                  completeObjective('Select a balanced team');
                  completePhase('mission-proposal');
                }}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Select trusted team members
              </button>
              <button
                onClick={() => {
                  handleDecision('suspicious-team', false);
                  completePhase('mission-proposal');
                }}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Select suspicious players
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="practice-complete bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Practice Complete</h3>
            <p className="text-gray-600 mb-6">
              You have completed the practice scenario. Great job!
            </p>
            <button
              onClick={completePracticeSession}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              View Results
            </button>
          </div>
        );
    }
  };

  if (!session) {
    return (
      <div className="practice-loading flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice scenario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-mode max-w-4xl mx-auto p-6">
      {renderScenarioOverview()}
      {renderParticipants()}
      {renderPracticeControls()}
      {renderPracticeContent()}
    </div>
  );
};

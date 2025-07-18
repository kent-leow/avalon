/**
 * Tutorial System Utilities
 * 
 * Core utility functions for managing tutorial progression, validation,
 * practice sessions, and contextual help system.
 */

import type {
  Tutorial,
  TutorialStep,
  TutorialState,
  TutorialProgress,
  TutorialLevel,
  TutorialPhase,
  TutorialValidation,
  TutorialSettings,
  TutorialStatistics,
  TutorialAchievement,
  TutorialAchievementType,
  TutorialSystem,
  PracticeSession,
  PracticeScenario,
  PracticeResults,
  PracticePerformance,
  ContextualHelp,
  ContextualHelpTrigger,
  CharacterTutorialType,
  TutorialError,
  TutorialContext,
  TutorialNavigation,
  TutorialAnimation,
  PracticeSettings,
  PracticeProgress,
  PracticeParticipant,
  HelpContext,
  HelpContent,
  GameState
} from '~/types/tutorial-system';

import {
  TUTORIAL_LEVELS,
  TUTORIAL_PHASES,
  ACHIEVEMENT_TYPES
} from '~/types/tutorial-system';

// Tutorial System Management
export class TutorialSystemManager {
  private tutorials = new Map<string, Tutorial>();
  private practiceScenarios = new Map<string, PracticeScenario>();
  private contextualHelp = new Map<string, ContextualHelp>();
  private currentState: TutorialState | null = null;

  constructor() {
    this.initializeDefaultTutorials();
    this.initializePracticeScenarios();
    this.initializeContextualHelp();
  }

  // Tutorial Management
  getTutorial(id: string): Tutorial | null {
    return this.tutorials.get(id) ?? null;
  }

  getTutorialsByLevel(level: TutorialLevel): Tutorial[] {
    return Array.from(this.tutorials.values()).filter(t => t.level === level);
  }

  getTutorialsByPhase(phase: TutorialPhase): Tutorial[] {
    return Array.from(this.tutorials.values()).filter(t => t.phase === phase);
  }

  getTutorialsByCharacter(characterType: CharacterTutorialType): Tutorial[] {
    return Array.from(this.tutorials.values()).filter(t => t.characterType === characterType);
  }

  getRecommendedTutorials(userLevel: TutorialLevel, completedTutorials: string[]): Tutorial[] {
    const available = Array.from(this.tutorials.values()).filter(t => {
      if (completedTutorials.includes(t.id)) return false;
      if (t.level === userLevel) return true;
      if (userLevel === 'intermediate' && t.level === 'beginner') return true;
      if (userLevel === 'advanced' && ['beginner', 'intermediate'].includes(t.level)) return true;
      if (userLevel === 'master') return true;
      return false;
    });

    return available.sort((a, b) => {
      const aPhaseOrder = TUTORIAL_PHASES[a.phase].order;
      const bPhaseOrder = TUTORIAL_PHASES[b.phase].order;
      return aPhaseOrder - bPhaseOrder;
    });
  }

  // Tutorial State Management
  startTutorial(tutorialId: string, context: TutorialContext): TutorialState {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) {
      throw new Error(`Tutorial not found: ${tutorialId}`);
    }

    this.currentState = {
      isActive: true,
      currentTutorial: tutorial,
      currentStep: tutorial.steps[0] ?? null,
      stepProgress: 0,
      totalSteps: tutorial.steps.length,
      completedSteps: [],
      skippedSteps: [],
      startedAt: new Date().toISOString(),
      errors: [],
      context,
      metadata: {}
    };

    return this.currentState;
  }

  pauseTutorial(): TutorialState | null {
    if (!this.currentState) return null;

    this.currentState.pausedAt = new Date().toISOString();
    this.currentState.isActive = false;
    return this.currentState;
  }

  resumeTutorial(): TutorialState | null {
    if (!this.currentState) return null;

    this.currentState.pausedAt = undefined;
    this.currentState.isActive = true;
    return this.currentState;
  }

  nextStep(): TutorialState | null {
    if (!this.currentState?.currentTutorial) return null;

    const currentStepIndex = this.currentState.currentTutorial.steps.findIndex(
      step => step.id === this.currentState!.currentStep?.id
    );

    if (currentStepIndex === -1) return null;

    // Mark current step as completed
    if (this.currentState.currentStep) {
      this.currentState.completedSteps.push(this.currentState.currentStep.id);
    }

    // Move to next step
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < this.currentState.currentTutorial.steps.length) {
      this.currentState.currentStep = this.currentState.currentTutorial.steps[nextStepIndex] ?? null;
      this.currentState.stepProgress = nextStepIndex;
    } else {
      // Tutorial completed
      this.currentState.currentStep = null;
      this.currentState.isActive = false;
      this.currentState.stepProgress = this.currentState.totalSteps;
    }

    this.currentState.lastInteraction = new Date().toISOString();
    return this.currentState;
  }

  skipStep(): TutorialState | null {
    if (!this.currentState?.currentStep) return null;

    if (!this.currentState.currentStep.isSkippable) {
      this.addError('validation', 'This step cannot be skipped');
      return this.currentState;
    }

    this.currentState.skippedSteps.push(this.currentState.currentStep.id);
    return this.nextStep();
  }

  goToPreviousStep(): TutorialState | null {
    if (!this.currentState?.currentTutorial) return null;

    const currentStepIndex = this.currentState.currentTutorial.steps.findIndex(
      step => step.id === this.currentState!.currentStep?.id
    );

    if (currentStepIndex <= 0) return null;

    // Remove current step from completed if it was there
    if (this.currentState.currentStep) {
      const completedIndex = this.currentState.completedSteps.indexOf(this.currentState.currentStep.id);
      if (completedIndex > -1) {
        this.currentState.completedSteps.splice(completedIndex, 1);
      }
    }

    // Move to previous step
    const prevStepIndex = currentStepIndex - 1;
    this.currentState.currentStep = this.currentState.currentTutorial.steps[prevStepIndex] ?? null;
    this.currentState.stepProgress = prevStepIndex;
    this.currentState.lastInteraction = new Date().toISOString();

    return this.currentState;
  }

  getCurrentState(): TutorialState | null {
    return this.currentState;
  }

  // Tutorial Validation
  validateStep(step: TutorialStep, context: Record<string, unknown>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const action of step.actions) {
      const validation = this.validateAction(action.validation, context);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateAction(validation: TutorialValidation, context: Record<string, unknown>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      switch (validation.type) {
        case 'element-exists':
          if (validation.selector && !document.querySelector(validation.selector)) {
            errors.push(`Element not found: ${validation.selector}`);
          }
          break;

        case 'element-visible':
          if (validation.selector) {
            const element = document.querySelector(validation.selector);
            if (!element || !this.isElementVisible(element)) {
              errors.push(`Element not visible: ${validation.selector}`);
            }
          }
          break;

        case 'element-text':
          if (validation.selector && validation.expectedValue) {
            const element = document.querySelector(validation.selector);
            if (!element || element.textContent !== validation.expectedValue) {
              errors.push(`Element text mismatch: ${validation.selector}`);
            }
          }
          break;

        case 'element-value':
          if (validation.selector && validation.expectedValue) {
            const element = document.querySelector(validation.selector)!;
            if (!element || (element as HTMLInputElement).value !== validation.expectedValue) {
              errors.push(`Element value mismatch: ${validation.selector}`);
            }
          }
          break;

        case 'custom':
          if (validation.customValidator) {
            const validator = this.getCustomValidator(validation.customValidator);
            if (validator && !validator(context)) {
              errors.push(validation.errorMessage);
            }
          }
          break;

        default:
          errors.push(`Unknown validation type: ${validation.type as string}`);
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== 'hidden' &&
      style.display !== 'none' &&
      parseFloat(style.opacity) > 0
    );
  }

  private getCustomValidator(validatorName: string): ((context: Record<string, unknown>) => boolean) | null {
    // Custom validators can be registered here
    const validators: Record<string, (context: Record<string, unknown>) => boolean> = {
      'game-state-valid': (context) => Boolean(context.gameState && (context.gameState as any).isValid === true),
      'player-ready': (context) => Boolean(context.player && (context.player as any).isReady === true),
      'room-joined': (context) => Boolean(context.room && (context.room as any).isJoined === true),
      'mission-selected': (context) => Boolean(context.mission && (context.mission as any).isSelected === true)
    };

    return validators[validatorName] || null;
  }

  // Tutorial Progress Tracking
  calculateProgress(tutorialId: string, completedSteps: string[]): TutorialProgress {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) return 'not-started';

    if (completedSteps.length === 0) return 'not-started';
    if (completedSteps.length === tutorial.steps.length) return 'completed';
    return 'in-progress';
  }

  calculateCompletionPercentage(tutorialId: string, completedSteps: string[]): number {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial || tutorial.steps.length === 0) return 0;

    return Math.round((completedSteps.length / tutorial.steps.length) * 100);
  }

  getEstimatedTimeRemaining(tutorialId: string, completedSteps: string[]): number {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) return 0;

    const remainingSteps = tutorial.steps.filter(step => !completedSteps.includes(step.id));
    return remainingSteps.reduce((total, step) => total + step.duration, 0);
  }

  // Achievement System
  checkAchievements(userId: string, statistics: TutorialStatistics): TutorialAchievement[] {
    const achievements: TutorialAchievement[] = [];

    // First Steps
    if (statistics.totalTutorialsCompleted >= 1) {
      achievements.push(this.createAchievement('first-steps', true));
    }

    // Tutorial Complete
    if (statistics.totalTutorialsCompleted >= this.tutorials.size) {
      achievements.push(this.createAchievement('tutorial-complete', true));
    }

    // Quick Learner
    if (statistics.averageCompletionTime < 300) { // 5 minutes
      achievements.push(this.createAchievement('quick-learner', true));
    }

    // Perfectionist
    if (statistics.perfectScores >= 5) {
      achievements.push(this.createAchievement('perfectionist', true));
    }

    // Practice Champion
    if (statistics.totalTutorialsCompleted >= 10) {
      achievements.push(this.createAchievement('practice-champion', true));
    }

    return achievements;
  }

  private createAchievement(type: TutorialAchievementType, unlocked: boolean): TutorialAchievement {
    const config = ACHIEVEMENT_TYPES[type];
    return {
      id: `achievement-${type}`,
      type,
      title: config.name,
      description: config.description,
      icon: this.getAchievementIcon(type),
      points: config.points,
      unlocked,
      unlockedAt: unlocked ? new Date().toISOString() : undefined,
      progress: unlocked ? 100 : 0,
      maxProgress: 100,
      requirements: [],
      rewards: [],
      metadata: {}
    };
  }

  private getAchievementIcon(type: TutorialAchievementType): string {
    const icons: Record<TutorialAchievementType, string> = {
      'first-steps': '🎯',
      'role-master': '👑',
      'strategy-student': '📚',
      'practice-champion': '🏆',
      'tutorial-complete': '✅',
      'helping-hand': '🤝',
      'quick-learner': '⚡',
      'perfectionist': '💎'
    };
    return icons[type] || '🏅';
  }

  // Practice Session Management
  startPracticeSession(scenarioId: string, settings: PracticeSettings): PracticeSession {
    const scenario = this.practiceScenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Practice scenario not found: ${scenarioId}`);
    }

    const session: PracticeSession = {
      id: `practice-${Date.now()}`,
      type: 'scenario',
      title: scenario.title,
      description: scenario.description,
      scenario,
      participants: this.createPracticeParticipants(scenario),
      settings,
      progress: this.initializePracticeProgress(scenario),
      results: this.initializePracticeResults(),
      startedAt: new Date().toISOString(),
      metadata: {}
    };

    return session;
  }

  private createPracticeParticipants(scenario: PracticeScenario): PracticeParticipant[] {
    const participants: PracticeParticipant[] = [];

    // Add human player
    participants.push({
      id: 'human-player',
      name: 'You',
      role: 'pending',
      isHuman: true,
      isActive: true,
      performance: this.initializePerformance(),
      metadata: {}
    });

    // Add AI players
    scenario.aiPlayers.forEach(ai => {
      participants.push({
        id: ai.id,
        name: ai.name,
        role: ai.role,
        isHuman: false,
        isActive: true,
        performance: this.initializePerformance(),
        metadata: { aiConfig: ai }
      });
    });

    return participants;
  }

  private initializePracticeProgress(_scenario: PracticeScenario): PracticeProgress {
    return {
      currentPhase: 'setup',
      phasesCompleted: [],
      objectivesCompleted: [],
      decisionsCorrect: 0,
      decisionsTotal: 0,
      hintsUsed: 0,
      timeElapsed: 0,
      metadata: {}
    };
  }

  private initializePracticeResults(): PracticeResults {
    return {
      completed: false,
      success: false,
      score: 0,
      accuracy: 0,
      timeToComplete: 0,
      objectivesAchieved: [],
      mistakesMade: [],
      recommendations: [],
      nextSuggestions: [],
      performance: this.initializePerformance(),
      metadata: {}
    };
  }

  private initializePerformance(): PracticePerformance {
    return {
      score: 0,
      accuracy: 0,
      decisionsCorrect: 0,
      decisionsTotal: 0,
      timeToDecision: 0,
      hintsUsed: 0,
      mistakesMade: 0,
      improvementAreas: [],
      metadata: {}
    };
  }

  // Contextual Help System
  getContextualHelp(trigger: ContextualHelpTrigger, context: Record<string, unknown>): ContextualHelp[] {
    const relevantHelp = Array.from(this.contextualHelp.values()).filter(help => {
      if (help.dismissed) return false;
      if (!this.evaluateHelpConditions(help, context)) return false;
      return this.matchesTrigger(help.trigger, trigger);
    });

    return relevantHelp.sort((a, b) => b.priority - a.priority);
  }

  private evaluateHelpConditions(help: ContextualHelp, context: any): boolean {
    return help.conditions.every(condition => {
      switch (condition.type) {
        case 'user-level':
          return context.userLevel === condition.value;
        case 'game-phase':
          return context.gamePhase === condition.value;
        case 'tutorial-progress':
          return context.tutorialProgress === condition.value;
        case 'setting':
          return context.settings?.[condition.value] === true;
        default:
          return true;
      }
    });
  }

  private matchesTrigger(helpTrigger: ContextualHelpTrigger, currentTrigger: ContextualHelpTrigger): boolean {
    return helpTrigger.type === currentTrigger.type &&
           helpTrigger.selector === currentTrigger.selector;
  }

  // Tutorial Navigation
  getTutorialNavigation(state: TutorialState): TutorialNavigation {
    if (!state.currentTutorial) {
      return {
        canGoBack: false,
        canGoForward: false,
        canSkip: false,
        canPause: false,
        canRestart: false,
        canExit: true,
        showProgress: false,
        showStepNumbers: false,
        allowJumpToStep: false,
        metadata: {}
      };
    }

    const currentStepIndex = state.currentTutorial.steps.findIndex(
      step => step.id === state.currentStep?.id
    );

    return {
      canGoBack: currentStepIndex > 0,
      canGoForward: currentStepIndex < state.currentTutorial.steps.length - 1,
      canSkip: state.currentStep?.isSkippable || false,
      canPause: state.isActive,
      canRestart: true,
      canExit: true,
      showProgress: true,
      showStepNumbers: true,
      allowJumpToStep: false,
      metadata: {}
    };
  }

  // Error Handling
  addError(type: 'validation' | 'timeout' | 'interaction' | 'system' | 'user', message: string): void {
    if (!this.currentState) return;

    const error: TutorialError = {
      id: `error-${Date.now()}`,
      type,
      message,
      stepId: this.currentState.currentStep?.id || 'unknown',
      timestamp: new Date().toISOString(),
      resolved: false,
      metadata: {}
    };

    this.currentState.errors.push(error);
  }

  resolveError(errorId: string): void {
    if (!this.currentState) return;

    const error = this.currentState.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  // Animation Utilities
  applyAnimation(element: HTMLElement, animation: TutorialAnimation): void {
    const keyframes = this.getAnimationKeyframes(animation);
    const options = this.getAnimationOptions(animation);

    element.animate(keyframes, options);
  }

  private getAnimationKeyframes(animation: TutorialAnimation): Keyframe[] {
    const presets: Record<string, Keyframe[]> = {
      highlight: [
        { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
        { backgroundColor: 'rgba(59, 130, 246, 0.3)' },
        { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
      ],
      pulse: [
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)' },
        { transform: 'scale(1)' }
      ],
      shake: [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
      ],
      bounce: [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
        { transform: 'translateY(0)' }
      ]
    };

    return presets[animation.type] || [];
  }

  private getAnimationOptions(animation: TutorialAnimation): KeyframeAnimationOptions {
    return {
      duration: animation.duration,
      delay: animation.delay || 0,
      iterations: animation.iterations || 1,
      direction: animation.direction || 'normal',
      easing: animation.easing || 'ease-in-out'
    };
  }

  // Utility Methods
  private initializeDefaultTutorials(): void {
    // Default tutorials would be loaded here
    // This is a placeholder for tutorial content
  }

  private initializePracticeScenarios(): void {
    // Default practice scenarios would be loaded here
    // This is a placeholder for practice content
  }

  private initializeContextualHelp(): void {
    // Default contextual help would be loaded here
    // This is a placeholder for help content
  }
}

// Tutorial Progress Utilities
export function calculateOverallProgress(
  tutorialSystem: TutorialSystem,
  availableTutorials: Tutorial[]
): number {
  if (availableTutorials.length === 0) return 0;
  
  const completed = tutorialSystem.completedTutorials.length;
  return Math.round((completed / availableTutorials.length) * 100);
}

export function getNextRecommendedTutorial(
  tutorialSystem: TutorialSystem,
  availableTutorials: Tutorial[]
): Tutorial | null {
  const incomplete = availableTutorials.filter(
    t => !tutorialSystem.completedTutorials.includes(t.id)
  );

  if (incomplete.length === 0) return null;

  // Sort by phase order and difficulty
  incomplete.sort((a, b) => {
    const aPhase = TUTORIAL_PHASES[a.phase].order;
    const bPhase = TUTORIAL_PHASES[b.phase].order;
    if (aPhase !== bPhase) return aPhase - bPhase;
    return a.difficulty - b.difficulty;
  });

  return incomplete[0] || null;
}

export function formatTutorialDuration(durationMinutes: number): string {
  if (durationMinutes < 1) return '< 1 min';
  if (durationMinutes < 60) return `${durationMinutes} min`;
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function getTutorialDifficultyColor(level: TutorialLevel): string {
  const colors: Record<TutorialLevel, string> = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
    master: '#8B5CF6'
  };
  return colors[level];
}

export function getTutorialPhaseIcon(phase: TutorialPhase): string {
  const icons: Record<TutorialPhase, string> = {
    introduction: '👋',
    'room-creation': '🏠',
    'character-roles': '🎭',
    'mission-proposal': '⚔️',
    'voting-mechanics': '🗳️',
    'mission-execution': '🎯',
    'assassin-attempt': '🗡️',
    'game-results': '🏆',
    'strategy-guide': '📚'
  };
  return icons[phase] || '📖';
}

export function validateTutorialPrerequisites(
  tutorial: Tutorial,
  completedTutorials: string[]
): { canStart: boolean; missingPrerequisites: string[] } {
  const missingPrerequisites = tutorial.prerequisites.filter(
    prereq => !completedTutorials.includes(prereq)
  );

  return {
    canStart: missingPrerequisites.length === 0,
    missingPrerequisites
  };
}

export function generateTutorialSummary(tutorial: Tutorial): string {
  const duration = formatTutorialDuration(tutorial.estimatedDuration);
  const difficulty = TUTORIAL_LEVELS[tutorial.level].name;
  const phase = TUTORIAL_PHASES[tutorial.phase].name;
  
  return `${phase} • ${difficulty} • ${duration} • ${tutorial.steps.length} steps`;
}

export function createTutorialBreadcrumb(tutorial: Tutorial, currentStepIndex: number): string[] {
  const breadcrumb = [
    TUTORIAL_PHASES[tutorial.phase].name,
    tutorial.title
  ];

  if (currentStepIndex >= 0 && currentStepIndex < tutorial.steps.length) {
    breadcrumb.push(`Step ${currentStepIndex + 1}`);
  }

  return breadcrumb;
}

// Global Tutorial System Instance
export const tutorialSystem = new TutorialSystemManager();

// Contextual Help System Functions
export function getContextualHelp(context: HelpContext): ContextualHelp | null {
  // Mock implementation - in real app, this would query a database or configuration
  if (context.gamePhase === 'mission-proposal' && context.playerRole === 'merlin') {
    return {
      id: 'merlin-mission-proposal',
      title: 'Mission Proposal as Merlin',
      icon: '🔮',
      trigger: {
        type: 'page-load',
        metadata: {}
      },
      content: {
        title: 'Mission Proposal as Merlin',
        text: 'As Merlin, you know who the evil players are. Use this knowledge carefully to guide the mission team selection.',
        message: 'Guide the mission team selection wisely',
        type: 'tip',
        steps: [
          'Observe the proposed team carefully',
          'Consider if any evil players are included',
          'Vote based on your knowledge, but don\'t be too obvious'
        ],
        tips: [
          'Don\'t always vote against evil players - it will reveal your identity',
          'Sometimes approve a mission with one evil player if you trust the others',
          'Use your knowledge subtly to influence discussions'
        ],
        warnings: [
          'Being too obvious about knowing evil players will get you killed'
        ],
        metadata: {}
      },
      conditions: [],
      display: {
        type: 'banner',
        position: 'top',
        size: 'medium',
        theme: 'light',
        animation: 'fade',
        persistent: false,
        closable: true,
        metadata: {}
      },
      priority: 5,
      frequency: 'session',
      timesShown: 0,
      dismissed: false,
      actions: [
        {
          id: 'got-it',
          label: 'Got it',
          type: 'button',
          action: 'dismiss',
          style: 'primary',
          handler: () => {
            // Tutorial dismiss handler
          },
          metadata: {}
        }
      ],
      relatedTutorials: ['merlin-strategy', 'mission-proposal-advanced'],
      metadata: {}
    };
  }
  
  return null;
}

export function shouldShowHelp(help: ContextualHelp, history: string[]): boolean {
  if (help.dismissed) return false;
  
  switch (help.frequency) {
    case 'once':
      return !history.includes(help.id);
    case 'session':
      return true; // Could be enhanced with session tracking
    case 'always':
      return true;
    default:
      return false;
  }
}

export function formatHelpContent(content: ContextualHelp['content']): HelpContent {
  return {
    text: content.text || content.message,
    steps: content.steps || [],
    tips: content.tips || [],
    warnings: content.warnings || []
  };
}

export function getHelpContextFromGameState(gameState?: GameState, currentPhase?: TutorialPhase): HelpContext | null {
  if (!gameState && !currentPhase) return null;
  
  return {
    gamePhase: gameState?.phase || currentPhase,
    playerRole: gameState?.playerRole,
    roomCode: gameState?.roomCode,
    playerCount: gameState?.playerCount,
    missionNumber: gameState?.missionNumber,
    isHost: gameState?.isHost,
    currentAction: gameState?.votingInProgress ? 'voting' : gameState?.missionInProgress ? 'mission' : undefined,
    metadata: gameState?.metadata || {}
  };
}

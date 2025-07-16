/**
 * Tutorial System tRPC Router
 * 
 * API endpoints for tutorial system, practice sessions, and contextual help.
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { 
  tutorialSystem,
  calculateOverallProgress,
  getNextRecommendedTutorial,
  validateTutorialPrerequisites
} from '~/lib/tutorial-system-utils';
import { 
  DEFAULT_TUTORIAL_SETTINGS,
  DEFAULT_PRACTICE_SETTINGS,
  TUTORIAL_LEVELS,
  TUTORIAL_PHASES,
  CHARACTER_TUTORIALS 
} from '~/types/tutorial-system';
import type { Tutorial } from '~/types/tutorial-system';

export const tutorialSystemRouter = createTRPCRouter({
  // Tutorial Management
  getAllTutorials: publicProcedure.query(async () => {
    return {
      tutorials: [] as Tutorial[],
      levels: TUTORIAL_LEVELS,
      phases: TUTORIAL_PHASES,
      characters: CHARACTER_TUTORIALS
    };
  }),

  getTutorialById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const tutorial = tutorialSystem.getTutorial(input.id);
      return { tutorial };
    }),

  getTutorialsByLevel: publicProcedure
    .input(z.object({ level: z.enum(['beginner', 'intermediate', 'advanced', 'master']) }))
    .query(async ({ input }) => {
      const tutorials = tutorialSystem.getTutorialsByLevel(input.level);
      return { tutorials };
    }),

  getTutorialsByPhase: publicProcedure
    .input(z.object({ 
      phase: z.enum([
        'introduction',
        'room-creation',
        'character-roles',
        'mission-proposal',
        'voting-mechanics',
        'mission-execution',
        'assassin-attempt',
        'game-results',
        'strategy-guide'
      ]) 
    }))
    .query(async ({ input }) => {
      const tutorials = tutorialSystem.getTutorialsByPhase(input.phase);
      return { tutorials };
    }),

  getTutorialsByCharacter: publicProcedure
    .input(z.object({ 
      characterType: z.enum(['merlin', 'evil', 'percival', 'assassin', 'good-generic', 'evil-generic']) 
    }))
    .query(async ({ input }) => {
      const tutorials = tutorialSystem.getTutorialsByCharacter(input.characterType);
      return { tutorials };
    }),

  getRecommendedTutorials: publicProcedure
    .input(z.object({
      userLevel: z.enum(['beginner', 'intermediate', 'advanced', 'master']),
      completedTutorials: z.array(z.string())
    }))
    .query(async ({ input }) => {
      const tutorials = tutorialSystem.getRecommendedTutorials(input.userLevel, input.completedTutorials);
      return { tutorials };
    }),

  validatePrerequisites: publicProcedure
    .input(z.object({
      tutorialId: z.string(),
      completedTutorials: z.array(z.string())
    }))
    .query(async ({ input }) => {
      const tutorial = tutorialSystem.getTutorial(input.tutorialId);
      if (!tutorial) {
        throw new Error('Tutorial not found');
      }
      
      const validation = validateTutorialPrerequisites(tutorial, input.completedTutorials);
      return validation;
    }),

  // Basic Tutorial Operations
  startTutorial: publicProcedure
    .input(z.object({
      tutorialId: z.string(),
      context: z.object({
        gamePhase: z.string().optional(),
        playerRole: z.string().optional(),
        roomCode: z.string().optional(),
        playerCount: z.number().optional(),
        missionNumber: z.number().optional(),
        isHost: z.boolean().optional(),
        gameState: z.record(z.any()).optional(),
        uiState: z.record(z.any()).optional(),
        metadata: z.record(z.any()).default({})
      })
    }))
    .mutation(async ({ input }) => {
      const state = tutorialSystem.startTutorial(input.tutorialId, input.context);
      return { state };
    }),

  getCurrentState: publicProcedure
    .query(async () => {
      const state = tutorialSystem.getCurrentState();
      return { state };
    }),

  nextStep: publicProcedure
    .mutation(async () => {
      const state = tutorialSystem.nextStep();
      return { state };
    }),

  previousStep: publicProcedure
    .mutation(async () => {
      const state = tutorialSystem.goToPreviousStep();
      return { state };
    }),

  skipStep: publicProcedure
    .mutation(async () => {
      const state = tutorialSystem.skipStep();
      return { state };
    }),

  pauseTutorial: publicProcedure
    .mutation(async () => {
      const state = tutorialSystem.pauseTutorial();
      return { state };
    }),

  resumeTutorial: publicProcedure
    .mutation(async () => {
      const state = tutorialSystem.resumeTutorial();
      return { state };
    }),

  // Tutorial Progress
  getProgress: publicProcedure
    .input(z.object({
      tutorialId: z.string(),
      completedSteps: z.array(z.string())
    }))
    .query(async ({ input }) => {
      const progress = tutorialSystem.calculateProgress(input.tutorialId, input.completedSteps);
      const percentage = tutorialSystem.calculateCompletionPercentage(input.tutorialId, input.completedSteps);
      const timeRemaining = tutorialSystem.getEstimatedTimeRemaining(input.tutorialId, input.completedSteps);
      
      return {
        progress,
        percentage,
        timeRemaining
      };
    }),

  getOverallProgress: publicProcedure
    .input(z.object({
      userId: z.string(),
      completedTutorials: z.array(z.string())
    }))
    .query(async ({ input }) => {
      const mockTutorialSystem = {
        id: 'system-1',
        playerId: input.userId,
        currentTutorial: null,
        progress: 'in-progress' as const,
        completedTutorials: input.completedTutorials,
        achievements: [],
        settings: DEFAULT_TUTORIAL_SETTINGS,
        statistics: {
          totalTutorialsCompleted: input.completedTutorials.length,
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

      const availableTutorials: Tutorial[] = [];
      const overallProgress = calculateOverallProgress(mockTutorialSystem, availableTutorials);
      const nextTutorial = getNextRecommendedTutorial(mockTutorialSystem, availableTutorials);

      return {
        overallProgress,
        nextTutorial,
        statistics: mockTutorialSystem.statistics
      };
    }),

  // Tutorial Settings
  getTutorialSettings: publicProcedure
    .query(async () => {
      return { settings: DEFAULT_TUTORIAL_SETTINGS };
    }),

  updateTutorialSettings: publicProcedure
    .input(z.object({
      autoPlay: z.boolean().optional(),
      showHints: z.boolean().optional(),
      skipAnimations: z.boolean().optional(),
      audioEnabled: z.boolean().optional(),
      speechEnabled: z.boolean().optional(),
      highContrastMode: z.boolean().optional(),
      fontSize: z.enum(['small', 'medium', 'large']).optional(),
      animationSpeed: z.enum(['slow', 'normal', 'fast']).optional(),
      hintFrequency: z.enum(['minimal', 'normal', 'frequent']).optional(),
      difficultyPreference: z.enum(['beginner', 'intermediate', 'advanced', 'master']).optional(),
      preferredLanguage: z.string().optional(),
      accessibilityMode: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const settings = { ...DEFAULT_TUTORIAL_SETTINGS, ...input };
      return { settings };
    }),

  // Practice Sessions
  startPracticeSession: publicProcedure
    .input(z.object({
      scenarioId: z.string(),
      settings: z.object({
        allowHints: z.boolean().optional(),
        allowUndo: z.boolean().optional(),
        allowPause: z.boolean().optional(),
        showExplanations: z.boolean().optional(),
        highlightOptimalMoves: z.boolean().optional(),
        aiDifficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
        timeLimit: z.number().optional(),
        autoAdvance: z.boolean().optional()
      }).optional()
    }))
    .mutation(async ({ input }) => {
      const settings = { ...DEFAULT_PRACTICE_SETTINGS, ...input.settings };
      
      try {
        const session = tutorialSystem.startPracticeSession(input.scenarioId, settings);
        return { session };
      } catch (error) {
        throw new Error(`Failed to start practice session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  getPracticeScenarios: publicProcedure
    .input(z.object({
      difficulty: z.number().optional(),
      phase: z.enum([
        'introduction',
        'room-creation',
        'character-roles',
        'mission-proposal',
        'voting-mechanics',
        'mission-execution',
        'assassin-attempt',
        'game-results',
        'strategy-guide'
      ]).optional(),
      characterType: z.enum(['merlin', 'evil', 'percival', 'assassin', 'good-generic', 'evil-generic']).optional()
    }))
    .query(async () => {
      const scenarios = [
        {
          id: 'scenario-1',
          title: 'Basic Mission Selection',
          description: 'Learn to select appropriate team members',
          difficulty: 1,
          playerCount: 5,
          phase: 'mission-proposal' as const,
          objectives: ['Select a balanced team', 'Avoid suspicious players'],
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
            requiredObjectives: ['Select a balanced team'],
            optionalObjectives: ['Avoid suspicious players'],
            metadata: {}
          },
          metadata: {}
        }
      ];

      return { scenarios };
    }),

  // Error Handling
  reportError: publicProcedure
    .input(z.object({
      type: z.enum(['validation', 'timeout', 'interaction', 'system', 'user']),
      message: z.string(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ input }) => {
      tutorialSystem.addError(input.type, input.message);
      return { success: true };
    }),

  resolveError: publicProcedure
    .input(z.object({
      errorId: z.string()
    }))
    .mutation(async ({ input }) => {
      tutorialSystem.resolveError(input.errorId);
      return { success: true };
    }),

  // Basic Analytics
  getTutorialAnalytics: publicProcedure
    .input(z.object({
      userId: z.string(),
      timeframe: z.enum(['day', 'week', 'month', 'all']).optional()
    }))
    .query(async () => {
      const analytics = {
        totalTutorialsCompleted: 0,
        totalTimeSpent: 0,
        averageSessionLength: 0,
        mostPopularTutorials: [] as string[],
        difficultyDistribution: {} as Record<string, number>,
        completionRates: {} as Record<string, number>,
        commonErrors: [] as string[],
        improvementTrends: [] as string[]
      };

      return { analytics };
    })
});

export type TutorialSystemRouter = typeof tutorialSystemRouter;

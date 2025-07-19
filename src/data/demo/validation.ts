import { z } from 'zod';
import type { DemoPlayer, DemoMission, DemoGameState, DemoScenario, DemoAccessibilityState, DemoMobileState } from './types';

/**
 * Zod schemas for validating demo data
 * Ensures all demo data conforms to expected structure
 */

export const DemoPlayerSchema = z.object({
  _brand: z.literal('demo'),
  id: z.string(),
  name: z.string().min(1).max(50),
  role: z.enum(['good', 'evil', 'merlin', 'assassin', 'percival', 'morgana', 'mordred', 'oberon']),
  isHost: z.boolean(),
  isReady: z.boolean(),
  connectionStatus: z.enum(['connected', 'disconnected', 'reconnecting']),
});

export const DemoMissionSchema = z.object({
  _brand: z.literal('demo'),
  id: z.string(),
  number: z.number().min(1).max(5),
  requiredPlayers: z.number().min(2).max(5),
  status: z.enum(['pending', 'in-progress', 'success', 'failure']),
  selectedPlayers: z.array(z.string()),
  votes: z.array(z.object({
    playerId: z.string(),
    vote: z.enum(['success', 'failure']),
  })),
  failVotesRequired: z.number().min(1).max(3),
});

export const DemoGameStateSchema = z.object({
  _brand: z.literal('demo'),
  id: z.string(),
  roomCode: z.string().length(6),
  phase: z.enum(['lobby', 'role-reveal', 'team-selection', 'mission-voting', 'mission-execution', 'game-end']),
  players: z.array(DemoPlayerSchema),
  missions: z.array(DemoMissionSchema),
  currentMission: z.number().min(1).max(5),
  hostId: z.string(),
  settings: z.object({
    playerCount: z.number().min(5).max(10),
    includeMerlin: z.boolean(),
    includePercival: z.boolean(),
    includeMorgana: z.boolean(),
    includeMordred: z.boolean(),
    includeOberon: z.boolean(),
  }),
  gameResult: z.object({
    winner: z.enum(['good', 'evil']),
    reason: z.enum(['missions', 'assassination']),
    assassinationTarget: z.string().optional(),
  }).optional(),
});

export const DemoScenarioSchema = z.object({
  _brand: z.literal('demo'),
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  gameState: DemoGameStateSchema,
  category: z.enum(['standard', 'large-game', 'endgame', 'mobile', 'accessibility']),
});

export const DemoAccessibilityStateSchema = z.object({
  _brand: z.literal('demo'),
  highContrast: z.boolean(),
  largeText: z.boolean(),
  screenReader: z.boolean(),
  keyboardNavigation: z.boolean(),
  reducedMotion: z.boolean(),
});

export const DemoMobileStateSchema = z.object({
  _brand: z.literal('demo'),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  orientation: z.enum(['portrait', 'landscape']),
  touchEnabled: z.boolean(),
  viewportSize: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
});

/**
 * Validate demo data against schemas
 */
export function validateDemoPlayer(data: unknown): DemoPlayer {
  return DemoPlayerSchema.parse(data) as DemoPlayer;
}

export function validateDemoMission(data: unknown): DemoMission {
  return DemoMissionSchema.parse(data) as DemoMission;
}

export function validateDemoGameState(data: unknown): DemoGameState {
  return DemoGameStateSchema.parse(data) as DemoGameState;
}

export function validateDemoScenario(data: unknown): DemoScenario {
  return DemoScenarioSchema.parse(data) as DemoScenario;
}

export function validateDemoAccessibilityState(data: unknown): DemoAccessibilityState {
  return DemoAccessibilityStateSchema.parse(data) as DemoAccessibilityState;
}

export function validateDemoMobileState(data: unknown): DemoMobileState {
  return DemoMobileStateSchema.parse(data) as DemoMobileState;
}

/**
 * Runtime check to ensure demo data is not used in production
 */
export function isDemoEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname.includes('demo');
  }
  return process.env.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true' || process.env.BUILD_DEMO === 'true';
}

/**
 * Ensure demo data can only be used in appropriate environments
 */
export function ensureDemoEnvironment(): void {
  if (!isDemoEnvironment()) {
    throw new Error('Demo data cannot be used in production environment');
  }
}

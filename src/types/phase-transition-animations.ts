import type { GamePhase } from './game-state';
import type { Player } from './room';

// Animation State Types
export interface AnimationState {
  currentAnimation: AnimationType | null;
  isAnimating: boolean;
  animationQueue: QueuedAnimation[];
  motionPreferences: MotionPreferences;
  audioEnabled: boolean;
}

export interface QueuedAnimation {
  id: string;
  type: AnimationType;
  config: AnimationConfig;
  priority: number;
  delay?: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  intensity: 'subtle' | 'moderate' | 'dramatic';
  effects: EffectType[];
}

// Animation Type Enums
export type AnimationType = 'phase' | 'action' | 'celebration' | 'loading';
export type TransitionType = 'phase' | 'action' | 'celebration' | 'loading';
export type EffectType = 'fade' | 'slide' | 'scale' | 'particles' | 'glow' | 'shake' | 'bounce' | 'pulse';
export type CelebrationType = 'victory' | 'defeat' | 'achievement' | 'milestone';
export type ActionType = 'vote' | 'select' | 'confirm' | 'reject' | 'join' | 'leave' | 'start' | 'end';

// Phase Transition Animation Props
export interface PhaseTransitionAnimatorProps {
  currentPhase: GamePhase;
  previousPhase: GamePhase | null;
  isTransitioning: boolean;
  transitionType: TransitionType;
  duration?: number;
  children: React.ReactNode;
  onTransitionComplete?: () => void;
}

// Transition Effects Props
export interface TransitionEffectsProps {
  effectType: EffectType;
  phase: GamePhase;
  isActive: boolean;
  intensity?: 'subtle' | 'moderate' | 'dramatic';
  duration?: number;
  onEffectComplete?: () => void;
}

// Audio Cue Manager Props
export interface AudioCueManagerProps {
  currentPhase: GamePhase;
  actionType?: ActionType;
  volume?: number;
  enabled?: boolean;
  onAudioPlay?: (audioId: string) => void;
}

// Celebration Animations Props
export interface CelebrationAnimationsProps {
  celebrationType: CelebrationType;
  isVisible: boolean;
  winner?: 'good' | 'evil';
  players?: Player[];
  onCelebrationComplete?: () => void;
}

// Action Feedback Props
export interface ActionFeedbackProps {
  actionType: ActionType;
  success?: boolean;
  position?: { x: number; y: number };
  duration?: number;
  onFeedbackComplete?: () => void;
}

// Motion Preferences Props
export interface MotionPreferencesProps {
  children: React.ReactNode;
  respectReducedMotion?: boolean;
  fallbackMode?: 'static' | 'minimal' | 'off';
}

// Motion Preferences Type
export interface MotionPreferences {
  reducedMotion: boolean;
  disableAnimations: boolean;
  animationIntensity: 'subtle' | 'moderate' | 'dramatic';
  enableAudio: boolean;
  enableParticles: boolean;
  enableShake: boolean;
}

// Audio Configuration
export interface AudioConfig {
  id: string;
  src: string;
  volume: number;
  loop: boolean;
  preload: boolean;
}

// Animation Timing Constants
export const ANIMATION_TIMING = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  CELEBRATION: 2500,
  ACTION_FEEDBACK: 200,
} as const;

export const ANIMATION_EASING = {
  EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  EASE_IN: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  EASE_IN_OUT: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Animation Priority Constants
export const ANIMATION_PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
} as const;

// Effect Configuration
export interface EffectConfig {
  type: EffectType;
  duration: number;
  delay: number;
  intensity: number;
  color?: string;
  size?: number;
  count?: number;
}

// Particle System Configuration
export interface ParticleConfig {
  count: number;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  lifetime: { min: number; max: number };
  color: string[];
  shape: 'circle' | 'square' | 'triangle' | 'star';
  gravity: number;
  wind: number;
}

// Animation Hook Return Type
export interface UsePhaseTransitionAnimationsReturn {
  animationState: AnimationState;
  startAnimation: (config: AnimationConfig) => void;
  stopAnimation: () => void;
  queueAnimation: (animation: QueuedAnimation) => void;
  clearQueue: () => void;
  setMotionPreferences: (preferences: Partial<MotionPreferences>) => void;
}

// Motion Preferences Hook Return Type
export interface UseMotionPreferencesReturn {
  motionPreferences: MotionPreferences;
  updatePreferences: (preferences: Partial<MotionPreferences>) => void;
  respectsReducedMotion: boolean;
  shouldAnimate: (animationType: AnimationType) => boolean;
}

// Animation Event Types
export interface AnimationEvent {
  type: 'start' | 'complete' | 'interrupt' | 'error';
  animationId: string;
  timestamp: number;
  phase?: GamePhase;
  duration?: number;
}

// Performance Metrics
export interface AnimationMetrics {
  totalAnimations: number;
  averageDuration: number;
  frameDrops: number;
  memoryUsage: number;
  lastUpdate: number;
}

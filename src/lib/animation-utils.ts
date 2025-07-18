import type { 
  AnimationConfig, 
  QueuedAnimation, 
  MotionPreferences, 
  AnimationState, 
  EffectConfig, 
  ParticleConfig, 
  AnimationEvent,
  AnimationMetrics,
  TransitionType,
  EffectType,
  CelebrationType,
  ActionType
} from '~/types/phase-transition-animations';
import type { GamePhase } from '~/types/game-state';
import type { Player } from '~/types/room';

// Animation Configuration Utilities
export function createAnimationConfig(
  duration: number,
  effects: EffectType[],
  intensity: 'subtle' | 'moderate' | 'dramatic' = 'moderate'
): AnimationConfig {
  return {
    duration,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    intensity,
    effects,
  };
}

export function createQueuedAnimation(
  type: TransitionType,
  config: AnimationConfig,
  priority = 3,
  delay = 0
): QueuedAnimation {
  return {
    id: `animation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    config,
    priority,
    delay,
  };
}

// Default Motion Preferences
export function getDefaultMotionPreferences(): MotionPreferences {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    reducedMotion: prefersReducedMotion,
    disableAnimations: false,
    animationIntensity: 'moderate',
    enableAudio: true,
    enableParticles: true,
    enableShake: true,
  };
}

// Animation State Management
export function createInitialAnimationState(): AnimationState {
  return {
    currentAnimation: null,
    isAnimating: false,
    animationQueue: [],
    motionPreferences: getDefaultMotionPreferences(),
    audioEnabled: true,
  };
}

export function shouldAnimate(
  animationType: TransitionType,
  preferences: MotionPreferences
): boolean {
  if (preferences.disableAnimations) return false;
  if (preferences.reducedMotion && animationType === 'celebration') return false;
  return true;
}

// Animation Queue Management
export function sortAnimationQueue(animations: QueuedAnimation[]): QueuedAnimation[] {
  return [...animations].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return (a.delay || 0) - (b.delay || 0);
  });
}

export function getNextAnimation(queue: QueuedAnimation[]): QueuedAnimation | null {
  const sortedQueue = sortAnimationQueue(queue);
  return sortedQueue.length > 0 ? sortedQueue[0] || null : null;
}

export function removeAnimationFromQueue(
  queue: QueuedAnimation[],
  animationId: string
): QueuedAnimation[] {
  return queue.filter(animation => animation.id !== animationId);
}

// Phase Transition Utilities
export function getPhaseTransitionConfig(
  fromPhase: GamePhase,
  toPhase: GamePhase,
  intensity: 'subtle' | 'moderate' | 'dramatic' = 'moderate'
): AnimationConfig {
  const effects: EffectType[] = ['fade'];
  
  // Add phase-specific effects
  if (toPhase === 'lobby') {
    effects.push('pulse');
  } else if (toPhase === 'roleReveal') {
    effects.push('glow', 'scale');
  } else if (toPhase === 'missionSelect') {
    effects.push('slide');
  } else if (toPhase === 'voting' || toPhase === 'missionVote') {
    effects.push('pulse', 'glow');
  } else if (toPhase === 'missionResult') {
    effects.push('scale', 'particles');
  } else if (toPhase === 'gameOver') {
    effects.push('particles', 'glow');
  }
  
  const baseDuration = intensity === 'subtle' ? 300 : 
                     intensity === 'moderate' ? 500 : 750;
  
  return createAnimationConfig(baseDuration, effects, intensity);
}

// Action Feedback Utilities
export function getActionFeedbackConfig(
  actionType: ActionType,
  success = true
): AnimationConfig {
  const effects: EffectType[] = [];
  
  if (success) {
    effects.push('scale', 'glow');
    if (actionType === 'vote' || actionType === 'select') {
      effects.push('pulse');
    }
  } else {
    effects.push('shake');
  }
  
  return createAnimationConfig(200, effects, 'moderate');
}

// Celebration Utilities
export function getCelebrationConfig(
  celebrationType: CelebrationType,
  winner?: 'good' | 'evil'
): AnimationConfig {
  const effects: EffectType[] = ['particles'];
  
  if (celebrationType === 'victory') {
    effects.push('glow', 'scale');
    if (winner === 'good') {
      effects.push('bounce');
    }
  } else if (celebrationType === 'defeat') {
    effects.push('fade');
  } else if (celebrationType === 'achievement') {
    effects.push('pulse', 'glow');
  }
  
  return createAnimationConfig(2500, effects, 'dramatic');
}

// Effect Configuration Utilities
export function createEffectConfig(
  type: EffectType,
  duration = 300,
  delay = 0,
  intensity = 1,
  color?: string
): EffectConfig {
  return {
    type,
    duration,
    delay,
    intensity,
    color,
  };
}

export function createParticleConfig(
  count = 50,
  colors: string[] = ['#22c55e', '#3b82f6', '#f59e0b']
): ParticleConfig {
  return {
    count,
    size: { min: 2, max: 6 },
    speed: { min: 50, max: 150 },
    lifetime: { min: 1000, max: 3000 },
    color: colors,
    shape: 'circle',
    gravity: 0.5,
    wind: 0.1,
  };
}

// Animation Event Utilities
export function createAnimationEvent(
  type: 'start' | 'complete' | 'interrupt' | 'error',
  animationId: string,
  phase?: GamePhase,
  duration?: number
): AnimationEvent {
  return {
    type,
    animationId,
    timestamp: Date.now(),
    phase,
    duration,
  };
}

// Performance Utilities
export function createAnimationMetrics(): AnimationMetrics {
  return {
    totalAnimations: 0,
    averageDuration: 0,
    frameDrops: 0,
    memoryUsage: 0,
    lastUpdate: Date.now(),
  };
}

export function updateAnimationMetrics(
  metrics: AnimationMetrics,
  duration: number,
  frameDrops = 0
): AnimationMetrics {
  const newTotal = metrics.totalAnimations + 1;
  const newAverage = (metrics.averageDuration * metrics.totalAnimations + duration) / newTotal;
  
  return {
    totalAnimations: newTotal,
    averageDuration: newAverage,
    frameDrops: metrics.frameDrops + frameDrops,
    memoryUsage: typeof performance !== 'undefined' && 'memory' in performance ? 
      (performance as any).memory.usedJSHeapSize : 0,
    lastUpdate: Date.now(),
  };
}

// CSS Animation Utilities
export function getCSSAnimationName(effectType: EffectType): string {
  switch (effectType) {
    case 'fade': return 'fade-in-out';
    case 'slide': return 'slide-in-out';
    case 'scale': return 'scale-in-out';
    case 'particles': return 'particles-float';
    case 'glow': return 'glow-pulse';
    case 'shake': return 'shake-horizontal';
    case 'bounce': return 'bounce-in';
    case 'pulse': return 'pulse-scale';
    default: return 'fade-in-out';
  }
}

export function getCSSTransitionProperty(effectType: EffectType): string {
  switch (effectType) {
    case 'fade': return 'opacity';
    case 'slide': return 'transform';
    case 'scale': return 'transform';
    case 'glow': return 'box-shadow, opacity';
    case 'shake': return 'transform';
    case 'bounce': return 'transform';
    case 'pulse': return 'transform, opacity';
    default: return 'all';
  }
}

// Mock Data Generators for Testing
export function createMockAnimationQueue(): QueuedAnimation[] {
  return [
    createQueuedAnimation('phase', createAnimationConfig(500, ['fade', 'slide']), 1),
    createQueuedAnimation('action', createAnimationConfig(200, ['scale', 'glow']), 2),
    createQueuedAnimation('celebration', createAnimationConfig(2500, ['particles', 'glow']), 3),
  ];
}

export function createMockMotionPreferences(reducedMotion = false): MotionPreferences {
  return {
    reducedMotion,
    disableAnimations: false,
    animationIntensity: 'moderate',
    enableAudio: true,
    enableParticles: !reducedMotion,
    enableShake: !reducedMotion,
  };
}

// Animation Cleanup Utilities
export function cleanupAnimation(animationId: string): void {
  const element = document.querySelector(`[data-animation-id="${animationId}"]`);
  if (element) {
    element.removeAttribute('data-animation-id');
    element.classList.remove('animating');
  }
}

export function cleanupAllAnimations(): void {
  const animatingElements = document.querySelectorAll('[data-animation-id]');
  animatingElements.forEach(element => {
    element.removeAttribute('data-animation-id');
    element.classList.remove('animating');
  });
}

// Duration Calculation Utilities
export function calculateStaggeredDelay(index: number, baseDelay = 50): number {
  return index * baseDelay;
}

export function calculateAdaptiveDuration(
  baselineMs: number,
  complexity: number,
  preferences: MotionPreferences
): number {
  let duration = baselineMs;
  
  // Adjust for complexity
  duration *= Math.min(complexity, 2);
  
  // Adjust for preferences
  if (preferences.reducedMotion) {
    duration *= 0.5;
  }
  
  switch (preferences.animationIntensity) {
    case 'subtle':
      duration *= 0.7;
      break;
    case 'dramatic':
      duration *= 1.3;
      break;
    default:
      break;
  }
  
  return Math.max(duration, 100); // Minimum 100ms
}

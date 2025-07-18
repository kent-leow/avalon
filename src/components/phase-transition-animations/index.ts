export { PhaseTransitionAnimator } from './PhaseTransitionAnimator';
export { TransitionEffects } from './TransitionEffects';
export { AudioCueManager } from './AudioCueManager';
export { CelebrationAnimations } from './CelebrationAnimations';
export { ActionFeedback } from './ActionFeedback';
export { MotionPreferences, MotionPreferencesPanel, useMotionPreferencesContext } from './MotionPreferences';

// Re-export types
export type {
  PhaseTransitionAnimatorProps,
  TransitionEffectsProps,
  AudioCueManagerProps,
  CelebrationAnimationsProps,
  ActionFeedbackProps,
  MotionPreferencesProps,
} from '~/types/phase-transition-animations';

// Re-export hooks
export { usePhaseTransitionAnimations } from '~/hooks/usePhaseTransitionAnimations';
export { useMotionPreferences } from '~/hooks/useMotionPreferences';

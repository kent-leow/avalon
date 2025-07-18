import { 
  createAnimationConfig, 
  createQueuedAnimation, 
  sortAnimationQueue,
  getPhaseTransitionConfig,
  getActionFeedbackConfig,
  getCelebrationConfig,
  createEffectConfig,
  createParticleConfig,
  calculateStaggeredDelay,
  calculateAdaptiveDuration,
  createMockMotionPreferences
} from '../animation-utils';
import { type TransitionType, type EffectType, type CelebrationType, type ActionType } from '~/types/phase-transition-animations';

describe('Animation Utils', () => {
  describe('createAnimationConfig', () => {
    it('creates animation config with default values', () => {
      const config = createAnimationConfig(300, ['fade']);

      expect(config.duration).toBe(300);
      expect(config.easing).toBe('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
      expect(config.intensity).toBe('moderate');
      expect(config.effects).toEqual(['fade']);
    });

    it('creates animation config with custom values', () => {
      const config = createAnimationConfig(500, ['scale', 'particles'], 'dramatic');

      expect(config.duration).toBe(500);
      expect(config.easing).toBe('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
      expect(config.intensity).toBe('dramatic');
      expect(config.effects).toEqual(['scale', 'particles']);
    });
  });

  describe('createQueuedAnimation', () => {
    it('creates queued animation with generated ID', () => {
      const animation = createQueuedAnimation(
        'phase' as TransitionType,
        createAnimationConfig(300, ['fade'])
      );

      expect(animation.id).toBeDefined();
      expect(animation.type).toBe('phase');
      expect(animation.priority).toBe(3);
      expect(animation.config.duration).toBe(300);
    });

    it('creates queued animation with custom values', () => {
      const animation = createQueuedAnimation(
        'action' as TransitionType,
        createAnimationConfig(200, ['bounce']),
        2,
        100
      );

      expect(animation.id).toBeDefined();
      expect(animation.type).toBe('action');
      expect(animation.priority).toBe(2);
      expect(animation.delay).toBe(100);
    });
  });

  describe('sortAnimationQueue', () => {
    it('sorts animations by priority', () => {
      const animations = [
        createQueuedAnimation('phase' as TransitionType, createAnimationConfig(300, ['fade']), 3),
        createQueuedAnimation('action' as TransitionType, createAnimationConfig(200, ['bounce']), 2),
        createQueuedAnimation('celebration' as TransitionType, createAnimationConfig(500, ['particles']), 1)
      ];

      const sorted = sortAnimationQueue(animations);

      expect(sorted[0]?.priority).toBe(1);
      expect(sorted[1]?.priority).toBe(2);
      expect(sorted[2]?.priority).toBe(3);
    });
  });

  describe('getPhaseTransitionConfig', () => {
    it('returns config for LOBBY phase', () => {
      const config = getPhaseTransitionConfig('lobby', 'lobby');

      expect(config.duration).toBe(500);
      expect(config.intensity).toBe('moderate');
      expect(config.effects).toContain('fade');
    });

    it('returns config for MISSION_SELECTION phase', () => {
      const config = getPhaseTransitionConfig('lobby', 'missionSelect');

      expect(config.duration).toBe(500);
      expect(config.intensity).toBe('moderate');
      expect(config.effects).toContain('slide');
    });
  });

  describe('getActionFeedbackConfig', () => {
    it('returns config for successful action', () => {
      const config = getActionFeedbackConfig('vote' as ActionType, true);

      expect(config.duration).toBe(200);
      expect(config.intensity).toBe('moderate');
      expect(config.effects).toContain('scale');
    });

    it('returns config for failed action', () => {
      const config = getActionFeedbackConfig('vote' as ActionType, false);

      expect(config.duration).toBe(200);
      expect(config.intensity).toBe('moderate');
      expect(config.effects).toContain('shake');
    });
  });

  describe('getCelebrationConfig', () => {
    it('returns config for victory celebration', () => {
      const config = getCelebrationConfig('victory' as CelebrationType, 'good');

      expect(config.duration).toBe(2500);
      expect(config.intensity).toBe('dramatic');
      expect(config.effects).toContain('particles');
    });
  });

  describe('calculateStaggeredDelay', () => {
    it('calculates staggered delay correctly', () => {
      const delay = calculateStaggeredDelay(2, 100);
      expect(delay).toBe(200);
    });

    it('uses default base delay', () => {
      const delay = calculateStaggeredDelay(1);
      expect(delay).toBe(50);
    });
  });

  describe('calculateAdaptiveDuration', () => {
    it('calculates adaptive duration based on complexity', () => {
      const preferences = createMockMotionPreferences();
      const duration = calculateAdaptiveDuration(300, 0.8, preferences);
      expect(duration).toBe(240); // 300 * 0.8
    });

    it('handles reduced motion', () => {
      const preferences = createMockMotionPreferences(true);
      const duration = calculateAdaptiveDuration(300, 1, preferences);
      expect(duration).toBe(150); // 300 * 1 * 0.5
    });
  });
});

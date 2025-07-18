import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhaseTransitionAnimator } from '../PhaseTransitionAnimator';
import { usePhaseTransitionAnimations } from '~/hooks/usePhaseTransitionAnimations';
import { useMotionPreferences } from '~/hooks/useMotionPreferences';

// Mock hooks
jest.mock('~/hooks/usePhaseTransitionAnimations');
jest.mock('~/hooks/useMotionPreferences');

// Mock AudioCueManager to avoid AudioContext issues in tests
jest.mock('../AudioCueManager', () => ({
  AudioCueManager: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="audio-cue-manager">{children}</div>
  ),
}));

const mockUsePhaseTransitionAnimations = usePhaseTransitionAnimations as jest.MockedFunction<typeof usePhaseTransitionAnimations>;
const mockUseMotionPreferences = useMotionPreferences as jest.MockedFunction<typeof useMotionPreferences>;

describe('PhaseTransitionAnimator', () => {
  beforeEach(() => {
    mockUsePhaseTransitionAnimations.mockReturnValue({
      animationState: {
        currentAnimation: null,
        isAnimating: false,
        animationQueue: [],
        motionPreferences: {
          reducedMotion: false,
          disableAnimations: false,
          animationIntensity: 'moderate',
          enableAudio: true,
          enableParticles: true,
          enableShake: true,
        },
        audioEnabled: true,
      },
      startAnimation: jest.fn(),
      stopAnimation: jest.fn(),
      queueAnimation: jest.fn(),
      clearQueue: jest.fn(),
      setMotionPreferences: jest.fn(),
    });

    mockUseMotionPreferences.mockReturnValue({
      motionPreferences: {
        reducedMotion: false,
        disableAnimations: false,
        animationIntensity: 'moderate',
        enableAudio: true,
        enableParticles: true,
        enableShake: true,
      },
      updatePreferences: jest.fn(),
      respectsReducedMotion: false,
      shouldAnimate: jest.fn(() => true),
    });
  });

  it('renders without crashing', () => {
    render(<PhaseTransitionAnimator currentPhase="lobby" previousPhase={null} isTransitioning={false} transitionType="phase">
      <div>Test Content</div>
    </PhaseTransitionAnimator>);
    expect(screen.getByTestId('phase-transition-animator')).toBeInTheDocument();
  });

  it('renders with disabled animations', () => {
    mockUseMotionPreferences.mockReturnValue({
      motionPreferences: {
        reducedMotion: true,
        disableAnimations: true,
        animationIntensity: 'subtle',
        enableAudio: false,
        enableParticles: false,
        enableShake: false,
      },
      updatePreferences: jest.fn(),
      respectsReducedMotion: true,
      shouldAnimate: jest.fn(() => false),
    });

    render(<PhaseTransitionAnimator currentPhase="lobby" previousPhase={null} isTransitioning={false} transitionType="phase">
      <div>Test Content</div>
    </PhaseTransitionAnimator>);
    const animator = screen.getByTestId('phase-transition-animator');
    expect(animator).toBeInTheDocument();
  });

  it('renders with transitioning state', () => {
    render(<PhaseTransitionAnimator currentPhase="missionSelect" previousPhase="lobby" isTransitioning={true} transitionType="phase">
      <div>Test Content</div>
    </PhaseTransitionAnimator>);
    const animator = screen.getByTestId('phase-transition-animator');
    expect(animator).toBeInTheDocument();
  });
});
